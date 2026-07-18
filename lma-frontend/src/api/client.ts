import type {
  LoginRequest,
  TokenResponse,
  AdministradorResponse,
  AdministradorCreate,
  Jugador,
  JugadorListado,
  JugadorInput,
  Club,
  ClubListado,
  ClubInput,
  Liga,
  LigaListado,
  LigaInput,
  LigaCalendarioItem,
  LigaCalendarioInput,
  Torneo,
  TorneoListado,
  TorneoInput,
  JugadoresBusquedaResponse,
  ImportarResultadosResponse,
  ImportarClasificacionResponse,
  Noticia,
  NoticiaInput,
  MedallaResponse,
  MedallaInput,
  EstadisticasGlobales,
  ApiErrorBody,
} from "./types";

// ==========================================
// CONFIGURACIÓN BASE
// ==========================================

// En Vite, definí VITE_API_URL en un archivo .env (ej: VITE_API_URL=http://localhost:8000)
// Si no está seteada, usamos localhost:8000 (default de uvicorn) para desarrollo.
const API_URL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8000";

const TOKEN_KEY = "lma_admin_token";

// ==========================================
// MANEJO DEL TOKEN JWT
// ==========================================

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

// ==========================================
// HELPER GENÉRICO DE FETCH
// ==========================================

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function apiFetch<T>(path: string, options: RequestInit = {}, auth = false): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };
  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const token = getToken();
    if (!token) {
      throw new ApiError("No hay sesión activa. Iniciá sesión como administrador.", 401);
    }
    headers["Authorization"] = `Bearer ${token}`;
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, { ...options, headers });
  } catch {
    throw new ApiError("No se pudo conectar con el servidor. Verificá que el backend esté corriendo.", 0);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const isJson = response.headers.get("content-type")?.includes("application/json");
  const body = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    if (response.status === 401 && auth) {
      clearToken();
    }
    const detail = (body as ApiErrorBody)?.detail;
    throw new ApiError(
      typeof detail === "string" ? detail : `Error ${response.status} al llamar a ${path}`,
      response.status
    );
  }

  return body as T;
}

// ==========================================
// AUTENTICACIÓN
// ==========================================

export async function login(usuario: string, clave: string): Promise<TokenResponse> {
  const data: LoginRequest = { usuario, clave };
  const result = await apiFetch<TokenResponse>("/api/login", {
    method: "POST",
    body: JSON.stringify(data),
  });
  setToken(result.access_token);
  return result;
}

export function logout() {
  clearToken();
}

