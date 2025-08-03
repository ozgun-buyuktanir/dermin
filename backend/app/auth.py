from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, EmailStr
from app.db import users_collection
from app.utils import create_access_token  # ✅ düzelttik

auth_router = APIRouter()

class UserRegister(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

@auth_router.post("/register")
async def register_user(user: UserRegister):
    if users_collection.find_one({"email": user.email}):
        raise HTTPException(status_code=400, detail="Email already registered")

    users_collection.insert_one({
        "username": user.username,
        "email": user.email,
        "password": user.password
    })

    # ✅ JWT üret
    token = create_access_token({"sub": user.email})

    return {"message": "User registered successfully", "token": token}

@auth_router.post("/login")
async def login_user(user: UserLogin):
    db_user = users_collection.find_one({"email": user.email})
    if not db_user or db_user["password"] != user.password:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # ✅ JWT üret
    token = create_access_token({"sub": user.email})

    return {"message": "Login successful", "token": token}
