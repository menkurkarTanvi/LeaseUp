import {useEffect, useState} from 'react';
import '../../styles/ChatBox.css';
import axios from 'axios';

export default function ChatBox({selectedUnits}){
  const [send, setSend] = useState(0);
  const [clear, setClear] = useState(0);
  const [conversationList, setConversationList] = useState([]);
  const [userQuestion, setUserQuestion] = useState('');
  
  const handleSend = () => {
    if (!userQuestion.trim()) return;
    setSend(prev => prev + 1);
  }

    const handleClear = () => {
      setClear(prev => prev +1);
    }
    const conversation = conversationList.map((msg, i) => (
      <p key={i}>
        <strong>{msg.sender === "human" ? "You" : "Bot"}:</strong> {msg.content}
      </p>
    ));

  // Logic when send button is pressed
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        // PUT only if userQuestion is not empty
        if (userQuestion.trim() !== '') {
          await axios.put(`http://localhost:8000/save_spreadsheet_conversation`,
            { question: userQuestion },
            {
                params: {
                  apartment_ids: selectedUnits 
                }
            }
          );
          setUserQuestion('');
        }

        // Always run GET
        const res = await axios.get(`http://localhost:8000/get_spreadsheet_conversation`);
        setConversationList(res.data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchConversation();
  }, [send]);

   useEffect(() => {
    if (clear === 0) return;
    setUserQuestion('');
    axios.get(`http://localhost:8000/get_spreadsheet_conversation`)
          .then(res => {
            setConversationList(res.data);
          })
          .catch(err => console.error(err));
    }, [clear]);

  return(
      <div className="chatbox" id="chatbox">
        <div className="chatbox-header">AI Assistant</div>
        <div className="chatbox-body" id="chat-messages">
          <p><strong>Bot:</strong> Select 2 or more apartments for me to compare!</p>
          {conversation}
        </div>
        <div className="chatbox-input">
          <input 
            type="text" 
            placeholder="Type your message..." 
            value={userQuestion}
            onChange={(e) => setUserQuestion(e.target.value)}
            id="chat-input" />
            <button onClick={handleSend}>Send</button>
            <button onClick={handleClear}>Clear</button>
        </div>
      </div>
  );
}