# app/chatbot_router.py
from fastapi import APIRouter, HTTPException, Header, Depends
from pydantic import BaseModel
from typing import Optional
from app.utils import decode_token
from app.chat import get_chat_history, add_message
from app.prompts import save_prompt, get_all_prompts
from app.gemini_api import get_gemini_response
from bson import ObjectId

chatbot_router = APIRouter()

# ✅ Request modelleri
class ChatRequest(BaseModel):
    message: str

class SavePromptRequest(BaseModel):
    prompt: str
    tag: Optional[str] = "general"

# ✅ Kullanıcıyı token’dan doğrulama
def get_current_user(authorization: str = Header(...)):
    """Header’dan token alıp email döner"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Invalid authorization header")

    token = authorization.split(" ")[1]
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    return email

# ✅ Chat endpoint
@chatbot_router.post("/chat")
async def chat_endpoint(req: ChatRequest, user_email: str = Depends(get_current_user)):
    if not req.message.strip():
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # ✅ Geçmişi al (DB'den)
    history = get_chat_history(user_email)
    past_texts = [h["message"] for h in history]

    # ✅ Gemini’den cevap al
    reply = get_gemini_response(past_texts, req.message)

    # ✅ Mesajları DB’ye kaydet
    add_message(user_email, "user", req.message)
    add_message(user_email, "assistant", reply)

    return {"reply": reply}

# ✅ Kullanıcının geçmiş mesajlarını getir
@chatbot_router.get("/get_history")
async def get_history(user_email: str = Depends(get_current_user)):
    history = get_chat_history(user_email)

    # ✅ Mongo ObjectId ve timestamp'leri stringe çevir
    for h in history:
        if "_id" in h and isinstance(h["_id"], ObjectId):
            h["_id"] = str(h["_id"])
        if "timestamp" in h and not isinstance(h["timestamp"], str):
            h["timestamp"] = str(h["timestamp"])
    return history

# ✅ Yeni prompt kaydet
@chatbot_router.post("/save_prompt")
async def save_prompt_endpoint(req: SavePromptRequest, user_email: str = Depends(get_current_user)):
    if not req.prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty")

    saved = save_prompt(req.prompt, req.tag)
    return {"status": "ok", "saved_prompt": saved}

# ✅ Prompt listesini getir
@chatbot_router.get("/get_prompts")
async def get_prompts_endpoint():
    return get_all_prompts()
