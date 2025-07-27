#This page has endpoints needs for the spreadsheet page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistorySpreadsheet, UserDetails, SavedApartments
from backend.app.schemas import OutputApartmentDetails, QueryRequest
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
#            "id": 1,
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


#Get the conversation history that will be displayed in the chat box. id_1: number of first apartment, id_2: id of 2nd apartment
@router.get("/get_spreadsheet_conversation/{id_1}/{id_2}")
def get_lease_conversation(id_1: int, id_2: int, db: Session = Depends(get_db)):
    # Get all messages (human + AI), ordered by timestamp for the pair of apartments with id_1 and id_2
    statement = (
        select(ConversationHistorySpreadsheet)
        .where(and_(ConversationHistorySpreadsheet.property_one == id_1, ConversationHistorySpreadsheet.property_two == id_2))
        .order_by(ConversationHistorySpreadsheet.timestamp)
    )
    messages = db.exec(statement).all()

    # [{"sender": "ai", "content": "How can I help you"}, {"sender": "human", "content": "I want to know....."}...... ]
    return [
        {"sender": msg.sender, "content": msg.content} for msg in messages
    ]


#Gets the ai response and saves the human question and the ai response to the database
@router.put("/save_spreadsheet_conversation/{id_1}/{id_2}")
def save_lease_conversation(id_1: int, id_2: int, query: QueryRequest, db: Session = Depends(get_db)):
    statement = (
        select(ConversationHistorySpreadsheet)
        .where(and_(ConversationHistorySpreadsheet.property_one == id_1, ConversationHistorySpreadsheet.property_two == id_2))
        .order_by(ConversationHistorySpreadsheet.timestamp)
    )
    messages = db.exec(statement).all()
    memory = []
    #--------------------------------------------------Gather memory and call agent---------------------------------#
    for msg in messages:
        if msg.sender == 'human':
            memory.append(HumanMessage(content = msg.content))
        elif msg.sender == 'ai':
            memory.append(AIMessage(content = msg.content))
   
    #call the lease agent to get ai_response to user question
    answer = spreadsheet_agent(memory, id_1, id_2)
    #Agent will return formatted response like this
    #AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),

    #------------------------------------------------------------------------------------------------------------------#
     # Sample human message
    human_message = ConversationHistorySpreadsheet(
        property_one = id_1,
        property_two = id_2,
        sender="human",
        content=query,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(human_message)
    
    # Sample AI response (for testing)
    ai_message = ConversationHistorySpreadsheet(
        property_one = id_1,
        property_two = id_2,
        sender="ai",
        content="This is a sample AI response to your question.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)
    
    # Commit the changes to the database
    db.commit()
    return {"message": "Sample conversation saved!"}