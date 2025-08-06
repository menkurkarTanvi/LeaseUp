import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css'; // Optional for styling

function Navbar () {
  return (
    <nav className="navbar">
      <h2 className="logo">LeaseUp</h2>
      <ul className="nav-links">
        <li><Link to="/">Map</Link></li>
        <li><Link to="/leases">Leases</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;