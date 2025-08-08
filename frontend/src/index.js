import { BrowserRouter } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import './index.css';
import App from './App';
import { ApartmentProvider } from './contexts/ApartmentContext';

const theme = createTheme();
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>
    <ApartmentProvider>
      <App />
    </ApartmentProvider>
    </BrowserRouter>
  </ThemeProvider>
  
);

// reportWebVitals();
