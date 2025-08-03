import os
from ultralytics import YOLO

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
MODEL_PATH = os.path.join(BASE_DIR, "yolo", "yolov8s_50epochs.pt")

yolo_model = YOLO(MODEL_PATH)

def classify_image(image_path: str):
    """
    YOLOv8 modelini kullanarak bir resmi sınıflandırır.
    :param image_path: Resmin dosya yolu
    :return: YOLO results objesi
    """
    results = yolo_model(image_path)

    # ✅ boxlu görseli static klasörüne kaydediyoruz
    os.makedirs("static", exist_ok=True)
    results[0].save(filename="static/boxed.jpg")

    return results[0]  # ilk (ve tek) sonucu döndürüyoruz
