import { SectionBand } from "@/components/home/SectionBand";
import { QuienesSomos } from "@/components/home/QuienesSomos";
import { RankingDestacado } from "@/components/home/RankingDestacado";
import { ClubesAfiliados } from "@/components/home/ClubesAfiliados";
import { NoticiasHome } from "@/components/home/NoticiasHome";
import { GaleriaHome } from "@/components/home/GaleriaHome";
import type { Noticia, JugadorListado, EstadisticasGlobales } from "@/api/types";

interface HomeContentProps {
  noticias: Noticia[];
  jugadores: JugadorListado[];
  stats: EstadisticasGlobales;
}

/**
 * Segunda parte de la landing (debajo del hero), como experiencia editorial.
 * Cada capítulo tiene su propia composición y las transiciones se resuelven con
 * tono de fondo + espacio (sin separadores decorativos):
 *
 *   Hero ─ #101010 Sobre la Liga ─ #0a0a0a Ranking ─ #141414 Noticias ─ #0d0d0d Clubes ─ #0a0a0a Galería ─ Footer
 */
export function HomeContent({ noticias, jugadores, stats }: HomeContentProps) {
  return (
    <>
      {/* Sobre la Liga — institucional, texto + foto */}
      <SectionBand className="bg-[#101010]" spacing="xl">
        <QuienesSomos stats={stats} />
      </SectionBand>

      {/* Ranking — protagonista, con foto tenue del torneo de fondo */}
      <SectionBand
        className="bg-[#0a0a0a]"
        spacing="xl"
        backdrop={
          <>
            <img
              src="/images/galeria11.jpeg"
              alt=""
              aria-hidden="true"
              className="h-full w-full object-cover opacity-[0.09]"
            />
            {/* Degradados: mantiene los bordes en el tono de la banda y deja
                respirar la foto en el centro, detrás de la lista. */}
            <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0a] via-[#0a0a0a]/60 to-[#0a0a0a]" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-transparent to-[#0a0a0a]" />
            {/* Calidez dorada muy sutil */}
            <div className="absolute left-1/2 top-1/2 h-[70vh] w-[70vh] -translate-x-1/2 -translate-y-1/2 rounded-full bg-amber-500/[0.04] blur-[130px]" />
          </>
        }
      >
        <RankingDestacado jugadores={jugadores} />
      </SectionBand>

      {/* Noticias — layout terminado + estado preparado para el backend */}
      <SectionBand className="bg-[#141414]" spacing="lg">
        <NoticiasHome noticias={noticias} />
      </SectionBand>

      {/* Clubes Afiliados — trae su propio <section> full-bleed con fondo oscuro */}
      <ClubesAfiliados />

      {/* Galería — cierre visual antes del footer */}
      <SectionBand className="bg-[#0a0a0a]" spacing="xl">
        <GaleriaHome />
      </SectionBand>
    </>
  );
}
