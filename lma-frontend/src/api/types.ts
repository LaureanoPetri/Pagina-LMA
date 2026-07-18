// ==========================================
// Tipos que reflejan la forma "rica" que arma el backend (ver
// app/schemas/schemas.py y los builders de app/main.py). Son básicamente
// los mismos tipos que tenía src/data/mock.ts, para no tener que tocar el
// JSX de las páginas — solo cambia de dónde viene el dato.
//
// OJO: el id de Jugador es un STRING (el id_lma real, ej "LMA-00001"),
// a diferencia del mock viejo que usaba number. Es la única diferencia de
// tipos real respecto al mock original.
// ==========================================

export type CategoriaElo = "blitz" | "rapida" | "clasica";

// ---------- AUTENTICACIÓN ----------
export interface LoginRequest {
  usuario: string;
  clave: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
}

export interface AdministradorResponse {
  id: number;
  usuario: string;
}

export interface AdministradorCreate {
  usuario: string;
  clave: string;
}

// ---------- JUGADOR ----------
export interface Jugador {
  id: string;
  nombre: string;
  apellido: string;
  club: string;
  id_club: number | null;
  ciudad: string;
  categoria: string;
  lmaId: string;
  fideId: string;
  fechaNacimiento: string | null;
  edad: number | null;
  estado: "Activo" | "Inactivo" | "Suspendido";
  elo: { blitz: number; rapida: number; clasica: number };
  variacion: { blitz: number; rapida: number; clasica: number };
  mejorElo: { blitz: number; rapida: number; clasica: number };
  historicoElo: { fecha: string; blitz: number; rapida: number; clasica: number }[];
  estadisticas: { victorias: number; derrotas: number; tablas: number; partidas: number };
  torneos: { id: number; nombre: string; fecha: string; posicion: number | null; categoria: string | null }[];
  trofeos: { nombre: string; torneo: string; fecha: string; tipo: string | null }[];
  medallas: { nombre: string; torneo: string; fecha: string; metal: string }[];
}

/** Versión liviana usada en los listados (Ranking, Jugadores, Panel Admin). */
export interface JugadorListado {
  id: string;
  nombre: string;
  apellido: string;
  club: string;
  id_club: number | null;
  ciudad: string;
  categoria: string;
  lmaId: string;
  fideId: string;
  estado: "Activo" | "Inactivo" | "Suspendido";
  elo: { blitz: number; rapida: number; clasica: number };
  variacion: { blitz: number; rapida: number; clasica: number };
  mejorElo: { blitz: number; rapida: number; clasica: number };
}

/** Respuesta paginada de GET /api/jugadores/buscar (usada por Ranking y Jugadores). */
export interface JugadoresBusquedaResponse {
  items: JugadorListado[];
  total: number;
}

export interface JugadorInput {
  id_lma: string;
  id_fide?: string | null;
  nombre: string;
  apellido: string;
  ciudad?: string | null;
  categoria?: string | null;
  fecha_nacimiento?: string | null;
  elo_blitz: number;
  elo_rapida: number;
  elo_clasica: number;
  id_club?: number | null;
  estado: "Activo" | "Inactivo" | "Suspendido";
}

// ---------- CLUB ----------
export interface Club {
  id: number;
  nombre: string;
  nombreCorto: string;
  departamento: string;
  provincia: string;
  fundacion: number | null;
  presidente: string;
  sede: string;
  redes: { facebook?: string | null; instagram?: string | null; twitter?: string | null; web?: string | null };
  miembros: number;
  puntos: number;
  eloPromedio: number;
  campeonatos: number;
  torneosGanados: number;
  trofeos: { nombre: string; torneo: string; fecha: string }[];
  medallas: { nombre: string; torneo: string; fecha: string; metal: string }[];
  color: string;
}

export interface ClubListado {
  id: number;
  nombre: string;
  nombreCorto: string;
  departamento: string;
  provincia: string;
  fundacion: number | null;
  presidente: string;
  sede: string;
  miembros: number;
  puntos: number;
  eloPromedio: number;
  campeonatos: number;
  torneosGanados: number;
  color: string;
}

export interface ClubInput {
  nombre: string;
  nombreCorto?: string | null;
  departamento?: string | null;
  provincia?: string | null;
  fundacion?: number | null;
  presidente?: string | null;
  sede?: string | null;
  logo_url?: string | null;
  color?: string | null;
  facebook?: string | null;
  instagram?: string | null;
  twitter?: string | null;
  web?: string | null;
}

