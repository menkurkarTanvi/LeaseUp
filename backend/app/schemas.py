from typing import Annotated, List, Optional
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

#Details we are going to save about the Apartments
class OutputApartmentDetails(BaseModel):
    property_id: str
    price: int
    address: str
    latitude: float 
    longitude: float
    beds: int
    baths: int
    lot_size_sqft: int | None = None
    description: str | None = None
    listing_agent: List[str] = []
    amentities: List[str] = []
    appliances: List[str] = []
    flooring: str | None = None
    heating: str | None = None
    cooling: str | None = None
    parking: str | None = None
    images: List[str] = []

#Question asked to chat bot
class QueryRequest(BaseModel):
    question: str
    user_info: Optional[dict] = None


