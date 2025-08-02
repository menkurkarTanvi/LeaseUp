from pydantic import BaseModel
from typing import List
from langchain_core.messages import (
    AIMessage,
    HumanMessage,
    SystemMessage,
    ToolMessage,
    trim_messages,
)
from langchain_openai import ChatOpenAI
from langgraph.checkpoint.memory import MemorySaver
from langgraph.graph import START, MessagesState, StateGraph
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
from app.models.models import SavedApartments
import getpass
import os
import json

if not os.environ.get("OPENAI_API_KEY"):
  os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

model = ChatOpenAI(
  model="gpt-3.5-turbo",
  streaming=True,
  callbacks=[StreamingStdOutCallbackHandler()]
)

# add system prompt to history
system_prompt = SystemMessage(
    content=(
        """
            You are a helpful spreadsheet assistant
        """
    )
)

messages = [system_prompt]

# trimmer

trimmer = trim_messages(
    max_tokens=65,
    strategy="last",
    token_counter=model,
    include_system=True,
    allow_partial=False,
    start_on="human",
)

workflow = StateGraph(state_schema=MessagesState)

# Define the function that calls the model
def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

# Define the node and edge
workflow.add_edge(START, "model")
workflow.add_node("model", call_model)

# Add simple in-memory checkpointer
memory = MemorySaver()
app = workflow.compile(checkpointer=memory)
config = {"configurable": {"thread_id": "zbc114"}}

# Loop for conversation
while True:
    query = input("Input: ").strip()
    if not query:
        continue # continue waiting if no input
    if query == "quit":
        break
    input_messages = [HumanMessage(content=query)]

    output = app.invoke({"messages": messages + input_messages}, config)

    messages = output["messages"]

    output["messages"][-1]  # output contains all messages in state
    print()

    if output["messages"][-1].content.strip().startswith("{"):
        try:
            json_object = json.loads(output["messages"][-1].content)
            try:
                TravelPlan.model_validate(json_object)
                print("Model validated.\n")
            except:
                print("Model validation failed.\n")
                break
            print("Creating JSON... Ending conversation.\n")
            file_path = "travelPlan.json"
            with open(file_path, 'w') as json_file:
                json.dump(json_object, json_file, indent=4)
            break
        except json.JSONDecodeError:
            print("JSON creation failed.\n")
            pass
        
print("=== Message History ===")
for msg in messages:
    print(f"{msg.type}: {msg.content}")