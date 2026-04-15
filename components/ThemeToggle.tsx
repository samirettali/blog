"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const nextTheme = resolvedTheme === "dark" ? "light" : "dark";

  return (
    <button
      aria-label="Toggle theme"
      className="nav-link block pl-3"
      onClick={() => setTheme(nextTheme)}
      type="button"
    >
      {mounted && resolvedTheme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
