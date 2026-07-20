import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import type { JugadorListado } from "@/api/types";

interface RankingDestacadoProps {
  /** Jugadores ya traídos por InicioPage (no se dispara ninguna consulta nueva). */
  jugadores: JugadorListado[];
}

/**
 * Preview elegante del ranking: el Top 5 por ELO clásico. Reutiliza la misma
 * lógica de orden que ya usaba el Home (sort por elo.clasica) sobre los datos
 * ya cargados; el ranking completo (con filtros y modalidades) vive en /ranking.
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
        <div className="flex items-center justify-center gap-3">
          <span className="h-px w-8 bg-amber-500/60" />
          <span className="text-xs font-medium uppercase tracking-[0.25em] text-amber-500">
            Ranking provincial
          </span>
          <span className="h-px w-8 bg-amber-500/60" />
        </div>
        <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
          Los mejores del ranking
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-relaxed text-muted-foreground">
          El Top 5 de la clasificación oficial por ELO clásico. Consultá el
          ranking completo con todas las modalidades y filtros.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mx-auto mt-12 max-w-3xl border-y border-white/10">
          {top5.map((j, i) => (
            <button
              key={j.id}
              type="button"
              onClick={() => navigate(`/jugadores/${j.id}`)}
              className="group flex w-full items-center gap-4 border-b border-white/10 py-5 text-left transition-colors last:border-b-0 hover:bg-white/[0.03] md:gap-6"
            >
              <span
                className={`w-10 shrink-0 text-center text-2xl font-black tabular-nums md:text-3xl ${
                  i === 0 ? "gold-text" : "text-zinc-600"
                }`}
              >
                {i + 1}
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-white transition-colors group-hover:text-amber-400">
                  {j.nombre} {j.apellido}
                </p>
                <p className="truncate text-sm text-muted-foreground">
                  {j.club}
                  {j.ciudad ? ` · ${j.ciudad}` : ""}
                </p>
              </div>

              <div className="shrink-0 text-right">
                <p className="gold-text text-2xl font-bold tabular-nums">{j.elo.clasica}</p>
                <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ELO</p>
              </div>
            </button>
          ))}
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-10 flex justify-center">
          <Link to="/ranking">
            <Button
              size="lg"
              className="gold-gradient h-12 px-7 text-base font-semibold text-black hover:opacity-90"
            >
              Ver Ranking Completo
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </Link>
        </div>
      </Reveal>
    </>
  );
}
