import { useNavigate, Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";
import type { JugadorListado } from "@/api/types";

interface RankingDestacadoProps {
  /** Jugadores ya traídos por InicioPage (no se dispara ninguna consulta nueva). */
  jugadores: JugadorListado[];
}

/**
 * Ranking en clave editorial (no dashboard): el líder es el protagonista visual,
 * presentado en grande, y los perseguidores (2º a 5º) se listan al costado como
 * en una doble página de revista deportiva. Reutiliza la lógica de orden por ELO
 * clásico sobre los datos ya cargados; el ranking completo vive en /ranking.
 */
export function RankingDestacado({ jugadores }: RankingDestacadoProps) {
  const navigate = useNavigate();

  const top5 = jugadores
    .slice()
    .sort((a, b) => b.elo.clasica - a.elo.clasica)
    .slice(0, 5);

  if (top5.length === 0) return null;

  const [lider, ...perseguidores] = top5;

  return (
    <>
      {/* Encabezado editorial delgado: título + acceso, en una línea. */}
      <Reveal>
        <div className="flex items-end justify-between gap-6 border-b border-white/10 pb-6">
          <h2 className="text-2xl font-bold tracking-tight md:text-3xl">Ranking provincial</h2>
          <Link
            to="/ranking"
            className="group hidden shrink-0 items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-amber-400 sm:inline-flex"
          >
            Ver ranking completo
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>

      <div className="mt-14 grid gap-x-16 gap-y-14 lg:grid-cols-12">
        {/* ─── Líder: protagonista ─── */}
        <Reveal className="lg:col-span-5">
          <button
            type="button"
            onClick={() => navigate(`/jugadores/${lider.id}`)}
            className="group block w-full text-left"
          >
            <div className="flex items-baseline gap-4">
              <span className="gold-text text-6xl font-black leading-none tabular-nums md:text-7xl">01</span>
              <span className="text-xs font-medium uppercase tracking-[0.35em] text-amber-500/80">
                Líder
              </span>
            </div>

            <h3 className="mt-8 text-3xl font-bold leading-tight tracking-tight text-white transition-colors group-hover:text-amber-100 md:text-4xl">
              {lider.nombre} {lider.apellido}
            </h3>
            <p className="mt-3 text-muted-foreground">
              {lider.club}
              {lider.ciudad ? ` · ${lider.ciudad}` : ""}
            </p>

            <div className="mt-10 flex items-end gap-3">
              <span className="gold-text text-5xl font-black leading-none tabular-nums md:text-6xl">
                {lider.elo.clasica}
              </span>
              <span className="pb-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground">
                ELO Clásico
              </span>
            </div>
          </button>
        </Reveal>

        {/* ─── Perseguidores 2º–5º ─── */}
        <Reveal delay={120} className="lg:col-span-7">
          <div className="border-t border-white/10">
            {perseguidores.map((j, i) => (
              <button
                key={j.id}
                type="button"
                onClick={() => navigate(`/jugadores/${j.id}`)}
                className="group flex w-full items-center gap-5 border-b border-white/10 py-6 text-left transition-colors hover:bg-white/[0.03] md:gap-8"
              >
                <span className="w-8 shrink-0 text-2xl font-black tabular-nums text-zinc-700 transition-colors group-hover:text-zinc-500 md:text-3xl">
                  {i + 2}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold text-white transition-colors group-hover:text-amber-400">
                    {j.nombre} {j.apellido}
                  </p>
                  <p className="truncate text-sm text-muted-foreground">
                    {j.club}
                    {j.ciudad ? ` · ${j.ciudad}` : ""}
                  </p>
                </div>
                <span className="shrink-0 gold-text text-2xl font-bold tabular-nums md:text-3xl">
                  {j.elo.clasica}
                </span>
              </button>
            ))}
          </div>

          {/* Acceso al ranking completo (visible también en mobile) */}
          <Link
            to="/ranking"
            className="group mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300 sm:hidden"
          >
            Ver ranking completo
            <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
          </Link>
        </Reveal>
      </div>
    </>
  );
}
