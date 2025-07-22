from typing import Annotated
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from datetime import date
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.schemas import InfoFromQuestionare

router = APIRouter()

#Retrieves the data from the questionare the user filled out
@router.get("/questionare/")
def get_info_from_quesionare(
    questionare_info: InfoFromQuestionare,
    db: Session = Depends(get_db)
):
    return "User information from questionare successfully stored in database"
