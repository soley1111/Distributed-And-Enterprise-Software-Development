import React from "react";
import { useNavigate, NavLink, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import logoutIcon from "../assets/logout.svg";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <NavLink 
          to="/" 
          className={({ isActive }) => 
            isActive ? "navbar-title active" : "navbar-title"
          }
        >
          HOME
        </NavLink>
        <NavLink 
          to="/communities" 
          className={({ isActive }) => 
            isActive ? "navbar-title active" : "navbar-title"
          }
        >
          COMMUNITIES
        </NavLink>
        <NavLink 
          to="/events" 
          className={({ isActive }) => 
            isActive ? "navbar-title active" : "navbar-title"
          }
        >
          EVENTS
        </NavLink>
        <NavLink 
          to="/search" 
          className={({ isActive }) => 
            isActive ? "navbar-title active" : "navbar-title"
          }
        >
          SEARCH
        </NavLink>
        <NavLink 
          to="/profile" 
          className={({ isActive }) => 
            isActive ? "navbar-title active" : "navbar-title"
          }
        >
          PROFILE
        </NavLink>
      </div>
      <button className="navbar-logout" onClick={handleLogout}>
        <img src={logoutIcon} alt="Logout" className="logout-icon" />
        LOGOUT
      </button>
    </nav>
  );
}

export default Navbar;