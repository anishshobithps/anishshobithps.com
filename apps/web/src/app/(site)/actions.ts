"use server";

import { getNowPlaying, type NowPlayingData } from "@/lib/spotify";

export async function fetchNowPlaying(): Promise<NowPlayingData> {
  return getNowPlaying();
}
