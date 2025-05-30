"use client";

import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext<IChatPluginThemeContextProps>({
  theme: "system",
  setTheme: () => {},
  isDark: false,
});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const getSystemTheme = () =>
    window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";

  const [systemTheme, setSystemTheme] = useState(getSystemTheme);
  const [theme, setTheme] = useState<IChatPluginThemeOptions>(() => {
    const storedTheme = localStorage.getItem("theme") as IChatPluginThemeOptions | null;
    return storedTheme && ["dark", "light", "system"].includes(storedTheme)
      ? storedTheme
      : "system";
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = () => setSystemTheme(getSystemTheme());

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  useEffect(() => {
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(
      theme === "system" ? systemTheme : theme
    );
  }, [theme, systemTheme]);

  useEffect(() => {
    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    } else {
      localStorage.removeItem("theme");
    }
  }, [theme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        isDark:
          theme === "dark" || (theme === "system" && systemTheme === "dark"),
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};
