from datetime import datetime
from storage import load_json, save_json, CHAT_FILE

def get_chat_history(user_id):
    chats = load_json(CHAT_FILE)
    return [c for c in chats if c["user_id"] == user_id]

def add_message(user_id, role, message):
    chats = load_json(CHAT_FILE)
    chats.append({
        "user_id": user_id,
        "role": role,
        "message": message,
        "timestamp": datetime.utcnow().isoformat()
    })
    save_json(CHAT_FILE, chats)
