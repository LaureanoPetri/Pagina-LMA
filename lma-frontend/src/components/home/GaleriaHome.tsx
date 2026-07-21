import { Camera } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";

/**
 * Un tile de la galería. Para cargar fotos reales más adelante basta con pasar
 * `src` (y opcionalmente `caption`); si no hay `src`, muestra el placeholder.
 */
interface Tile {
  /** Clases de grid (tamaño del tile dentro del bento). */
  area: string;
  src?: string;
  caption?: string;
}

/**
 * Composición pensada como bento editorial. Reemplazar imágenes es trivial:
 * agregar `src`/`caption` a cada tile. El resto (hover, grilla, responsive) ya
 * está resuelto.
 */
const tiles: Tile[] = [
  { area: "sm:col-span-2 sm:row-span-2" },
  { area: "" },
  { area: "" },
  { area: "sm:col-span-2" },
  { area: "" },
  { area: "" },
  { area: "sm:col-span-2" },
];

/**
 * Sección "Galería": cierre fuerte y visual antes del footer. Layout listo para
 * recibir las fotografías reales de los torneos (sin imágenes de relleno).
 */
export function GaleriaHome() {
  return (
    <>
      <Reveal>
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <h2 className="max-w-md text-3xl font-bold tracking-tight md:text-4xl">
            Momentos de la Liga
          </h2>
          <p className="max-w-sm text-sm leading-relaxed text-muted-foreground md:text-right">
            Torneos, premiaciones y la comunidad ajedrecística de Mendoza.
            Muy pronto, con las fotografías oficiales.
          </p>
        </div>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-14 grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[200px] sm:grid-cols-4 sm:gap-4">
          {tiles.map((t, i) => (
            <GalleryTile key={i} tile={t} />
          ))}
        </div>
      </Reveal>
    </>
  );
}

function GalleryTile({ tile }: { tile: Tile }) {
  return (
    <figure
      className={cn(
        "group relative overflow-hidden rounded-2xl bg-white/[0.02] ring-1 ring-white/10",
        tile.area
      )}
    >
      {tile.src ? (
        <img
          src={tile.src}
          alt={tile.caption ?? ""}
          className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-white/[0.04] to-transparent">
          <Camera
            size={28}
            className="text-white/10 transition-colors duration-300 group-hover:text-amber-500/40"
          />
        </div>
      )}

      {/* Overlay dorado sutil + oscurecido inferior al hacer hover */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-amber-500/0 transition-[box-shadow,--tw-ring-color] duration-300 group-hover:ring-amber-500/30" />

      {tile.caption && (
        <figcaption className="absolute bottom-4 left-5 translate-y-1 text-sm font-medium text-white opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
          {tile.caption}
        </figcaption>
      )}
    </figure>
  );
}
