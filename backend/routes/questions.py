from typing import Annotated
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from datetime import date
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.schemas import InfoFromQuestionnaire
from backend.app.models.models import UserDetails
import json

router = APIRouter()

#Retrieves the data from the questionnaire the user filled out and stores in database
@router.put("/questions")
def put_info_from_questionare(
    questionnaire_info: InfoFromQuestionnaire,
    db: Session = Depends(get_db)
):
    amenities_list = questionnaire_info.amenities
    user = UserDetails(
        id = 1,
        name=questionnaire_info.name,
        college=questionnaire_info.college,
        country=questionnaire_info.country,
        state=questionnaire_info.state,
        city=questionnaire_info.city,
        min_price=questionnaire_info.min_price,
        max_price=questionnaire_info.max_price,
        amenities=json.dumps(amenities_list)
    )
    try:
        db.add(user)
        db.commit()
        db.refresh(user)
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))
    return user