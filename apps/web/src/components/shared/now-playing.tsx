import { NowPlayingLive } from "@/components/shared/now-playing-live";
import { queryKeys } from "@/lib/query-keys";
import { getNowPlaying } from "@/lib/spotify";
import { Prefetch } from "@repo/query/prefetch";

export function NowPlaying() {
  return (
    <Prefetch queryKey={queryKeys.nowPlaying} queryFn={getNowPlaying}>
      <NowPlayingLive />
    </Prefetch>
  );
}
