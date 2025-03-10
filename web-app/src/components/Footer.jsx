import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import ThemeToggle from './ThemeToggle';
import './Footer.css';

const Footer = () => {
    const { theme } = useContext(ThemeContext);
    
    return (
        <footer className={`footer ${theme === 'dark' ? 'footer-dark' : 'footer-light'}`}>
            <div className="container">
                <div className="row justify-content-center">
                    <div className="col-md-8 text-center">
                        <div className="footer-nav">
                            <a className="footer-link" href="#home">Home</a>
                            <a className="footer-link" href="#drivers">Drivers</a>
                            <a className="footer-link" href="#riders">Riders</a>
                            <div className="footer-theme-toggle">
                                <ThemeToggle />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="copyright">© {new Date().getFullYear()} Fleet. All rights reserved.</p>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 