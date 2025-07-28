from typing import Annotated
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from datetime import date
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.schemas import InfoFromQuestionnaire

router = APIRouter()

#Retrieves the data from the questionnaire the user filled out
@router.get("/questions/")
def get_info_from_questionare(
    questionnaire_info: InfoFromQuestionnaire,
    db: Session = Depends(get_db)
):
    return "User information from questionare successfully stored in database"
