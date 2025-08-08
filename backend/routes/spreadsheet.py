#This page has endpoints needs for the spreadsheet page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_, delete
from fastapi import APIRouter, Query
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistorySpreadsheet, UserDetails, SavedApartments
from backend.app.schemas import OutputApartmentDetails, QueryRequest, SelectedApartments
from backend.app.agents.spreadsheet_agent import spreadsheet_agent
from backend.apartment_data.data import apartments
from datetime import datetime, timezone
from langchain_core.messages import HumanMessage, AIMessage,SystemMessage, BaseMessage, ToolMessage
router = APIRouter()

#Gets a list of the saved aparments to display on the spreadsheet
@router.get("/saved_apartments", response_model = List[SavedApartments])
def get_saved_apartments(db: Session = Depends(get_db)):
    apartments = db.exec(select(SavedApartments)).all()
    #Take a look at the SavedApartments in models.py to see all the fields that should be included in the spreadsheet

    #EXAMPLE OUTPUT
#    [
#       {
#            "id": 0,
#            "name": "Gordon Farms",
#            "price": 1650.0,
#            "address": "7200 Gorden Farms Pkwy, Dublin, OH 43016",
#            "latitude": 40.110219,
#            "longitude": -83.169342,
#            "beds": 2,
#            "baths": 2,
#            "lot_size_sqft": 1122,
#            "listing_agent": "Spring Property Management",
#            "contact": "(380) 205-3698",
#            "amenities": "[\"Club House\",\"Fitness Center\",\"Swimming Pool\"]",
#            "lease_terms": "[\"Flexible\",\"One year\"]"
#        }
#    ]
    return apartments


saved_names_storage = []  # in-memory storage

@router.post("/save_selected_names")
def save_selected_names(
    names: List[str]
):
    # save to in-memory list
    global saved_names_storage
    saved_names_storage = names

    return {"message": f"Saved {len(saved_names_storage)} apartment names successfully."}

@router.get("/get_selected_names")
def get_selected_names():
    global saved_names_storage
    
    normalized_saved = [name.strip().lower() for name in saved_names_storage]
    print("len:", len(saved_names_storage))

    selected_apartments = [
        apt for apt in apartments
        if apt["name"].strip().lower() in normalized_saved
    ]

    print("Matched apartments:", selected_apartments)

    return {
        "selected_apartments": [
        {
            "id": apt["id"],
            "name": apt["name"],
            "price": apt["price"],
            "address": apt["address"],
            "beds": apt["beds"],
            "baths": apt["baths"],
            "lot_size_sqft": apt["lot_size_sqft"],
            "listing_agent": apt["listing_agent"],
            "contact": apt["contact"],
            "amenities": apt.get("amenities", "[]"),  # fallback to "[]"
            "lease_terms": apt.get("lease_terms", "[]"),  # fallback to "[]"
        } for apt in selected_apartments
    ]
    }


#Get the conversation history that will be displayed in the chat box
@router.get("/get_spreadsheet_conversation")
def get_spreadsheet_conversation(db: Session = Depends(get_db)):
    # Get all messages (human + AI), ordered by timestamp
    statement = (
        select(ConversationHistorySpreadsheet)
        .order_by(ConversationHistorySpreadsheet.timestamp)
    )
    
    messages = db.exec(statement).all()

    # Convert to list of dicts
    return [
        {"sender": msg.sender, "content": msg.content} for msg in messages
    ]


#Gets ai_response to user_question and save both to the database
@router.put("/save_spreadsheet_conversation")
def save_spreadsheet_conversation(query: QueryRequest, db: Session = Depends(get_db)):
    global saved_names_storage

    id_array = [
        apt["id"]
        for apt in apartments
        if apt["name"] in saved_names_storage
    ]
    
    # save human message
    human_message = ConversationHistorySpreadsheet(
        property_ids=id_array,
        sender="human",
        content=query.question,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(human_message)
    db.commit() 

    # refetch convo
    statement = (
        select(ConversationHistorySpreadsheet)
        .where(ConversationHistorySpreadsheet.property_ids == id_array)
        .order_by(ConversationHistorySpreadsheet.timestamp)
    )
    messages = db.exec(statement).all()

    memory = []

    for msg in messages:
        if msg.sender == 'human':
            memory.append(HumanMessage(content=msg.content))
        elif msg.sender == 'ai':
            memory.append(AIMessage(content=msg.content))

    print(f"Calling spreadsheet_agent with memory and apartments of len {len(id_array)}")
    aptsById = [
        apt for apt in apartments
        if apt["id"] in id_array
    ]
    answer = spreadsheet_agent(memory, selectedApartments=aptsById)
    print(f"Agent answer: {answer} (type: {type(answer)})")

    # save ai message
    ai_message = ConversationHistorySpreadsheet(
        property_ids=id_array,
        sender="ai",
        content=answer,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)
    db.commit()

    return {"message": "Conversation saved with AI response."}

@router.put("/clear")
def clear_conversation(db: Session = Depends(get_db)): 
    db.exec(delete(ConversationHistorySpreadsheet))
    db.commit()
    return {"message": f"Conversation cleared."}