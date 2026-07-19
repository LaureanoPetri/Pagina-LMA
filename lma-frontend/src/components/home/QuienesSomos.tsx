import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/common/Reveal";
import type { EstadisticasGlobales } from "@/api/types";

interface QuienesSomosProps {
  stats: EstadisticasGlobales;
}

/**
 * Sección institucional "¿Quiénes somos?": texto a la izquierda, foto grande a
 * la derecha y, debajo, una franja sutil de indicadores (no un dashboard de
 * tarjetas). Diseño minimalista, mucho aire y aparición al hacer scroll.
 */
export function QuienesSomos({ stats }: QuienesSomosProps) {
  const indicadores = [
    { valor: String(stats.jugadores), etiqueta: "Jugadores registrados", destacar: false },
    { valor: String(stats.clubes), etiqueta: "Clubes federados", destacar: false },
    { valor: "Oficial", etiqueta: "Ranking ELO provincial", destacar: true },
  ];

  return (
    <>
      <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
        {/* ─── Texto ─── */}
        <Reveal>
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-amber-500/60" />
            <span className="text-xs font-medium uppercase tracking-[0.25em] text-amber-500">
              La institución
            </span>
          </div>

          <h2 className="mt-6 text-3xl font-bold leading-tight tracking-tight md:text-4xl lg:text-[2.75rem]">
            ¿Qué es la Liga Mendocina de Ajedrez?
          </h2>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground md:text-lg">
            La Liga Mendocina de Ajedrez es la organización oficial que reúne a
            jugadores, clubes y torneos de toda la provincia. Nuestro objetivo es
            fomentar el crecimiento del ajedrez mendocino, organizar competencias
            oficiales y mantener el Ranking ELO provincial.
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
        <Reveal delay={120}>
          <div className="relative">
            <div className="pointer-events-none absolute -inset-6 -z-10 rounded-full bg-amber-500/5 blur-3xl" />
            <img
              src="/images/about-chess.jpg"
              alt="Piezas de ajedrez sobre un tablero durante una partida"
              className="aspect-[4/3] w-full rounded-2xl object-cover shadow-2xl shadow-black/50 ring-1 ring-white/10"
            />
          </div>
        </Reveal>
      </div>

      {/* ─── Indicadores sutiles ─── */}
      <Reveal delay={80}>
        <div className="mt-16 grid grid-cols-1 gap-y-8 border-t border-white/10 pt-10 sm:grid-cols-3 sm:divide-x sm:divide-white/10">
          {indicadores.map((ind) => (
            <div key={ind.etiqueta} className="px-2 text-center sm:px-6 sm:first:pl-0 sm:last:pr-0">
              <p
                className={`text-4xl font-black tracking-tight md:text-5xl ${
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
