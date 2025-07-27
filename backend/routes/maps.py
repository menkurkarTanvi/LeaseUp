#This page has endpoints needs for the maps page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_, delete
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistoryMap, UserDetails, SavedApartments
from backend.app.schemas import OutputApartmentDetails, QueryRequest
import httpx
import asyncio
from backend.apartment_data.data import apartments
from datetime import datetime, timezone
from backend.app.agents.maps_agent import maps_agent
from langchain_core.messages import HumanMessage, AIMessage,SystemMessage, BaseMessage, ToolMessage
import json
router = APIRouter()

#Retrieves the apartments based on the data gathered from the questionare
#Function calls api to get apartments that match user needs
@router.get("/apartments/")
def get_apartments(db: Session = Depends(get_db)):
    return apartments

                
#Saves details of an apartment the user liked to the database
@router.post("/apartments/{property_id}")
def save_aparments(property_id: int, db: Session = Depends(get_db)):
    dict = apartments[property_id]
    saved_apartment = SavedApartments(
        id = property_id,
        name = dict.get("name"),
        price = dict.get("price"),
        address = dict.get("address"),
        latitude = dict.get("latitude"),
        longitude = dict.get("longitude"),
        beds = dict.get("beds"),
        baths = dict.get("baths"),
        lot_size_sqft = dict.get("lot_size_sqft"),
        listing_agent = dict.get("listing_agent"),
        contact = dict.get("contact"),
        amenities=json.dumps(dict.get("amenities", [])),
        lease_terms=json.dumps(dict.get("lease_terms", []))
    )
    db.add(saved_apartment)
    db.commit()
    db.refresh(saved_apartment)
    return {"message": "Apartment information successfully saved", "apartment": saved_apartment}


#Gets crime rate info
@router.get("/apartments/{lattitude}/{longitude}")
def get_crime_rates():
    return 


#Get the conversation history that will be displayed in the chat box
@router.get("/get_map_conversation/{id}")
def get_map_conversation(id: int, db: Session = Depends(get_db)):
    # Get all messages (human + AI), ordered by timestamp
    statement = (
        select(ConversationHistoryMap)
        .where(ConversationHistoryMap.property_id == id)
        .order_by(ConversationHistoryMap.timestamp)
    )
    
    messages = db.exec(statement).all()

    # Convert to list of dicts
    return [
        {"sender": msg.sender, "content": msg.content} for msg in messages
    ]


#Gets ai_response to user_question and save both to the database
@router.put("/save_map_conversation/{id}")
def save_map_conversation(id: int, query: QueryRequest, db: Session = Depends(get_db),):
    statement = (
        select(ConversationHistoryMap)
        .where(ConversationHistoryMap.property_id == id)
        .order_by(ConversationHistoryMap.timestamp)
    )
    messages = db.exec(statement).all()
    memory = []
     #--------------------------------------------------Gather memory and call agent---------------------------------#
    for msg in messages:
        if msg.sender == 'human':
            memory.append(HumanMessage(content = msg.content))
        elif msg.sender == 'ai':
            memory.append(AIMessage(content = msg.content))
    
    #call the maps agent to get ai_response to user question
    answer = maps_agent(memory, id)
    #Agent will return formatted response like this
    #AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),

    #------------------------------------------------------------------------------------------------------------------#
    
    # Sample human message
    human_message = ConversationHistoryMap(
        property_id=id,
        sender="human",
        content=query.question,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(human_message)
    
    # Sample AI response (for testing)
    ai_message = ConversationHistoryMap(
        property_id=id,
        sender="ai",
        content="This is a sample AI response to your question.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)
    
    # Commit the changes to the database
    db.commit()
    return {"message": "Sample conversation saved!"}

@router.put("/clear/{id}")
def clear_conversation(id: int, db: Session = Depends(get_db)): 
    db.exec(delete(ConversationHistoryMap).where(ConversationHistoryMap.property_id == id))
    db.commit()
    return {"message": f"Conversation for property_id {id} cleared."}