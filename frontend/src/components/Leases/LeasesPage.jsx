import React, { useState, useRef, useEffect } from 'react';
import './LeasesPage.css';

const LeasesPage = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploadedFilename, setUploadedFilename] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [statusType, setStatusType] = useState('');
  
  // Chat functionality
  const [chatMessages, setChatMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [isChatting, setIsChatting] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [showPdfViewer, setShowPdfViewer] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // Suggested questions buttons
  const suggestedQuestions = [
    "Summarize the lease",
    "What is the rent amount?",
    "What are the pet policies?",
    "Who pays for utilities?",
    "What is the security deposit?",
    "What are the parking rules?",
    "What is the lease term?",
    "What are the late payment fees?",
    "Can I sublet the apartment?",
    "What are the move-in requirements?"
  ];

  const handleSuggestedQuestion = (question) => {
    if (!uploadedFilename || isChatting) return;
    
    // Add user message immediately
    const userMessage = { sender: 'user', content: question, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    setIsChatting(true);

    // Send the question to the AI
    sendQuestionToAI(question);
  };

  const sendQuestionToAI = async (question) => {
    try {
      const res = await fetch(`http://localhost:8000/save_lease_conversation/${uploadedFilename}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      });

      const result = await res.json();
      
      if (result.error) {
        throw new Error(result.error);
      }

      const aiMessage = { 
        sender: 'ai', 
        content: result.ai_response || "I'm sorry, I couldn't process your question at this time.",
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, aiMessage]);
    } catch (err) {
      console.error("Chat failed", err);
      const errorMessage = { 
        sender: 'ai', 
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date() 
      };
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setSelectedFile(file);
    setStatusMessage('');
    setChatMessages([]);
    setShowChat(false);
    setShowPdfViewer(false);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatusMessage('Please select a file first');
      setStatusType('error');
      return;
    }
  
    setIsUploading(true);
    setStatusMessage('Uploading PDF to vector database...');
    setStatusType('info');
  
    const formData = new FormData();
    formData.append("file", selectedFile);
  
    try {
      const res = await fetch("http://localhost:8000/upload_pdf/", {
        method: "POST",
        body: formData,
      });      
  
      const result = await res.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log("Upload result:", result);
      setUploadedFilename(result.pdf_id);
      setStatusMessage('✅ PDF successfully uploaded! You can now chat with the AI assistant.');
      setStatusType('success');
      
      // Create PDF URL for viewer
      const fileUrl = URL.createObjectURL(selectedFile);
      setPdfUrl(fileUrl);
      setShowPdfViewer(true);
      setShowChat(true);
      
      // Start chat with initial analysis
      setChatMessages([{
        sender: 'ai',
        content: `Hello! I've uploaded and analyzed your lease document. I can help you understand any terms, conditions, or sections.`,
        timestamp: new Date()
      }]);
      
      // Automatically get analysis
      setTimeout(() => {
        getAnalysis();
      }, 1000);
      
    } catch (err) {
      console.error("Upload failed", err);
      setStatusMessage(`❌ Upload failed: ${err.message}`);
      setStatusType('error');
    } finally {
      setIsUploading(false);
    }
  };

  const getAnalysis = async () => {
    if (!uploadedFilename) return;
    
    try {
      const res = await fetch(`http://localhost:8000/summarize_lease/${uploadedFilename}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const result = await res.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      const analysisMessage = {
        sender: 'ai',
        content: `Here are the key sections I found in your lease:\n\n${result.important_sections?.map((section, index) => `${index + 1}. ${section}`).join('\n')}\n\nYou can ask me specific questions about any of these sections or anything else in your lease!`,
        timestamp: new Date()
      };
      
      setChatMessages(prev => [...prev, analysisMessage]);
    } catch (err) {
      console.error("Analysis failed", err);
      const errorMessage = {
        sender: 'ai',
        content: "I've uploaded your lease successfully! You can ask me any questions about it now.",
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, errorMessage]);
    }
  };

  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim() || !uploadedFilename) return;

    const userMessage = { sender: 'user', content: userInput, timestamp: new Date() };
    setChatMessages(prev => [...prev, userMessage]);
    const question = userInput;
    setUserInput('');
    setIsChatting(true);

    // Send the question to the AI
    sendQuestionToAI(question);
  };

  return (
    <div className="leases-container">
      <div className="leases-header">
        <h1>Lease Document Analysis</h1>
        <p>
          Upload your lease PDF and chat with our AI assistant to understand your lease terms, 
          conditions, and important sections.
        </p>
      </div>

      <div className="upload-section">
        <h2>Upload Lease Document</h2>
        
        <div className="file-input-container">
          <input
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            className="file-input"
            id="file-input"
          />
          <label htmlFor="file-input" className="file-input-label">
            Choose PDF File
          </label>
          {selectedFile && (
            <div className="selected-file">
              📄 {selectedFile.name}
            </div>
          )}
        </div>

        <div className="button-container">
          <button 
            onClick={handleUpload} 
            className="upload-button"
            disabled={!selectedFile || isUploading}
          >
            {isUploading && <span className="loading"></span>}
            {isUploading ? 'Uploading...' : 'Upload & Start Chat'}
          </button>
        </div>

        {statusMessage && (
          <div className={`status-message status-${statusType}`}>
            {statusMessage}
          </div>
        )}
      </div>

      {(showPdfViewer || showChat) && (
        <div className="main-content">
          <div className="pdf-panel">
            <div className="pdf-viewer">
              <h3>📄 Original Lease Document</h3>
              <iframe
                src={pdfUrl}
                width="100%"
                height="600px"
                title="Lease Document"
                className="pdf-iframe"
              />
            </div>
          </div>

          <div className="chat-panel">
            <div className="chat-container">
              <h3>💬 Lease AI Assistant</h3>
              <div className="chat-messages">
                {chatMessages.map((message, index) => (
                  <div key={index} className={`chat-message ${message.sender}`}>
                    <div className="message-content">
                      {message.content.split('\n').map((line, i) => (
                        <div key={i}>{line}</div>
                      ))}
                    </div>
                    <div className="message-time">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                {isChatting && (
                  <div className="chat-message ai">
                    <div className="message-content">
                      <span className="loading"></span>
                      Thinking...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>
              
              {/* Suggested Questions */}
              {chatMessages.length > 0 && !isChatting && (
                <div className="suggested-questions">
                  <h4>💡 Suggested Questions:</h4>
                  <div className="suggested-buttons">
                    {suggestedQuestions.map((question, index) => (
                      <button
                        key={index}
                        onClick={() => handleSuggestedQuestion(question)}
                        className="suggested-button"
                        disabled={isChatting}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <form onSubmit={handleChatSubmit} className="chat-input-form">
                <input
                  type="text"
                  value={userInput}
                  onChange={(e) => setUserInput(e.target.value)}
                  placeholder="Ask about your lease..."
                  className="chat-input"
                  disabled={isChatting}
                />
                <button 
                  type="submit" 
                  className="chat-send-button"
                  disabled={!userInput.trim() || isChatting}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LeasesPage;
