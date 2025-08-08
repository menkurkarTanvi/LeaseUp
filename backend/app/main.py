from fastapi import FastAPI
from backend.routes import questions
from backend.routes import maps

from backend.routes import lease, spreadsheet
from backend.app.db.database import create_db
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from backend.app.models.models import SavedApartments  
from pinecone import Pinecone, ServerlessSpec
from sqlmodel import SQLModel, create_engine, Session, delete

# db engine
sqlite_file_name = "database.db"
sqlite_url = f"sqlite:///{sqlite_file_name}"
connect_args = {"check_same_thread": False}
engine = create_engine(sqlite_url, connect_args=connect_args)


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Running startup tasks...")

    create_db()

#    clear SavedApartments table
    with Session(engine) as session:
        session.exec(delete(SavedApartments))
        session.commit()

    print("Startup complete.")
    yield
    print("Shutdown complete.")


app = FastAPI(lifespan=lifespan)

# Include routers
app.include_router(questions.router)
app.include_router(maps.router)
app.include_router(lease.router)
app.include_router(spreadsheet.router)

@app.get("/")
def root():
    return {"message": "Welcome to FastAPI!"}


#Connects to the frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://127.0.0.1:3000", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

