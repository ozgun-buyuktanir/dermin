from fastapi import FastAPI, HTTPException, Depends, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from app.database.mongodb import MongoDatabase
from app.models.user import User, UserCreate, UserUpdate, UserLogin, Token, SkinSurvey
from app.models.analysis import Analysis, AnalysisCreate, AnalysisUpdate, AnalysisStatus
from app.models.skin_analysis import SkinAnalysisResult, AnalysisRequest, SkinAnalysisDB
from app.ml.yolo_predictor import YOLOPredictor
from app.ai.gemini_client import gemini_client
from app.auth import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    get_current_user
)

# Database instance
db = MongoDatabase()

# YOLO Predictor instance
yolo_predictor = YOLOPredictor()

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
    user_dict["display_name"] = ""  # Start with empty display name
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

# DEPRECATED: Bu endpoint duplicate olduğu için kaldırıldı
# @app.get("/api/analyses/{analysis_id}", response_model=Analysis)
# async def get_analysis(analysis_id: str):
#     """Tek analiz getir"""
#     analysis = await db.get_analysis(analysis_id)
#     if not analysis:
#         raise HTTPException(status_code=404, detail="Analysis not found")
#     
#     analysis["id"] = analysis["_id"]
#     return Analysis(**analysis)

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

# YOLO Skin Analysis endpoints
@app.post("/api/analyze-skin")
async def analyze_skin_image(
    file: UploadFile = File(...),
    confidence_threshold: float = 0.25,
    current_user_id: str = Depends(get_current_user)
):
    """Cilt fotoğrafını YOLO ile analiz et"""
    try:
        # Validate file
        if not file.content_type.startswith("image/"):
            raise HTTPException(status_code=400, detail="File must be an image")
        
        # Check file size (max 10MB)
        if file.size > 10 * 1024 * 1024:
            raise HTTPException(status_code=400, detail="File too large. Max size is 10MB")
        
        # Read image data
        image_data = await file.read()
        
        # Convert image to base64 for storage
        import base64
        image_base64 = base64.b64encode(image_data).decode('utf-8')
        image_data_url = f"data:{file.content_type};base64,{image_base64}"
        
        # Load YOLO model if not loaded
        if yolo_predictor.model is None:
            success = yolo_predictor.load_model()
            if not success:
                raise HTTPException(status_code=500, detail="Failed to load YOLO model")
        
        # Run prediction
        import time
        start_time = time.time()
        
        prediction_result = yolo_predictor.predict_image(
            image_data=image_data,
            confidence_threshold=confidence_threshold
        )
        
        processing_time = time.time() - start_time
        
        if not prediction_result["success"]:
            raise HTTPException(status_code=500, detail=f"Prediction failed: {prediction_result.get('error', 'Unknown error')}")
        
        # Generate analysis summary
        summary = yolo_predictor.get_analysis_summary(prediction_result["predictions"])
        
        # Get user survey data for personalized explanation
        user = await db.get_user(current_user_id)
        user_survey_data = user.get("survey_data", {}) if user else {}
        
        # Generate AI explanation with Gemini
        ai_explanation = gemini_client.generate_skin_analysis_explanation(
            yolo_predictions=prediction_result["predictions"],
            user_survey_data=user_survey_data,
            language="tr"  # Turkish by default
        )
        
        # Prepare result
        analysis_result = {
            "success": True,
            "predictions": prediction_result["predictions"],
            "summary": summary,
            "ai_explanation": ai_explanation,
            "model_info": prediction_result["model_info"],
            "processing_time": round(processing_time, 3)
        }
        
        # Save analysis to database
        analysis_data = {
            "user_id": current_user_id,
            "image_url": image_data_url,  # Store as base64 data URL
            "result": analysis_result,
            "status": "completed"
        }
        
        analysis_id = await db.create_analysis(analysis_data)
        
        # Track analysis event
        try:
            # TODO: Add analytics tracking
            pass
        except:
            pass  # Don't fail if analytics fails
        
        return {
            "analysis_id": analysis_id,
            "result": analysis_result
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Skin analysis error: {e}")
        raise HTTPException(status_code=500, detail="Analysis failed. Please try again.")

@app.get("/api/analyze-skin/demo")
async def demo_skin_analysis():
    """Demo endpoint - YOLO modelini test et"""
    try:
        # Load model if not loaded
        if yolo_predictor.model is None:
            success = yolo_predictor.load_model()
            if not success:
                return {
                    "success": False,
                    "error": "Failed to load YOLO model",
                    "model_info": None
                }
        
        return {
            "success": True,
            "message": "YOLO model loaded successfully",
            "model_info": {
                "model_path": yolo_predictor.model_path,
                "class_names": yolo_predictor.class_names,
                "device": 'cuda' if yolo_predictor.model else 'cpu'
            }
        }
        
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/api/gemini/test")
async def test_gemini():
    """Gemini API bağlantısını test et"""
    try:
        # Test with sample data
        sample_predictions = [
            {
                "class_name": "acne",
                "confidence": 0.85,
                "bbox": {"x": 100, "y": 150, "width": 50, "height": 60}
            }
        ]
        
        sample_survey = {
            "name": "Test User",
            "age": "25",
            "skinType": "yağlı",
            "skinConcerns": ["akne", "siyah nokta"]
        }
        
        result = gemini_client.generate_skin_analysis_explanation(
            yolo_predictions=sample_predictions,
            user_survey_data=sample_survey,
            language="tr"
        )
        
        return {
            "gemini_available": gemini_client.model is not None,
            "api_key_configured": gemini_client.api_key is not None,
            "test_result": result
        }
        
    except Exception as e:
        return {
            "gemini_available": False,
            "api_key_configured": gemini_client.api_key is not None,
            "error": str(e)
        }

# Analysis history endpoints
@app.get("/api/analyses")
async def get_user_analyses(
    limit: int = 10,
    current_user_id: str = Depends(get_current_user)
):
    """Kullanıcının analiz geçmişi"""
    try:
        analyses = await db.get_user_analyses(current_user_id, limit)
        
        # Format analyses for frontend
        formatted_analyses = []
        for analysis in analyses:
            formatted_analysis = {
                "id": str(analysis["_id"]),
                "title": f"Cilt Analizi - {analysis.get('created_at', 'Tarih bilinmiyor')}",
                "date": analysis.get("created_at", "2024-01-01"),
                "thumbnail": analysis.get("image_url", "https://via.placeholder.com/100x100?text=Analiz"),
                "condition": "Analiz Tamamlandı",
                "severity": "medium",
                "confidence": 0.85,
                "status": analysis.get("status", "completed"),
                "result": analysis.get("result")
            }
            
            # Extract condition from AI explanation if available
            if analysis.get("result", {}).get("ai_explanation", {}).get("explanation", {}).get("detected_issues"):
                issues = analysis["result"]["ai_explanation"]["explanation"]["detected_issues"]
                if issues and len(issues) > 0:
                    formatted_analysis["condition"] = issues[0][:20] + "..." if len(issues[0]) > 20 else issues[0]
            
            # Extract severity from predictions
            if analysis.get("result", {}).get("predictions"):
                predictions = analysis["result"]["predictions"]
                if predictions:
                    avg_confidence = sum(p.get("confidence", 0) for p in predictions) / len(predictions)
                    formatted_analysis["confidence"] = avg_confidence
                    if avg_confidence > 0.8:
                        formatted_analysis["severity"] = "high"
                    elif avg_confidence > 0.6:
                        formatted_analysis["severity"] = "medium"
                    else:
                        formatted_analysis["severity"] = "low"
                        
            formatted_analyses.append(formatted_analysis)
        
        return {
            "success": True,
            "analyses": formatted_analyses,
            "count": len(formatted_analyses)
        }
    except Exception as e:
        print(f"Analyses fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analyses")

@app.get("/api/analyses/{analysis_id}")
async def get_analysis_detail(analysis_id: str):
    """Tek analiz detayı"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        
        client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
        database = client[os.getenv('DATABASE_NAME')]
        
        analysis = await database.analyses.find_one({"_id": ObjectId(analysis_id)})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Convert ObjectId to string for JSON serialization
        analysis["_id"] = str(analysis["_id"])
        
        # Print to debug
        print(f"Analysis data: {analysis}")
        print(f"Has result field: {'result' in analysis}")
        
        client.close()
        return analysis
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error fetching analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analysis")

@app.get("/api/analyses/{analysis_id}/raw")
async def get_analysis_raw(analysis_id: str):
    """Raw analiz verisi test için"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        
        client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
        database = client[os.getenv('DATABASE_NAME')]
        
        analysis = await database.analyses.find_one({"_id": ObjectId(analysis_id)})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Convert ObjectId to string for JSON serialization
        analysis["_id"] = str(analysis["_id"])
        
        client.close()
        return analysis
        
    except Exception as e:
        print(f"Error fetching raw analysis: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch analysis")

# Survey endpoints
@app.post("/api/surveys")
async def create_survey(
    survey_data: SkinSurvey, 
    current_user_id: str = Depends(get_current_user)
):
    """Survey cevabını kaydet"""
    try:
        # Get user
        user = await db.get_user(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if survey already completed
        if user.get("survey_completed", False):
            raise HTTPException(status_code=400, detail="Survey already completed")
        
        # Prepare survey result data for forumresult collection
        survey_result = {
            "user_id": current_user_id,
            "user_email": user["email"],
            "user_name": survey_data.name or user.get("display_name", "Unknown"),
            "responses": survey_data.dict(),
            "survey_completed": True
        }
        
        # Save to forumresult collection
        survey_id = await db.create_survey_result(survey_result)
        
        # Update user with survey completion status and display name
        update_data = {
            "survey_data": survey_data.dict(),
            "survey_completed": True,
            "display_name": survey_data.name  # Set display name from survey
        }
        
        success = await db.update_user(current_user_id, update_data)
        if not success:
            raise HTTPException(status_code=500, detail="Failed to update user survey status")
        
        return {
            "message": "Survey saved successfully",
            "survey_id": survey_id,
            "survey_completed": True
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Survey creation error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save survey")

@app.get("/api/surveys/me")
async def get_my_survey(current_user_id: str = Depends(get_current_user)):
    """Kullanıcının survey cevabını getir"""
    try:
        user = await db.get_user(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if not user.get("survey_completed", False):
            raise HTTPException(status_code=404, detail="Survey not completed")
        
        return {
            "survey_data": user.get("survey_data"),
            "survey_completed": True
        }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Survey fetch error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch survey")

@app.get("/api/surveys/status")
async def get_survey_status(current_user_id: str = Depends(get_current_user)):
    """Survey durumunu kontrol et"""
    try:
        user = await db.get_user(current_user_id)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {
            "survey_completed": user.get("survey_completed", False)
        }
    except Exception as e:
        print(f"Survey status error: {e}")
        raise HTTPException(status_code=500, detail="Failed to check survey status")

@app.get("/api/surveys/results")
async def get_survey_results(current_user_id: str = Depends(get_current_user)):
    """Kullanıcının tüm survey sonuçlarını getir"""
    try:
        results = await db.get_survey_results(current_user_id)
        return {
            "results": results,
            "count": len(results)
        }
    except Exception as e:
        print(f"Survey results error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch survey results")

# Chat endpoints
@app.post("/api/chat/analysis/{analysis_id}")
async def chat_with_analysis(
    analysis_id: str,
    message: dict,
    current_user_id: str = Depends(get_current_user)
):
    """Analiz sonuçları hakkında chat"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        
        # Get analysis data
        client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
        database = client[os.getenv('DATABASE_NAME')]
        
        analysis = await database.analyses.find_one({"_id": ObjectId(analysis_id)})
        
        if not analysis:
            raise HTTPException(status_code=404, detail="Analysis not found")
        
        # Get user data for context
        user = await db.get_user(current_user_id)
        user_survey_data = user.get("survey_data", {}) if user else {}
        
        # Generate AI response based on analysis and user question
        ai_response = gemini_client.generate_chat_response(
            user_message=message.get("content", ""),
            analysis_data=analysis.get("result", {}),
            user_survey_data=user_survey_data,
            language="tr"
        )
        
        # Save chat message to database
        chat_data = {
            "analysis_id": analysis_id,
            "user_id": current_user_id,
            "messages": [
                {
                    "role": "user",
                    "content": message.get("content", ""),
                    "timestamp": "2024-01-01T00:00:00Z"
                },
                {
                    "role": "assistant", 
                    "content": ai_response,
                    "timestamp": "2024-01-01T00:00:00Z"
                }
            ]
        }
        
        # Store in chat collection
        chat_id = await database.chats.insert_one(chat_data)
        
        client.close()
        
        return {
            "response": ai_response,
            "chat_id": str(chat_id.inserted_id)
        }
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="Failed to process chat message")

@app.get("/api/chat/analysis/{analysis_id}/history")
async def get_chat_history(
    analysis_id: str,
    current_user_id: str = Depends(get_current_user)
):
    """Analiz için chat geçmişi"""
    try:
        from motor.motor_asyncio import AsyncIOMotorClient
        from bson import ObjectId
        
        client = AsyncIOMotorClient(os.getenv('MONGODB_URL'))
        database = client[os.getenv('DATABASE_NAME')]
        
        chats = await database.chats.find({
            "analysis_id": analysis_id,
            "user_id": current_user_id
        }).to_list(length=100)
        
        client.close()
        
        # Convert ObjectId to string
        for chat in chats:
            chat["_id"] = str(chat["_id"])
        
        return {
            "chats": chats
        }
        
    except Exception as e:
        print(f"Chat history error: {e}")
        raise HTTPException(status_code=500, detail="Failed to fetch chat history")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
