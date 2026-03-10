import { cn } from "@/lib/utils";

interface MainTrackLogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function MainTrackLogo({
  size = "md",
  showText = true,
  className,
}: MainTrackLogoProps) {
  const sizeClasses = {
    sm: "h-6 w-6",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  const textSizeClasses = {
    sm: "text-lg",
    md: "text-xl",
    lg: "text-2xl",
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Logo Icon - A stylized wrench/gear combo representing maintenance */}
      <svg
        className={cn(sizeClasses[size], "text-primary")}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Outer circle - track */}
        <circle
          cx="20"
          cy="20"
          r="18"
          stroke="currentColor"
          strokeWidth="2.5"
          fill="none"
        />
        {/* Inner gear/cog teeth */}
        <path
          d="M20 6V10M20 30V34M6 20H10M30 20H34M10.1 10.1L13 13M27 27L29.9 29.9M29.9 10.1L27 13M13 27L10.1 29.9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Center check mark */}
        <path
          d="M14 20L18 24L26 16"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-foreground",
            textSizeClasses[size]
          )}
        >
          MainTrack
        </span>
      )}
    </div>
  );
}

export function MainTrackIcon({ className }: { className?: string }) {
  return (
    <svg
      className={cn("text-primary", className)}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke="currentColor"
        strokeWidth="2.5"
        fill="none"
      />
      <path
        d="M20 6V10M20 30V34M6 20H10M30 20H34M10.1 10.1L13 13M27 27L29.9 29.9M29.9 10.1L27 13M13 27L10.1 29.9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M14 20L18 24L26 16"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
