from sqlalchemy import (
    Column,
    Integer,
    String,
    Date,
    ForeignKey,
    Text,
)

from sqlalchemy.orm import relationship
from app.core.database import Base
class Torneo(Base):
    __tablename__ = "torneo"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    fecha = Column(Date, nullable=False)
    ritmo = Column(String(50), nullable=False)
    tipo_ranking = Column(String(50))
    estado = Column(String(50))
    link_inscripcion = Column(String(255))
    id_liga = Column(Integer, ForeignKey("liga.id"), nullable=True)
    organizador = Column(String(150))
    arbitro = Column(String(150))
    tipo_torneo = Column(String(50))
    cantidad_rondas = Column(Integer)
    fecha_fin = Column(Date, nullable=True)

    # Modalidad de ritmo de juego: "Blitz" | "Rápida" | "Clásica". Determina
    # qué uno de los 3 ELO del jugador se actualiza al recalcular resultados
    # (ver app/core/elo.py). Nullable porque los torneos viejos no lo tienen.
    tipo_ritmo = Column(String(20), nullable=True)

    participantes = Column(Integer, nullable=True)

    premios = Column(Text, nullable=True)

    descripcion = Column(Text, nullable=True)

    imagen = Column(String, nullable=True)
    lugar = Column(String(255), nullable=True)

    liga = relationship("Liga", back_populates="torneos")
    resultados = relationship("ResultadoTorneo", back_populates="torneo")
    partidas = relationship("Partida", back_populates="torneo")