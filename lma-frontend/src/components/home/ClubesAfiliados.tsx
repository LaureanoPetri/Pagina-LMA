import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

/**
 * Clubes afiliados. Poné cada logo en /public/images y sumá una línea acá.
 * Se respeta la relación de aspecto (object-contain), así que no importa si el
 * archivo es cuadrado, PNG o JPG: no se deforma ni se recorta. Se conservan los
 * colores originales del logo (sin escala de grises).
 */
const clubes: { src: string; nombre: string }[] = [
  { src: "/images/ColegioAndino.jpg", nombre: "Colegio Andino" },
  { src: "/images/LosOgrosDeBaku.png", nombre: "Los Ogros de Baku" },
  { src: "/images/GimnasiayEsgrima.jpg", nombre: "Gimnasia y Esgrima" },
  { src: "/images/GodoyCruz.jpg", nombre: "Godoy Cruz" },
  { src: "/images/Regatas.jpg", nombre: "Regatas" },
  { src: "/images/Uncuyo.jpg", nombre: "UNCuyo" },
  { src: "/images/Pacifico.jpg", nombre: "Pacífico" },
  { src: "/images/TupungatoAgostinelli.jpg", nombre: "Tupungato Agostinelli" },
  { src: "/images/CSYDAM.jpg", nombre: "CSyDAM" },
];

const PLUGIN_OPTIONS = { items: 6, loop: true, nav: true, dots: false, autoplay: true };
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
            <h1 className="text-light text-9 font-weight-bold mb-2 pb-4 text-3xl font-bold tracking-tight text-white md:text-4xl">
              Clubes Afiliados
            </h1>
          </div>
        </div>

        <div className="row">
          <div className="col w-full">
            <div className="relative px-10 md:px-14">
              <div
                className="owl-carousel owl-theme full-width owl-loaded owl-drag owl-carousel-init flex items-center justify-center gap-8 overflow-hidden md:gap-12"
                data-plugin-options={JSON.stringify(PLUGIN_OPTIONS)}
              >
                {slide.map((club, i) => (
                  <div
                    key={`${club.src}-${offset}-${i}`}
                    className="owl-item flex shrink-0 flex-col items-center"
                  >
                    <img
                      src={club.src}
                      alt={club.nombre}
                      onError={() =>
                        setOcultos((prevSet) => new Set(prevSet).add(club.src))
                      }
                      className="h-16 w-auto object-contain transition duration-300 ease-out hover:scale-[1.08] md:h-24"
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
