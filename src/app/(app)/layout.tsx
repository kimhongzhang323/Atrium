import { AppShell } from "@/components/shell/app-shell";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AppShell trail={["Atrium"]}>{children}</AppShell>;
}
