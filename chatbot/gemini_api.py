import os
import google.generativeai as genai
from dotenv import load_dotenv

# API key yükle
load_dotenv("dermin/chatbot/.env/gemini_keys.env")
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

MODEL_NAME = "gemini-1.5-flash"

SYSTEM_PROMPT = """
Sen bir sohbet asistanısın.
Kullanıcıya cilt ve saç sağlığı konularında yardımcı ol.
Kullanıcı sorularına net, anlaşılır ve detaylı cevaplar ver.
Eğer soruya cevap veremiyorsan, "Bu konuda bilgi sahibi değilim." şeklinde cevap ver.
Kullanıcıya önerilerde bulunabilirsin, ancak tıbbi tavsiye verme.
Gerekirse hastalık belirtileri veya tedavi yöntemleri hakkında genel bilgi verebilirsin ve kullanıcıyı bir uzmana yönlendirebilirsin.
Unutma, sen bir yapay zeka asistanısın, gerçek bir doktor değilsin.
"""

def get_gemini_response(history, new_message):
    """
    Gemini API'yi çağırır. Eğer history boşsa SYSTEM_PROMPT otomatik eklenir.
    """
    messages_to_send = []
    
    # Eğer geçmiş boşsa sistem promptu ekle
    if not history:
        messages_to_send.append(SYSTEM_PROMPT)
    else:
        messages_to_send.append(SYSTEM_PROMPT)
        messages_to_send.extend(history)

    # Yeni mesajı ekle
    messages_to_send.append(new_message)

    model = genai.GenerativeModel(MODEL_NAME)
    response = model.generate_content(messages_to_send)

    return response.text