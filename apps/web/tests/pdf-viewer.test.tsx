import { act, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { settle } from "@ui-sdk/core/testing";
import { createAgent } from "@ui-sdk/react/agent";
import { describe, expect, test } from "vitest";
import {
  PdfViewer,
  PdfViewerControls,
  PdfViewerDownload,
  PdfViewerFilename,
  PdfViewerOpen,
  PdfViewerPagination,
  PdfViewerReload,
  PdfViewerToolbar,
  PdfViewerZoom,
} from "@repo/ui/components/pdf-viewer";

const agent = createAgent();

function renderViewer() {
  render(
    <PdfViewer file="/api/resume" downloadHref="/api/resume/download" deferMs={1e9}>
      <PdfViewerToolbar aria-label="PDF viewer controls">
        <PdfViewerFilename name="resume.pdf" />
        <PdfViewerControls>
          <PdfViewerPagination />
          <PdfViewerZoom />
          <PdfViewerReload />
          <PdfViewerOpen />
          <PdfViewerDownload label="Download" aria-label="Download resume as PDF" />
        </PdfViewerControls>
      </PdfViewerToolbar>
    </PdfViewer>,
  );
  return screen.getByRole("toolbar", { name: "PDF viewer controls" });
}

function zoomField() {
  return screen.getByRole("textbox", { name: "Zoom" }) as HTMLInputElement;
}

describe("PdfViewer toolbar", () => {
  test("is one named toolbar with every control named", () => {
    const toolbar = renderViewer();
    for (const name of ["Zoom out", "Zoom in", "Reload PDF"]) {
      expect(within(toolbar).getByRole("button", { name })).toBeTruthy();
    }
    expect(
      within(toolbar).getByRole("link", { name: "Open PDF in new tab" }).getAttribute("target"),
    ).toBe("_blank");
    expect(
      within(toolbar).getByRole("link", { name: "Download resume as PDF" }).getAttribute("href"),
    ).toBe("/api/resume/download");
    expect(zoomField().value).toBe("100%");
    expect(
      [...toolbar.querySelectorAll<HTMLElement>("button, a, input:not([type=hidden])")].filter(
        (el) => el.tabIndex === 0,
      ),
    ).toHaveLength(1);
  });

  test("zoom buttons step by ten percent and stop at the bounds", async () => {
    const user = userEvent.setup();
    renderViewer();

    await user.click(screen.getByRole("button", { name: "Zoom in" }));
    expect(zoomField().value).toBe("110%");
    for (let i = 0; i < 6; i++) {
      await user.click(screen.getByRole("button", { name: "Zoom out" }));
    }
    expect(zoomField().value).toBe("50%");
    expect(screen.getByRole("button", { name: "Zoom out" }).hasAttribute("disabled") ||
      screen.getByRole("button", { name: "Zoom out" }).getAttribute("aria-disabled") === "true").toBe(true);
  });

  test("arrow keys move along the toolbar and Up steps the zoom field", async () => {
    const user = userEvent.setup();
    renderViewer();

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Zoom out" }));
    await user.keyboard("{ArrowRight}");
    expect(document.activeElement).toBe(zoomField());
    await user.keyboard("{ArrowUp}");
    expect(zoomField().value).toBe("110%");
  });

  test("pagination stays hidden until a document has several pages", () => {
    renderViewer();
    expect(screen.queryByRole("group", { name: "Page navigation" })).toBeNull();
  });

  test("an agent can set the zoom by name", async () => {
    renderViewer();
    const components = agent
      .snapshot()
      .filter((entry) => !entry.offPage && entry.component !== "more");
    for (const entry of components) {
      expect(entry.label, `${entry.component} ${entry.ref} has no name`).toBeTruthy();
    }
    const toolbar = components.find((entry) => entry.component === "toolbar");
    expect(toolbar?.label).toBe("PDF viewer controls");
    expect(toolbar?.buttons).toEqual(["Zoom out", "Zoom in", "Reload PDF"]);
    expect(components.map((entry) => entry.label)).toContain("Zoom");

    const typed = await agent.act({
      steps: [{ ref: "Zoom", action: "setValue", args: [1.5] }],
    });
    await act(() => settle());
    expect(typed.ok, typed.error?.message).toBe(true);
    expect(zoomField().value).toBe("150%");

    const pressed = await agent.act({
      steps: [{ ref: "PDF viewer controls", action: "press", args: ["Zoom in"] }],
    });
    await act(() => settle());
    expect(pressed.ok, pressed.error?.message).toBe(true);
    expect(zoomField().value).toBe("160%");
  });
});
