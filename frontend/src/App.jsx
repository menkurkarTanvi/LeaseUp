
import ApartmentForm from "./components/FormComponents/ApartmentForm";
import {BrowserRouter, Routes, Route} from 'react-router-dom';
import LeasesPage from './components/Leases/LeasesPage';
import MapsPage from './components/MapsPage/MapPage';
import Navbar from "./components/Navbar";

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
