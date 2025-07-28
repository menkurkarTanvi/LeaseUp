import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Login from './components/Login';
import Spreadsheets from './components/Spreadsheets';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Spreadsheets/>}/>
      <Route path="/Login" element={<Login/>}/>
    </Routes>
  );
}

export default App;
