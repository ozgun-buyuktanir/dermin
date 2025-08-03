from pydantic import BaseModel
from typing import Optional, Dict, Any, List, Union
from datetime import datetime

class SurveyResponse(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    skin_type: Optional[str] = None
    facial_conditions: Optional[List[str]] = []
    sun_sensitivity: Optional[str] = None
    physical_sensitivity: Optional[str] = None
    itching: Optional[str] = None
    allergies: Optional[str] = None
    hair_type: Optional[str] = None
    hair_issues: Optional[List[str]] = []
    diet_type: Optional[str] = None
    water_intake: Optional[str] = None
    exercise_frequency: Optional[str] = None
    alcohol_consumption: Optional[int] = None
    smoking_habits: Optional[int] = None
    chronic_illness: Optional[str] = None
    regular_medications: Optional[str] = None
    dermatologist_visit: Optional[str] = None
    timestamp: Optional[str] = None
    version: Optional[str] = None

class Survey(BaseModel):
    id: str
    user_email: str
    responses: Dict[str, Any]
    completed_at: datetime
    version: str = "1.0"
    
    class Config:
        from_attributes = True
