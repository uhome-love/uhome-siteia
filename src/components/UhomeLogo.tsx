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

  const aspectRatio = 1424 / 420;
  const width = Math.round(height * aspectRatio);

  return (
    <img
      src="/uhome-logo.svg"
      height={height}
      width={width}
      alt="Uhome Imóveis"
      className={className}
      style={{
        filter: white ? "brightness(0) invert(1)" : "none",
        objectFit: "contain",
        display: "block",
      }}
    />
  );
}
