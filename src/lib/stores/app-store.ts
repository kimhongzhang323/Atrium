"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AppState {
  dark: boolean;
  railOpen: boolean;
  userId: string;
  toggleDark: () => void;
  setRailOpen: (v: boolean) => void;
  setUserId: (id: string) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      dark: false,
      railOpen: true,
      userId: "aisyah",
      toggleDark: () => set((s) => ({ dark: !s.dark })),
      setRailOpen: (v) => set({ railOpen: v }),
      setUserId: (id) => set({ userId: id }),
    }),
    { name: "atrium:ui" },
  ),
);
