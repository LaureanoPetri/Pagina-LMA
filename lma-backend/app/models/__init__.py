from app.core.database import Base
from .administrador import Administrador
from .provincia import Provincia
from .departamento import Departamento
from .club import Club
from .liga import Liga
from .jugador import Jugador
from .torneo import Torneo
from .resultados_e_historial import ResultadoTorneo, HistorialELO
from .extras import (
    Noticia,
    Trofeo,
    JugadorGanaPremio,
    ClubGanaTrofeo,
    Medalla,
    Partida,
    LigaCalendario,
)