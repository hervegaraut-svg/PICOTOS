"use client";

import { usePathname } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { MembersStrip } from "@/components/layout/MembersStrip";
import { BottomNav } from "@/components/layout/BottomNav";

const HIDE_SHELL_ROUTES = ["/login", "/first-login"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const showShell = !HIDE_SHELL_ROUTES.includes(pathname);

  if (!showShell) {
    return <>{children}</>;
  }

  return (
    <div className="mx-auto min-h-screen max-w-md bg-cream pb-20">
      <Header />
      <MembersStrip />
      <main className="px-4 pb-6 pt-4">{children}</main>
      <BottomNav />
    </div>
  );
}
