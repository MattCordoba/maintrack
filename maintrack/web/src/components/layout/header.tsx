"use client";

import Link from "next/link";
import { Bell, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MainTrackLogo } from "@/components/shared/logo";
import { cn } from "@/lib/utils";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  notificationCount?: number;
  className?: string;
}

export function Header({
  title,
  showBack = false,
  backHref,
  notificationCount = 0,
  className,
}: HeaderProps) {
  return (
    <header
      className={cn(
        "sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden safe-area-top",
        className
      )}
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          {showBack && backHref && (
            <Link href={backHref}>
              <Button variant="ghost" size="icon" className="-ml-2">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
          )}
          {title ? (
            <h1 className="text-lg font-semibold">{title}</h1>
          ) : (
            <MainTrackLogo size="sm" />
          )}
        </div>

        <Link href="/notifications" className="relative">
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Button>
        </Link>
      </div>
    </header>
  );
}
