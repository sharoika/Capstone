import React, { useContext } from 'react';
import { ThemeContext } from '../context/ThemeContext';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
    const { theme } = useContext(ThemeContext);
    
    return (
        <footer className={`footer ${theme === 'dark' ? 'footer-dark' : 'footer-light'}`}>
            <div className="container">
                <div className="row">
                    <div className="col-md-4 mb-4 mb-md-0">
                        <h5>Fleet</h5>
                        <p>A fair ride-share alternative. Experience reliable and affordable rides with Fleet.</p>
                        <div className="social-icons">
                            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FaFacebook /></a>
                            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter"><FaTwitter /></a>
                            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><FaInstagram /></a>
                            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"><FaLinkedin /></a>
                        </div>
                    </div>
                    <div className="col-md-2 mb-4 mb-md-0">
                        <h5>Company</h5>
                        <ul className="footer-links">
                            <li><a href="/about">About Us</a></li>
                            <li><a href="/careers">Careers</a></li>
                            <li><a href="/blog">Blog</a></li>
                            <li><a href="/press">Press</a></li>
                        </ul>
                    </div>
                    <div className="col-md-2 mb-4 mb-md-0">
                        <h5>Products</h5>
                        <ul className="footer-links">
                            <li><a href="/ride">Ride</a></li>
                            <li><a href="/drive">Drive</a></li>
                            <li><a href="/deliver">Deliver</a></li>
                            <li><a href="/business">Business</a></li>
                        </ul>
                    </div>
                    <div className="col-md-4">
                        <h5>Contact Us</h5>
                        <ul className="footer-links">
                            <li><a href="mailto:support@fleet.com">support@fleet.com</a></li>
                            <li><a href="tel:+1234567890">+1 (234) 567-890</a></li>
                            <li><address>123 Fleet Street, City, Country</address></li>
                        </ul>
                    </div>
                </div>
                <hr />
                <div className="row">
                    <div className="col-md-6 mb-3 mb-md-0">
                        <p className="copyright">© {new Date().getFullYear()} Fleet. All rights reserved.</p>
                    </div>
                    <div className="col-md-6 text-md-end">
                        <ul className="footer-bottom-links">
                            <li><a href="/privacy">Privacy Policy</a></li>
                            <li><a href="/terms">Terms of Service</a></li>
                            <li><a href="/cookies">Cookie Policy</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer; 