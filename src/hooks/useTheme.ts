import { useEffect, useState } from "preact/hooks";

type Theme = "light" | "dark";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setTheme(isDark ? "dark" : "light");
  }, []);

  const toggle = () => {
    const nextTheme = theme === "light" ? "dark" : "light";
    setTheme(nextTheme);
    toggleHtml(nextTheme);
    store(nextTheme);
  };

  return { theme, toggle };
}

function toggleHtml(theme: Theme) {
  const root = document.documentElement;

  if (theme === "light") {
    root.classList.remove("dark");
  } else {
    root.classList.add("dark");
  }
}

function store(theme: Theme) {
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Do nothing.
  }
}
