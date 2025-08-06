import React, {useState} from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Link from '@mui/material/Link';
import '@fontsource/roboto/500.css';
import '../styles/Login.css';

export default function Login() {
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Login button clicked');

    if (username==="user" && password==="pass") {
      console.log('Successful login');
      navigate('/MapPage');
    }
    else
      console.log('Login unsuccessful');
  };

  return (
  <div>
    <Typography id="page-title" variant="h4">Welcome to LeaseUp</Typography>
    <Typography id="description" variant="body1">Your go-to AI college apartment searching tool</Typography>
    <Box
      component="form"
      className="loginForm"
      noValidate
      autoComplete="off"
      >
      <Typography id="form-title" variant="h5">Login</Typography>
      <TextField 
        id="user" 
        label="Username" 
        variant="outlined"
        value={username}
        onChange={(e) => setUsername(e.target.value)} 
      />
      <TextField 
        id="pass" 
        label="Password" 
        variant="outlined" 
        value={password}
        onChange={(e) => setPassword(e.target.value)} 
      />
      <Button id="login-button" variant="contained" onClick={handleSubmit}>Login</Button>
      <Link id="signup-link" variant="body2">Sign Up</Link>
    </Box>
  </div>
  );
}
