#Import the vector database (The pdf has already been loaded into the vector database)
from typing import List
from typing import Sequence
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage, ToolMessage
from typing_extensions import TypedDict
from backend.vector_store.vector_database import vector_store

class State(TypedDict):
    messages: Sequence[BaseMessage]

#memory: list of conversation history --> [Human(), AI(), Human(), AI()]
def lease_agent(memory: List[BaseMessage], pdf_id: str):
    #---------------------------------------ONE WAY TO STORE MEMORY FOR AGENTS, CAN BE CHANGED -----------------------------------------#
    conversationMemory = State(messages = memory)

    #------------------------------------------------------------------------------------------------------------------------------------#
    # Initialize the LLM
    llm = ChatOpenAI(
        model="gpt-4o-mini",
        temperature=0.1,
        openai_api_key=os.getenv("OPENAI_API_KEY")
    )
    
    # Get the latest user message
    if not memory:
        return AIMessage(content="I don't see any previous messages. How can I help you with your lease document?")
    
    latest_message = memory[-1]
    if not isinstance(latest_message, HumanMessage):
        return AIMessage(content="I'm ready to help you with your lease document. What would you like to know?")
    
    user_question = latest_message.content
    
    # Search the vector database for relevant context
    try:
        # Search for relevant chunks from the specific PDF
        relevant_docs = vector_store.similarity_search(
            user_question, 
            k=5, 
            filter={"pdf_id": pdf_id}
        )
        
        # Extract the content from relevant documents
        context = "\n\n".join([doc.page_content for doc in relevant_docs])
        
        # Create a system prompt that instructs the AI to be a helpful lease assistant
        system_prompt = f"""You are a helpful lease document assistant. You have access to the following relevant sections from a lease document:

{context}

Please answer the user's question based on the information provided in the lease document. If the information is not available in the provided context, say so clearly. Be helpful, accurate, and professional in your responses.

User Question: {user_question}"""
        
        # Create messages for the LLM
        messages = [
            SystemMessage(content=system_prompt)
        ]
        
        # Add conversation history for context
        for msg in memory[:-1]:  # Exclude the latest message as it's already in the system prompt
            messages.append(msg)
        
        # Get response from LLM
        response = llm.invoke(messages)
        
        return response
        
    except Exception as e:
        return AIMessage(content=f"I encountered an error while searching the lease document: {str(e)}. Please try again or contact support if the issue persists.")