import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { useState } from "react";
import { describe, expect, test, vi } from "vitest";
import { Slider } from "@repo/ui/components/slider";

function Harness({ onCommit }: { onCommit: (value: number[]) => void }) {
  const [value, setValue] = useState([40]);
  return (
    <Slider
      aria-label="Sound volume"
      min={0}
      max={100}
      step={5}
      value={value}
      onValueChange={setValue}
      onValueCommit={onCommit}
    />
  );
}

describe("@repo/ui slider", () => {
  test("arrow keys step the value and commit it", async () => {
    const user = userEvent.setup();
    const onCommit = vi.fn();
    render(<Harness onCommit={onCommit} />);

    const thumb = screen.getByRole("slider", { name: "Sound volume" }) as HTMLInputElement;
    expect(thumb.value).toBe("40");

    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(thumb.value).toBe("45");
    expect(onCommit).toHaveBeenLastCalledWith([45]);
  });
});
