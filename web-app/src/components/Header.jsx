import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";
import './Header.css';


const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);

    const toggleMenu = () => {
        setIsOpen(!isOpen);
    };

    return (
        <nav className="navbar navbar-expand-lg sticky-top" style={{ background: "white", height: '8vh' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={Logo} alt="Logo" width="40" height="40" className="d-inline-block align-text-top me-2" />
                    <b className="ps-1 fs-2">Fleet</b>
                </Link>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    onClick={toggleMenu} 
                    aria-controls="navbarNavAltMarkup" 
                    aria-expanded={isOpen} 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div 
                    className={`navbar-collapse ${isOpen ? "slide-down" : "slide-up"}`} 
                    id="navbarNavAltMarkup"
                >
                    <div className="navbar-nav ms-lg-auto d-flex align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/" onClick={() => setIsOpen(false)}>Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/drivers" onClick={() => setIsOpen(false)}>Drivers</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/riders" onClick={() => setIsOpen(false)}>Riders</Link>
                        </li>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
