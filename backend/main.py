from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database import db
from app.models.user import User, UserCreate, UserUpdate
from app.models.analysis import Analysis, AnalysisCreate, AnalysisUpdate, AnalysisStatus

# Database lifecycle
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await db.connect()
    yield
    # Shutdown
    await db.disconnect()

# FastAPI app
app = FastAPI(
    title="Dermin AI API",
    description="AI-powered skin analysis API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:5173").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security
security = HTTPBearer()

@app.get("/")
async def root():
    return {"message": "Dermin AI API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-06-30T12:00:00Z"}

# User endpoints
@app.post("/api/users", response_model=User)
async def create_user(user_data: UserCreate):
    """Yeni kullanıcı oluştur"""
    # Check if user already exists
    existing_user = await db.get_user(user_data.firebase_uid)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    user_id = await db.create_user(user_data.dict())
    user = await db.get_user(user_data.firebase_uid)
    user["id"] = user["_id"]
    return User(**user)

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: str):
    """Kullanıcı bilgilerini getir"""
    user = await db.get_user(user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = user["_id"]
    return User(**user)

@app.put("/api/users/{user_id}", response_model=User)
async def update_user(user_id: str, update_data: UserUpdate):
    """Kullanıcı bilgilerini güncelle"""
    success = await db.update_user(user_id, update_data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.get_user(user_id)
    user["id"] = user["_id"]
    return User(**user)

# Analysis endpoints
@app.post("/api/analyses", response_model=Analysis)
async def create_analysis(analysis_data: AnalysisCreate):
    """Yeni analiz oluştur"""
    # Create analysis record
    analysis_dict = analysis_data.dict()
    analysis_dict["status"] = AnalysisStatus.PENDING
    
    analysis_id = await db.create_analysis(analysis_dict)
    analysis = await db.get_analysis(analysis_id)
    analysis["id"] = analysis["_id"]
    
    # TODO: Trigger background AI processing
    
    return Analysis(**analysis)

@app.get("/api/users/{user_id}/analyses")
async def get_user_analyses(user_id: str, limit: int = 10):
    """Kullanıcının analizlerini getir"""
    analyses = await db.get_user_analyses(user_id, limit)
    for analysis in analyses:
        analysis["id"] = analysis["_id"]
    
    return [Analysis(**analysis) for analysis in analyses]

@app.get("/api/analyses/{analysis_id}", response_model=Analysis)
async def get_analysis(analysis_id: str):
    """Tek analiz getir"""
    analysis = await db.get_analysis(analysis_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    
    analysis["id"] = analysis["_id"]
    return Analysis(**analysis)

@app.post("/api/upload-image")
async def upload_image(file: UploadFile = File(...)):
    """Resim yükle"""
    # TODO: Implement image upload to S3/Firebase Storage
    # For now, return mock URL
    
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Mock image URL
    mock_url = f"https://example.com/images/{file.filename}"
    
    return {
        "image_url": mock_url,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": file.size
    }