export async function crearPrimerAdmin(usuario: string, clave: string): Promise<AdministradorResponse> {
  const data: AdministradorCreate = { usuario, clave };
  return apiFetch<AdministradorResponse>("/api/admin/setup", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

// ==========================================
// JUGADORES
// ==========================================

export function getJugadores(): Promise<JugadorListado[]> {
  return apiFetch<JugadorListado[]>("/api/jugadores");
}

export function getJugador(id: string): Promise<Jugador> {
  return apiFetch<Jugador>(`/api/jugadores/${id}`);
}

export function crearJugador(data: JugadorInput): Promise<Jugador> {
  return apiFetch<Jugador>("/api/jugadores", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarJugador(id: string, data: Partial<JugadorInput>): Promise<Jugador> {
  return apiFetch<Jugador>(`/api/jugadores/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarJugador(id: string): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/jugadores/${id}`, { method: "DELETE" }, true);
}

/**
 * Búsqueda paginada de jugadores: filtra/ordena/pagina en el servidor en vez
 * de traer la tabla entera. La usan Ranking y Jugadores.
 */
export function buscarJugadores(params: {
  search?: string;
  idClub?: number;
  categoria?: string;
  estado?: string;
  sortBy?: string;
  sortDir?: "asc" | "desc";
  limit?: number;
  offset?: number;
}): Promise<JugadoresBusquedaResponse> {
  const qs = new URLSearchParams();
  if (params.search) qs.set("search", params.search);
  if (params.idClub != null) qs.set("id_club", String(params.idClub));
  if (params.categoria) qs.set("categoria", params.categoria);
  if (params.estado) qs.set("estado", params.estado);
  if (params.sortBy) qs.set("sort_by", params.sortBy);
  if (params.sortDir) qs.set("sort_dir", params.sortDir);
  qs.set("limit", String(params.limit ?? 10));
  qs.set("offset", String(params.offset ?? 0));
  return apiFetch<JugadoresBusquedaResponse>(`/api/jugadores/buscar?${qs.toString()}`);
}

// ==========================================
// CLUBES
// ==========================================

export function getClubes(): Promise<ClubListado[]> {
  return apiFetch<ClubListado[]>("/api/clubes");
}

export function getClub(id: number): Promise<Club> {
  return apiFetch<Club>(`/api/clubes/${id}`);
}

export function crearClub(data: ClubInput): Promise<Club> {
  return apiFetch<Club>("/api/clubes", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarClub(id: number, data: Partial<ClubInput>): Promise<Club> {
  return apiFetch<Club>(`/api/clubes/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarClub(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/clubes/${id}`, { method: "DELETE" }, true);
}

// ==========================================
// LIGAS
// ==========================================

export function getLigas(): Promise<LigaListado[]> {
  return apiFetch<LigaListado[]>("/api/ligas");
}

export function getLiga(id: number): Promise<Liga> {
  return apiFetch<Liga>(`/api/ligas/${id}`);
}

export function crearLiga(data: LigaInput): Promise<Liga> {
  return apiFetch<Liga>("/api/ligas", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarLiga(id: number, data: Partial<LigaInput>): Promise<Liga> {
  return apiFetch<Liga>(`/api/ligas/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarLiga(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/ligas/${id}`, { method: "DELETE" }, true);
}

// ---- Calendario de una liga ----

export function getCalendarioLiga(idLiga: number): Promise<LigaCalendarioItem[]> {
  return apiFetch<LigaCalendarioItem[]>(`/api/ligas/${idLiga}/calendario`);
}

export function crearItemCalendario(idLiga: number, data: LigaCalendarioInput): Promise<LigaCalendarioItem> {
  return apiFetch<LigaCalendarioItem>(`/api/ligas/${idLiga}/calendario`, { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarItemCalendario(idLiga: number, itemId: number, data: Partial<LigaCalendarioInput>): Promise<LigaCalendarioItem> {
  return apiFetch<LigaCalendarioItem>(`/api/ligas/${idLiga}/calendario/${itemId}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarItemCalendario(idLiga: number, itemId: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/ligas/${idLiga}/calendario/${itemId}`, { method: "DELETE" }, true);
}

// ==========================================
// TORNEOS
// ==========================================

export function getTorneos(): Promise<TorneoListado[]> {
  return apiFetch<TorneoListado[]>("/api/torneos");
}

export function getTorneo(id: number): Promise<Torneo> {
  return apiFetch<Torneo>(`/api/torneos/${id}`);
}

export function crearTorneo(data: TorneoInput): Promise<Torneo> {
  return apiFetch<Torneo>("/api/torneos", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarTorneo(id: number, data: Partial<TorneoInput>): Promise<Torneo> {
  return apiFetch<Torneo>(`/api/torneos/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarTorneo(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/torneos/${id}`, { method: "DELETE" }, true);
}

/** Sube el Excel de Chess-Results (cuadro cruzado por clasificación final) para un torneo. */
export function importarResultadosTorneo(id: number, archivo: File): Promise<ImportarResultadosResponse> {
  const formData = new FormData();
  formData.append("file", archivo);
  return apiFetch<ImportarResultadosResponse>(
    `/api/torneos/${id}/importar-resultados`,
    { method: "POST", body: formData },
    true
  );
}

/**
 * Sube el Excel "Clasificación Final" de Chess-Results (el que trae la
 * columna Club/Ciudad) para asignar/crear automáticamente el club de cada
 * jugador del torneo, sin tener que hacerlo a mano uno por uno.
 */
export function importarClasificacionTorneo(id: number, archivo: File): Promise<ImportarClasificacionResponse> {
  const formData = new FormData();
  formData.append("file", archivo);
  return apiFetch<ImportarClasificacionResponse>(
    `/api/torneos/${id}/importar-clasificacion`,
    { method: "POST", body: formData },
    true
  );
}

// ==========================================
// NOTICIAS
// ==========================================

export function getNoticias(): Promise<Noticia[]> {
  return apiFetch<Noticia[]>("/api/noticias");
}

export function getNoticia(id: number): Promise<Noticia> {
  return apiFetch<Noticia>(`/api/noticias/${id}`);
}

export function crearNoticia(data: NoticiaInput): Promise<Noticia> {
  return apiFetch<Noticia>("/api/noticias", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarNoticia(id: number, data: Partial<NoticiaInput>): Promise<Noticia> {
  return apiFetch<Noticia>(`/api/noticias/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarNoticia(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/noticias/${id}`, { method: "DELETE" }, true);
}

// ==========================================
// MEDALLAS
// ==========================================

export function getMedallas(): Promise<MedallaResponse[]> {
  return apiFetch<MedallaResponse[]>("/api/medallas", {}, true);
}

export function getMedalla(id: number): Promise<MedallaResponse> {
  return apiFetch<MedallaResponse>(`/api/medallas/${id}`, {}, true);
}

export function crearMedalla(data: MedallaInput): Promise<MedallaResponse> {
  return apiFetch<MedallaResponse>("/api/medallas", { method: "POST", body: JSON.stringify(data) }, true);
}

export function actualizarMedalla(id: number, data: Partial<MedallaInput>): Promise<MedallaResponse> {
  return apiFetch<MedallaResponse>(`/api/medallas/${id}`, { method: "PUT", body: JSON.stringify(data) }, true);
}

export function eliminarMedalla(id: number): Promise<{ ok: boolean }> {
  return apiFetch<{ ok: boolean }>(`/api/medallas/${id}`, { method: "DELETE" }, true);
}

// ==========================================
// ESTADÍSTICAS GLOBALES
// ==========================================

export function getEstadisticas(): Promise<EstadisticasGlobales> {
  return apiFetch<EstadisticasGlobales>("/api/estadisticas");
}
