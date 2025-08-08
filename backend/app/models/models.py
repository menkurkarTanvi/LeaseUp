import json
from typing import Annotated, List
from pydantic import BaseModel, EmailStr
from typing import Optional
from sqlmodel import Field, Session, SQLModel, create_engine, select
from sqlalchemy import Column, Text, JSON
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

#Store apartment information for apartments user LIKES 
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
    amenities: Optional[str] = Field(default="[]", sa_column=Column("amenities_list", Text))
    lease_terms: Optional[str] = Field(default="[]", sa_column=Column("lease_list", Text))

    @property
    def amenities_list(self) -> list:
        return json.loads(self._amenities_list or "[]")

    @amenities_list.setter
    def lease_list(self, value: list):
        self._amenities_list = json.dumps(value)

    @property
    def lease_list(self) -> list:
        return json.loads(self._lease_list or "[]")

    @lease_list.setter
    def lease_list(self, value: list):
        self._lease_list = json.dumps(value)


#------------------------------------------------------CONVERSATION HISTORY-----------------------------------------------------------------#

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
    property_ids: List[int] = Field(sa_column=Column(JSON))
    sender: str  # 'human' or 'ai'
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
