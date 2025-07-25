#This page has endpoints needs for the maps page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistoryMap, UserDetails
from backend.app.schemas import OutputApartmentDetails
import httpx
import asyncio
from backend.routes.data import apartments
router = APIRouter()

#Retrieves the apartments based on the data gathered from the questionare
#Function calls api to get apartments that match user needs
@router.get("/apartments/")
def get_apartments(db: Session = Depends(get_db)):
    return apartments

                
#Saves details of an apartment the user liked to the database
@router.post("/apartments/{property_id}")
def save_aparments(db: Session = Depends(get_db)):

    return "Apartment information successfully saved to database"


#Gets crime rate info
@router.get("/apartments/{lattitude}{longitude}")
def get_crime_rates():
    return 


#Get the conversation history that will be displayed in the chat box
@router.get("/conversation/{property_id}")
def get_chat_history(property_id: int, db: Session = Depends(get_db)):
    statement = select(ConversationHistoryMap).where(
        and_(ConversationHistoryMap.property_id == property_id, 
             ConversationHistoryMap.sender == 'ai')
        ).order_by(ConversationHistoryMap.timestamp)
    
    statement2 = select(ConversationHistoryMap).where(
        and_(ConversationHistoryMap.property_id == property_id, 
             ConversationHistoryMap.sender == 'human')
        ).order_by(ConversationHistoryMap.timestamp)
    
    ai_response = db.exec(statement).all()
    human_response = db.exec(statement2).all()

    conversation_list = []
    while len(ai_response) > 0 and len(human_response) > 0:
        conversation_list.append(human_response.pop(0).content)
        conversation_list.append(ai_response.pop(0).content)
    
    #What it looks like: ["What is the monthly rent?", "The monthly rent is ___"...]
    return conversation_list


#Gets ai_response to user_question and save both to the database
@router.post("/{property_id}{user_query}")
def save_message(property_id: int, user_query: str):
    #call the maps agent to get ai_response to user question

    #Agent will return formatted response like this
    #[HumanMessage(content='What is 3 * 12? Also, what is 11 + 49?'),
    #AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),
    #ToolMessage(content='36', name='multiply', tool_call_id='call_loT2pliJwJe3p7nkgXYF48A1'),
    #ToolMessage(content='60', name='add', tool_call_id='call_bG9tYZCXOeYDZf3W46TceoV4')]
    pass