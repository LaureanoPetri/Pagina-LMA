/**
 * Logos reales de los clubes afiliados. Poné cada archivo en /public/images
 * y sumá una línea acá — se usa tanto en la cinta de la Home como en el
 * directorio de Clubes y en el perfil individual de cada club.
 */
export interface ClubAfiliado {
  src: string;
  nombre: string;
}

export const CLUBES_AFILIADOS: ClubAfiliado[] = [
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

// Los nombres de club en la API no siempre calzan letra a letra con los del
// listado de arriba (mayúsculas, acentos, espacios), así que comparamos
// versiones normalizadas en lugar de una igualdad estricta.
function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(new RegExp("[\\u0300-\\u036f]", "g"), "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

const LOGO_POR_NOMBRE = new Map(CLUBES_AFILIADOS.map((c) => [normalizar(c.nombre), c.src]));

/** Devuelve el logo del club probando cada nombre candidato (nombre completo, nombre corto, etc). */
export function getClubLogoSrc(...nombres: (string | null | undefined)[]): string | undefined {
  for (const nombre of nombres) {
    if (!nombre) continue;
    const src = LOGO_POR_NOMBRE.get(normalizar(nombre));
    if (src) return src;
  }
  return undefined;
}
