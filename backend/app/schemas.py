from typing import Annotated, List
from pydantic import BaseModel, EmailStr
from datetime import date
from sqlmodel import Field

#Fields from the questionare sheet
class InfoFromQuestionnaire(BaseModel):
    name: str
    college: str
    country: str
    state: str
    city: str
    min_price: int
    max_price: int
    amenities: List[str]

