from sqlalchemy import Column, Integer, String, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Jugador(Base):
    __tablename__ = "jugador"

    id_lma = Column(String(20), primary_key=True, index=True)
    id_fide = Column(String(20), unique=True, nullable=True)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    fecha_nacimiento = Column(Date, nullable=True)
    # Todo jugador nuevo arranca en 1400 en las tres modalidades; a partir de
    # ahí sube o baja según los resultados que carga la importación de Excel
    # (ver app/core/elo.py).
    elo_blitz = Column(Integer, default=1400)
    elo_rapida = Column(Integer, default=1400)
    elo_clasica = Column(Integer, default=1400)
    id_club = Column(Integer, ForeignKey("club.id"), nullable=True)

    # Ciudad y categoría son texto libre (se completan a mano o desde la
    # importación de Chess-Results cuando se puede inferir).
    ciudad = Column(String(100), nullable=True)
    categoria = Column(String(50), nullable=True)

    # Reemplaza al viejo booleano "actividad": el frontend maneja 3 estados.
    estado = Column(String(20), nullable=False, default="Activo")

    club = relationship("Club", back_populates="jugadores")
    resultados = relationship("ResultadoTorneo", back_populates="jugador")
    historial_elo = relationship("HistorialELO", back_populates="jugador")
    medallas = relationship("Medalla", back_populates="jugador")
    partidas_blancas = relationship(
        "Partida", foreign_keys="Partida.id_jugador_blancas", back_populates="jugador_blancas"
    )
    partidas_negras = relationship(
        "Partida", foreign_keys="Partida.id_jugador_negras", back_populates="jugador_negras"
    )