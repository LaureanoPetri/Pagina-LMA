from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Provincia(Base):
    __tablename__ = "provincia"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    
    departamentos = relationship("Departamento", back_populates="provincia")