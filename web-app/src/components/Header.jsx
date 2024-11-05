import React from "react";
import { Link } from "react-router-dom";
import Logo from "../assets/logo.png";

const Navbar = () => {
    return (
        <nav className="navbar navbar-expand-lg sticky-top" style={{ background: "white", height: '8vh' }}>
            <div className="container">
                <Link className="navbar-brand d-flex align-items-center" to="/">
                    <img src={Logo} alt="Logo" width="100" height="100" className="d-inline-block align-text-top me-2" />
                    <b className="ps-1 fs-2">Fleet</b>
                </Link>
                <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNavAltMarkup" aria-controls="navbarNavAltMarkup" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarNavAltMarkup">
                    <div className="navbar-nav ms-lg-auto d-flex align-items-center">
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/">Home</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/drivers">Drivers</Link>
                        </li>
                        <li className="nav-item">
                            <Link className="nav-link fs-3" to="/riders">Riders</Link>
                        </li>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
