import { create } from "zustand";
import { persist } from "zustand/middleware";
import { themeStorageKey } from "../../keys/storage.keys";

export type Theme = "light" | "dark";

type States = {
  theme: Theme;
};

type Actions = {
  toggleTheme: () => void;
};

const prefersDark =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

const initialValues: States = {
  theme: prefersDark ? "dark" : "light",
};

// Plain zustand create, not the reset-aware one: the theme is a device preference
// and survives sign-out.
export const useThemeStore = create<States & Actions>()(
  persist(
    (set) => ({
      ...initialValues,
      toggleTheme: () =>
        set((state) => ({ theme: state.theme === "light" ? "dark" : "light" })),
    }),
    { name: themeStorageKey },
  ),
);

export const selectTheme = (state: States) => state.theme;
