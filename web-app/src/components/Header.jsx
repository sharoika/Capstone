import React from "react";
import Logo from "../assets/logo.png";

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top" style={{ background: "white", height: '8vh' }}>
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="#home">
                    <img src={Logo} alt="Logo" width="50" height="50" className="d-inline-block align-text-top me-2" />
                    <b className="ps-1 fs-2">Fleet</b>
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
                        <a className="nav-link fs-3" href="#home">Home</a>
                        <a className="nav-link fs-3" href="#drivers">Drivers</a>
                        <a className="nav-link fs-3" href="#riders">Riders</a>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
