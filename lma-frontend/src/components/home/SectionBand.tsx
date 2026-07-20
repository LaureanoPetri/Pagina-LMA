import { cn } from "@/lib/utils";

/**
 * Escala de espaciado vertical: comunica jerarquía. El Ranking usa "xl" (respira
 * más que nadie); las secciones secundarias usan "sm"/"md".
 */
const spacingMap = {
  sm: "py-14 md:py-16",
  md: "py-16 md:py-24",
  lg: "py-20 md:py-28",
  xl: "py-24 md:py-36",
} as const;

interface SectionBandProps {
  children: React.ReactNode;
  /** Clases de fondo/tono de la banda (ej. "bg-[#0d0d0d]"). */
  className?: string;
  spacing?: keyof typeof spacingMap;
  id?: string;
}

/**
 * Banda full-width que rompe el `container` del Layout para pintar un tono
 * propio de fondo (el "capítulo"), y vuelve a encolumnar el contenido dentro
 * de un container. Es la pieza que crea el ritmo tonal del Home.
 */
export function SectionBand({ children, className, spacing = "md", id }: SectionBandProps) {
  return (
    <section
      id={id}
      className={cn("relative left-1/2 w-screen -translate-x-1/2", spacingMap[spacing], className)}
    >
      <div className="container mx-auto px-4">{children}</div>
    </section>
  );
}
