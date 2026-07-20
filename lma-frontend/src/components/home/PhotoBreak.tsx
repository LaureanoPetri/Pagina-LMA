import { Reveal } from "@/components/common/Reveal";

/**
 * Quiebre cinematográfico full-width: una única foto panorámica que separa
 * "¿Qué es la Liga?" del "Ranking". Los degradados superior/inferior están
 * calibrados para fundirse con el tono de las bandas vecinas (#141414 arriba,
 * #0d0d0d abajo), así la foto emerge y se disuelve sin cortes duros.
 */
export function PhotoBreak() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 overflow-hidden">
      <div className="relative flex min-h-[42vh] items-center justify-center md:min-h-[52vh]">
        <img
          src="/images/band-chess.jpg"
          alt="Piezas de ajedrez enfrentadas durante una partida"
          className="absolute inset-0 h-full w-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#141414] via-transparent to-[#0d0d0d]" />

        <Reveal className="relative z-10 mx-auto max-w-2xl px-6 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.3em] text-amber-400/90">
            Ajedrez mendocino
          </p>
          <p className="mt-4 text-2xl font-semibold leading-snug text-white md:text-3xl">
            Cada partida suma para el ranking provincial oficial.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
