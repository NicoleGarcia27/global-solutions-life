"use client";
import { usePathname } from "next/navigation";
import Sidebar from "./Sidebar";

const AUTH_PAGES = ["/login", "/registro", "/buzon"];

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isBarePage = pathname.endsWith("/imprimir");

  if (isAuthPage || isBarePage) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-full overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
