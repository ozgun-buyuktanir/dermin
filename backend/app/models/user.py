from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from datetime import datetime

class UserBase(BaseModel):
    firebase_uid: str
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    pass

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    skin_type: Optional[str] = None
    age_range: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None

class User(UserBase):
    id: str
    skin_type: Optional[str] = None
    age_range: Optional[str] = None
    preferences: Dict[str, Any] = {}
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
