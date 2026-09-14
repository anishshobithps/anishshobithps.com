import { NowPlayingLive } from "@/components/shared/now-playing-live";
import { getQueryClient } from "@/lib/get-query-client";
import { queryKeys } from "@/lib/query-keys";
import { getNowPlaying } from "@/lib/spotify";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

export async function NowPlaying() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: queryKeys.nowPlaying,
    queryFn: getNowPlaying,
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NowPlayingLive />
    </HydrationBoundary>
  );
}
