import { Env, OAuth2Credentials, AccountData } from "./types";
import {
	CODE_ASSIST_ENDPOINT,
	CODE_ASSIST_API_VERSION,
	OAUTH_CLIENT_ID,
	OAUTH_CLIENT_SECRET,
	OAUTH_REFRESH_URL,
	TOKEN_BUFFER_TIME,
	KV_TOKEN_KEY
} from "./config";

interface TokenRefreshResponse {
	access_token: string;
	expires_in: number;
}

export class AuthManager {
	private env: Env;
	private currentAccountId: string | null = null;
	private currentAccessToken: string | null = null;

	constructor(env: Env) {
		this.env = env;
	}

	/**
	 * Determines which provider pool to check for quota exhaustion.
	 */
	private getProviderForModel(modelId: string): "gemini" | "partner" {
		const lower = modelId.toLowerCase();
		if (lower.includes("claude") || lower.includes("gpt")) {
			return "partner";
		}
		return "gemini";
	}

	/**
	 * Find an available account from the KV pool that isn't currently rate-limited for the requested provider.
	 * Implements Randomized Round-Robin with Priority routing.
	 */
	public async getAvailableAccount(modelId: string): Promise<string> {
		const provider = this.getProviderForModel(modelId);
		const now = Date.now();

		if (this.env.ACCOUNTS_KV) {
			try {
				const keys = await this.env.ACCOUNTS_KV.list();
				const healthyAccountsByPriority = new Map<number, string[]>();
				let fallbackAccountId: string | null = null;

				for (const key of keys.keys) {
					const accountData = await this.env.ACCOUNTS_KV.get<AccountData>(key.name, "json");
					if (!accountData || accountData.is_invalid) continue;

					if (!fallbackAccountId) {
						fallbackAccountId = key.name;
					}

					const exhaustedUntil = provider === "gemini" ? accountData.exhausted_gemini_until : accountData.exhausted_partner_until;

					if (!exhaustedUntil || exhaustedUntil < now) {
						// Healthy account! Group it by priority (defaulting to 100)
						const priority = accountData.priority !== undefined ? accountData.priority : 100;
						if (!healthyAccountsByPriority.has(priority)) {
							healthyAccountsByPriority.set(priority, []);
						}
						healthyAccountsByPriority.get(priority)!.push(key.name);
					}
				}

				if (healthyAccountsByPriority.size > 0) {
					// Find the group with the lowest priority number (e.g., 1 goes before 100)
					const priorities = Array.from(healthyAccountsByPriority.keys()).sort((a, b) => a - b);
					const lowestPriority = priorities[0];
					const bestAccounts = healthyAccountsByPriority.get(lowestPriority)!;
					
					// Randomly select one account from the best priority group to distribute load (Serverless Round Robin)
					const selectedAccountId = bestAccounts[Math.floor(Math.random() * bestAccounts.length)];
					
					console.log(`[MultiAuth] Selected healthy account: ${selectedAccountId} (Priority: ${lowestPriority}) for provider ${provider}`);
					return selectedAccountId;
				}

				if (fallbackAccountId) {
					console.warn(`[MultiAuth] ALL accounts exhausted for provider ${provider}. Falling back to ${fallbackAccountId} and hoping for the best.`);
					return fallbackAccountId;
				}
				
				console.warn("[MultiAuth] ACCOUNTS_KV is bound but empty. Falling back to GCP_SERVICE_ACCOUNT env var.");
			} catch (e) {
				console.error("[MultiAuth] Failed to read from ACCOUNTS_KV:", e);
			}
		}

		// Legacy fallback
		return "legacy_single_account";
	}

