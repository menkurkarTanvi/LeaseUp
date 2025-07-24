
import ApartmentForm from "./components/FormComponents/ApartmentForm";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import MapsPage from './components/MapsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ApartmentForm/>}></Route>
        <Route path="/maps" element={<MapsPage/>}></Route>

      
      </Routes>
    </BrowserRouter>
  );
}

export default App;
