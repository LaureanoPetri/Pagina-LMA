from datetime import date
from typing import List, Optional

from pydantic import BaseModel


# ==========================================
# AUTENTICACIÓN / ADMIN
# ==========================================

class AdministradorBase(BaseModel):
    usuario: str


class AdministradorCreate(AdministradorBase):
    clave: str


class AdministradorResponse(AdministradorBase):
    id: int

    class Config:
        from_attributes = True


class LoginRequest(BaseModel):
    usuario: str
    clave: str


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ==========================================
# PROVINCIA / DEPARTAMENTO (solo lectura, ya no se usan para Club)
# ==========================================

class ProvinciaResponse(BaseModel):
    id: int
    nombre: str

    class Config:
        from_attributes = True


class DepartamentoResponse(BaseModel):
    id: int
    nombre: str
    id_provincia: Optional[int] = None

    class Config:
        from_attributes = True


# ==========================================
# BLOQUES REUTILIZABLES
# ==========================================

class EloBloque(BaseModel):
    blitz: int
    rapida: int
    clasica: int


class HistoricoEloPunto(BaseModel):
    fecha: str
    blitz: int
    rapida: int
    clasica: int


class EstadisticasJugador(BaseModel):
    victorias: int
    derrotas: int
    tablas: int
    partidas: int


class TorneoJugadoItem(BaseModel):
    id: int
    nombre: str
    fecha: str
    posicion: Optional[int] = None
    categoria: Optional[str] = None


class TrofeoItem(BaseModel):
    nombre: str
    torneo: str
    fecha: str
    tipo: Optional[str] = None


class MedallaItem(BaseModel):
    id: int
    nombre: str
    torneo: str
    fecha: str
    metal: str


class MedallaResponse(BaseModel):
    """Fila completa para el CRUD de medallas en el panel de administración."""
    id: int
    nombre: str
    metal: str
    fecha: Optional[str] = None
    id_torneo: Optional[int] = None
    torneoNombre: Optional[str] = None
    id_jugador: Optional[str] = None
    jugadorNombre: Optional[str] = None
    id_club: Optional[int] = None
    clubNombre: Optional[str] = None


class MedallaCreate(BaseModel):
    nombre: str
    metal: str
    fecha: Optional[str] = None
    id_torneo: Optional[int] = None
    id_jugador: Optional[str] = None
    id_club: Optional[int] = None


class MedallaUpdate(BaseModel):
    nombre: Optional[str] = None
    metal: Optional[str] = None
    fecha: Optional[str] = None
    id_torneo: Optional[int] = None
    id_jugador: Optional[str] = None
    id_club: Optional[int] = None


# ==========================================
# JUGADOR
# ==========================================

class JugadorCreate(BaseModel):
    id_lma: str
    id_fide: Optional[str] = None
    nombre: str
    apellido: str
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    elo_blitz: int = 1400
    elo_rapida: int = 1400
    elo_clasica: int = 1400
    id_club: Optional[int] = None
    estado: str = "Activo"


class JugadorUpdate(BaseModel):
    id_fide: Optional[str] = None
    nombre: Optional[str] = None
    apellido: Optional[str] = None
    ciudad: Optional[str] = None
    categoria: Optional[str] = None
    fecha_nacimiento: Optional[date] = None
    elo_blitz: Optional[int] = None
    elo_rapida: Optional[int] = None
    elo_clasica: Optional[int] = None
    id_club: Optional[int] = None
    estado: Optional[str] = None


class JugadorResponse(BaseModel):
    """
    Forma "rica" que espera el frontend: incluye club (nombre), estadísticas,
    variación de ELO, histórico, torneos jugados, trofeos y medallas.
    Se arma a mano en el backend (no es un mapeo directo del ORM).
    """
    id: str
    nombre: str
    apellido: str
    club: str
    id_club: Optional[int] = None
    ciudad: str
    categoria: str
    lmaId: str
    fideId: str
    fechaNacimiento: Optional[str] = None
    edad: Optional[int] = None
    estado: str
    elo: EloBloque
    variacion: EloBloque
    mejorElo: EloBloque
    historicoElo: List[HistoricoEloPunto]
    estadisticas: EstadisticasJugador
    torneos: List[TorneoJugadoItem]
    trofeos: List[TrofeoItem]
    medallas: List[MedallaItem]


