import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import { cn } from "@/lib/utils";
import type { JugadorListado } from "@/api/types";

interface RankingDestacadoProps {
  /** Jugadores ya traídos por InicioPage (no se dispara ninguna consulta nueva). */
  jugadores: JugadorListado[];
}

/**
 * Ranking en clave editorial: el Top 5 por ELO clásico como una lista centrada,
 * con el 1º jerarquizado tipográficamente. La presencia visual la aporta la foto
 * tenue de fondo (ver <SectionBand backdrop> en HomeContent); acá el protagonista
 * es la lista. Reutiliza la lógica de orden sobre los datos ya cargados; el
 * ranking completo vive en /ranking.
 */
export function RankingDestacado({ jugadores }: RankingDestacadoProps) {
  const navigate = useNavigate();

  const top5 = jugadores
    .slice()
    .sort((a, b) => b.elo.clasica - a.elo.clasica)
    .slice(0, 5);

  if (top5.length === 0) return null;

  return (
    <>
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">
          Ranking provincial
        </p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
          Top 5 · ELO Clásico
        </h2>
      </Reveal>

      <Reveal delay={100}>
        <ol className="mx-auto mt-16 max-w-2xl divide-y divide-white/10 border-y border-white/10">
          {top5.map((j, i) => {
            const lider = i === 0;
            return (
              <li key={j.id}>
                <button
                  type="button"
                  onClick={() => navigate(`/jugadores/${j.id}`)}
                  className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-5 text-left transition-colors hover:bg-white/[0.03] md:gap-8 md:py-6"
                >
                  <span
                    className={cn(
                      "w-10 text-center font-black leading-none tabular-nums",
                      lider ? "gold-text text-4xl md:text-5xl" : "text-2xl text-zinc-700 md:text-3xl"
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>

                  <div className="min-w-0">
                    <p
                      className={cn(
                        "truncate font-semibold text-white transition-colors group-hover:text-amber-400",
                        lider && "text-lg md:text-xl"
                      )}
                    >
                      {j.nombre} {j.apellido}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {j.club}
                      {j.ciudad ? ` · ${j.ciudad}` : ""}
                    </p>
                  </div>

                  <span
                    className={cn(
                      "gold-text shrink-0 font-bold tabular-nums",
                      lider ? "text-3xl md:text-4xl" : "text-2xl"
                    )}
                  >
                    {j.elo.clasica}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-14 flex justify-center">
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
