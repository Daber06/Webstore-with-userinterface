import React from "react";
import { Link } from "react-router-dom";
import "../styles/Menu.css";

const Menu: React.FC = () => {
  return (
    <nav className="menu">
      <ul>
        <li>
          <Link to="/" className="menu-button">Home</Link>
        </li>
        <li>
          <Link to="/cart" className="menu-button">Cart</Link>
        </li>
        <li>
          <Link to="/signup" className="menu-button">Sign up</Link>
        </li>
        <li>
          <Link to="/about" className="menu-button">About Us</Link>
        </li>
      </ul>
    </nav>
  );
};

export default Menu;
