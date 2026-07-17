import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

const REDIRECT_URI = "http://127.0.0.1:3000";
const AUTHORIZE_ENDPOINT = "https://accounts.spotify.com/authorize";
const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const SCOPES = ["user-read-currently-playing", "user-read-recently-played"];

function buildAuthorizeUrl(clientId: string): string {
    const url = new URL(AUTHORIZE_ENDPOINT);
    url.search = new URLSearchParams({
        client_id: clientId,
        response_type: "code",
        redirect_uri: REDIRECT_URI,
        scope: SCOPES.join(" "),
    }).toString();
    return url.toString();
}

async function getToken() {
    const clientId = process.env.SPOTIFY_CLIENT_ID;
    if (!clientId) throw new Error("SPOTIFY_CLIENT_ID not set");

    const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
    if (!clientSecret) throw new Error("SPOTIFY_CLIENT_SECRET not set");

    console.log("\n1. Open this URL and approve access:\n");
    console.log(buildAuthorizeUrl(clientId));
    console.log(`\n2. Spotify redirects to ${REDIRECT_URI}/?code=...`);
    console.log("   (the page will not load — that is expected)");
    console.log("\n3. Copy the value of the code parameter from that URL.");

    const rl = readline.createInterface({ input, output });

    try {
        const code = await rl.question(
            "\nPaste your Spotify authorization code:\n> "
        );

        const basic = Buffer.from(`${clientId}:${clientSecret}`).toString(
            "base64"
        );

        const res = await fetch(TOKEN_ENDPOINT, {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basic}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code.trim(),
                redirect_uri: REDIRECT_URI,
            }),
        });

        const json = await res.json();

        if (!res.ok) {
            console.error("\n❌ Error:\n", json);
            return;
        }

        console.log("\n✅ Refresh Token:\n");
        console.log(json.refresh_token);
    } catch (err) {
        console.error("Error:", err);
    } finally {
        rl.close();
    }
}

getToken().catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
});
