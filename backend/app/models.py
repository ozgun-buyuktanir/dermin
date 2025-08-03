from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, List

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class SurveyModel(BaseModel):
    name: Optional[str] = None
    age: int
    gender: str
    skin_type: str
    skin_issues: Optional[List[str]] = []
    sun_sensitive: str
    physical_sensitive: str
    itching: str
    allergies: str
    hair_type: str
    hair_issues: Optional[List[str]] = []
    diet: str
    water_intake: str
    exercise_per_week: str
    alcohol_per_week: Optional[int] = None
    cigarettes_per_day: Optional[int] = None
    chronic_disease: str
    medication: str
    dermatologist_visit: str
