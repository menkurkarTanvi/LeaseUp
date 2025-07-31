#Import the vector database (The pdf has already been loaded into the vector database)
from vector_store.vector_database import vector_store
from typing import List
from typing import Sequence
from langchain_core.messages import HumanMessage, AIMessage,SystemMessage, BaseMessage, ToolMessage
from typing_extensions import TypedDict

class State(TypedDict):
    messages: Sequence[BaseMessage]

#memory: list of conversation history --> [Human(), AI(), Human(), AI()]
def lease_agent(memory: List[BaseMessage], pdf_id: str):

    #---------------------------------------ONE WAY TO STORE MEMORY FOR AGENTS, CAN BE CHANGED -----------------------------------------#
    conversationMemory = State(messages = memory)

    #------------------------------------------------------------------------------------------------------------------------------------#
    #logic for lease agent goes here
    #vector_store.similarity_search(query, k=3, filter={"pdf_id": pdf_id})


    #Output Response (AIMessage)
    #Agent will return formatted response like this
    #AIMessage(content='ai response...', additional_kwargs={'tool_calls': [{'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'function': {'arguments': '{"a": 3, "b": 12}', 'name': 'multiply'}, 'type': 'function'}, {'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'function': {'arguments': '{"a": 11, "b": 49}', 'name': 'add'}, 'type': 'function'}]}, response_metadata={'token_usage': {'completion_tokens': 50, 'prompt_tokens': 87, 'total_tokens': 137}, 'model_name': 'gpt-4o-mini-2024-07-18', 'system_fingerprint': 'fp_661538dc1f', 'finish_reason': 'tool_calls', 'logprobs': None}, id='run-e3db3c46-bf9e-478e-abc1-dc9a264f4afe-0', tool_calls=[{'name': 'multiply', 'args': {'a': 3, 'b': 12}, 'id': 'call_loT2pliJwJe3p7nkgXYF48A1', 'type': 'tool_call'}, {'name': 'add', 'args': {'a': 11, 'b': 49}, 'id': 'call_bG9tYZCXOeYDZf3W46TceoV4', 'type': 'tool_call'}], usage_metadata={'input_tokens': 87, 'output_tokens': 50, 'total_tokens': 137})
    return "hi"