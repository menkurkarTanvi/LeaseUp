from typing import List
from vector_store.vector_database import vector_store
from langchain_core.messages import HumanMessage, AIMessage,SystemMessage, BaseMessage, ToolMessage
def summarize_lease_agent(pdf_id: str) -> List[str]:
    #Returns a list of the most important sections in the lease
    return ""