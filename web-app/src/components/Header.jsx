import React, { useContext, useEffect } from "react";
import Logo from "../assets/logo.png";
import ThemeToggle from "./ThemeToggle";
import { ThemeContext } from "../context/ThemeContext";
import "./Header.css"; // We'll create this CSS file

const Navbar = () => {
    const { theme } = useContext(ThemeContext);
    
    // Update navbar classes when theme changes
    useEffect(() => {
        const navbar = document.querySelector('.navbar-custom');
        if (navbar) {
            if (theme === 'dark') {
                navbar.classList.add('navbar-dark');
                navbar.classList.remove('navbar-light');
            } else {
                navbar.classList.add('navbar-light');
                navbar.classList.remove('navbar-dark');
            }
        }
    }, [theme]);
    
    return (
        <nav className={`navbar navbar-expand-lg sticky-top navbar-custom ${theme === 'dark' ? 'navbar-dark' : 'navbar-light'}`}>
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="#home">
                    <img src={Logo} alt="Logo" className="navbar-logo me-2" />
                    <b className="ps-1 brand-text">Fleet</b>
                </a>
                <button 
                    className="navbar-toggler" 
                    type="button" 
                    data-bs-toggle="collapse" 
                    data-bs-target="#navbarNavAltMarkup" 
                    aria-controls="navbarNavAltMarkup" 
                    aria-expanded="false" 
                    aria-label="Toggle navigation"
                >
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav ms-lg-auto">
                        <a className="nav-link" href="#home">Home</a>
                        <a className="nav-link" href="#drivers">Drivers</a>
                        <a className="nav-link" href="#riders">Riders</a>
                    </div>
                    <ThemeToggle />
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
