import { Routes, Route } from 'react-router-dom';
import './App.css';
import Login from './components/Login';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Login/>}/>
      <Route path="/MapPage" element={<Login/>}/> {/* Replace with actual map URL */}
    </Routes>
  );
}

export default App;
