from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Departamento(Base):
    __tablename__ = "departamento"
    
    id = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    id_provincia = Column(Integer, ForeignKey("provincia.id"))
    
    provincia = relationship("Provincia", back_populates="departamentos")