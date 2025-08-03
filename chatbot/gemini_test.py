# gemini_test.py
import os
import google.generativeai as genai
from dotenv import load_dotenv

x = load_dotenv("dermin/chatbot/.env/gemini_keys.env")
print(x)
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

model = genai.GenerativeModel("gemini-1.5-flash")
response = model.generate_content("Merhaba Gemini, cevap veriyor musun?")
print(response.text)

