from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Club(Base):
    __tablename__ = "club"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)

    # Texto libre (el formulario del frontend los pide como texto, no como
    # selección de una tabla de departamentos/provincias).
    departamento = Column(String(100), nullable=True)
    provincia = Column(String(100), nullable=True)

    logo_url = Column(String(255), nullable=True)

    nombre_corto = Column(String, nullable=True)
    fundacion = Column(Integer, nullable=True)
    presidente = Column(String, nullable=True)
    sede = Column(String, nullable=True)
    color = Column(String, nullable=True)

    facebook = Column(String, nullable=True)
    instagram = Column(String, nullable=True)
    x = Column(String, nullable=True)
    sitio_web = Column(String, nullable=True)

    jugadores = relationship("Jugador", back_populates="club")
    medallas = relationship("Medalla", back_populates="club")