// ---------- LIGA ----------
export interface Liga {
  id: number;
  nombre: string;
  temporada: string;
  division: string;
  estado: "En curso" | "Próxima" | "Finalizada" | "";
  ritmo: string;
  equipos: number;
  rondas: number;
  fechaInicio: string;
  fechaFin: string;
  descripcion: string;
  clasificacionJugadores: { jugadorId: string; puntos: number; partidas: number }[];
  clasificacionClubes: { clubId: number; puntos: number; pj: number; pg: number; pe: number; pp: number }[];
  torneos: { id: number; nombre: string; fecha: string; estado: string; linkInscripcion: string | null }[];
  calendario: { id: number; ronda: number; fecha: string | null; descripcion: string }[];
}

export interface LigaCalendarioItem {
  id: number;
  ronda: number;
  fecha: string | null;
  descripcion: string;
}

export interface LigaCalendarioInput {
  ronda: number;
  fecha?: string | null;
  descripcion: string;
}

export interface LigaListado {
  id: number;
  nombre: string;
  temporada: string;
  division: string;
  estado: string;
  ritmo: string;
  equipos: number;
  rondas: number;
  fechaInicio: string;
  fechaFin: string;
}

export interface LigaInput {
  nombre: string;
  anio: number;
  division?: string | null;
  temporada?: string | null;
  ritmo?: string | null;
  fecha_inicio?: string | null;
  fecha_fin?: string | null;
  cantidad_equipos?: number | null;
  rondas?: number | null;
  descripcion?: string | null;
  estado?: string | null;
}

// ---------- TORNEO ----------
export interface Ronda {
  numero: number;
  fecha: string | null;
  partidas: { blancasId: string | null; negrasId: string | null; resultado: string }[];
}

export interface Torneo {
  id: number;
  nombre: string;
  liga: string;
  ligaId: number | null;
  fecha: string;
  fechaFin: string;
  tipo: string;
  tipoRitmo: string | null;
  ritmo: string;
  rondas: number;
  estado: "Próximo" | "En curso" | "Finalizado" | "";
  participantes: number;
  lugar: string;
  linkInscripcion: string | null;
  descripcion: string;
  organizador: string;
  arbitro: string;
  premios: string;
  ganador?: { jugadorId: string; nombre: string } | null;
  variacionElo: number;
  puntosEntregados: number;
  tablaFinal: { jugadorId: string; posicion: number | null; puntos: number; variacion: number }[];
  rondasJugadas: Ronda[];
}

export interface TorneoListado {
  id: number;
  nombre: string;
  liga: string;
  ligaId: number | null;
  fecha: string;
  fechaFin: string;
  tipo: string;
  tipoRitmo: string | null;
  ritmo: string;
  rondas: number;
  estado: string;
  participantes: number;
  lugar: string;
  linkInscripcion: string | null;
  descripcion: string;
}

export interface TorneoInput {
  nombre: string;
  fecha: string;
  ritmo: string;
  tipo_ranking?: string | null;
  estado?: string | null;
  link_inscripcion?: string | null;
  id_liga?: number | null;
  organizador?: string | null;
  arbitro?: string | null;
  tipo_torneo?: string | null;
  tipo_ritmo?: string | null;
  cantidad_rondas?: number | null;
  fecha_fin?: string | null;
  participantes?: number | null;
  lugar?: string | null;
  premios?: string | null;
  descripcion?: string | null;
  imagen?: string | null;
}

export interface ImportarResultadosResponse {
  ok: boolean;
  jugadores_creados: number;
  jugadores_encontrados: number;
  partidas_creadas: number;
  resultados_creados: number;
  rondas_detectadas: number;
  elo_actualizado: boolean;
  jugadores_con_elo_actualizado: number;
  avisos: string[];
}

// ---------- NOTICIA ----------
export interface Noticia {
  id: number;
  titulo: string;
  resumen: string | null;
  texto: string | null;
  categoria: string | null;
  imagen: string | null;
  fecha: string;
}

export interface NoticiaInput {
  titulo: string;
  resumen?: string | null;
  texto?: string | null;
  categoria?: string | null;
  imagen?: string | null;
  fecha: string;
}

// ---------- MEDALLAS ----------
export interface MedallaResponse {
  id: number;
  nombre: string;
  metal: string;
  fecha: string | null;
  id_torneo: number | null;
  torneoNombre: string | null;
  id_jugador: string | null;
  jugadorNombre: string | null;
  id_club: number | null;
  clubNombre: string | null;
}

export interface MedallaInput {
  nombre: string;
  metal: string;
  fecha?: string | null;
  id_torneo?: number | null;
  id_jugador?: string | null;
  id_club?: number | null;
}

// ---------- ESTADÍSTICAS GLOBALES ----------
export interface EstadisticasGlobales {
  jugadores: number;
  clubes: number;
  ligas: number;
  torneos: number;
  partidasJugadas: number;
  temporadaActual: string;
}

// ---------- ERROR DE LA API ----------
export interface ApiErrorBody {
  detail?: string;
}
