"use client";

import { Sidebar } from "./sidebar";
import { MobileNav } from "./mobile-nav";
import { Header } from "./header";

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  overdueCount?: number;
  notificationCount?: number;
}

export function AppLayout({
  children,
  title,
  showBack = false,
  backHref,
  overdueCount = 0,
  notificationCount = 0,
}: AppLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Desktop Sidebar */}
      <Sidebar overdueCount={overdueCount} notificationCount={notificationCount} />

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile Header */}
        <Header
          title={title}
          showBack={showBack}
          backHref={backHref}
          notificationCount={notificationCount}
        />

        {/* Page Content */}
        <main className="flex-1 pb-20 md:pb-0">{children}</main>

        {/* Mobile Bottom Navigation */}
        <MobileNav overdueCount={overdueCount} />
      </div>
    </div>
  );
}
