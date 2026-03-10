"use client";

import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FABProps {
  onClick?: () => void;
  href?: string;
  className?: string;
  label?: string;
}

export function FAB({ onClick, className, label = "Add new" }: FABProps) {
  return (
    <Button
      onClick={onClick}
      size="icon"
      className={cn(
        "fixed bottom-20 right-4 z-40 h-14 w-14 rounded-full shadow-lg md:bottom-8 md:right-8",
        className
      )}
      aria-label={label}
    >
      <Plus className="h-6 w-6" />
    </Button>
  );
}
