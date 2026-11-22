from datetime import datetime, timedelta, timezone
from typing import Optional, Any
from jose import jwt, JWTError
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import OAuth2PasswordBearer
from app.core.config import settings

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_PREFIX}/auth/login", auto_error=False)

def is_bcrypt_hash(password: str) -> bool:
    """Check if a string looks like a bcrypt hash."""
    return password.startswith("$2b$") or password.startswith("$2a$") or password.startswith("$2y$")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify password — supports both plain text (demo users) and bcrypt hashes (registered users).
    """
    if not plain_password or not hashed_password:
        return False
    
    # If stored password is a bcrypt hash — use bcrypt verification
    if is_bcrypt_hash(hashed_password):
        try:
            return pwd_context.verify(plain_password, hashed_password)
        except Exception:
            return False
    
    # For plain text demo passwords (pre-seeded PROFILES) — direct comparison
    return plain_password == hashed_password

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, settings.JWT_SECRET, algorithm=settings.JWT_ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.JWT_ALGORITHM])
        return payload
    except JWTError:
        return None
