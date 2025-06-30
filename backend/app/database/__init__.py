from .mongodb import MongoDatabase
from .interface import DatabaseInterface

# Database factory - MongoDB'yi değiştirmek için buraya PostgreSQL, SQLite vs ekleyebiliriz
def get_database() -> DatabaseInterface:
    """Database instance döndür"""
    return MongoDatabase()

# Global database instance
db: DatabaseInterface = get_database()
