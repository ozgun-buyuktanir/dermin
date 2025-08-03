from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from datetime import datetime

class BoundingBox(BaseModel):
    x1: float
    y1: float
    x2: float
    y2: float

class SkinConditionPrediction(BaseModel):
    class_id: int
    class_name: str
    confidence: float
    bounding_box: BoundingBox
    area: float

class ModelInfo(BaseModel):
    model_path: str
    confidence_threshold: float
    device: str

class AnalysisSummary(BaseModel):
    overall_status: str  # "clear", "mild_concerns", "needs_attention"
    detected_conditions: List[str]
    condition_counts: Dict[str, int]
    total_detections: int
    confidence_avg: float
    recommendations: List[str]

class SkinAnalysisResult(BaseModel):
    success: bool
    predictions: List[SkinConditionPrediction]
    summary: Optional[AnalysisSummary] = None
    model_info: Optional[ModelInfo] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class AnalysisRequest(BaseModel):
    confidence_threshold: float = 0.25
    include_summary: bool = True

class SkinAnalysisDB(BaseModel):
    """Database model for skin analysis results"""
    id: Optional[str] = None
    user_id: str
    image_url: str
    result: SkinAnalysisResult
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True
