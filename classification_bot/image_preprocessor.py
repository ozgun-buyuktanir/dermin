# classification_bot/image_preprocessor.py

from PIL import Image
import os

def convert_to_grayscale(image_path: str) -> str:
    """
    Verilen resmi siyah-beyaza çevirir ve yeni dosya yolunu döner.
    :param image_path: Orijinal resmin yolu
    :return: Yeni siyah-beyaz resim yolu
    """
    img = Image.open(image_path).convert("L")  # 'L' → grayscale (tek kanal)
    
    # Yeni dosya yolu oluştur (aynı klasör + _gray ekleyelim)
    base, ext = os.path.splitext(image_path)
    gray_path = f"{base}_gray{ext}"
    
    img.save(gray_path)
    return gray_path
