
import ApartmentForm from "./components/FormComponents/ApartmentForm";
import {BrowserRouter, Routes, Route, useLocation} from 'react-router-dom';
import LeasesPage from './components/Leases/LeasesPage';
import MapsPage from './components/MapsPage/MapPage';
import Navbar from "./components/Navbar";

function App() {
  const location = useLocation();

  const showNavBar = location.pathname !== '/';
  return (
    <>
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={<ApartmentForm/>}></Route>
        <Route path="/maps" element={<MapsPage/>}></Route>
        <Route path="/leases" element={<LeasesPage />} />
      </Routes>
    </>
  );
}

export default App;
