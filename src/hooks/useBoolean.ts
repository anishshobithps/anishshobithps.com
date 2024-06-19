import { useState } from "preact/hooks";

export function useBoolean() {
  const [value, setValue] = useState(false);
  const on = () => setValue(true);
  const off = () => setValue(false);
  const toggle = () => setValue((value) => !value);

  return { value, on, off, toggle };
}
