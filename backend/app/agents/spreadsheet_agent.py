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
import os

# --- Setup ---
if not os.environ.get("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

model = ChatOpenAI(
    model="gpt-4o-mini",
    temperature=0.1,
    streaming=True,
    callbacks=[StreamingStdOutCallbackHandler()],
)

system_prompt = SystemMessage(
    content=(
        """
        You are a helpful and intelligent apartment comparison agent. You have a list of apartments to compare.
        Each element in this list is an apartment record, represented as an object with the following attributes:
    
        id: Unique identifier
        name: Name or title of the listing
        price: Monthly rent or cost
        address: Full address of the apartment
        latitude / longitude: Geographic coordinates
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
        
        Always keep your tone professional, helpful, and user-focused. If necessary information is missing or ambiguous, request clarification rather than making assumptions.
        """
    )
)

# Define the function that calls the llm
def call_model(state: MessagesState):
    response = model.invoke(state["messages"])
    return {"messages": [response]}

# Build graph
workflow = StateGraph(state_schema=MessagesState)
workflow.add_node("chat", call_model)
workflow.set_entry_point("chat")
workflow.add_edge(START, "chat")

# Compile App with Memory
memory = MemorySaver()
app = workflow.compile()

conversationMemory = RunnableWithMessageHistory(
    app,
    memory,
    input_messages_key="messages",
    history_messages_key="messages",
)

# --- Helper: Inject Apartments to Compare ---
def build_comparison_message(selected_names: list[str]):
    selected = [apt for apt in apartments if apt.name in selected_names or str(apt.id) in selected_names]
    if not selected:
        return HumanMessage(content="I couldn't find those apartments. Can you try naming them again?")
    
    descriptions = []
    for apt in selected:
        descriptions.append(
            f"Apartment: {apt.name}\n"
            f"  - Price: ${apt.price}\n"
            f"  - Beds: {apt.beds}, Baths: {apt.baths}\n"
            f"  - Size: {apt.lot_size_sqft} sqft\n"
            f"  - Amenities: {', '.join(apt.amenities_list)}\n"
            f"  - Lease Terms: {', '.join(apt.lease_list)}\n"
            f"  - Address: {apt.address}"
        )
    context = "\n\n".join(descriptions)
    return HumanMessage(content=f"Please compare the following apartments:\n\n{context}")

# --- Run Loop ---
if __name__ == "__main__":
    thread_id = "apt-convo-thread"
    messages = [system_prompt]

    # Optional: pre-inject context
    selected_apartments = []  # e.g., ['Cambridge Lofts', 'Southside Villas']
    if selected_apartments:
        messages.append(build_comparison_message(selected_apartments))

    while True:
        user_input = input("You: ").strip()
        if user_input.lower() == "quit":
            print("Ending conversation.")
            break
        if not user_input:
            continue

        messages.append(HumanMessage(content=user_input))

        output = conversationMemory.invoke(
            {"messages": messages},
            config={"configurable": {"thread_id": thread_id}},
        )
        messages = output["messages"]

        print("\nAI:", messages[-1].content, "\n")


def spreadsheet_agent(memory: List[BaseMessage], selectedList: List[str]):
    thread_id = "apt-spreadsheet-agent-thread"
    messages = [system_prompt] + memory

    if selectedList:
        messages.append(build_comparison_message(selectedList))

    # Call the agent with message history and thread_id for persistent memory
    output = conversationMemory.invoke(
        {"messages": messages},
        config={"configurable": {"thread_id": thread_id}},
    )

    # Return full AIMessage (which includes tool_calls, metadata, etc.)
    return output["messages"][-1]


#     #Output Response (AIMessage)
#     #Agent will return formatted response like this
#     #AIMessage(content='ai message for comparing two apartments', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137})
    
#     return "Agents response after comparing two apartments........."