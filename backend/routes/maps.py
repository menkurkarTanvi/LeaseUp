#This page has endpoints needs for the maps page
from typing import Annotated
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db

router = APIRouter()

#Retrieves the apartments based on the data gathered from the questionare
#Function calls api to get apartments that match user needs
@router.get("/apartments/")
def get_apartments(db: Session = Depends(get_db)
):
    return "User information from questionare successfully stored"


#Saves details of an apartment the user liked to the database
@router.post("/apartments/{property_id}")
def save_aparments(db: Session = Depends(get_db)):

    return "Apartment information successfully saved to database"

#Gets crime rate info
@router.get("/apartments/{lattitude}{longitude}")
def get_crime_rates():
    return 