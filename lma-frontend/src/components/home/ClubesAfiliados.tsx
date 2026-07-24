import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { CLUBES_AFILIADOS as clubes } from "@/data/clubLogos";

const PLUGIN_OPTIONS = { items: 4, loop: true, nav: true, dots: false, autoplay: true };
const AUTOPLAY_MS = 3000;

/**
 * Sección "Clubes Afiliados": carrusel con la estructura de marcado de Owl
 * Carousel (owl-carousel / owl-item / owl-nav) pero con la lógica de avance,
 * loop y autoplay resuelta en React (el proyecto no usa jQuery).
 */
export function ClubesAfiliados() {
  const [ocultos, setOcultos] = useState<Set<string>>(new Set());
  const visibles = useMemo(() => clubes.filter((c) => !ocultos.has(c.src)), [ocultos]);
  const total = visibles.length;

  const [offset, setOffset] = useState(0);

  const next = () => setOffset((o) => (total ? (o + 1) % total : 0));
  const prev = () => setOffset((o) => (total ? (o - 1 + total) % total : 0));

  useEffect(() => {
    if (!PLUGIN_OPTIONS.autoplay || total === 0) return;
    const id = setInterval(next, AUTOPLAY_MS);
    return () => clearInterval(id);
  }, [total]);

  if (total === 0) return null;

  const itemsPorVista = Math.min(PLUGIN_OPTIONS.items, total);
  // loop: true → la ventana visible siempre "envuelve" sobre el arreglo, sin cortes al llegar al final.
  const slide = Array.from({ length: itemsPorVista }, (_, i) => visibles[(offset + i) % total]);

  return (
    <section className="section section-default bg-color-dark border-top-0 relative left-1/2 w-screen -translate-x-1/2 bg-[#0d0d0d] py-20 md:py-28">
      <div className="container-fluid mx-auto px-4 md:px-10">
        <div className="row">
          <div className="col w-full text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">Comunidad</p>
            <h1 className="text-light text-9 font-weight-bold mb-2 mt-4 pb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Clubes Afiliados
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="col w-full">
            <div className="relative px-10 md:px-14">
              <div
                className="owl-carousel owl-theme full-width owl-loaded owl-drag owl-carousel-init flex items-stretch divide-x divide-white/5 overflow-hidden rounded-lg border border-white/5"
                data-plugin-options={JSON.stringify(PLUGIN_OPTIONS)}
              >
                {slide.map((club, i) => (
                  <div
                    key={`${club.src}-${offset}-${i}`}
                    className="owl-item flex aspect-square flex-1 items-center justify-center bg-[#161819]"
                  >
                    <img
                      src={club.src}
                      alt={club.nombre}
                      onError={() =>
                        setOcultos((prevSet) => new Set(prevSet).add(club.src))
                      }
                      className="h-full w-full object-contain p-8 transition duration-300 ease-out hover:scale-[1.08] md:p-12"
                    />
                  </div>
                ))}
              </div>

              <div className="owl-nav">
                <button
                  type="button"
                  aria-label="Club anterior"
                  onClick={prev}
                  className="owl-prev absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  aria-label="Club siguiente"
                  onClick={next}
                  className="owl-next absolute right-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/5 text-white transition hover:bg-white/15"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
