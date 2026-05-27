import * as crypto from 'crypto';
import * as readline from 'readline';

const CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET = "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";
const REDIRECT_URI = "https://antigravity.google/oauth-callback";
const SCOPES = "https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/experimentsandconfigs https://www.googleapis.com/auth/userinfo.email https://www.googleapis.com/auth/cloud-platform https://www.googleapis.com/auth/cclog openid";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

async function login() {
    console.log("=== Antigravity Proxy Auth ===");
    
    // Generate PKCE code verifier and challenge (Google requires this for modern flows)
    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(crypto.createHash('sha256').update(verifier).digest());

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&code_challenge=${challenge}&code_challenge_method=S256&access_type=offline&prompt=consent`;

    console.log("\n1. Open this URL in your browser:");
    console.log("\n" + authUrl + "\n");
    console.log("2. Log in with your Google Account and click 'Allow'.");
    console.log("3. The browser will take you to a page displaying a short authorization code (e.g. 4/0Aeo...).");
    console.log("4. Copy ONLY that short code and paste it below.");
    console.log("   (IMPORTANT: Do not close this terminal! You must paste the code right here)");
    console.log("\n");

    rl.question('> ', async (input) => {
        try {
            let code = input.trim();
            // Fallback just in case they still paste the full URL
            if (code.includes("code=")) {
                const urlObj = new URL(code);
                code = urlObj.searchParams.get("code");
            }

            if (!code) {
                console.error("Could not find 'code' in the input.");
                process.exit(1);
            }

            console.log("\nExchanging code for tokens...");

            const response = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                    "User-Agent": "Go-http-client/2.0"
                },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    code_verifier: verifier,
                    grant_type: "authorization_code",
                    redirect_uri: REDIRECT_URI
                })
            });

            if (!response.ok) {
                console.error("Failed to get tokens:", await response.text());
                process.exit(1);
            }

            const data = await response.json();
            
            const wranglerJson = {
                access_token: "expired",
                refresh_token: data.refresh_token,
                scope: SCOPES,
                token_type: "Bearer",
                id_token: "",
                expiry_date: 0
            };

            console.log("\n✅ SUCCESS! Here is your GCP_SERVICE_ACCOUNT secret for Cloudflare:\n");
            console.log(JSON.stringify(wranglerJson));
            console.log("\nRun `npx wrangler secret put GCP_SERVICE_ACCOUNT` and paste the single line of JSON above.");
            
        } catch (e) {
            console.error("Error:", e.message);
        } finally {
            rl.close();
        }
    });
}

login();