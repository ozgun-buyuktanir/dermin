from fastapi import FastAPI
import sys
import os
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles  # ✅ eklendi

sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

from app.auth import auth_router
from app.kvkk import kvkk_router
from app.survey import survey_router
from app.yolo_router import yolo_router
from app.chatbot_router import chatbot_router

app = FastAPI(title="Dermin Backend")

# ✅ CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # frontend domainini buraya koy (örn: http://localhost:5173)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ static klasörünü bağla
app.mount("/static", StaticFiles(directory="static"), name="static")

# ✅ Router'lar
app.include_router(auth_router, prefix="/auth", tags=["Auth"])
app.include_router(kvkk_router, prefix="/kvkk", tags=["KVKK"])
app.include_router(survey_router, prefix="/survey", tags=["Survey"])
app.include_router(yolo_router, prefix="/yolo", tags=["YOLO"])
app.include_router(chatbot_router, prefix="/chatbot", tags=["Chatbot"])

@app.get("/")
def root():
    return {"message": "Dermin API is running"}
