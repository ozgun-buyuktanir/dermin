from fastapi import APIRouter, UploadFile, File
import sys, os, tempfile, shutil

# Klasör yolunu import edebilmek için ekle
sys.path.append(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from classification_bot.classifier import process_image

yolo_router = APIRouter()

@yolo_router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    # ✅ Dosyayı geçici kaydet
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as tmp:
        shutil.copyfileobj(file.file, tmp)
        tmp_path = tmp.name

    # ✅ YOLO + Gemini yorumunu al
    result = process_image(tmp_path)

    return {
        "top_class": result["top_class"],
        "confidence": result["confidence"],
        "gemini_response": result["gemini_response"],
        "boxed_image_url": "/static/boxed.jpg"  # ✅ Frontend bu URL’den çekecek
    }