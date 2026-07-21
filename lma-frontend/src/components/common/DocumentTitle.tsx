import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const SITE_NAME = "Liga Mendocina de Ajedrez";

/**
 * Segmento del título según la ruta actual. `null` → sólo el nombre del sitio
 * (home). El template ("<segmento> | <sitio>") se aplica en un único lugar, así
 * que las páginas individuales no hardcodean su título.
 */
function segmentoPorRuta(pathname: string): string | null {
  if (pathname.startsWith("/ranking")) return "Ranking";
  if (pathname.startsWith("/ligas")) return "Ligas";
  if (pathname.startsWith("/torneos")) return "Torneos";
  if (pathname.startsWith("/clubes")) return "Clubes";
  if (pathname.startsWith("/jugadores")) return "Jugadores";
  if (pathname.startsWith("/noticias")) return "Noticias";
  if (pathname.startsWith("/faq")) return "FAQ";
  if (pathname.startsWith("/admin")) return "Admin";
  return null; // "/" y cualquier otra ruta → identidad base
}

/**
 * Mantiene el <title> de la pestaña sincronizado con la ruta, con un template
 * único y consistente en toda la app. No renderiza nada.
 *
 *   /         → "Liga Mendocina de Ajedrez"
 *   /ranking  → "Ranking | Liga Mendocina de Ajedrez"
 */
export function DocumentTitle() {
  const { pathname } = useLocation();

  useEffect(() => {
    const segmento = segmentoPorRuta(pathname);
    document.title = segmento ? `${segmento} | ${SITE_NAME}` : SITE_NAME;
  }, [pathname]);

  return null;
}
