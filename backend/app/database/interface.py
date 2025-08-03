from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
from datetime import datetime

class DatabaseInterface(ABC):
    """Abstract database interface - MongoDB'yi değiştirmek için"""
    
    @abstractmethod
    async def connect(self):
        pass
    
    @abstractmethod
    async def disconnect(self):
        pass
    
    @abstractmethod
    async def create_user(self, user_data: Dict[str, Any]) -> str:
        pass
    
    @abstractmethod
    async def get_user(self, user_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_user_by_email(self, email: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def update_user(self, user_id: str, update_data: Dict[str, Any]) -> bool:
        pass
    
    @abstractmethod
    async def create_analysis(self, analysis_data: Dict[str, Any]) -> str:
        pass
    
    @abstractmethod
    async def get_user_analyses(self, user_id: str, limit: int = 10) -> List[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def get_analysis(self, analysis_id: str) -> Optional[Dict[str, Any]]:
        pass
    
    @abstractmethod
    async def update_analysis(self, analysis_id: str, update_data: Dict[str, Any]) -> bool:
        pass
    
    @abstractmethod
    async def create_survey_result(self, survey_data: Dict[str, Any]) -> str:
        pass
    
    @abstractmethod
    async def get_survey_results(self, user_id: str) -> List[Dict[str, Any]]:
        pass
