from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database import db
from app.models.user import User, UserCreate, UserUpdate, UserLogin, Token
from app.models.analysis import Analysis, AnalysisCreate, AnalysisUpdate, AnalysisStatus
from app.models.survey import SurveyResponse, Survey
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)

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
    allow_origins=["http://localhost:5173", "http://localhost:3000", "*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Dermin AI API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": "2025-07-28T12:00:00Z"}

# Authentication endpoints
@app.post("/api/auth/check-user")
async def check_user_exists(email_data: dict):
    """Check if user exists by email"""
    email = email_data.get("email")
    if not email:
        raise HTTPException(status_code=400, detail="Email is required")
    
    user = await db.get_user_by_email(email)
    return {"exists": user is not None}

@app.post("/api/auth/register", response_model=Token)
async def register(user_data: UserCreate):
    """Yeni kullanıcı kaydı"""
    # Check if user already exists
    existing_user = await db.get_user_by_email(user_data.email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User with this email already exists")
    
    # Hash password
    hashed_password = get_password_hash(user_data.password)
    
    # Create user
    user_dict = user_data.dict()
    user_dict["password_hash"] = hashed_password
    del user_dict["password"]  # Remove plain password
    
    user_id = await db.create_user(user_dict)
    
    # Create access token
    access_token = create_access_token(data={"sub": user_id, "email": user_data.email})
    
    return {"access_token": access_token, "token_type": "bearer"}

@app.post("/api/auth/login", response_model=Token)
async def login(user_credentials: UserLogin):
    """Kullanıcı girişi"""
    # Get user by email
    user = await db.get_user_by_email(user_credentials.email)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Verify password
    if not verify_password(user_credentials.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    # Create access token
    access_token = create_access_token(data={"sub": user["_id"], "email": user["email"]})
    
    return {"access_token": access_token, "token_type": "bearer"}

# User endpoints
@app.get("/api/users/me", response_model=User)
async def get_current_user_info(current_user_id: str = Depends(get_current_user)):
    """Mevcut kullanıcı bilgilerini getir"""
    user = await db.get_user(current_user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user["id"] = user["_id"]
    return User(**user)

@app.put("/api/users/me", response_model=User)
async def update_current_user(
    update_data: UserUpdate, 
    current_user_id: str = Depends(get_current_user)
):
    """Mevcut kullanıcı bilgilerini güncelle"""
    success = await db.update_user(current_user_id, update_data.dict(exclude_unset=True))
    if not success:
        raise HTTPException(status_code=404, detail="User not found")
    
    user = await db.get_user(current_user_id)
    user["id"] = user["_id"]
    return User(**user)

# Analysis endpoints
@app.post("/api/analyses", response_model=Analysis)
async def create_analysis(
    analysis_data: AnalysisCreate,
    current_user_id: str = Depends(get_current_user)
):
    """Yeni analiz oluştur"""
    # Create analysis record
    analysis_dict = analysis_data.dict()
    analysis_dict["user_id"] = current_user_id
    analysis_dict["status"] = AnalysisStatus.PENDING
    
    analysis_id = await db.create_analysis(analysis_dict)
    analysis = await db.get_analysis(analysis_id)
    analysis["id"] = analysis["_id"]
    
    # TODO: Trigger background AI processing
    
    return Analysis(**analysis)

@app.get("/api/analyses")
async def get_user_analyses(
    current_user_id: str = Depends(get_current_user),
    limit: int = 10
):
    """Kullanıcının analizlerini getir"""
    analyses = await db.get_user_analyses(current_user_id, limit)
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

# Survey endpoints
@app.post("/api/surveys")
async def create_survey(survey_data: SurveyResponse, current_user: User = Depends(get_current_user)):
    """Survey cevabı kaydet"""
    try:
        # Convert to dict and add user info
        survey_dict = survey_data.model_dump()
        survey_dict["user_email"] = current_user.email
        
        # Remove None values
        survey_dict = {k: v for k, v in survey_dict.items() if v is not None}
        
        survey_id = await db.create_survey(survey_dict)
        
        return {
            "message": "Survey saved successfully",
            "survey_id": survey_id
        }
    except Exception as e:
        print(f"Survey creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save survey")

@app.get("/api/surveys/me")
async def get_my_survey(current_user: User = Depends(get_current_user)):
    """Kullanıcının survey cevabını getir"""
    try:
        survey = await db.get_user_survey(current_user.email)
        if not survey:
            raise HTTPException(status_code=404, detail="Survey not found")
        
        return survey
    except HTTPException:
        raise
    except Exception as e:
        print(f"Survey fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch survey")
