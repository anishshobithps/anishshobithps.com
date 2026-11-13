import { NowPlayingLive } from "@/components/shared/now-playing-live";
import { getNowPlaying } from "@/lib/spotify";

export async function NowPlaying() {
  const initial = await getNowPlaying();
  return <NowPlayingLive initial={initial} />;
}
