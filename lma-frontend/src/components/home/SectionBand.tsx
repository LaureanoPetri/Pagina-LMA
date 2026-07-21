import { cn } from "@/lib/utils";

/**
 * Escala de espaciado vertical: comunica jerarquía. El Ranking usa "xl" (respira
 * más que nadie); las secciones secundarias usan "sm"/"md".
 */
const spacingMap = {
  sm: "py-16 md:py-24",
  md: "py-20 md:py-28",
  lg: "py-28 md:py-36",
  xl: "py-32 md:py-44",
} as const;

interface SectionBandProps {
  children: React.ReactNode;
  /** Clases de fondo/tono de la banda (ej. "bg-[#0d0d0d]"). */
  className?: string;
  spacing?: keyof typeof spacingMap;
  id?: string;
  /** Capa decorativa full-bleed detrás del contenido (ej. foto tenue + degradados). */
  backdrop?: React.ReactNode;
}

/**
 * Banda full-width que rompe el `container` del Layout para pintar un tono
 * propio de fondo (el "capítulo"), y vuelve a encolumnar el contenido dentro
 * de un container. Es la pieza que crea el ritmo tonal del Home.
 */
export function SectionBand({ children, className, spacing = "md", id, backdrop }: SectionBandProps) {
  return (
    <section
      id={id}
      className={cn(
        "relative left-1/2 w-screen -translate-x-1/2",
        backdrop && "overflow-hidden",
        spacingMap[spacing],
        className
      )}
    >
      {backdrop && <div className="pointer-events-none absolute inset-0">{backdrop}</div>}
      <div className="container relative z-10 mx-auto px-4">{children}</div>
    </section>
  );
}
