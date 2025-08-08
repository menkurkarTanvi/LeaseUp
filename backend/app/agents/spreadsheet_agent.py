from backend.vector_store.vector_database import vector_store
from typing import List
from typing import Sequence
from langchain_core.messages import (
    HumanMessage, 
    AIMessage,
    SystemMessage, 
    BaseMessage, 
    ToolMessage,
)
from langchain_openai import ChatOpenAI
from langgraph.graph import START, MessagesState, StateGraph
from langgraph.checkpoint.memory import MemorySaver
from langchain_core.runnables.history import RunnableWithMessageHistory
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from typing_extensions import TypedDict
from backend.apartment_data.data import apartments
import getpass
from dotenv import load_dotenv
import os
from openai import OpenAI

class State(TypedDict):
    messages: Sequence[BaseMessage]

# --- Setup ---
load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)

system_prompt = """
        You are a helpful and intelligent apartment comparison agent. You have a list of apartments to compare.
        Each element in this list is an apartment record, represented as an object with the following attributes:
    
        id: Unique identifier
        name: Name or title of the listing
        price: Monthly rent or cost
        address: Full address of the apartment
        beds: Number of bedrooms
        baths: Number of bathrooms
        lot_size_sqft: Lot or unit size in square feet
        listing_agent: Name of the real estate agent or provider
        contact: Contact information for follow-up
        amenities: A list of amenities (e.g., \"Gym\", \"Free parking\", \"Washer/Dryer\")
        lease_terms: A list of lease options or restrictions (e.g., \"12-month minimum\", \"No pets\")

        Your goal is to:
        1. Compare multiple apartments by any of their attributes.
        2. Highlight strengths, weaknesses, and notable differences between listings.
        3. Identify patterns (e.g., which listings are above average price, or which have the most amenities).
        4. Offer helpful, unbiased insights based on the data.
        
        If the user's preferences are not yet clear, politely ask clarifying or guiding follow-up questions. For example:
        - \"Would you like to sort by price, size, or number of bedrooms?\"
        - \"Are there any must-have amenities you're looking for?\"
        - \"Is budget the most important factor in your decision?\"
        
        Always keep your tone professional, helpful, and user-focused. 
        If necessary information is missing or ambiguous, request clarification rather than making assumptions. 
        Lastly, responses should be brief and comprehensive. Keep them under 200 characters and ONLY output summary text with complete sentences.
        """

# memory: list of conversation history --> [Human(), AI(), Human(), AI()]
def spreadsheet_agent(memory: list, selectedApartments=None):
    global system_prompt
    if not selectedApartments or len(selectedApartments) < 2:
        system_prompt += """
        The user has not selected enough apartments for you to compare yet. 
        Please direct them to check the check boxes to the left and select at least 2 for comparison."""
    else:
        apt_details_str = "\n".join(
                        f"""Apartment: {apt['name']}
            Price: ${apt['price']}
            Beds/Baths: {apt['beds']} beds / {apt['baths']} baths
            Address: {apt['address']}
            Square Footage: {apt['lot_size_sqft']} sqft
            Description: {apt['description']}
            Listing Agent: {apt['listing_agent']}
            Contact: {apt['contact']}
            Amenities: {', '.join(apt['amenities'])}
            Lease Terms: {', '.join(apt['lease_terms'])}
            URL: {apt['url']}"""
            for apt in selectedApartments
    )
    system_prompt += "\nList of apartments to compare:\n" + apt_details_str
    
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]

    for msg in memory:
        role = "user" if msg.type == "human" else "assistant"
        messages.append({"role": role, "content": msg.content})

    trimmed_messages = [messages[0]] + messages[-9:]

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=trimmed_messages,
        temperature=0.5
    )

    return response.choices[0].message.content
