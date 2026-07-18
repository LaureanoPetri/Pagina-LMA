from enum import Enum

class EstadoTorneo(str, Enum):
    PROXIMO = "Próximo"
    EN_CURSO = "En curso"
    FINALIZADO = "Finalizado"

class TipoRanking(str, Enum):
    LMA = "LMA"
    FIDE = "FIDE"
    AMBOS = "Ambos"

class RitmoTorneo(str, Enum):
    BLITZ = "Blitz"
    RAPIDA = "Rápida"
    CLASICA = "Clásica"