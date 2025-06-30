from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from datetime import datetime
from enum import Enum

class AnalysisStatus(str, Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

class SkinIssue(BaseModel):
    type: str  # "acne", "wrinkles", "dark_spots", etc.
    severity: float  # 0.0 - 1.0
    confidence: float  # 0.0 - 1.0
    location: Optional[Dict[str, float]] = None  # {"x": 0.5, "y": 0.3, "width": 0.1, "height": 0.1}

class AnalysisResults(BaseModel):
    health_score: float  # 0-100
    skin_issues: List[SkinIssue] = []
    recommendations: List[str] = []
    confidence: float  # 0.0 - 1.0
    processing_time: Optional[float] = None

class AnalysisCreate(BaseModel):
    user_id: str
    image_url: str
    metadata: Optional[Dict[str, Any]] = None

class AnalysisUpdate(BaseModel):
    status: Optional[AnalysisStatus] = None
    results: Optional[AnalysisResults] = None
    error_message: Optional[str] = None

class Analysis(BaseModel):
    id: str
    user_id: str
    image_url: str
    status: AnalysisStatus
    results: Optional[AnalysisResults] = None
    metadata: Dict[str, Any] = {}
    error_message: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