	/**
	 * Initializes authentication for a specific model request.
	 * It finds a healthy account from the pool and retrieves/refreshes its access token.
	 */
	public async initializeAuth(modelId: string = "gemini-3.5-flash"): Promise<void> {
		const accountId = await this.getAvailableAccount(modelId);
		this.currentAccountId = accountId;

		try {
			if (accountId === "legacy_single_account") {
				await this.initializeLegacyAuth();
				return;
			}

			// Multi-account logic
			const accountData = await this.env.ACCOUNTS_KV!.get<AccountData>(accountId, "json");
			if (!accountData) throw new Error(`Account data for ${accountId} not found in KV`);

			const timeUntilExpiry = (accountData.expiry_date || 0) - Date.now();
			if (accountData.access_token && timeUntilExpiry > TOKEN_BUFFER_TIME) {
				this.currentAccessToken = accountData.access_token;
				console.log(`[MultiAuth] Using cached token for ${accountId}, valid for ${Math.floor(timeUntilExpiry / 1000)}s`);
				return;
			}

			console.log(`[MultiAuth] Token for ${accountId} expired. Refreshing...`);
			await this.refreshAccountToken(accountId, accountData);

		} catch (e: unknown) {
			const errorMessage = e instanceof Error ? e.message : String(e);
			console.error(`[MultiAuth] Failed to initialize auth for ${accountId}:`, e);
			throw new Error("Authentication failed: " + errorMessage);
		}
	}

	private async refreshAccountToken(accountId: string, accountData: AccountData): Promise<void> {
		const params = new URLSearchParams({
			client_id: OAUTH_CLIENT_ID,
			refresh_token: accountData.refresh_token,
			grant_type: "refresh_token"
		});
		if (OAUTH_CLIENT_SECRET) params.append("client_secret", OAUTH_CLIENT_SECRET);

		const refreshResponse = await fetch(OAUTH_REFRESH_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params
		});

		if (!refreshResponse.ok) {
			const errorText = await refreshResponse.text();
			console.error(`[MultiAuth] Token refresh failed for ${accountId}:`, errorText);
			
			// If it's a hard invalid_grant (e.g., user revoked access), mark it as invalid
			if (errorText.includes("invalid_grant")) {
				accountData.is_invalid = true;
				await this.env.ACCOUNTS_KV!.put(accountId, JSON.stringify(accountData));
				console.error(`[MultiAuth] Account ${accountId} marked as permanently INVALID.`);
			}
			throw new Error(`Token refresh failed: ${errorText}`);
		}

		const refreshData = (await refreshResponse.json()) as TokenRefreshResponse;
		this.currentAccessToken = refreshData.access_token;
		
		accountData.access_token = refreshData.access_token;
		accountData.expiry_date = Date.now() + refreshData.expires_in * 1000;

