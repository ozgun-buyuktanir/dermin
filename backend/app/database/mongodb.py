from motor.motor_asyncio import AsyncIOMotorClient
from typing import List, Dict, Any, Optional
from datetime import datetime
import os
from .interface import DatabaseInterface

class MongoDatabase(DatabaseInterface):
    def __init__(self):
        self.client = None
        self.database = None
        
    async def connect(self):
        """MongoDB bağlantısı"""
        mongodb_url = os.getenv("MONGODB_URL", "mongodb://localhost:27017")
        database_name = os.getenv("DATABASE_NAME", "dermin_db")
        
        self.client = AsyncIOMotorClient(mongodb_url)
        self.database = self.client[database_name]
        
        # Test connection
        await self.client.admin.command('ping')
        print(f"✅ Connected to MongoDB: {database_name}")
        
    async def disconnect(self):
        """MongoDB bağlantısını kapat"""
        if self.client:
            self.client.close()
            print("❌ Disconnected from MongoDB")
    
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        """Yeni kullanıcı oluştur"""
        user_data["created_at"] = datetime.utcnow()
        user_data["updated_at"] = datetime.utcnow()
        
        result = await self.database.users.insert_one(user_data)
        return str(result.inserted_id)
    
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        """User ID ile kullanıcı getir"""
        from bson import ObjectId
        
        try:
            user = await self.database.users.find_one({"_id": ObjectId(user_id)})
            if user:
                user["_id"] = str(user["_id"])
            return user
        except:
            return None
    
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        """Email ile kullanıcı getir"""
        user = await self.database.users.find_one({"email": email})
        if user:
            user["_id"] = str(user["_id"])
        return user
    
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        """Kullanıcı bilgilerini güncelle"""
        from bson import ObjectId
        
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = await self.database.users.update_one(
                {"_id": ObjectId(user_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False
    
    async def create_analysis(self, analysis_data: Dict[str, Any]) -> str:
        """Yeni analiz kaydet"""
        analysis_data["created_at"] = datetime.utcnow()
        analysis_data["updated_at"] = datetime.utcnow()
        
        result = await self.database.analyses.insert_one(analysis_data)
        return str(result.inserted_id)
    
    async def get_user_analyses(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        """Kullanıcının analizlerini getir"""
        cursor = self.database.analyses.find(
            {"user_id": user_id}
        ).sort("created_at", -1).limit(limit)
        
        analyses = []
        async for analysis in cursor:
            analysis["_id"] = str(analysis["_id"])
            analyses.append(analysis)
            
        return analyses
    
    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        """Tek analiz getir"""
        from bson import ObjectId
        
        try:
            analysis = await self.database.analyses.find_one({"_id": ObjectId(analysis_id)})
            if analysis:
                analysis["_id"] = str(analysis["_id"])
            return analysis
        except:
            return None
    
    async def update_analysis(self, analysis_id: str, update_data: Dict[str, Any]) -> bool:
        """Analiz güncelle"""
        from bson import ObjectId
        
        update_data["updated_at"] = datetime.utcnow()
        
        try:
            result = await self.database.analyses.update_one(
                {"_id": ObjectId(analysis_id)},
                {"$set": update_data}
            )
            return result.modified_count > 0
        except:
            return False

    async def create_survey_result(self, survey_data: Dict[str, Any]) -> str:
        """Survey sonucunu forumresult koleksiyonuna kaydet"""
        survey_data["submitted_at"] = datetime.utcnow()
        
        result = await self.database.forumresult.insert_one(survey_data)
        return str(result.inserted_id)
    
    async def get_survey_results(self, user_id: str) -> List[Dict[str, Any]]:
        """Kullanıcının survey sonuçlarını getir"""
        cursor = self.database.forumresult.find({"user_id": user_id})
        results = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            results.append(doc)
        return results
