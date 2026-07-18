from sqlalchemy import Column, Integer, String
from app.core.database import Base

class Administrador(Base):
    __tablename__ = "administrador"
    
    id = Column(Integer, primary_key=True, index=True)
    usuario = Column(String, unique=True, nullable=False)
    clave = Column(String, nullable=False)