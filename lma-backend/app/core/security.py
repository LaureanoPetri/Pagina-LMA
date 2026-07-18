"""
Utilidades de autenticación: hash de contraseñas y JWT.

Requiere en requirements.txt:
    python-jose[cryptography]
    passlib[bcrypt]

Variables de entorno esperadas en .env:
    JWT_SECRET_KEY=una-clave-larga-y-random-para-firmar-los-tokens
    (si no está seteada, se usa un valor por defecto SOLO para desarrollo)
"""
import os
from datetime import datetime, timedelta, timezone
from typing import Optional

import bcrypt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from sqlalchemy.orm import Session

from app.core import database
from app.models import Administrador

# --- Config ---
SECRET_KEY = os.getenv("JWT_SECRET_KEY", "cambiar-esta-clave-en-produccion-lma-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 8  # 8 horas

# El tokenUrl es solo informativo para la doc de Swagger (/docs)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="api/login", auto_error=False)


def hash_password(password: str) -> str:
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    expire = datetime.now(timezone.utc) + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def _get_db():
    db = database.SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_admin(
    token: Optional[str] = Depends(oauth2_scheme),
    db: Session = Depends(_get_db),
) -> Administrador:
    """
    Dependency para proteger rutas: usar como
        admin: Administrador = Depends(get_current_admin)
    en cualquier ruta que solo el panel admin deba poder llamar.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas o sesión expirada",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if not token:
        raise credentials_exception
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        usuario: Optional[str] = payload.get("sub")
        if usuario is None:
            raise credentials_exception
    except JWTError:
        raise credentials_exception

    admin = db.query(Administrador).filter(Administrador.usuario == usuario).first()
    if admin is None:
        raise credentials_exception
    return admin
