import React from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  return (
    <nav className="navbar">
      <div className="logo-container">
        <img src="/Leaseup.png" alt="Leaseup Logo" className="logo-image" />
        <h2 className="logo-text">LeaseUp</h2>
      </div>
      <ul className="nav-links">
        <li><Link to="/">Map</Link></li>
        <li><Link to="/leases">Leases</Link></li>
      </ul>
    </nav>
  );
};

export default Navbar;