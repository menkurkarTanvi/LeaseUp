import '../../styles/ChatBox.css';

export default function ChatBox({chatAI, setChatAI}){
  return(
      <div className="chatbox" id="chatbox">
        <div className="chatbox-header">AI Assistant</div>
        <div className="chatbox-body" id="chat-messages">
          <p><strong>Bot:</strong> Select 2 or more apartments for me to compare!</p>
        </div>
        <div className="chatbox-input">
          <input type="text" placeholder="Type your message..." id="chat-input" />
          <button>Send</button>
        </div>
      </div>
  );
}