from sqlalchemy import Column, Integer, String, Date, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Noticia(Base):
    __tablename__ = "noticia"

    id = Column(Integer, primary_key=True, index=True)

    titulo = Column(String(255), nullable=False)

    resumen = Column(String(500), nullable=True)

    texto = Column(Text, nullable=False)

    categoria = Column(String(100), nullable=True)

    imagen = Column(String(255), nullable=True)

    fecha = Column(Date, nullable=False)

class Trofeo(Base):
    __tablename__ = "trofeo"
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String, nullable=False)
    icono_url = Column(String)
    # Ej: "Campeón", "Subcampeón", "Mejor Jugador", "Revelación"
    tipo = Column(String(50), nullable=True)

class JugadorGanaPremio(Base):
    __tablename__ = "jugadorganapremio"
    id_jugador = Column(String(20), ForeignKey("jugador.id_lma"), primary_key=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id"), primary_key=True)
    id_trofeo = Column(Integer, ForeignKey("trofeo.id"), primary_key=True)

class ClubGanaTrofeo(Base):
    __tablename__ = "clubganatrofeo"
    id_club = Column(Integer, ForeignKey("club.id"), primary_key=True)
    id_liga = Column(Integer, ForeignKey("liga.id"), primary_key=True)
    id_trofeo = Column(Integer, ForeignKey("trofeo.id"), primary_key=True)


class Medalla(Base):
    """
    Medalla individual o por equipos. Es un concepto separado de Trofeo:
    representa un podio (oro/plata/bronce) ligado opcionalmente a un
    jugador o a un club, y opcionalmente a un torneo puntual.
    """
    __tablename__ = "medalla"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    metal = Column(String(10), nullable=False)  # "oro" | "plata" | "bronce"
    fecha = Column(String(20), nullable=True)

    id_torneo = Column(Integer, ForeignKey("torneo.id"), nullable=True)
    id_jugador = Column(String(20), ForeignKey("jugador.id_lma"), nullable=True)
    id_club = Column(Integer, ForeignKey("club.id"), nullable=True)

    torneo = relationship("Torneo")
    jugador = relationship("Jugador", back_populates="medallas")
    club = relationship("Club", back_populates="medallas")


class Partida(Base):
    """
    Una partida individual dentro de una ronda de un torneo. Se genera
    automáticamente al importar el cuadro cruzado de Chess-Results, pero
    también se puede cargar/editar a mano.
    """
    __tablename__ = "partida"

    id = Column(Integer, primary_key=True, index=True)
    id_torneo = Column(Integer, ForeignKey("torneo.id"), nullable=False)
    ronda = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=True)

    id_jugador_blancas = Column(String(20), ForeignKey("jugador.id_lma"), nullable=True)
    id_jugador_negras = Column(String(20), ForeignKey("jugador.id_lma"), nullable=True)

    # "1-0", "0-1", "½-½", o "bye" cuando un jugador queda libre en la ronda.
    resultado = Column(String(10), nullable=True)

    torneo = relationship("Torneo", back_populates="partidas")
    jugador_blancas = relationship(
        "Jugador", foreign_keys=[id_jugador_blancas], back_populates="partidas_blancas"
    )
    jugador_negras = relationship(
        "Jugador", foreign_keys=[id_jugador_negras], back_populates="partidas_negras"
    )


class LigaCalendario(Base):
    """Fixture / calendario de rondas de una liga por equipos."""
    __tablename__ = "ligacalendario"

    id = Column(Integer, primary_key=True, index=True)
    id_liga = Column(Integer, ForeignKey("liga.id"), nullable=False)
    ronda = Column(Integer, nullable=False)
    fecha = Column(Date, nullable=True)
    descripcion = Column(String(255), nullable=True)

    liga = relationship("Liga", back_populates="calendario")