class JugadorListItem(BaseModel):
    """Versión liviana para listados (sin recalcular todo lo pesado)."""
    id: str
    nombre: str
    apellido: str
    club: str
    id_club: Optional[int] = None
    ciudad: str
    categoria: str
    lmaId: str
    fideId: str
    estado: str
    elo: EloBloque
    variacion: EloBloque
    mejorElo: EloBloque


class JugadoresBusquedaResponse(BaseModel):
    """Respuesta paginada para /api/jugadores/buscar (Ranking y Jugadores)."""
    items: List[JugadorListItem]
    total: int


# ==========================================
# CLUB
# ==========================================

class RedesClub(BaseModel):
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    web: Optional[str] = None


class ClubTrofeoItem(BaseModel):
    nombre: str
    torneo: str
    fecha: str


class ClubCreate(BaseModel):
    nombre: str
    nombreCorto: Optional[str] = None
    departamento: Optional[str] = None
    provincia: Optional[str] = None
    fundacion: Optional[int] = None
    presidente: Optional[str] = None
    sede: Optional[str] = None
    logo_url: Optional[str] = None
    color: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    web: Optional[str] = None


class ClubUpdate(BaseModel):
    nombre: Optional[str] = None
    nombreCorto: Optional[str] = None
    departamento: Optional[str] = None
    provincia: Optional[str] = None
    fundacion: Optional[int] = None
    presidente: Optional[str] = None
    sede: Optional[str] = None
    logo_url: Optional[str] = None
    color: Optional[str] = None
    facebook: Optional[str] = None
    instagram: Optional[str] = None
    twitter: Optional[str] = None
    web: Optional[str] = None


class ClubResponse(BaseModel):
    id: int
    nombre: str
    nombreCorto: str
    departamento: str
    provincia: str
    fundacion: Optional[int] = None
    presidente: str
    sede: str
    redes: RedesClub
    miembros: int
    puntos: int
    eloPromedio: int
    campeonatos: int
    torneosGanados: int
    trofeos: List[ClubTrofeoItem]
    medallas: List[MedallaItem]
    color: str


class ClubListItem(BaseModel):
    id: int
    nombre: str
    nombreCorto: str
    departamento: str
    provincia: str
    fundacion: Optional[int] = None
    presidente: str
    sede: str
    miembros: int
    puntos: int
    eloPromedio: int
    campeonatos: int
    torneosGanados: int
    color: str


# ==========================================
# LIGA
# ==========================================

class ClasificacionJugadorLigaItem(BaseModel):
    jugadorId: str
    puntos: float
    partidas: int


class ClasificacionClubLigaItem(BaseModel):
    clubId: int
    puntos: int
    pj: int
    pg: int
    pe: int
    pp: int


class TorneoLigaItem(BaseModel):
    id: int
    nombre: str
    fecha: str
    estado: str
    linkInscripcion: Optional[str] = None


class CalendarioItem(BaseModel):
    id: int
    ronda: int
    fecha: Optional[str] = None
    descripcion: str


class LigaCalendarioUpdate(BaseModel):
    ronda: Optional[int] = None
    fecha: Optional[date] = None
    descripcion: Optional[str] = None


class LigaCreate(BaseModel):
    nombre: str
    anio: int
    division: Optional[str] = None
    temporada: Optional[str] = None
    ritmo: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    cantidad_equipos: Optional[int] = None
    rondas: Optional[int] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None


class LigaUpdate(BaseModel):
    nombre: Optional[str] = None
    anio: Optional[int] = None
    division: Optional[str] = None
    temporada: Optional[str] = None
    ritmo: Optional[str] = None
    fecha_inicio: Optional[date] = None
    fecha_fin: Optional[date] = None
    cantidad_equipos: Optional[int] = None
    rondas: Optional[int] = None
    descripcion: Optional[str] = None
    estado: Optional[str] = None


class LigaResponse(BaseModel):
    id: int
    nombre: str
    temporada: str
    division: str
    estado: str
    ritmo: str
    equipos: int
    rondas: int
    fechaInicio: str
    fechaFin: str
    descripcion: str
    clasificacionJugadores: List[ClasificacionJugadorLigaItem]
    clasificacionClubes: List[ClasificacionClubLigaItem]
    torneos: List[TorneoLigaItem]
    calendario: List[CalendarioItem]


class LigaListItem(BaseModel):
    id: int
    nombre: str
    temporada: str
    division: str
    estado: str
    ritmo: str
    equipos: int
    rondas: int
    fechaInicio: str
    fechaFin: str


