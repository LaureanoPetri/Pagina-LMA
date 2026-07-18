from sqlalchemy import Column, Integer, String, Date, Text
from sqlalchemy.orm import relationship
from app.core.database import Base

class Liga(Base):
    __tablename__ = "liga"

    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(150), nullable=False)
    anio = Column(Integer, nullable=False)
    division = Column(String, nullable=True)
    temporada = Column(String, nullable=True)
    ritmo = Column(String, nullable=True)

    fecha_inicio = Column(Date, nullable=True)
    fecha_fin = Column(Date, nullable=True)

    cantidad_equipos = Column(Integer, nullable=True)
    rondas = Column(Integer, nullable=True)
    descripcion = Column(Text, nullable=True)

    estado = Column(String, nullable=True)
    torneos = relationship("Torneo", back_populates="liga")
    calendario = relationship("LigaCalendario", back_populates="liga")