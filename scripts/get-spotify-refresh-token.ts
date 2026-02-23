import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

async function getToken() {
    const rl = readline.createInterface({ input, output });

    try {
        const code = await rl.question(
            "\nPaste your Spotify authorization code:\n> "
        );

        const basic = Buffer.from(
            `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`
        ).toString("base64");

        const res = await fetch("https://accounts.spotify.com/api/token", {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
                Authorization: `Basic ${basic}`,
            },
            body: new URLSearchParams({
                grant_type: "authorization_code",
                code: code.trim(),
                redirect_uri: "http://127.0.0.1:3000",
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

getToken();