class LigaCalendarioCreate(BaseModel):
    ronda: int
    fecha: Optional[date] = None
    descripcion: str


# ==========================================
# TORNEO
# ==========================================

class GanadorTorneo(BaseModel):
    jugadorId: str
    nombre: str


class TablaFinalItem(BaseModel):
    jugadorId: str
    posicion: Optional[int] = None
    puntos: float
    variacion: int


class PartidaRonda(BaseModel):
    blancasId: Optional[str] = None
    negrasId: Optional[str] = None
    resultado: str


class RondaJugada(BaseModel):
    numero: int
    fecha: Optional[str] = None
    partidas: List[PartidaRonda]


class TorneoCreate(BaseModel):
    nombre: str
    fecha: date
    ritmo: str
    tipo_ranking: Optional[str] = None
    estado: Optional[str] = None
    link_inscripcion: Optional[str] = None
    id_liga: Optional[int] = None
    organizador: Optional[str] = None
    arbitro: Optional[str] = None
    tipo_torneo: Optional[str] = None
    tipo_ritmo: Optional[str] = None  # "Blitz" | "Rápida" | "Clásica"
    cantidad_rondas: Optional[int] = None
    fecha_fin: Optional[date] = None
    participantes: Optional[int] = None
    lugar: Optional[str] = None
    premios: Optional[str] = None
    descripcion: Optional[str] = None
    imagen: Optional[str] = None


class TorneoUpdate(BaseModel):
    nombre: Optional[str] = None
    fecha: Optional[date] = None
    ritmo: Optional[str] = None
    tipo_ranking: Optional[str] = None
    estado: Optional[str] = None
    link_inscripcion: Optional[str] = None
    id_liga: Optional[int] = None
    organizador: Optional[str] = None
    arbitro: Optional[str] = None
    tipo_torneo: Optional[str] = None
    tipo_ritmo: Optional[str] = None
    cantidad_rondas: Optional[int] = None
    fecha_fin: Optional[date] = None
    participantes: Optional[int] = None
    lugar: Optional[str] = None
    premios: Optional[str] = None
    descripcion: Optional[str] = None
    imagen: Optional[str] = None


class TorneoResponse(BaseModel):
    id: int
    nombre: str
    liga: str
    ligaId: Optional[int] = None
    fecha: str
    fechaFin: str
    tipo: str
    tipoRitmo: Optional[str] = None
    ritmo: str
    rondas: int
    estado: str
    participantes: int
    lugar: str
    linkInscripcion: Optional[str] = None
    descripcion: str
    organizador: str
    arbitro: str
    premios: str
    ganador: Optional[GanadorTorneo] = None
    variacionElo: int
    puntosEntregados: int
    tablaFinal: List[TablaFinalItem]
    rondasJugadas: List[RondaJugada]


class TorneoListItem(BaseModel):
    id: int
    nombre: str
    liga: str
    ligaId: Optional[int] = None
    fecha: str
    fechaFin: str
    tipo: str
    tipoRitmo: Optional[str] = None
    ritmo: str
    rondas: int
    estado: str
    participantes: int
    lugar: str
    linkInscripcion: Optional[str] = None
    descripcion: str = ""


class ImportarResultadosResponse(BaseModel):
    ok: bool
    jugadores_creados: int
    jugadores_encontrados: int
    partidas_creadas: int
    resultados_creados: int
    rondas_detectadas: int
    elo_actualizado: bool = False
    jugadores_con_elo_actualizado: int = 0
    avisos: List[str] = []


# ==========================================
# NOTICIAS
# ==========================================

class NoticiaBase(BaseModel):
    titulo: str
    resumen: Optional[str] = None
    texto: Optional[str] = None
    categoria: Optional[str] = None
    imagen: Optional[str] = None
    fecha: date


class NoticiaCreate(NoticiaBase):
    pass


class NoticiaUpdate(BaseModel):
    titulo: Optional[str] = None
    resumen: Optional[str] = None
    texto: Optional[str] = None
    categoria: Optional[str] = None
    imagen: Optional[str] = None
    fecha: Optional[date] = None


class NoticiaResponse(NoticiaBase):
    id: int

    class Config:
        from_attributes = True


# ==========================================
# ESTADÍSTICAS GLOBALES (para el dashboard/inicio del frontend)
# ==========================================

class EstadisticasGlobales(BaseModel):
    jugadores: int
    clubes: int
    ligas: int
    torneos: int
    partidasJugadas: int
    temporadaActual: str
