import { render, waitFor } from "@testing-library/react";
import { Button } from "@ui-sdk/react/button";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { AgentBridge, allowAgentStep } from "@/components/shared/agent-bridge";

type Tool = {
  name: string;
  execute: (input: unknown) => Promise<unknown>;
};

const tools = new Map<string, Tool>();

beforeEach(() => {
  tools.clear();
  Object.defineProperty(document, "modelContext", {
    configurable: true,
    value: {
      registerTool: async (tool: Tool, options?: { signal?: AbortSignal }) => {
        tools.set(tool.name, tool);
        options?.signal?.addEventListener("abort", () => tools.delete(tool.name));
      },
    },
  });
});

afterEach(() => {
  vi.restoreAllMocks();
  Reflect.deleteProperty(document, "modelContext");
});

function renderPage(onDelete: () => void) {
  return render(
    <>
      <AgentBridge />
      <Button data-agent-confirm="Deletes the short link /cv" onClick={onDelete}>
        Delete
      </Button>
    </>,
  );
}

const pressDelete = () =>
  tools.get("act")!.execute({ steps: [{ ref: "Delete", action: "press" }] });

describe("AgentBridge", () => {
  test("registers snapshot, query and act with the browser", async () => {
    renderPage(() => {});
    await waitFor(() => expect([...tools.keys()].sort()).toEqual(["act", "query", "snapshot"]));
  });

  test("asks the visitor before a marked step, and a no stops it", async () => {
    const onDelete = vi.fn();
    const confirm = vi.spyOn(window, "confirm").mockReturnValue(false);
    renderPage(onDelete);
    await waitFor(() => expect(tools.has("act")).toBe(true));

    await pressDelete();
    expect(confirm).toHaveBeenCalledWith(
      "An assistant wants to: Deletes the short link /cv. Allow it?",
    );
    expect(onDelete).not.toHaveBeenCalled();

    confirm.mockReturnValue(true);
    await pressDelete();
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  test("unmarked steps run without asking", () => {
    const ask = vi.fn();
    expect(allowAgentStep({ confirm: undefined }, ask)).toBe(true);
    expect(ask).not.toHaveBeenCalled();
  });
});
