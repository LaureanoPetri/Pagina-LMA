import { Reveal } from "@/components/common/Reveal";

/**
 * Fotografías reales de los torneos de la Liga (public/images/galeria1..12).
 * La mayoría son verticales (1200×1600) y algunas horizontales; por eso usamos
 * un masonry por columnas (CSS multi-column) que respeta la proporción natural
 * de cada foto en vez de forzar un tamaño uniforme.
 */
const fotos = Array.from({ length: 12 }, (_, i) => `/images/galeria${i + 1}.jpeg`);

/**
 * Sección "Galería": cierre visual antes del footer. Masonry editorial, hover
 * sutil, bordes discretos y aire entre imágenes.
 */
export function GaleriaHome() {
  return (
    <>
      <Reveal>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-md">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
              Galería
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
              Momentos de la Liga
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
            Torneos, partidas y la comunidad ajedrecística de Mendoza.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-16 columns-2 gap-4 md:columns-3 md:gap-5 lg:columns-4">
          {fotos.map((src, i) => (
            <figure
              key={src}
              className="group mb-4 break-inside-avoid overflow-hidden rounded-xl ring-1 ring-white/10 md:mb-5"
            >
              <img
                src={src}
                alt={`Torneo de la Liga Mendocina de Ajedrez — fotografía ${i + 1}`}
                loading="lazy"
                className="h-auto w-full object-cover transition duration-[600ms] ease-out group-hover:scale-[1.03] group-hover:brightness-[1.07]"
              />
            </figure>
          ))}
        </div>
      </Reveal>
    </>
  );
}
