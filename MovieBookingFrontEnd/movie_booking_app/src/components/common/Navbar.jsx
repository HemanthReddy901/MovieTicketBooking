import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './Navbar.css';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          MovieBooking
        </Link>

        <ul className="nav-menu">
          <li className="nav-item">
            <Link to="/" className="nav-link">Home</Link>
          </li>
          
          {/* For non-authenticated or regular users, show search */}
          {(!isAuthenticated || user?.role === 'USER') && (
            <>
              <li className="nav-item">
                <Link to="/user/search" className="nav-link">Movies</Link>
              </li>
           
            </>
          )}
          
          {isAuthenticated && user?.role === 'THEATER_OWNER' && (
            <>
              <li className="nav-item">
                <Link to="/owner/dashboard" className="nav-link">Dashboard</Link>
              </li>
              <li className="nav-item">
                <Link to="/owner/theaters" className="nav-link">My Theaters</Link>
              </li>
              <li className="nav-item">
                <Link to="/owner/movies" className="nav-link">Manage Movies</Link>
              </li>
              <li className="nav-item">
                <Link to="/owner/shows" className="nav-link">Manage Shows</Link>
              </li>
            </>
          )}
          
          {isAuthenticated && user?.role === 'USER' && (
            <li className="nav-item">
              <Link to="/user/dashboard" className="nav-link">My Dashboard</Link>
            </li>
          )}
          
          {!isAuthenticated ? (
            <>
              <li className="nav-item">
                <Link to="/login" className="nav-link">Login</Link>
              </li>
              <li className="nav-item">
                <Link to="/signup" className="nav-link signup-btn">Signup</Link>
              </li>
            </>
          ) : (
            <>
              <li className="nav-item">
                <span className="nav-user">Hello, {user?.fullName}</span>
              </li>
              <li className="nav-item">
                <button onClick={handleLogout} className="nav-link logout-btn">
                  Logout
                </button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;