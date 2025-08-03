import os
import google.generativeai as genai
from classification_bot.image_preprocessor import convert_to_grayscale
from classification_bot.end_prompt import diagnosis_end_prompt, diagnosis_dictionary
from yolo.yolo_service import classify_image

# ✅ Gemini API setup
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise ValueError("❌ GEMINI_API_KEY environment variable is missing.")
genai.configure(api_key=GEMINI_API_KEY)

def ask_gemini(prompt: str) -> str:
    """Prompt'u Gemini modeline gönderir ve yanıt döner."""
    model = genai.GenerativeModel("gemini-1.5-flash")
    response = model.generate_content(prompt)
    return response.text

def process_image(image_path: str):
    """Resmi gri tonlamaya çevirir, YOLO ile tahmin yapar, Gemini’den açıklama döner."""

    # ✅ 1. Resmi gri tonlamaya çevir
    gray_image_path = convert_to_grayscale(image_path)

    # ✅ 2. YOLO ile sınıflandır + box çizilmiş resmi al
    results, boxed_image_url = classify_image(gray_image_path)
    detections = results.to_df()

    # ✅ 3. Hiçbir sınıf bulunmazsa
    if len(detections) == 0:
        return {
            "top_class": None,
            "confidence": None,
            "gemini_response": "No lesion detected in the image.",
            "boxed_image_url": boxed_image_url,
            "detections": {}
        }

    # ✅ 4. En yüksek güven skorlu sınıfı al
    top = detections.iloc[0]
    top_class_id = int(top["class"])
    top_class_name = diagnosis_dictionary.get(top_class_id, "Unknown")
    confidence = round(float(top["confidence"]), 2)

    # ✅ 5. Gemini için prompt hazırla & yanıt al
    prompt = diagnosis_end_prompt(top_class_id)
    gemini_response = ask_gemini(prompt)

    # ✅ 6. Tüm bilgileri döndür
    return {
        "top_class": top_class_name,
        "confidence": confidence,
        "gemini_response": gemini_response,
        "boxed_image_url": boxed_image_url,
        "detections": detections.to_dict()
    }
