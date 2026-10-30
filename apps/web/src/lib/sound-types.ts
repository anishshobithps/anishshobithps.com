export interface SoundAsset {
  name: string;
  dataUri: string;
  duration: number;
  format: "mp3" | "wav" | "ogg";
  license: "CC0" | "OGA-BY" | "MIT";
  author: string;
}
