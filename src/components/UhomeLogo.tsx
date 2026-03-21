interface UhomeLogoProps {
  variant?: "full" | "icon" | "white";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: { icon: 28, text: "text-lg" },
  md: { icon: 36, text: "text-2xl" },
  lg: { icon: 48, text: "text-3xl" },
};

export function UhomeLogo({ variant = "full", size = "md", className = "" }: UhomeLogoProps) {
  const s = sizes[size];
  const iconColor = variant === "white" ? "#FFFFFF" : "#5B6CF9";
  const textColor = variant === "white" ? "text-white" : "text-[hsl(231,70%,65%)]";

  const icon = (
    <svg
      width={s.icon}
      height={s.icon}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      {/* Circle background */}
      <circle cx="60" cy="60" r="56" fill={iconColor} />
      {/* House roof */}
      <path
        d="M60 22L30 48V52H38L60 33L82 52H90V48L60 22Z"
        fill="white"
      />
      {/* House chimney */}
      <rect x="74" y="28" width="8" height="14" fill="white" />
      {/* U shape (door / letter U) */}
      <path
        d="M44 50V78C44 87.941 52.059 96 62 96H58C67.941 96 76 87.941 76 78V50H66V78C66 82.418 62.418 86 58 86H62C57.582 86 54 82.418 54 78V50H44Z"
        fill="white"
      />
    </svg>
  );

  if (variant === "icon") {
    return <span className={`inline-flex ${className}`}>{icon}</span>;
  }

  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {icon}
      <span className={`font-body ${s.text} font-bold tracking-tight ${textColor}`}>
        UHome<span className="opacity-80">.</span>
      </span>
    </span>
  );
}
