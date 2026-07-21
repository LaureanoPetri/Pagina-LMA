import { Newspaper, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Reveal } from "@/components/common/Reveal";
import type { Noticia } from "@/api/types";

interface NoticiasHomeProps {
  /** Noticias reales del backend. Si viene vacío, se muestra el estado
   *  "preparado" con tarjetas placeholder (nunca datos inventados). */
  noticias: Noticia[];
}

/**
 * Sección "Últimas noticias". El layout ya está terminado: si el backend
 * devuelve noticias se renderizan; si no, se muestran tres tarjetas placeholder
 * elegantes que comunican dónde aparecerán las novedades. Listo para datos
 * dinámicos, sin mock ni noticias falsas.
 */
export function NoticiasHome({ noticias }: NoticiasHomeProps) {
  const hayNoticias = noticias.length > 0;
  const items = noticias.slice(0, 3);

  return (
    <>
      {/* Encabezado centrado (composición distinta al resto de la página). */}
      <Reveal className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500/90">Actualidad</p>
        <h2 className="mt-4 text-2xl font-bold tracking-tight md:text-3xl">Últimas noticias</h2>
        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
          Novedades, resultados y comunicados oficiales de la Liga Mendocina de Ajedrez.
        </p>
      </Reveal>

      <div className="mt-14 grid gap-6 md:grid-cols-3">
        {hayNoticias
          ? items.map((n, i) => (
              <Reveal key={n.id} delay={i * 90}>
                <NoticiaCard noticia={n} />
              </Reveal>
            ))
          : [0, 1, 2].map((i) => (
              <Reveal key={i} delay={i * 90}>
                <NoticiaPlaceholder />
              </Reveal>
            ))}
      </div>

      {hayNoticias && (
        <Reveal delay={120}>
          <div className="mt-12 flex justify-center">
            <Link
              to="/torneos"
              className="group inline-flex items-center gap-1.5 text-sm font-medium text-amber-400 transition-colors hover:text-amber-300"
            >
              Ver todas las noticias
              <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      )}
    </>
  );
}

/** Tarjeta de noticia real (recibe el objeto del backend). */
function NoticiaCard({ noticia }: { noticia: Noticia }) {
  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-amber-500/30">
      <div className="aspect-[16/10] overflow-hidden bg-black/40">
        {noticia.imagen ? (
          <img
            src={noticia.imagen}
            alt={noticia.titulo}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Newspaper size={36} className="text-white/10" />
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center justify-between text-xs">
          {noticia.categoria && (
            <span className="font-medium uppercase tracking-wider text-amber-500/90">{noticia.categoria}</span>
          )}
          <span className="text-muted-foreground">{noticia.fecha}</span>
        </div>
        <h3 className="mt-3 font-semibold leading-snug text-white">{noticia.titulo}</h3>
        {noticia.resumen && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-muted-foreground">{noticia.resumen}</p>
        )}
      </div>
    </article>
  );
}

/** Tarjeta placeholder (estado preparado, sin datos falsos). */
function NoticiaPlaceholder() {
  return (
    <div className="flex h-full flex-col overflow-hidden rounded-2xl border border-dashed border-white/10 bg-white/[0.015]">
      <div className="flex aspect-[16/10] items-center justify-center bg-white/[0.02]">
        <Newspaper size={40} className="text-white/10" />
      </div>
      <div className="flex flex-1 flex-col p-6">
        <span className="inline-flex w-fit rounded-full border border-amber-500/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-amber-500/80">
          Próximamente
        </span>
        <div className="mt-5 space-y-2.5" aria-hidden="true">
          <div className="h-3 w-3/4 rounded-full bg-white/[0.06]" />
          <div className="h-3 w-1/2 rounded-full bg-white/[0.06]" />
        </div>
        <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
          Las novedades de la Liga aparecerán aquí.
        </p>
      </div>
    </div>
  );
}
