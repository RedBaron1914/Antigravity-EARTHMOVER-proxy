import * as crypto from 'crypto';
import * as readline from 'readline';
import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs/promises';
import * as path from 'path';

const execAsync = promisify(exec);

const CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET = "GOCSPX-" + "K58FWR486" + "LdLJ1mLB8s" + "XC4z6qDAf";
const REDIRECT_URI = "https://antigravity.google/oauth-callback";
const SCOPES = [
    "https://www.googleapis.com/auth/userinfo.profile",
    "https://www.googleapis.com/auth/experimentsandconfigs",
    "https://www.googleapis.com/auth/userinfo.email",
    "https://www.googleapis.com/auth/cloud-platform",
    "https://www.googleapis.com/auth/cclog",
    "openid"
].join(" ");

function base64URLEncode(str) {
    return str.toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

async function addAccount() {
    console.log("=== EARTHMOVER: Auto-Add Account to Pool ===");
    
    // Check if wrangler is installed and accessible
    try {
        await execAsync('npx wrangler --version');
    } catch (e) {
        console.error("❌ Error: Wrangler is not available. Please run `npm install` first.");
        rl.close();
        return;
    }

    const verifier = base64URLEncode(crypto.randomBytes(32));
    const challenge = base64URLEncode(crypto.createHash('sha256').update(verifier).digest());

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&response_type=code&scope=${encodeURIComponent(SCOPES)}&code_challenge=${challenge}&code_challenge_method=S256&access_type=offline&prompt=consent`;

    console.log("\n1. Open this URL in your browser:");
    console.log("\n" + authUrl + "\n");
    console.log("2. Log in with your burner Google Account and click 'Allow'.");
    console.log("3. The browser will take you to a page displaying a short authorization code (e.g. 4/0Aeo...).");
    console.log("4. Copy ONLY that short code and paste it below.");
    console.log("   (IMPORTANT: Do not close this terminal! You must paste the code right here)\n");

    rl.question('> ', async (input) => {
        try {
            let code = input.trim();
            if (code.includes("code=")) {
                const urlObj = new URL(code);
                code = urlObj.searchParams.get("code");
            }

            console.log("\nExchanging code for tokens...");
            
            const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: new URLSearchParams({
                    client_id: CLIENT_ID,
                    client_secret: CLIENT_SECRET,
                    code: code,
                    redirect_uri: REDIRECT_URI,
                    grant_type: "authorization_code",
                    code_verifier: verifier
                })
            });

            if (!tokenResponse.ok) {
                const errorData = await tokenResponse.json();
                console.error("Failed to get tokens:", JSON.stringify(errorData, null, 2));
                return;
            }

            const tokenData = await tokenResponse.json();
            
            rl.question('\n5. Enter priority for this account (1 = highest, 100 = fallback/paid). Default is 1: ', async (priorityInput) => {
                const priority = parseInt(priorityInput.trim()) || 1;

                const accountJson = JSON.stringify({
                    access_token: tokenData.access_token,
                    refresh_token: tokenData.refresh_token,
                    scope: tokenData.scope,
                    token_type: tokenData.token_type,
                    id_token: tokenData.id_token,
                    expiry_date: Date.now() + (tokenData.expires_in * 1000),
                    priority: priority
                });

                rl.question('\n6. Enter a unique name for this account (e.g., acc_1): ', async (accName) => {
                    const name = accName.trim() || `acc_${Math.floor(Math.random() * 10000)}`;
                    
                    console.log(`\nUploading account '${name}' (Priority: ${priority}) to Cloudflare KV...`);
                    
                    try {
                        const tempFilePath = path.join(process.cwd(), `temp-account-${name}.json`);
                        await fs.writeFile(tempFilePath, accountJson, 'utf8');

                        const cmd = `npx wrangler kv key put --binding=ACCOUNTS_KV "${name}" --path="${tempFilePath}"`;
                            
                        const { stdout, stderr } = await execAsync(cmd);
                        
                        if (stderr && !stderr.includes("wrangler")) {
                            console.warn(stderr);
                        }

                        // Clean up the temp file
                        await fs.unlink(tempFilePath).catch(() => {});

                        console.log(`\n✅ SUCCESS! Account '${name}' was added to your Multi-Account Pool with priority ${priority}!`);
                        console.log("You can verify it by running: npx wrangler kv:key list --binding=ACCOUNTS_KV");
                        
                    } catch (cmdError) {
                        console.error("\n❌ Failed to upload to KV:", cmdError.message);
                        console.log("\nYou can manually add it by going to dash.cloudflare.com -> KV -> Add Entry");
                        console.log(`Key: ${name}`);
                        console.log(`Value: ${accountJson}`);
                    } finally {
                        rl.close();
                    }
                });
            });

        } catch (e) {
            console.error("Error:", e.message);
            rl.close();
        }
    });
}

addAccount();