interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export function Logo({ size = "md", showText = true }: LogoProps) {
  const sizes = {
    sm: { img: 32, text: "text-sm" },
    md: { img: 44, text: "text-base" },
    lg: { img: 80, text: "text-2xl" },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/images/lma-logo.svg"
        alt="Liga Mendocina de Ajedrez"
        style={{ width: s.img, height: s.img }}
        className="object-contain drop-shadow-md"
      />
      {showText && (
        <div className="flex flex-col leading-none">
          <span className={`font-bold gold-text ${s.text}`}>Liga Mendocina</span>
          <span className={`font-semibold text-muted-foreground ${size === "lg" ? "text-base" : "text-[10px]"}`}>
            de Ajedrez
          </span>
        </div>
      )}
    </div>
  );
}
