from typing import Annotated, List
from pydantic import BaseModel, EmailStr

from sqlmodel import Field, Session, SQLModel, create_engine, select

#Database models go here, below just a sample database
class UserDetails(SQLModel, table=True):
    name: str
    college: str
    country: str
    state: str
    city: str
    min_price: int
    max_price: int
    amenities: List[str]

#Store apartment information for apartments user likes 
class SavedApartments(SQLModel, table=True):
    id: int
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
    images: List[str]
    amenities: List[str]



