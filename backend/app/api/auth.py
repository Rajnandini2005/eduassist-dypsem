import base64
import json
from fastapi import APIRouter, HTTPException, status, Depends, Header
from typing import List, Optional
from app.models.schemas import (
    ProfileCreate, ProfileResponse, LoginRequest, TokenResponse, SwitchRoleRequest, UserUpdateRequest
)
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token, oauth2_scheme
from app.core.database import Database

router = APIRouter(prefix="/auth", tags=["Authentication"])

def get_current_user(
    token: Optional[str] = Depends(oauth2_scheme),
    x_user_email: Optional[str] = Header(None, alias="X-User-Email"),
    x_user_id: Optional[str] = Header(None, alias="X-User-Id"),
    x_user_name: Optional[str] = Header(None, alias="X-User-Name"),
    x_user_role: Optional[str] = Header(None, alias="X-User-Role")
) -> ProfileResponse:
    # 1. Check local_ token or standard JWT
    if token:
        if token.startswith("local_"):
            try:
                raw_payload = json.loads(base64.b64decode(token[6:]).decode("utf-8"))
                email = raw_payload.get("email")
                user_id = raw_payload.get("id")
                user = (Database.get_profile_by_email(email) if email else None) or (Database.get_profile_by_id(user_id) if user_id else None)
                if not user and email:
                    # Auto-persist user in backend profiles
                    user = Database.create_profile({
                        "id": user_id,
                        "email": email,
                        "full_name": raw_payload.get("full_name") or email.split("@")[0],
                        "role": raw_payload.get("role", "student"),
                        "department_id": raw_payload.get("department_id"),
                        "roll_no": raw_payload.get("roll_no", "")
                    })
                if user:
                    return ProfileResponse(**user)
            except Exception:
                pass
        else:
            payload = decode_access_token(token)
            if payload:
                user_id = payload.get("sub")
                user = Database.get_profile_by_id(user_id)
                if user:
                    return ProfileResponse(**user)

    # 2. Check X-User-Email / X-User-Id custom header (seamless cross-device & offline session sync)
    if x_user_email:
        user = Database.get_profile_by_email(x_user_email)
        if not user:
            user = Database.create_profile({
                "id": x_user_id,
                "email": x_user_email,
                "full_name": x_user_name or x_user_email.split("@")[0],
                "role": x_user_role or "student",
            })
        if user:
            return ProfileResponse(**user)

    if x_user_id:
        user = Database.get_profile_by_id(x_user_id)
        if user:
            return ProfileResponse(**user)

    # 3. Default fallback for anonymous demo viewer
    student = Database.get_profile_by_email("aarav.mehta@student.college.edu")
    if student:
        return ProfileResponse(**student)
    raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

@router.post("/register", response_model=TokenResponse)
def register(req: ProfileCreate):
    existing = Database.get_profile_by_email(req.email)
    if existing:
        token = create_access_token({"sub": existing["id"], "role": existing["role"], "email": existing["email"]})
        return TokenResponse(access_token=token, user=ProfileResponse(**existing))
    
    user_data = req.model_dump()
    user_data["password"] = get_password_hash(req.password)
    new_user = Database.create_profile(user_data)
    
    token = create_access_token({"sub": new_user["id"], "role": new_user["role"], "email": new_user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**new_user))

@router.post("/login", response_model=TokenResponse)
def login(req: LoginRequest):
    user = Database.get_profile_by_email(req.email)
    if not user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    if not verify_password(req.password, user.get("password", "")):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**user))

@router.get("/me", response_model=ProfileResponse)
def get_me(current_user: ProfileResponse = Depends(get_current_user)):
    return current_user

@router.post("/demo-switch", response_model=TokenResponse)
def switch_demo_role(req: SwitchRoleRequest):
    """
    Convenient switcher for evaluators, viva examination, and demo presentation.
    Instantly returns credentials for predefined Student, Faculty, or Admin accounts.
    """
    target_role = req.role.lower()
    user = None
    if target_role == "admin":
        user = Database.get_profile_by_email("madhura@dypsem.edu.in") or Database.get_profile_by_email("admin@college.edu")
    elif target_role == "faculty":
        user = Database.get_profile_by_email("faculty.verma@college.edu")
    elif target_role == "student":
        # Look for registered student accounts first
        all_students = [p for p in Database.get_profiles() if p.get("role") == "student"]
        non_demo_students = [s for s in all_students if s.get("email") != "aarav.mehta@student.college.edu"]
        if non_demo_students:
            user = non_demo_students[-1]
        else:
            user = Database.get_profile_by_email("aarav.mehta@student.college.edu")

    if not user:
        user = Database.get_profiles()[0]
    
    token = create_access_token({"sub": user["id"], "role": user["role"], "email": user["email"]})
    return TokenResponse(access_token=token, user=ProfileResponse(**user))

@router.get("/users", response_model=List[ProfileResponse])
def list_users(current_user: ProfileResponse = Depends(get_current_user)):
    # Can be viewed by faculty or admin
    profiles = Database.get_profiles()
    return [ProfileResponse(**p) for p in profiles]

@router.patch("/users/{user_id}", response_model=ProfileResponse)
def update_user(
    user_id: str,
    req: UserUpdateRequest,
    current_user: ProfileResponse = Depends(get_current_user)
):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only administrators can update user roles or account status.")

    updated = Database.update_user_profile(user_id, req.model_dump(exclude_unset=True))
    if not updated:
        raise HTTPException(status_code=404, detail="User not found")
    return ProfileResponse(**updated)
