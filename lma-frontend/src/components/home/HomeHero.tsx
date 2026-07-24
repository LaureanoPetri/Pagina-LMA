import { Link } from "react-router-dom";
import { ArrowRight, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface HomeHeroProps {
  /** Temporada actual (viene de las estadísticas globales). Opcional: el hero
   *  se renderiza igual mientras los datos todavía están cargando. */
  temporada?: string;
}

/**
 * Hero fullscreen de la landing. Es puramente presentacional: no hace llamadas
 * al backend ni depende de que los datos hayan cargado, así aparece al instante.
 * Se dibuja a lo ancho completo (full-bleed) rompiendo el `container` del Layout.
 */
export function HomeHero({ temporada }: HomeHeroProps) {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 -mt-8 flex min-h-[calc(100vh-4rem)] items-center overflow-hidden">
      {/* ─── Fondo ─── */}
      <div className="absolute inset-0">
        <img
          src="/images/hero-chess.jpg"
          alt=""
          aria-hidden="true"
          className="hero-zoom h-full w-full object-cover object-center"
        />
      </div>

      {/* ─── Overlays (oscurecen la foto y dan legibilidad al texto) ─── */}
      <div className="absolute inset-0 bg-black/40" />
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/70 to-background/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
      {/* Glow dorado sutil */}
      <div className="pointer-events-none absolute -top-1/4 right-0 h-[60vh] w-[60vh] rounded-full bg-amber-500/10 blur-[120px]" />
      {/* Línea dorada superior, coherente con el resto del sitio */}
      <div className="gold-gradient absolute left-0 top-0 h-1 w-full" />

      {/* ─── Contenido ─── */}
      <div className="container relative z-10 mx-auto px-4 py-16 md:py-20">
        <div className="max-w-2xl">
          <img
            src="/images/lma-logo.svg"
            alt="Escudo de la Liga Mendocina de Ajedrez"
            className="hero-rise h-20 w-20 object-contain drop-shadow-2xl md:h-24 md:w-24"
            style={{ animationDelay: "0ms" }}
          />

          <div
            className="hero-rise mt-6 inline-flex items-center gap-2 rounded-full border border-amber-500/30 bg-black/30 px-4 py-1.5 backdrop-blur-sm"
            style={{ animationDelay: "80ms" }}
          >
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-amber-500" />
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-amber-300/90">
              {temporada ? `Temporada ${temporada}` : "Ranking provincial"} · Mendoza
            </span>
          </div>

          <h1
            className="hero-rise mt-6 text-4xl font-black uppercase leading-[0.95] tracking-tight text-white sm:text-5xl lg:text-6xl"
            style={{ animationDelay: "160ms" }}
          >
            Liga Mendocina
            <span className="gold-text block">de Ajedrez</span>
          </h1>

          <p
            className="hero-rise mt-6 max-w-xl text-base leading-relaxed text-zinc-300 md:text-lg"
            style={{ animationDelay: "240ms" }}
          >
            El ranking provincial de Mendoza. Rankings, ELO,
            clubes, ligas y torneos clasificatorios, todo en un solo lugar.
          </p>

          <div
            className="hero-rise mt-9 flex flex-wrap items-center gap-3"
            style={{ animationDelay: "320ms" }}
          >
            <Link to="/ranking">
              <Button
                size="lg"
                className="gold-gradient h-12 px-7 text-base font-semibold text-black hover:opacity-90"
              >
                Ver Ranking
                <ArrowRight size={18} className="ml-2" />
              </Button>
            </Link>
            <Link to="/torneos">
              <Button
                size="lg"
                variant="outline"
                className="h-12 border-white/25 bg-white/5 px-7 text-base text-white backdrop-blur-sm hover:bg-white/10 hover:text-white"
              >
                <Trophy size={18} className="mr-2" />
                Próximos Torneos
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
