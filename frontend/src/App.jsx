
import ApartmentForm from "./components/FormComponents/ApartmentForm";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import MapsPage from './components/MapsPage';
import LeasesPage from './LeasesPage';
import Navbar from './Navbar';



function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<ApartmentForm/>}></Route>
        <Route path="/maps" element={<MapsPage/>}></Route>
        <Route path="/leases" element={<LeasesPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
