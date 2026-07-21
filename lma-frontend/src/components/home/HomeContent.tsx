import { SectionBand } from "@/components/home/SectionBand";
import { QuienesSomos } from "@/components/home/QuienesSomos";
import { RankingDestacado } from "@/components/home/RankingDestacado";
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
 *   Hero ─ #101010 Sobre la Liga ─ #0a0a0a Ranking ─ #141414 Noticias ─ #0a0a0a Galería ─ Footer
 */
export function HomeContent({ noticias, jugadores, stats }: HomeContentProps) {
  return (
    <>
      {/* Sobre la Liga — institucional, texto + foto */}
      <SectionBand className="bg-[#101010]" spacing="xl">
        <QuienesSomos stats={stats} />
      </SectionBand>

      {/* Ranking — protagonista, layout de revista */}
      <SectionBand className="bg-[#0a0a0a]" spacing="xl">
        <RankingDestacado jugadores={jugadores} />
      </SectionBand>

      {/* Noticias — layout terminado + estado preparado para el backend */}
      <SectionBand className="bg-[#141414]" spacing="lg">
        <NoticiasHome noticias={noticias} />
      </SectionBand>

      {/* Galería — cierre visual antes del footer */}
      <SectionBand className="bg-[#0a0a0a]" spacing="xl">
        <GaleriaHome />
      </SectionBand>
    </>
  );
}
