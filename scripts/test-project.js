import * as readline from 'readline';

const CLIENT_ID = "1071006060591-tmhssin2h21lcre235vtolojh4g403ep.apps.googleusercontent.com";
const CLIENT_SECRET = "GOCSPX-" + "K58FWR486" + "LdLJ1mLB8s" + "XC4z6qDAf";
const ENDPOINT = "https://daily-cloudcode-pa.googleapis.com/v1internal:loadCodeAssist";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log("=== Antigravity Project ID Tester ===");
console.log("Paste your GCP_SERVICE_ACCOUNT JSON (the single line JSON you got from login.js):");

rl.question('> ', async (input) => {
    try {
        const credentials = JSON.parse(input.trim());
        
        console.log("\nRefreshing access token to ensure it's valid...");
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                refresh_token: credentials.refresh_token,
                grant_type: "refresh_token"
            })
        });

        if (!tokenResponse.ok) {
            throw new Error(`Failed to refresh token: ${await tokenResponse.text()}`);
        }

        const tokenData = await tokenResponse.json();
        const accessToken = tokenData.access_token;
        console.log("Token refreshed successfully.");

        console.log("\nCalling loadCodeAssist endpoint...");
        const loadResponse = await fetch(ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${accessToken}`,
                "User-Agent": "antigravity/cli/1.0.2 windows/amd64"
            },
            body: JSON.stringify({
                metadata: { ideType: "ANTIGRAVITY" }
            })
        });

        const status = loadResponse.status;
        const responseText = await loadResponse.text();
        
        console.log(`\nHTTP Status: ${status}`);
        
        try {
            const json = JSON.parse(responseText);
            console.log("\nRaw JSON Response:");
            console.log(JSON.stringify(json, null, 2));
            
            if (json.cloudaicompanionProject) {
                console.log(`\n✅ SUCCESS! Your project ID is: ${json.cloudaicompanionProject}`);
            } else if (json.ineligibleTiers && json.ineligibleTiers.length > 0) {
                console.log(`\n❌ BLOCKED! Google refused to provide a project. Reason: ${json.ineligibleTiers[0].reasonCode}`);
            } else {
                console.log("\n⚠️ No project ID found in response, but no explicit block either.");
            }
        } catch (e) {
            console.log("\nRaw Text Response:");
            console.log(responseText);
        }
        
    } catch (e) {
        console.error("\nError:", e.message);
    } finally {
        rl.close();
    }
});