import { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Reveal } from "@/components/common/Reveal";

/**
 * Clubes afiliados. Poné cada logo en /public/images y sumá una línea acá.
 * Se respeta la relación de aspecto (object-contain + altura fija), así que no
 * importa si el archivo es cuadrado, PNG o JPG: no se deforma ni se recorta.
 * Se conservan los colores originales del logo (sin escala de grises).
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

/**
 * Sección "Clubes Afiliados": franja institucional con los logos de los clubes.
 * Slider horizontal con flechas (dark + dorado al hover), swipe táctil en mobile
 * y "peek" de los logos vecinos en los bordes. Sin marcos por logo; el fondo es
 * una única franja gris continua (la aporta la <SectionBand> contenedora).
 */
export function ClubesAfiliados() {
  const scrollerRef = useRef<HTMLDivElement>(null);

  const scrollByPage = (dir: 1 | -1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  if (clubes.length === 0) return null;

  return (
    <>
      <Reveal className="text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">Clubes</p>
        <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">Clubes Afiliados</h2>
      </Reveal>

      <Reveal delay={100}>
        <div className="relative mt-14 md:mt-16">
          {/* Flecha izquierda */}
          <button
            type="button"
            onClick={() => scrollByPage(-1)}
            aria-label="Ver clubes anteriores"
            className="group absolute left-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-sm transition-colors hover:border-amber-500/40 hover:bg-black/70 md:h-12 md:w-12"
          >
            <ChevronLeft size={20} className="text-zinc-400 transition-colors group-hover:text-[#c9a84c]" />
          </button>

          {/* Flecha derecha */}
          <button
            type="button"
            onClick={() => scrollByPage(1)}
            aria-label="Ver más clubes"
            className="group absolute right-0 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-sm transition-colors hover:border-amber-500/40 hover:bg-black/70 md:h-12 md:w-12"
          >
            <ChevronRight size={20} className="text-zinc-400 transition-colors group-hover:text-[#c9a84c]" />
          </button>

          {/* Fila deslizable (swipe táctil nativo + scroll suave por flechas) */}
          <div
            ref={scrollerRef}
            className="flex items-center gap-10 overflow-x-auto scroll-smooth px-14 py-4 [-ms-overflow-style:none] [scrollbar-width:none] md:gap-16 md:px-16 [&::-webkit-scrollbar]:hidden"
          >
            {clubes.map((club) => (
              <LogoItem key={club.src} club={club} />
            ))}
          </div>

          {/* Degradados en los bordes (peek): los logos se disuelven hacia la franja */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-14 bg-gradient-to-r from-[#1a1a1a] to-transparent md:w-20" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-14 bg-gradient-to-l from-[#1a1a1a] to-transparent md:w-20" />
        </div>
      </Reveal>
    </>
  );
}

function LogoItem({ club }: { club: { src: string; nombre: string } }) {
  const [oculto, setOculto] = useState(false);
  if (oculto) return null;

  return (
    <img
      src={club.src}
      alt={club.nombre}
      onError={() => setOculto(true)}
      className="h-28 w-auto shrink-0 object-contain transition-transform duration-300 ease-out hover:scale-105 md:h-32"
    />
  );
}
