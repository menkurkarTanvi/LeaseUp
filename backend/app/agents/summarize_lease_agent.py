from typing import List
from backend.vector_store.vector_database import vector_store
from langchain_core.messages import HumanMessage, AIMessage, SystemMessage, BaseMessage, ToolMessage
from langchain_openai import ChatOpenAI
import os
import dotenv

dotenv.load_dotenv()

def summarize_lease_agent(pdf_id: str) -> List[str]:
    """
    Returns a list of the most important sections in the lease document.
    This function identifies key lease terms and important clauses for highlighting.
    """
    try:
        # Initialize the LLM
        llm = ChatOpenAI(
            model="gpt-4o-mini",
            temperature=0.1,
            openai_api_key=os.getenv("OPENAI_API_KEY")
        )
        
        # Search for all documents related to this PDF
        all_docs = vector_store.similarity_search(
            "lease terms rent payment security deposit utilities pets parking", 
            k=10, 
            filter={"pdf_id": pdf_id}
        )
        
        # Combine all relevant content
        full_content = "\n\n".join([doc.page_content for doc in all_docs])
        
        # Create a system prompt to extract important lease sections
        system_prompt = f"""You are a lease document analyzer. Given the following lease document content, identify and extract the most important sections that a tenant should pay attention to.

Lease Document Content:
{full_content}

Please identify and return a list of the most important lease sections. Focus on:
1. Rent amount and payment terms
2. Security deposit requirements
3. Lease duration and renewal terms
4. Utility responsibilities
5. Pet policies
6. Parking arrangements
7. Maintenance responsibilities
8. Late payment penalties
9. Early termination clauses
10. Any unusual or important terms

Return your response as a simple list of important sections, one per line, without numbering or bullet points."""

        # Get the summary from LLM
        response = llm.invoke([SystemMessage(content=system_prompt)])
        
        # Parse the response into a list
        if hasattr(response, 'content'):
            summary_text = response.content
            # Split by newlines and clean up
            important_sections = [
                section.strip() 
                for section in summary_text.split('\n') 
                if section.strip() and not section.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.'))
            ]
            
            # Limit to top 8 most important sections
            return important_sections[:8]
        else:
            return ["Unable to extract lease sections at this time."]
            
    except Exception as e:
        return [f"Error analyzing lease document: {str(e)}"]