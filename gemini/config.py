import os
from dotenv import load_dotenv
 
# .env klasörünü yükle
dotenv_path = os.path.join('.env/gemini_keys.env')
load_dotenv(dotenv_path)
 
API_KEY = os.getenv("GEMINI_API_KEY")
if API_KEY is None:
    raise RuntimeError("GEMINI_API_KEY bulunamadı. .env dosyasını kontrol edin.")