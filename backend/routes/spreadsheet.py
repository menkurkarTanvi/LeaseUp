#This page has endpoints needs for the spreadsheet page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistoryMap, UserDetails
from backend.app.schemas import OutputApartmentDetails
import httpx
import asyncio
from backend.routes.data import apartments
router = APIRouter()


@router.get("/saved_apartments/")
def get_saved_apartments():
    pass