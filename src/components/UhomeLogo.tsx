interface UhomeLogoProps {
  variant?: "full" | "icon";
  height?: number;
  className?: string;
  white?: boolean;
}

export function UhomeLogo({
  variant = "full",
  height = 32,
  className,
  white = false,
}: UhomeLogoProps) {
  if (variant === "icon") {
    return (
      <img
        src="/uhome-logo.svg"
        height={height}
        width={height}
        alt="Uhome"
        className={className}
        style={{
          filter: white ? "brightness(0) invert(1)" : "none",
          objectFit: "contain",
        }}
      />
    );
  }

  return (
    <img
      src="/uhome-logo.svg"
      height={height}
      alt="Uhome Imóveis"
      className={className}
      style={{
        filter: white ? "brightness(0) invert(1)" : "none",
        objectFit: "contain",
        maxWidth: height * 4,
      }}
    />
  );
}
