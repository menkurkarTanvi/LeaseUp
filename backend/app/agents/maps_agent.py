from vector_store.vector_database import vector_store
from typing import List, Sequence
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage, ToolMessage
from typing_extensions import TypedDict
from apartment_data.data import apartments
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
    You are an apartment search assistant for OSU students.
    Use the conversation history and apartment data to answer user questions.
    Apartment Data: {apartments[property_id]}
    User Info: {user_info}
    """

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
