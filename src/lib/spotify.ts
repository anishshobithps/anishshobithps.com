import { unstable_cache } from "next/cache";

const TOKEN_ENDPOINT = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_ENDPOINT =
    "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_ENDPOINT =
    "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type SpotifyTrack = {
    name: string;
    artists: Array<{ name: string }>;
    album: { images: Array<{ url: string }> };
    external_urls: { spotify: string };
};

export type NowPlayingData =
    | {
        isPlaying: boolean;
        title: string;
        artist: string;
        albumArt: string | null;
        songUrl: string;
    }
    | { isPlaying: false; title: null; artist: null; albumArt: null; songUrl: null };

async function getAccessToken(): Promise<string> {
    const basic = Buffer.from(
        `${process.env.SPOTIFY_CLIENT_ID}:${process.env.SPOTIFY_CLIENT_SECRET}`,
    ).toString("base64");

    const res = await fetch(TOKEN_ENDPOINT, {
        method: "POST",
        headers: {
            Authorization: `Basic ${basic}`,
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            grant_type: "refresh_token",
            refresh_token: process.env.SPOTIFY_REFRESH_TOKEN ?? "",
        }),
    });

    const json = (await res.json()) as { access_token: string };
    return json.access_token;
}

export const getNowPlaying = unstable_cache(
    async (): Promise<NowPlayingData> => {
        try {
            const accessToken = await getAccessToken();
            const headers = { Authorization: `Bearer ${accessToken}` };

            const res = await fetch(NOW_PLAYING_ENDPOINT, { headers });

            if (res.status === 204 || res.status >= 400) {
                // Nothing actively playing — fall back to recently played
                const recentRes = await fetch(RECENTLY_PLAYED_ENDPOINT, { headers });
                if (!recentRes.ok)
                    return { isPlaying: false, title: null, artist: null, albumArt: null, songUrl: null };

                const recent = (await recentRes.json()) as {
                    items: Array<{ track: SpotifyTrack }>;
                };
                const track = recent.items[0]?.track;
                if (!track)
                    return { isPlaying: false, title: null, artist: null, albumArt: null, songUrl: null };

                return {
                    isPlaying: false,
                    title: track.name,
                    artist: track.artists.map((a) => a.name).join(", "),
                    albumArt: track.album.images[0]?.url ?? null,
                    songUrl: track.external_urls.spotify,
                };
            }

            const data = (await res.json()) as {
                is_playing: boolean;
                item: SpotifyTrack | null;
            };
            if (!data.item)
                return { isPlaying: false, title: null, artist: null, albumArt: null, songUrl: null };

            return {
                isPlaying: data.is_playing,
                title: data.item.name,
                artist: data.item.artists.map((a) => a.name).join(", "),
                albumArt: data.item.album.images[0]?.url ?? null,
                songUrl: data.item.external_urls.spotify,
            };
        } catch {
            return { isPlaying: false, title: null, artist: null, albumArt: null, songUrl: null };
        }
    },
    ["spotify-now-playing"],
    { revalidate: 60 },
);
