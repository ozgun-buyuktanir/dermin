from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any, List
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    display_name: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SkinSurvey(BaseModel):
    name: str  # Required field
    age: int
    gender: str
    skin_type: str
    facial_conditions: Optional[List[str]] = []
    sun_sensitivity: str
    physical_sensitivity: str
    stress_level: str
    water_intake: str
    diet_type: str
    exercise_frequency: str
    skincare_routine: str
    allergies: str

class UserUpdate(BaseModel):
    display_name: Optional[str] = None
    skin_type: Optional[str] = None
    age_range: Optional[str] = None
    preferences: Optional[Dict[str, Any]] = None
    survey_data: Optional[SkinSurvey] = None

class User(UserBase):
    id: str
    skin_type: Optional[str] = None
    age_range: Optional[str] = None
    preferences: Dict[str, Any] = {}
    survey_data: Optional[SkinSurvey] = None
    survey_completed: bool = False
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None
