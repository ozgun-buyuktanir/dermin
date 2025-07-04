
import google.generativeai as genai
from config import API_KEY
# API anahtarını buraya yapıştır


genai.configure(api_key=API_KEY)

# Doğru model

def ask_gemini(prompt: str, model_name: str = "gemini-1.5-flash", temperature: float = 0.7, max_tokens: int = 800) -> dict:
    #Verilen prompt'u Gemini'ye sorar, JSON cevabı döner.
    model = genai.GenerativeModel(model_name)
    chat=model.start_chat()
    response=chat.send_message(
        prompt
    )
    return response






