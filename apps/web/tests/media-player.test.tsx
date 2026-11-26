import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { renderToString } from "react-dom/server";
import { beforeAll, describe, expect, test } from "vitest";
import {
  MediaPlayer,
  MediaPlayerControls,
  MediaPlayerPlay,
  MediaPlayerPlaybackSpeed,
  MediaPlayerSeek,
  MediaPlayerSeekBackward,
  MediaPlayerSeekForward,
  MediaPlayerTime,
  MediaPlayerVideo,
  MediaPlayerVolume,
} from "@repo/ui/components/media-player";

const agent = createAgent();

beforeAll(() => {
  Object.defineProperty(HTMLMediaElement.prototype, "play", {
    configurable: true,
    value(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", { configurable: true, value: false });
      this.dispatchEvent(new Event("play"));
      this.dispatchEvent(new Event("playing"));
      return Promise.resolve();
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "pause", {
    configurable: true,
    value(this: HTMLMediaElement) {
      Object.defineProperty(this, "paused", { configurable: true, value: true });
      this.dispatchEvent(new Event("pause"));
    },
  });
  Object.defineProperty(HTMLMediaElement.prototype, "load", {
    configurable: true,
    value() {},
  });
});

async function renderPlayer() {
  render(
    <MediaPlayer>
      <MediaPlayerVideo src="/clip.mp4" />
      <MediaPlayerControls>
        <MediaPlayerSeek />
        <MediaPlayerPlay />
        <MediaPlayerSeekBackward />
        <MediaPlayerSeekForward />
        <MediaPlayerVolume />
        <MediaPlayerTime />
        <MediaPlayerPlaybackSpeed />
      </MediaPlayerControls>
    </MediaPlayer>,
  );
  const video = document.querySelector("video")!;
  Object.defineProperty(video, "duration", { configurable: true, value: 21 });
  Object.defineProperty(video, "readyState", { configurable: true, value: 4 });
  await act(async () => {
    video.dispatchEvent(new Event("loadedmetadata"));
    video.dispatchEvent(new Event("durationchange"));
    await settle();
  });
  return video;
}

describe("MediaPlayer", () => {
  test("is a named group whose controls are named by their tooltips", async () => {
    await renderPlayer();
    expect(screen.getByRole("group", { name: "Media player" })).toBeTruthy();
    for (const name of ["Play", "Back 10 seconds", "Forward 10 seconds", "Mute"]) {
      expect(await screen.findByRole("button", { name })).toBeTruthy();
    }
    expect(screen.getByRole("slider", { name: "Seek" })).toBeTruthy();
    expect(screen.getByRole("slider", { name: "Volume" })).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Playback speed 1x" }),
    ).toBeTruthy();
    expect(
      screen.getByRole("button", { name: "Play" }).getAttribute("aria-keyshortcuts"),
    ).toBe("Space");
  });

  test("server HTML already names the icon buttons", () => {
    const html = renderToString(
      <MediaPlayer>
        <MediaPlayerVideo src="/clip.mp4" />
        <MediaPlayerControls>
          <MediaPlayerPlay />
          <MediaPlayerVolume />
        </MediaPlayerControls>
      </MediaPlayer>,
    );
    const host = document.createElement("div");
    host.innerHTML = html;
    const buttons = [...host.querySelectorAll("button")];
    expect(buttons.length).toBeGreaterThan(0);
    for (const button of buttons) {
      const ids = button.getAttribute("aria-labelledby")?.split(" ") ?? [];
      const name = ids.map((id) => host.querySelector(`[id="${id}"]`)?.firstChild?.textContent).join(" ");
      expect(name, button.outerHTML.slice(0, 80)).toMatch(/^(Play|Mute)$/);
    }
  });

  test("play toggles to pause and back", async () => {
    const user = userEvent.setup();
    const video = await renderPlayer();

    await user.click(await screen.findByRole("button", { name: "Play" }));
    expect(video.paused).toBe(false);
    await user.click(await screen.findByRole("button", { name: "Pause" }));
    expect(video.paused).toBe(true);
  });

  test("mute and the volume slider drive the video", async () => {
    const user = userEvent.setup();
    const video = await renderPlayer();

    await user.click(await screen.findByRole("button", { name: "Mute" }));
    expect(video.muted).toBe(true);
    expect(await screen.findByRole("button", { name: "Unmute" })).toBeTruthy();

    const volume = screen.getByRole("slider", { name: "Volume" });
    fireEvent.change(volume, { target: { value: "0.4" } });
    await waitFor(() => expect(video.volume).toBeCloseTo(0.4));
    expect(video.muted).toBe(false);
  });

  test("the speed menu sets the playback rate", async () => {
    const user = userEvent.setup();
    const video = await renderPlayer();

    await user.click(screen.getByRole("button", { name: "Playback speed 1x" }));
    await user.click(await screen.findByRole("menuitemradio", { name: "1.5x" }));
    expect(video.playbackRate).toBe(1.5);
    expect(
      await screen.findByRole("button", { name: "Playback speed 1.5x" }),
    ).toBeTruthy();
  });

  test("an agent can find the controls and change them by name", async () => {
    const video = await renderPlayer();
    await act(() => settle());

    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }
    const labels = components.map((entry) => entry.label);
    for (const label of ["Seek", "Volume", "Play", "Mute"]) {
      expect(labels.some((l) => l?.startsWith(label)), `${label} missing`).toBe(true);
    }

    const result = await agent.act({
      steps: [
        { ref: "Volume", action: "setValue", args: [0.5] },
        { ref: "Seek", action: "setValue", args: [12] },
      ],
    });
    await act(() => settle());
    expect(result.ok, result.error?.message).toBe(true);
    expect(video.volume).toBeCloseTo(0.5);
    expect(video.currentTime).toBeCloseTo(12);
  });
});
