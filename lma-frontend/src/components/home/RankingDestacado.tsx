import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";
import type { JugadorListado, CategoriaElo } from "@/api/types";

interface RankingDestacadoProps {
  /** Jugadores ya traídos por InicioPage (no se dispara ninguna consulta nueva). */
  jugadores: JugadorListado[];
}

const categorias: { key: CategoriaElo; label: string }[] = [
  { key: "clasica", label: "ELO Clásico" },
  { key: "rapida", label: "ELO Rápido" },
  { key: "blitz", label: "ELO Blitz" },
];

/**
 * Ranking en clave editorial: el Top 5 por cada categoría (Clásico, Rápido,
 * Blitz) en tres columnas simultáneas, con el 1º jerarquizado. La presencia
 * visual la aporta la foto tenue de fondo (ver <SectionBand backdrop> en
 * HomeContent). Reutiliza los datos ya cargados; el ranking completo vive en
 * /ranking.
 */
export function RankingDestacado({ jugadores }: RankingDestacadoProps) {
  if (jugadores.length === 0) return null;

  const topPorCategoria = (key: CategoriaElo) =>
    jugadores
      .slice()
      .sort((a, b) => b.elo[key] - a.elo[key])
      .slice(0, 5);

  return (
    <>
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
          Ranking provincial
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Top 5 por categoría
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-16 grid gap-y-14 md:grid-cols-3 md:divide-x md:divide-white/10">
          {categorias.map((cat, idx) => (
            <div
              key={cat.key}
              className={cn("md:px-8", idx === 0 && "md:pl-0", idx === categorias.length - 1 && "md:pr-0")}
            >
              <p className="mb-6 text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
                {cat.label}
              </p>
              <RankingColumna categoria={cat.key} jugadores={topPorCategoria(cat.key)} />
            </div>
          ))}
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-16 flex justify-center">
          <Link to="/ranking">
            <Button
              size="lg"
              className="gold-gradient h-12 px-7 text-base font-semibold text-black hover:opacity-90"
            >
              Ver ranking completo
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </Reveal>
    </>
  );
}

function RankingColumna({ categoria, jugadores }: { categoria: CategoriaElo; jugadores: JugadorListado[] }) {
  const navigate = useNavigate();

  return (
    <ol className="divide-y divide-white/10 border-y border-white/10">
      {jugadores.map((j, i) => {
        const lider = i === 0;
        return (
          <li key={j.id}>
            <button
              type="button"
              onClick={() => navigate(`/jugadores/${j.id}`)}
              className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-4 py-4 text-left transition-colors hover:bg-white/[0.03]"
            >
              <span
                className={cn(
                  "w-6 text-center font-black leading-none tabular-nums",
                  lider ? "gold-text text-2xl md:text-3xl" : "text-lg text-zinc-700 md:text-xl"
                )}
              >
                {i + 1}
              </span>

              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-white transition-colors group-hover:text-amber-400 md:text-base">
                  {j.nombre} {j.apellido}
                </p>
                <p className="truncate text-xs text-muted-foreground">{j.club}</p>
              </div>

              <span className="gold-text shrink-0 text-lg font-bold tabular-nums md:text-xl">
                {j.elo[categoria]}
              </span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}
