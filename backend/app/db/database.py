from typing import Annotated

from fastapi import Depends, FastAPI, HTTPException, Query
from sqlmodel import Field, Session, SQLModel, create_engine, select

sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"

connect_args = {"check_same_thread": False}

#Create an engine which is what holds connection to the databse
engine = create_engine(sqlite_url, connect_args=connect_args)
print(engine.url)

#Create the table for all table models
def create_db():
    SQLModel.metadata.create_all(engine)

#Create a session dependency
def get_db():
    with Session(engine) as session:
        yield session  