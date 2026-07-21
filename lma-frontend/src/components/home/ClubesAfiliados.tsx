import { useState } from "react";
import { Reveal } from "@/components/common/Reveal";

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

/**
 * Sección "Clubes Afiliados": una cinta institucional en movimiento continuo
 * (marquee infinito) con los logos flotando sobre el fondo oscuro del sitio.
 * Sin cajas, bordes ni sombras. El título queda alineado al contenido, pero la
 * cinta se extiende full-bleed (de borde a borde de la ventana). Al hover se
 * detiene, el logo crece ~8% y aparece un banner bordó con el nombre del club.
 */
export function ClubesAfiliados() {
  if (clubes.length === 0) return null;

  return (
    <>
      <Reveal className="text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Clubes Afiliados</h2>
      </Reveal>

      {/* Cinta full-bleed: rompe el container para ir de borde a borde. */}
      <div className="marquee-mask relative left-1/2 mt-20 w-screen -translate-x-1/2 overflow-hidden md:mt-24">
        <ul className="marquee-track flex w-max items-start gap-24 px-12 md:gap-36 md:px-20">
          {/* Contenido duplicado (2ª copia aria-hidden) para el loop sin cortes. */}
          {[...clubes, ...clubes].map((club, i) => (
            <LogoItem key={i} club={club} duplicado={i >= clubes.length} />
          ))}
        </ul>

        {/* Degradados en los bordes: los logos se disuelven, nunca se recortan. */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#0d0d0d] to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#0d0d0d] to-transparent md:w-48" />
      </div>
    </>
  );
}

function LogoItem({ club, duplicado }: { club: { src: string; nombre: string }; duplicado: boolean }) {
  const [oculto, setOculto] = useState(false);
  if (oculto) return null;

  return (
    <li
      className="group relative flex shrink-0 flex-col items-center"
      aria-hidden={duplicado || undefined}
    >
      <img
        src={club.src}
        alt={duplicado ? "" : club.nombre}
        onError={() => setOculto(true)}
        className="h-40 w-auto object-contain transition duration-300 ease-out group-hover:scale-[1.08] group-hover:brightness-110"
      />

      {/* Banner bordó con el nombre (integrado al logo, aparece suave al hover). */}
      <span className="mt-5 translate-y-1 whitespace-nowrap rounded-full bg-[#5f1a24] px-3.5 py-1 text-xs font-medium text-white opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        {club.nombre}
      </span>
    </li>
  );
}