		await this.env.ACCOUNTS_KV!.put(accountId, JSON.stringify(accountData));
		console.log(`[MultiAuth] Token for ${accountId} refreshed successfully.`);
	}

	private async initializeLegacyAuth(): Promise<void> {
		if (!this.env.GCP_SERVICE_ACCOUNT) {
			throw new Error("`GCP_SERVICE_ACCOUNT` environment variable not set. Please provide OAuth2 credentials JSON.");
		}

		let cachedTokenData = null;
		try {
			const cachedToken = await this.env.GEMINI_CLI_KV.get(KV_TOKEN_KEY, "json");
			if (cachedToken) cachedTokenData = cachedToken as any;
		} catch (e) { /* ignore */ }

		if (cachedTokenData) {
			const timeUntilExpiry = cachedTokenData.expiry_date - Date.now();
			if (timeUntilExpiry > TOKEN_BUFFER_TIME) {
				this.currentAccessToken = cachedTokenData.access_token;
				return;
			}
		}

		const oauth2Creds: OAuth2Credentials = JSON.parse(this.env.GCP_SERVICE_ACCOUNT);
		const timeUntilExpiry = oauth2Creds.expiry_date - Date.now();
		if (timeUntilExpiry > TOKEN_BUFFER_TIME) {
			this.currentAccessToken = oauth2Creds.access_token;
			await this.cacheLegacyTokenInKV(oauth2Creds.access_token, oauth2Creds.expiry_date);
			return;
		}

		console.log("[LegacyAuth] Tokens expired, refreshing...");
		
		const params = new URLSearchParams({
			client_id: OAUTH_CLIENT_ID,
			refresh_token: oauth2Creds.refresh_token,
			grant_type: "refresh_token"
		});
		if (OAUTH_CLIENT_SECRET) params.append("client_secret", OAUTH_CLIENT_SECRET);

		const refreshResponse = await fetch(OAUTH_REFRESH_URL, {
			method: "POST",
			headers: { "Content-Type": "application/x-www-form-urlencoded" },
			body: params
		});

		if (!refreshResponse.ok) throw new Error("Token refresh failed");

		const refreshData = (await refreshResponse.json()) as TokenRefreshResponse;
		this.currentAccessToken = refreshData.access_token;
		await this.cacheLegacyTokenInKV(refreshData.access_token, Date.now() + refreshData.expires_in * 1000);
	}

	private async cacheLegacyTokenInKV(accessToken: string, expiryDate: number): Promise<void> {
		try {
			const ttlSeconds = Math.floor((expiryDate - Date.now()) / 1000) - 300;
			if (ttlSeconds >= 60) {
				await this.env.GEMINI_CLI_KV.put(KV_TOKEN_KEY, JSON.stringify({ access_token: accessToken, expiry_date: expiryDate }), {
					expirationTtl: ttlSeconds
				});
			}
		} catch (e) { /* ignore */ }
	}

	/**
	 * Marks the current account as exhausted for a specific provider.
	 * This triggers the round-robin to pick a different account on the next attempt.
	 */
	public async markAccountExhausted(modelId: string, resetDelaySeconds: number): Promise<void> {
		if (!this.currentAccountId || this.currentAccountId === "legacy_single_account" || !this.env.ACCOUNTS_KV) {
			console.warn("[MultiAuth] Cannot mark account exhausted: not using KV pool or no account selected.");
			return;
		}

		const provider = this.getProviderForModel(modelId);
		const unbanTimestamp = Date.now() + (resetDelaySeconds * 1000);
		
		try {
			const accountData = await this.env.ACCOUNTS_KV.get<AccountData>(this.currentAccountId, "json");
			if (accountData) {
				if (provider === "gemini") {
					accountData.exhausted_gemini_until = unbanTimestamp;
				} else {
					accountData.exhausted_partner_until = unbanTimestamp;
				}
				await this.env.ACCOUNTS_KV.put(this.currentAccountId, JSON.stringify(accountData));
				console.log(`[MultiAuth] 🛑 Account ${this.currentAccountId} marked EXHAUSTED for ${provider} until ${new Date(unbanTimestamp).toISOString()}`);
			}
		} catch (e) {
			console.error("[MultiAuth] Failed to update exhaustion state:", e);
		}
	}

	public async clearTokenCache(): Promise<void> {
		try {
			if (this.currentAccountId && this.currentAccountId !== "legacy_single_account" && this.env.ACCOUNTS_KV) {
				const accountData = await this.env.ACCOUNTS_KV.get<AccountData>(this.currentAccountId, "json");
				if (accountData) {
					accountData.access_token = undefined;
					accountData.expiry_date = undefined;
					await this.env.ACCOUNTS_KV.put(this.currentAccountId, JSON.stringify(accountData));
				}
			} else {
				await this.env.GEMINI_CLI_KV.delete(KV_TOKEN_KEY);
			}
		} catch (e) { /* ignore */ }
	}

	public async callEndpoint(method: string, body: Record<string, unknown>, isRetry: boolean = false): Promise<unknown> {
		if (!this.currentAccessToken) {
			await this.initializeAuth();
		}

		const response = await fetch(`${CODE_ASSIST_ENDPOINT}/${CODE_ASSIST_API_VERSION}:${method}`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${this.currentAccessToken}`
			},
			body: JSON.stringify(body)
		});

		if (!response.ok) {
			if (response.status === 401 && !isRetry) {
				this.currentAccessToken = null;
				await this.clearTokenCache();
				await this.initializeAuth();
				return this.callEndpoint(method, body, true);
			}
			const errorText = await response.text();
			throw new Error(`API call failed with status ${response.status}: ${errorText}`);
		}

		return response.json();
	}

	public getAccessToken(): string | null {
		return this.currentAccessToken;
	}
}