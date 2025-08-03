from fastapi import APIRouter, HTTPException
from app.db import users_collection
from app.models import SurveyModel
from app.utils import decode_token

survey_router = APIRouter()

@survey_router.post("/submit")
def submit_survey(survey: SurveyModel, token: str):
    email = decode_token(token)
    if not email:
        raise HTTPException(status_code=401, detail="Invalid token")
    users_collection.update_one(
        {"email": email},
        {"$set": {"survey": survey.dict()}}
    )
    return {"message": "Survey submitted"}
