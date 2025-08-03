from fastapi import APIRouter, HTTPException
from app.db import users_collection
from app.utils import decode_token

kvkk_router = APIRouter()

@kvkk_router.post("/approve")
def approve_kvkk(token: str):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    users_collection.update_one({"email": email}, {"$set": {"kvkk_approved": True}})
    return {"message": "KVKK approved"}
