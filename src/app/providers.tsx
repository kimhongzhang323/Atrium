"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { useAppStore } from "@/lib/stores/app-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [qc] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 60_000, refetchOnWindowFocus: false } },
  }));

  const dark = useAppStore((s) => s.dark);
  useEffect(() => {
    document.body.classList.toggle("dark", dark);
  }, [dark]);

  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}
