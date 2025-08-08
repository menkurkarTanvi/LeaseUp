import {Box, Button} from '@mui/material';
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
    const conversation = conversationList.slice(-10).map((msg, i) => (
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
            { question: userQuestion }
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
    <Box
      sx={{
        position: 'fixed',       
        bottom: 80,             
        right: 24,
        width: 400,             
        height: 400,
        bgcolor: 'background.paper',
        border: '2px solid black', 
        borderRadius: 2,
        boxShadow: 3,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1300,           
      }}
    >
      <Box
        sx={{
          bgcolor: 'black',
          color: 'white',
          p: 1,
          fontWeight: 'bold',
          fontSize: '1.1rem',
          borderTopLeftRadius: 8,
          borderTopRightRadius: 8,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>AI Assistant</span>
      </Box>
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          p: 1,
          fontSize: '0.9rem',
          backgroundColor: '#fafafa',
          borderBottom: '1px solid #ccc',
        }}
        id="chat-messages"
      >
        <p>
          <strong>Bot:</strong> Select 2 or more units and press 'Compare with AI'
        </p>
        {conversation}
      </Box>

      {/* chat messages with added scroll */}
      <Box
        component="form"
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        sx={{
          p: 1,
          display: 'flex',
          gap: 1,
          alignItems: 'center',
        }}
      >
        <input
          type="text"
          placeholder="Type your message..."
          value={userQuestion}
          onChange={(e) => setUserQuestion(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          style={{
            flex: 1,
            padding: '8px',
            fontSize: '1rem',
            borderRadius: '4px',
            border: '1px solid #ccc',
          }}
        />
        <Button variant="outlined" onClick={handleSend} size="small" sx={{ borderColor: 'black', color: 'black' }}>
          Send
        </Button>
        <Button variant="outlined" onClick={handleClear} size="small" sx={{ borderColor: 'black', color: 'black' }}>
          Clear
        </Button>
      </Box>
    </Box>
  );
}