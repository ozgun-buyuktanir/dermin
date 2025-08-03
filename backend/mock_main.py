from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
import time
import uuid

app = FastAPI(title="Dermin AI API - Test")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mock function for current user
async def get_current_user():
    return "mock_user_123"

@app.get("/")
async def root():
    return {"message": "Dermin AI API Test", "status": "running"}

# Auth endpoints
@app.post("/api/auth/check-user")
async def check_user_exists(email_data: dict):
    """Mock check user endpoint"""
    email = email_data.get("email")
    print(f"🔍 Checking user: {email}")
    
    # Mock response - always return user exists for testing
    return {"exists": True}

@app.post("/api/auth/login")
async def mock_login(credentials: dict):
    """Mock login endpoint"""
    email = credentials.get("email")
    password = credentials.get("password")
    
    print(f"🔍 Mock Login: {email}")
    
    # Mock token
    mock_token = "mock_jwt_token_123456789"
    
    return {
        "access_token": mock_token,
        "token_type": "bearer"
    }

@app.post("/api/auth/register")
async def mock_register(user_data: dict):
    """Mock register endpoint"""
    email = user_data.get("email")
    print(f"🔍 Mock Register: {email}")
    
    # Mock token
    mock_token = "mock_jwt_token_123456789"
    
    return {
        "access_token": mock_token,
        "token_type": "bearer"
    }

@app.get("/api/users/me")
async def get_current_user_mock():
    """Mock current user endpoint"""
    return {
        "id": "mock_user_123",
        "email": "test@example.com",
        "display_name": "Test User",
        "survey_completed": True
    }

@app.post("/api/analyze-skin")
async def analyze_skin_mock(
    file: UploadFile = File(...),
    current_user_id: str = Depends(get_current_user)
):
    """Mock skin analysis endpoint"""
    print(f"🔍 Mock Analysis Request:")
    print(f"  - File: {file.filename}")
    print(f"  - Content Type: {file.content_type}")
    print(f"  - User ID: {current_user_id}")
    
    # Validate file
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="File must be an image")
    
    # Mock processing time
    time.sleep(2)
    
    # Mock analysis ID
    analysis_id = str(uuid.uuid4())
    
    # Mock result
    mock_result = {
        "analysis_id": analysis_id,
        "result": {
            "success": True,
            "predictions": [
                {
                    "class_name": "acne",
                    "confidence": 0.85,
                    "bbox": {"x": 100, "y": 150, "width": 50, "height": 60}
                },
                {
                    "class_name": "blackheads", 
                    "confidence": 0.72,
                    "bbox": {"x": 200, "y": 80, "width": 30, "height": 40}
                }
            ],
            "ai_explanation": {
                "success": True,
                "explanation": {
                    "full_explanation": "🔍 **Cilt Analizi Sonuçları**\n\n**Genel Durum:** Cildinizdeki bazı problemler tespit edildi ancak genel olarak tedavi edilebilir durumda.\n\n**Tespit Edilen Sorunlar:**\n- **Akne:** %85 güvenilirlik ile tespit edildi\n- **Siyah Nokta:** %72 güvenilirlik ile tespit edildi\n\n**Öneriler:**\n- Günlük cilt temizliği yapın\n- Yağsız nemlendirici kullanın\n- Güneş koruyucu sürmeyi unutmayın\n\n**Doktor Kontrolü:** Hafif seviyede problemler için dermatoloji uzmanına danışmanız önerilir.",
                    "general_condition": "Cildinizdeki problemler tedavi edilebilir seviyede",
                    "detected_issues": [
                        "Akne problemleri mevcut - günlük bakım gerekiyor",
                        "Siyah nokta oluşumu - düzenli temizlik önemli"
                    ],
                    "recommendations": [
                        "Sabah akşam nazik temizlik",
                        "Yağsız nemlendirici kullanımı", 
                        "SPF 30+ güneş koruyucu"
                    ],
                    "doctor_consultation": "Hafif seviyede problemler için rutin kontrol yeterli"
                }
            },
            "processing_time": 2.3
        }
    }
    
    print(f"✅ Mock Analysis Result: {analysis_id}")
    return mock_result

@app.get("/api/analyses/{analysis_id}")
async def get_analysis_mock(analysis_id: str):
    """Mock get analysis endpoint"""
    print(f"🔍 Getting analysis: {analysis_id}")
    
    # Mock analysis data
    mock_analysis = {
        "_id": analysis_id,
        "user_id": "mock_user_123",
        "image_url": "temp://mock_image.jpg",
        "result": {
            "success": True,
            "predictions": [
                {
                    "class_name": "acne",
                    "confidence": 0.85,
                    "bbox": {"x": 100, "y": 150, "width": 50, "height": 60}
                },
                {
                    "class_name": "blackheads",
                    "confidence": 0.72,
                    "bbox": {"x": 200, "y": 80, "width": 30, "height": 40}
                }
            ],
            "ai_explanation": {
                "success": True,
                "explanation": {
                    "full_explanation": "🔍 **Cilt Analizi Sonuçları**\n\n**Genel Durum:** Cildinizdeki bazı problemler tespit edildi ancak genel olarak tedavi edilebilir durumda.\n\n**Tespit Edilen Sorunlar:**\n- **Akne:** %85 güvenilirlik ile tespit edildi\n- **Siyah Nokta:** %72 güvenilirlik ile tespit edildi\n\n**Öneriler:**\n- Günlük cilt temizliği yapın\n- Yağsız nemlendirici kullanın\n- Güneş koruyucu sürmeyi unutmayın\n\n**Doktor Kontrolü:** Hafif seviyede problemler için dermatoloji uzmanına danışmanız önerilir.",
                    "general_condition": "Cildinizdeki problemler tedavi edilebilir seviyede",
                    "detected_issues": [
                        "Akne problemleri mevcut - günlük bakım gerekiyor",
                        "Siyah nokta oluşumu - düzenli temizlik önemli"
                    ],
                    "recommendations": [
                        "Sabah akşam nazik temizlik",
                        "Yağsız nemlendirici kullanımı",
                        "SPF 30+ güneş koruyucu"
                    ],
                    "doctor_consultation": "Hafif seviyede problemler için rutin kontrol yeterli"
                }
            },
            "processing_time": 2.3
        },
        "status": "completed",
        "created_at": "2025-08-03T12:00:00Z"
    }
    
    return mock_analysis
