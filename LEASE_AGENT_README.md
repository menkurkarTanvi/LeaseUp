# Lease Agent Documentation

## Overview

The Lease Agent is a multi-agent AI system designed to help users understand and interact with lease documents. It uses vector storage (Pinecone) to store and retrieve relevant lease information, and provides intelligent responses to user questions about their lease.

## Architecture

### Components

1. **PDF Upload & Processing** (`backend/routes/lease.py`)
   - Uploads PDF lease documents
   - Chunks the document into smaller pieces
   - Stores chunks in Pinecone vector database with metadata

2. **Lease Agent** (`backend/app/agents/lease_agent.py`)
   - Processes user questions about lease documents
   - Searches vector database for relevant context
   - Uses GPT-4 to generate intelligent responses
   - Maintains conversation history

3. **Summarize Lease Agent** (`backend/app/agents/summarize_lease_agent.py`)
   - Extracts important lease sections
   - Identifies key terms and clauses
   - Returns highlighted sections for user attention

4. **Vector Database** (`backend/vector_store/vector_database.py`)
   - Manages Pinecone integration
   - Handles document chunking and storage
   - Provides similarity search functionality

## API Endpoints

### Upload PDF
```
POST /upload_pdf/
```
- Uploads a lease PDF document
- Returns a unique `pdf_id` for future reference

### Get Lease Summary
```
GET /summarize_lease/{pdf_id}
```
- Returns important lease sections for highlighting
- Identifies key terms like rent, security deposit, utilities, etc.

### Get Conversation History
```
GET /get_lease_conversation/{pdf_id}
```
- Returns all conversation messages for a specific PDF
- Maintains chat history between user and AI

### Save Conversation
```
PUT /save_lease_conversation/{pdf_id}
```
- Processes user questions about the lease
- Saves both user question and AI response to database
- Returns the AI response

## Usage Flow

1. **Upload Lease Document**
   ```bash
   curl -X POST "http://localhost:8000/upload_pdf/" \
        -H "Content-Type: multipart/form-data" \
        -F "file=@lease_document.pdf"
   ```

2. **Get Important Sections**
   ```bash
   curl "http://localhost:8000/summarize_lease/{pdf_id}"
   ```

3. **Ask Questions About Lease**
   ```bash
   curl -X PUT "http://localhost:8000/save_lease_conversation/{pdf_id}" \
        -H "Content-Type: application/json" \
        -d '{"question": "What is the rent amount?"}'
   ```

4. **View Conversation History**
   ```bash
   curl "http://localhost:8000/get_lease_conversation/{pdf_id}"
   ```

## Environment Variables Required

```bash
OPENAI_API_KEY=your_openai_api_key
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
```

## Dependencies

The lease agent requires the following packages (already in requirements.txt):
- `langchain-openai`
- `langchain-community`
- `langchain-pinecone`
- `langchain-text-splitters`
- `langchain-core`
- `openai`
- `pinecone-client`

## Testing

Run the test script to verify functionality:
```bash
python test_lease_agent.py
```

## Key Features

- **Intelligent Context Retrieval**: Uses vector similarity search to find relevant lease sections
- **Conversation Memory**: Maintains chat history for context-aware responses
- **Error Handling**: Graceful error handling for missing documents or API issues
- **Multi-PDF Support**: Each PDF gets a unique ID for isolated conversations
- **Important Section Highlighting**: Automatically identifies key lease terms

## Security Considerations

- PDF files are stored locally with unique IDs
- Vector database uses metadata filtering for PDF isolation
- API endpoints validate input parameters
- Error messages don't expose sensitive information

## Future Enhancements

- Add support for multiple file formats (DOCX, TXT)
- Implement document comparison features
- Add lease compliance checking
- Integrate with legal databases for enhanced responses
- Add multi-language support 