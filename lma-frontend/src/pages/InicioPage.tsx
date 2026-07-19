import { useEffect, useState } from "react";
import { HomeHero } from "@/components/home/HomeHero";
import { HomeContent } from "@/components/home/HomeContent";
import {
  getNoticias,
  getJugadores,
  getClubes,
  getTorneos,
  getEstadisticas,
} from "@/api/client";
import type {
  Noticia,
  JugadorListado,
  ClubListado,
  TorneoListado,
  EstadisticasGlobales,
} from "@/api/types";

/**
 * Landing de la Liga. Se compone de:
 *   1. <HomeHero />    — hero fullscreen (presentacional, aparece al instante).
 *   2. <HomeContent /> — el Home de siempre, con toda su funcionalidad intacta.
 *   3. Espacio preparado para futuras secciones (noticias, galería, sponsors).
 *
 * La lógica de datos (fetch de los 5 endpoints) vive acá y se pasa por props,
 * igual que antes: no cambió ningún endpoint ni la forma de los datos.
 */
export function InicioPage() {
  const [noticias, setNoticias] = useState<Noticia[]>([]);
  const [jugadores, setJugadores] = useState<JugadorListado[]>([]);
  const [clubes, setClubes] = useState<ClubListado[]>([]);
  const [torneos, setTorneos] = useState<TorneoListado[]>([]);
  const [stats, setStats] = useState<EstadisticasGlobales | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getNoticias(), getJugadores(), getClubes(), getTorneos(), getEstadisticas()])
      .then(([n, j, c, t, s]) => {
        setNoticias(n);
        setJugadores(j);
        setClubes(c);
        setTorneos(t);
        setStats(s);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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
        {loading || !stats ? (
          <p className="text-center text-muted-foreground py-20">Cargando...</p>
        ) : (
          <HomeContent
            noticias={noticias}
            jugadores={jugadores}
            clubes={clubes}
            torneos={torneos}
            stats={stats}
          />
        )}
      </div>

      {/* 3 · Espacio preparado para futuras secciones:
             Noticias destacadas · Galería · Sponsors.
             (El Footer ya vive en el Layout.) */}
    </div>
  );
}
