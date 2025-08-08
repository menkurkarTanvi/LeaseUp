
import ApartmentForm from "./components/FormComponents/ApartmentForm";
import { Routes, Route, useLocation, Navigate} from 'react-router-dom';
import LeasesPage from './components/Leases/LeasesPage';
import MapsPage from './components/MapsPage/MapPage';
import Navbar from './components/Navbar';
import Login from './components/Login';
import { Spreadsheets } from "./components/Spreadsheets/Spreadsheets";


function App() {
  const location = useLocation();
  const showNavBar = location.pathname !== '/' ;

  return (
    <>
      {showNavBar && <Navbar />}
      <Routes>
        <Route path="/" element={<ApartmentForm/>} />
        <Route path="/maps" element={<MapsPage/>}></Route>
        <Route path="/leases" element={<LeasesPage />} />
        <Route path="/spreadsheets" element={<Spreadsheets/>} />
        <Route path="*" element={<Navigate to="/" replace />} />

      </Routes>
    </>
  );
}

export default App;
