import os
import google.generativeai as genai

# 🔑 Gemini API anahtarını yükle
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY environment variable missing")

genai.configure(api_key=GEMINI_API_KEY)

# ✅ Gemini modelini hazırlayalım (tek sefer yüklenir)
model = genai.GenerativeModel("gemini-1.5-flash")

def get_gemini_response(history: list[str], user_message: str) -> str:
    """
    Kullanıcı mesajını Gemini'ye gönderir ve cevap döner.
    :param history: Kullanıcının önceki mesajlarının listesi (context için)
    :param user_message: Yeni gelen mesaj
    :return: Gemini cevabı (string)
    """
    try:
        # Geçmiş mesajlardan bir context oluştur
        context_text = "\n".join([f"User: {msg}" for msg in history[-5:]])  # son 5 mesaj
        full_prompt = (
            "You are Dermin ChatBot, an AI assistant specialized in dermatology.\n"
            "You should provide helpful, friendly and medically safe responses.\n"
            "Avoid giving direct diagnosis; always recommend consulting a dermatologist.\n\n"
            f"Chat history:\n{context_text}\n\n"
            f"User: {user_message}\nAssistant:"
        )

        response = model.generate_content(full_prompt)
        return response.text.strip()

    except Exception as e:
        return f"⚠️ Gemini API error: {str(e)}"
