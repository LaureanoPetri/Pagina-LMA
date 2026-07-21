import { useEffect, useState } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeContent } from "@/components/home/HomeContent";
import { LoadError } from "@/components/common/LoadError";
import { getNoticias, getJugadores, getEstadisticas } from "@/api/client";
import type { Noticia, JugadorListado, EstadisticasGlobales } from "@/api/types";

/**
 * Landing de la Liga. Se compone de:
 *   1. <HomeHero />    — hero fullscreen (presentacional, aparece al instante).
 *   2. <HomeContent /> — experiencia editorial: Sobre la Liga · Ranking ·
 *                        Noticias · Galería.
 *
 * Sólo pide al backend lo que el Home muestra hoy: noticias, jugadores (para el
 * ranking) y estadísticas globales. No cambió ningún endpoint.
 */
export function InicioPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [stats, setStats] = useState<EstadisticasGlobales | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cargar = () => {
    setLoading(true);
    setError(null);
    Promise.all([getNoticias(), getJugadores(), getEstadisticas()])
      .then(([n, j, s]) => {
        setNoticias(n);
        setJugadores(j);
        setStats(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : "No se pudo cargar la información de inicio."))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    cargar();
  }, []);

  return (
    <div className="animate-fade-in">
      {/* 1 · Hero fullscreen */}
      <HomeHero temporada={stats?.temporadaActual} />

      {/* 2 · Home de siempre (segunda sección).
             -mb-8 cancela el padding inferior del <main> para que la última
             banda tonal llegue a ras del footer (las bandas manejan su propio
             espaciado vertical, por eso ya no hace falta el pt-14). */}
      <div id="home-contenido" className="-mb-8">
        {loading ? (
          <p className="text-center text-muted-foreground py-20">Cargando...</p>
        ) : error || !stats ? (
          <LoadError message={error ?? "No se pudo cargar la información de inicio."} onRetry={cargar} />
        ) : (
          <HomeContent noticias={noticias} jugadores={jugadores} stats={stats} />
        )}
      </div>

      {/* 3 · Espacio preparado para futuras secciones:
             Noticias destacadas · Galería · Sponsors.
             (El Footer ya vive en el Layout.) */}
    </div>
  );
}
