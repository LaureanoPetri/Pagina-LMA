import { useState } from "react";
import { Reveal } from "@/components/common/Reveal";

/**
 * Clubes afiliados. Poné cada logo en /public/images y sumá una línea acá.
 * Se respeta la relación de aspecto (object-contain + altura fija), así que
 * no importa si el archivo es cuadrado, PNG o JPG: no se deforma.
 *
 * NOTA: los archivos deben existir en /public/images con el nombre exacto
 * (sensible a mayúsculas en producción). Si un logo no se encuentra, se oculta
 * solo (onError) para no mostrar una imagen rota.
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
 * Sección "Clubes Afiliados": una franja institucional en movimiento continuo
 * (marquee infinito) con los logos de los clubes. Sin flechas, botones ni
 * indicadores. Se pausa al hover, el logo crece apenas y aparece una cápsula
 * dorada con el nombre del club.
 */
export function ClubesAfiliados() {
  if (clubes.length === 0) return null;

  return (
    <>
      <Reveal className="text-center">
        <h2 className="text-3xl font-bold tracking-tight md:text-4xl">Clubes Afiliados</h2>
      </Reveal>

      <Reveal delay={100}>
        {/* La máscara recorta los extremos y pausa la animación al hover. */}
        <div className="marquee-mask relative mt-16 overflow-hidden">
          <ul className="marquee-track flex w-max items-stretch gap-14 md:gap-20">
            {/* Contenido duplicado (aria-hidden en la 2ª copia) para el loop. */}
            {[...clubes, ...clubes].map((club, i) => (
              <LogoItem key={i} club={club} duplicado={i >= clubes.length} />
            ))}
          </ul>

          {/* Degradados en los bordes: los logos aparecen y se disuelven. */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-[#101010] to-transparent md:w-32" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-[#101010] to-transparent md:w-32" />
        </div>
      </Reveal>
    </>
  );
}

function LogoItem({ club, duplicado }: { club: { src: string; nombre: string }; duplicado: boolean }) {
  const [oculto, setOculto] = useState(false);
  if (oculto) return null;

  return (
    <li
      className="group relative flex h-32 shrink-0 flex-col items-center justify-start pt-1"
      aria-hidden={duplicado || undefined}
    >
      <div className="flex h-16 items-center justify-center md:h-20">
        <img
          src={club.src}
          alt={duplicado ? "" : club.nombre}
          onError={() => setOculto(true)}
          className="max-h-full w-auto rounded-xl object-contain opacity-80 transition duration-300 ease-out group-hover:scale-105 group-hover:opacity-100 group-hover:brightness-110"
        />
      </div>

      {/* Cápsula dorada con el nombre del club (aparece suave al hover). */}
      <span className="mt-4 translate-y-1 whitespace-nowrap rounded-full bg-[#c9a84c] px-3 py-1 text-xs font-medium text-zinc-900 opacity-0 transition-all duration-300 ease-out group-hover:translate-y-0 group-hover:opacity-100">
        {club.nombre}
      </span>
    </li>
  );
}
