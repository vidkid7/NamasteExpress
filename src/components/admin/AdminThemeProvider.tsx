"use client";

import { useEffect, useState } from "react";

export function AdminThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<"light" | "dark">("light");

  useEffect(() => {
    const stored = localStorage.getItem("adminTheme") as "light" | "dark" | null;
    if (stored) setTheme(stored);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-admin-theme", theme);
    return () => {
      document.documentElement.removeAttribute("data-admin-theme");
    };
  }, [theme]);

  return <div data-admin-theme={theme}>{children}</div>;
}
