from sqlalchemy import Column, Integer, String, Date, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class ResultadoTorneo(Base):
    __tablename__ = "resultadotorneo"
    
    id = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id"))
    id_jugador = Column(String(20), ForeignKey("jugador.id_lma"))
    id_club = Column(Integer, ForeignKey("club.id"), nullable=True)
    posicion_final = Column(Integer)
    puntos_liga = Column(Integer)
    puntuacion_obtenida = Column(Float)
    variacion_elo = Column(Integer)

    torneo = relationship("Torneo", back_populates="resultados")
    jugador = relationship("Jugador", back_populates="resultados")

class HistorialELO(Base):
    __tablename__ = "historialelo"
    
    id = Column(Integer, primary_key=True, index=True)
    id_jugador = Column(String(20), ForeignKey("jugador.id_lma"))
    id_torneo = Column(Integer, ForeignKey("torneo.id"))
    fecha = Column(Date)
    tipo_ritmo = Column(String(50))
    nuevo_elo = Column(Integer)

    jugador = relationship("Jugador", back_populates="historial_elo")