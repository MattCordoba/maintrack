"use client";

import {
  Home,
  Building,
  Building2,
  Trees,
  Palmtree,
  Car,
  Truck,
  Caravan,
  Bike,
  Snowflake,
  Ship,
  Sailboat,
  Waves,
  Container,
  Plane,
  Radio,
  Mountain,
  Scissors,
  Tractor,
  Wind,
  Axe,
  Droplets,
  Zap,
  Flower2,
  Gauge,
  Trash2,
  ArrowUp,
  Circle,
  Crosshair,
  Printer,
  Cpu,
  Minus,
  Grid3X3,
  Shovel,
  MoveVertical,
  ArrowUpRight,
  Fish,
  Target,
  Anchor,
  Lock,
  HardHat,
  Wrench,
  Backpack,
  LucideIcon,
  Square,
} from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, LucideIcon> = {
  home: Home,
  building: Building,
  "building-2": Building2,
  trees: Trees,
  palmtree: Palmtree,
  car: Car,
  truck: Truck,
  caravan: Caravan,
  bike: Bike,
  snowflake: Snowflake,
  ship: Ship,
  sailboat: Sailboat,
  waves: Waves,
  container: Container,
  plane: Plane,
  radio: Radio,
  mountain: Mountain,
  scissors: Scissors,
  tractor: Tractor,
  wind: Wind,
  axe: Axe,
  droplets: Droplets,
  zap: Zap,
  "flower-2": Flower2,
  gauge: Gauge,
  "trash-2": Trash2,
  "arrow-up": ArrowUp,
  circle: Circle,
  crosshair: Crosshair,
  printer: Printer,
  cpu: Cpu,
  minus: Minus,
  "grid-3x3": Grid3X3,
  shovel: Shovel,
  "move-vertical": MoveVertical,
  "arrow-up-right": ArrowUpRight,
  fish: Fish,
  target: Target,
  anchor: Anchor,
  lock: Lock,
  "hard-hat": HardHat,
  wrench: Wrench,
  backpack: Backpack,
  square: Square,
};

interface AssetIconProps {
  iconSlug: string;
  className?: string;
  size?: "sm" | "md" | "lg";
}

export function AssetIcon({ iconSlug, className, size = "md" }: AssetIconProps) {
  const Icon = iconMap[iconSlug] || Wrench;

  const sizeClasses = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div
      className={cn(
        "flex items-center justify-center rounded-lg bg-primary/10 p-2",
        className
      )}
    >
      <Icon className={cn("text-primary", sizeClasses[size])} />
    </div>
  );
}
