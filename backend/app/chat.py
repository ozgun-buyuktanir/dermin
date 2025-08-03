from datetime import datetime
from app.db import chat_collection

def get_chat_history(user_id):
    """Belirli kullanıcıya ait geçmiş mesajları döndür"""
    return list(chat_collection.find({"user_id": user_id}, {"_id": 0}))

def add_message(user_id, role, message):
    """Mesajı MongoDB’ye kaydet"""
    chat_collection.insert_one({
        "user_id": user_id,
        "role": role,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    })
