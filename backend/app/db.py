from pymongo import MongoClient
import os
from dotenv import load_dotenv

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017/")
client = MongoClient(MONGO_URI)
db = client["dermin_app"]

users_collection = db["users"]
records_collection = db["records"]   # YOLO sonuçları buraya
chat_collection = db["chat_history"] # Chatbot geçmişi buraya

