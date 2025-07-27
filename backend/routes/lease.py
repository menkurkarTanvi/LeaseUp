#This page has endpoints needs for the leases page
from typing import Annotated, List
from fastapi import Depends, HTTPException
from sqlmodel import Session, select
from sqlmodel import and_
from fastapi import APIRouter
#Imports from other files
from backend.app.db.database import get_db
from backend.app.models.models import ConversationHistoryLeases, UserDetails, SavedApartments
from backend.app.schemas import OutputApartmentDetails, QueryRequest
import httpx
import asyncio
from backend.apartment_data.data import apartments
from fastapi import FastAPI, File, UploadFile
from fastapi.responses import JSONResponse
import os
import uuid
from datetime import datetime, timezone
from backend.vector_store.vector_database import upload_pdf_lease
from backend.app.agents.lease_agent import lease_agent
from langchain_core.messages import HumanMessage, AIMessage,SystemMessage, BaseMessage, ToolMessage
import json
router = APIRouter()

#GETS LEASE TERMS FOR SAVED APARTMENTS TO DISPLAY IN THE TABLE
@router.get("/lease_terms")
def get_lease_terms(db: Session = Depends(get_db)):
    apartments = db.exec(select(SavedApartments)).all()
    #using json to convert the json string back inot a python list
    lease_terms_all_apartments = [
        json.loads(apartment.lease_terms) for apartment in apartments
    ]
    return lease_terms_all_apartments

#This Router is called once the user clicks the sumbit button on the Leases Page
@router.post("/upload_pdf/")
async def upload_pdf(file: UploadFile = File(...)):
    # Create a unique file name and created the unique pdf_id to identify the pdf
    pdf_id = str(uuid.uuid4())
    pdf_path = f"pdf/{pdf_id}.pdf"

    # Save the uploaded PDF
    os.makedirs("pdf", exist_ok=True)
    contents = await file.read()
    with open(pdf_path, "wb") as f:
        f.write(contents)

    # Calls the function to store the pdf to Pinecone vector database
    upload_pdf_lease(pdf_path, pdf_id)
    
    #Returns an id number for that pdf
    return pdf_id



#--------------------------------------------This gets the coversation history for the pdf uploaded----------------------------#
@router.get("/get_lease_conversation/{pdf_id}")
def get_lease_conversation(pdf_id: int, db: Session = Depends(get_db)):
    # Get all messages (human + AI), ordered by timestamp
    statement = (
        select(ConversationHistoryLeases)
        .where(ConversationHistoryLeases.pdf_id == pdf_id)
        .order_by(ConversationHistoryLeases.timestamp)
    )
    messages = db.exec(statement).all()

    # [{"sender": "ai", "content": "How can I help you"}, {"sender": "human", "content": "I want to know....."}...... ]
    return [
        {"sender": msg.sender, "content": msg.content} for msg in messages
    ]


#Gets ai_response to user_question and save both to the database
@router.put("/save_lease_conversation/{pdf_id}")
def save_lease_conversation(pdf_id: int, query: QueryRequest, db: Session = Depends(get_db),):
    statement = (
        select(ConversationHistoryLeases)
        .where(ConversationHistoryLeases.pdf_id == pdf_id)
        .order_by(ConversationHistoryLeases.timestamp)
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
    answer = lease_agent(memory, pdf_id)
    #Agent will return formatted response like this
    #AIMessage(content='', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137}),

    #------------------------------------------------------------------------------------------------------------------#

     # Sample human message
    human_message = ConversationHistoryLeases(
        pdf_id=pdf_id,
        sender="human",
        content=query,
        timestamp=datetime.now(timezone.utc)
    )
    db.add(human_message)
    
    # Sample AI response (for testing)
    ai_message = ConversationHistoryLeases(
        pdf_id= pdf_id,
        sender="ai",
        content="This is a sample AI response to your question.",
        timestamp=datetime.now(timezone.utc)
    )
    db.add(ai_message)
    
    # Commit the changes to the database
    db.commit()
    return {"message": "Sample conversation saved!"}