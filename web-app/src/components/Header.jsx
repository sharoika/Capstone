import React from "react";
import Logo from "../assets/logo.png";

const Navbar = () => {
    return (
        <nav
            className="navbar navbar-expand-lg sticky-top"
            style={{ background: "white", height: '8vh' }}
        >
            <div className="container">
                <a className="navbar-brand d-flex align-items-center" href="/">
                    <img
                        src={Logo}
                        alt="Logo"
                        width="100"
                        height="100"
                        className="d-inline-block align-text-top me-2"
                    />
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
                    <div className="navbar-nav ms-lg-auto d-flex align-items-center">
                        <li className="nav-item">
                            <a className="nav-link fs-3" href="/"> {/* Use Bootstrap size class */}
                                Home
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link fs-3" href="/">
                                Drivers
                            </a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link fs-3" href="/">
                                Riders
                            </a>
                        </li>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
