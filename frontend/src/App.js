import { Routes, Route } from 'react-router-dom';
import './styles/App.css';
import Login from './components/Login';
import Spreadsheets from './components/Spreadsheets';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Spreadsheets/>}/>
      <Route path="/MapPage" element={<Login/>}/> {/* Replace with actual map URL */}
    </Routes>
  );
}

export default App;
