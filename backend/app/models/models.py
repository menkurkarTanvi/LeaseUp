from typing import Annotated, List
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import datetime

#Database models go here
class UserDetails(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    college: str
    country: str
    state: str
    city: str
    min_price: int
    max_price: int
    amenities: str

#Store apartment information for apartments user likes 
class SavedApartments(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int
    price: float
    street: str
    city: str
    state: str
    zip_code: int
    beds: int
    baths: int
    area: int
    lattitude: float
    longitde: float
    images: str
    amenities: str


#Stores conversation history for the map_page
class ConversationHistoryMap(SQLModel, table=False):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int
    sender: str  # 'human' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)
