from typing import Annotated, List
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
from datetime import datetime
from datetime import datetime, timezone

#Database models go here
class UserDetails(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    userName: str
    college: str
    min_price: int
    max_price: int
    amenities: str

#Store apartment information for apartments user likes 
class SavedApartments(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str
    price: float
    address: str
    latitude: float
    longitude: float
    beds: int
    baths: int
    lot_size_sqft: int
    listing_agent: str
    contact: str
    amenities: str
    lease_terms: str


#Stores conversation history for the map_page
class ConversationHistoryMap(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_id: int
    sender: str  # 'human' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

#Stores Conversation History For Leases Page
class ConversationHistoryLeases(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    pdf_id: int
    sender: str  # 'human' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

#save Conversation history for Spreadsheet page
class ConversationHistorySpreadsheet(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    property_one: int
    property_two: int
    sender: str  # 'human' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
