import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import type { EstadisticasGlobales } from "@/api/types";

interface QuienesSomosProps {
  stats: EstadisticasGlobales;
}

/**
 * "Sobre la Liga Mendocina" — primera sección después del hero. Layout editorial
 * amplio: texto a la izquierda, fotografía institucional grande a la derecha, y
 * debajo una franja sutil de indicadores. Calmo, elegante, institucional.
 */
export function QuienesSomos({ stats }: QuienesSomosProps) {
  const indicadores = [
    { valor: String(stats.jugadores), etiqueta: "Jugadores registrados", destacar: false },
    { valor: String(stats.clubes), etiqueta: "Clubes federados", destacar: false },
    { valor: "Ranking", etiqueta: "ELO provincial", destacar: true },
  ];

  return (
    <>
      <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-20">
        {/* ─── Texto ─── */}
        <Reveal className="lg:col-span-5">
          <div className="flex items-center gap-3">
            <span className="h-px w-10 bg-amber-500/60" />
            <span className="text-xs font-medium uppercase tracking-[0.3em] text-amber-500">
              La institución
            </span>
          </div>

          <h2 className="mt-7 text-3xl font-bold leading-[1.15] tracking-tight md:text-4xl">
            Sobre la Liga Mendocina de Ajedrez
          </h2>

          <p className="mt-7 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            La Liga Mendocina de Ajedrez es una temporada de torneos que reúne a
            jugadores y clubes de toda la provincia. Nuestro objetivo es
            fomentar el crecimiento del ajedrez mendocino, organizar competencias
            y mantener el Ranking ELO provincial.
          </p>

          <div className="mt-9">
            <Link to="/ligas">
              <Button
                variant="outline"
                size="lg"
                className="h-12 border-amber-500/40 bg-transparent px-7 text-base text-amber-400 hover:bg-amber-500/10 hover:text-amber-300"
              >
                Conocer más
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
          </div>
        </Reveal>

        {/* ─── Imagen ─── */}
        <Reveal delay={120} className="lg:col-span-7">
          <div className="relative">
            <div className="pointer-events-none absolute -inset-8 -z-10 rounded-full bg-amber-500/5 blur-3xl" />
            <img
              src="/images/about-chess2.jpg"
              alt="Jugadores durante una partida en un torneo de la Liga Mendocina de Ajedrez"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl shadow-black/60 ring-1 ring-white/10"
            />
          </div>
        </Reveal>
      </div>

      {/* ─── Indicadores sutiles ─── */}
      <Reveal delay={80}>
        <div className="mt-20 grid grid-cols-1 gap-y-8 border-t border-white/10 pt-12 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
          {indicadores.map((ind) => (
            <div key={ind.etiqueta} className="px-2 text-center sm:px-8 sm:first:pl-0 sm:last:pr-0">
              <p
                className={`text-3xl font-black tracking-tight md:text-4xl ${
                  ind.destacar ? "gold-text" : "text-white"
                }`}
              >
                {ind.valor}
              </p>
              <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                {ind.etiqueta}
              </p>
            </div>
          ))}
        </div>
      </Reveal>
    </>
  );
}
