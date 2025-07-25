import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import MapPage from './MapPage';
import LeasesPage from './LeasesPage';
import Navbar from './Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<MapPage />} />
        <Route path="/leases" element={<LeasesPage />} />
      </Routes>
    </Router>
  );
}

export default App;
