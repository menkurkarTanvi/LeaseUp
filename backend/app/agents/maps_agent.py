from backend.vector_store.vector_database import vector_store
from typing import List, Sequence
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage, ToolMessage
from typing_extensions import TypedDict
from backend.apartment_data.data import apartments
from dotenv import load_dotenv
import os
from openai import OpenAI 

class State(TypedDict):
    messages: Sequence[BaseMessage]

load_dotenv()
api_key = os.getenv("OPENAI_API_KEY")

client = OpenAI(api_key=api_key)  

# memory: list of conversation history --> [Human(), AI(), Human(), AI()]
def maps_agent(memory: list, property_id: int, user_info=None):
    system_prompt = f"""
    You are an apartment search assistant for University of Texas at Austin students.
    Use the conversation history and apartment data to answer user questions.
    Apartment Data: {apartments[property_id]}
    """

    if user_info:
        user_details = []
        if user_info.get("userName"):
            user_details.append(f"You are talking to {user_info['userName']}. Address them in a friendly tone using their name.")
        if user_info.get("selectedCollege"):
            college = user_info['selectedCollege']
            college_name = college.get("school.name", "their name")
            user_details.append(f"They attend {college_name}.")
        if user_info.get("selectedAmenities"):
            amenities = " ".join(user_info['selectedAmenities'])
            user_details.append(f"They want amenities including {amenities}.")
        if user_info.get("priceRange"):
            price_range = user_info['priceRange']
            user_details.append(f"Their budget is between {price_range[0]} and {price_range[1]}.")
        if user_info.get("address"):
            user_details.append(f"They are interested in apartments that are near {user_info['address']}.")
        
        system_prompt += "\nUser Info:\n" + "\n".join(user_details)
    
    
    messages = [
        {"role": "system", "content": system_prompt}
    ]

    for msg in memory:
        role = "user" if msg.type == "human" else "assistant"
        messages.append({"role": role, "content": msg.content})

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=messages,
        temperature=0.5
    )

    return response.choices[0].message.content
