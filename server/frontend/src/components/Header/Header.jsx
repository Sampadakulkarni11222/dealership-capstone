import React from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Header = ({ userName, setUserName }) => {
  const navigate = useNavigate();

  const logout = async () => {
    await axios.get("/djangoapp/logout", { withCredentials: true });
    sessionStorage.removeItem("username");
    setUserName("");
    window.alert("You have been logged out.");
    navigate("/");
  };

  return (
    <nav className="navbar">
      <span className="brand">🚗 Cars Dealership</span>
      <ul>
        <li><Link to="/">Home</Link></li>
        <li><a href="/djangoapp/about/">About Us</a></li>
        <li><a href="/djangoapp/contact/">Contact Us</a></li>
        {userName ? (
          <>
            <li id="loggedInUser">Welcome, {userName}</li>
            <li>
              <a href="#" onClick={logout}>Logout</a>
            </li>
          </>
        ) : (
          <>
            <li><Link to="/login">Login</Link></li>
            <li><Link to="/register">Sign Up</Link></li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Header;
