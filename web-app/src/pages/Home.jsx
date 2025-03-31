import React, { useEffect, useContext, useState } from 'react';
import Navbar from '../components/Header';
import Footer from '../components/Footer';
import homeImage from '../assets/home.jpg';
import riderImage from '../assets/newRider.jpg';
import { FaClock, FaMoneyBillWave, FaUsers, FaShieldAlt, FaStar, FaMapMarkedAlt, FaCarAlt, FaMobileAlt, FaRoute } from 'react-icons/fa';
import { ThemeContext } from '../context/ThemeContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Home.css';

const Home = () => {
    console.log(process.env.REACT_APP_API_URL);
    const { theme } = useContext(ThemeContext);
    const [showModal, setShowModal] = useState(false);

    // Add scroll animation effect
    useEffect(() => {
        const handleScroll = () => {
            const elements = document.querySelectorAll('.animate-on-scroll');
            elements.forEach(element => {
                const position = element.getBoundingClientRect();
                // If element is in viewport
                if(position.top < window.innerHeight * 0.8) {
                    element.classList.add('animated');
                }
            });
        };

        window.addEventListener('scroll', handleScroll);
        // Trigger once on load
        handleScroll();
        
        return () => {
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    // Function to handle button click and show modal
    const handleAppButtonClick = () => {
        setShowModal(true);
    };

    return (
        <>
            <Navbar />
            <div className="home-page">
                {/* Home Section with animated elements */}
                <section id="home" className="home-section d-flex align-items-center">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 text-section">
                                <h1 className="display-3 font-weight-bold mb-4">Fleet</h1>
                                <p className="lead mb-4">A fair ride-share alternative. Experience reliable and affordable rides with Fleet.</p>
                                <div className="d-flex gap-3">
                                    <a href="#drivers" className="btn btn-outline-light btn-lg px-5 py-3 rounded-pill">Learn More</a>
                                </div>
                            </div>
                            <div className="col-lg-6 image-section d-none d-lg-block">
                                <img src={homeImage || "/placeholder.svg"} alt="Fleet" className="img-fluid rounded shadow" />
                            </div>
                        </div>
                    </div>
                    
                    {/* Animated scroll indicator */}
                    <div className="scroll-indicator">
                        <div className="mouse">
                            <div className="wheel"></div>
                        </div>
                        <div>
                            <span className="scroll-arrow"></span>
                            <span className="scroll-arrow"></span>
                            <span className="scroll-arrow"></span>
                        </div>
                    </div>
                </section>

                {/* Drivers Section with 3 Benefit Cards */}
                <section id="drivers" className="drivers-section">
                    <div className="container">
                        <div className="section-header text-center mb-5 animate-on-scroll">
                            <span className="badge rounded-pill bg-primary px-3 py-2 mb-3">For Drivers</span>
                            <h2 className="display-4 font-weight-bold">Why Drive with Us?</h2>
                            <div className="divider mx-auto"></div>
                        </div>
                        
                        <div className="row">
                            {[
                                { icon: FaClock, title: "Flexible Hours", text: "Work when you want, with the flexibility to choose your own schedule. Drive part-time, full-time, or whenever you're available." },
                                { icon: FaMoneyBillWave, title: "Competitive Earnings", text: "Earn more with competitive rates and incentives. Your hard work deserves fair compensation." },
                                { icon: FaUsers, title: "Supportive Community", text: "Join a community of supportive drivers and a company that values your feedback. We're here to support you on and off the road." }
                            ].map((card, index) => (
                                <div key={index} className="col-md-4 mb-4">
                                    <div className="card h-100 shadow-sm hover-card animate-on-scroll" style={{animationDelay: `${index * 0.2}s`}}>
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <div className="icon-wrapper">
                                                <card.icon className={`card-icon mb-3 ${theme === 'dark' ? 'icon-dark' : ''}`} />
                                            </div>
                                            <h5 className="card-title font-weight-bold">{card.title}</h5>
                                            <p className="card-text">{card.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        
                        <div className="text-center mt-5 animate-on-scroll">
                            <button 
                                onClick={handleAppButtonClick} 
                                className="btn btn-primary btn-lg px-5 py-3 rounded-pill">
                                Get Fleet
                            </button>
                        </div>
                    </div>
                </section>

                {/* App Features Section */}
                <section className="app-features-section">
                    <div className="container">
                        <div className="section-header text-center mb-5 animate-on-scroll">
                            <span className="badge rounded-pill bg-primary px-3 py-2 mb-3">Features</span>
                            <h2 className="display-4 font-weight-bold">Powerful Features</h2>
                            <div className="divider mx-auto"></div>
                        </div>
                        
                        <div className="row g-4">
                            {[
                                { icon: FaCarAlt, title: "Multiple Vehicle Options", text: "Choose from a variety of vehicle types to suit your needs and budget." },
                                { icon: FaMobileAlt, title: "Easy Mobile Booking", text: "Book rides with just a few taps on our intuitive mobile application." },
                                { icon: FaRoute, title: "Optimized Routes", text: "Get to your destination faster with our smart route optimization." }
                            ].map((feature, index) => (
                                <div key={index} className="col-md-4 animate-on-scroll" style={{animationDelay: `${index * 0.2}s`}}>
                                    <div className="feature-card">
                                        <div className="feature-icon-wrapper">
                                            <feature.icon className={`feature-card-icon ${theme === 'dark' ? 'icon-dark' : ''}`} />
                                        </div>
                                        <h4>{feature.title}</h4>
                                        <p>{feature.text}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Redesigned Riders Section */}
                <section id="riders" className="riders-section">
                    <div className="container">
                        <div className="section-header text-center mb-5 animate-on-scroll">
                            <span className="badge rounded-pill bg-primary px-3 py-2 mb-3">For Riders</span>
                            <h2>Experience the Fleet Difference</h2>
                            <div className="divider mx-auto"></div>
                        </div>
                        
                        <div className="row align-items-center">
                            <div className="col-lg-6 animate-on-scroll">
                                <img 
                                    src={riderImage || "/placeholder.svg"} 
                                    alt="Rider experience" 
                                    className="img-fluid"
                                />
                            </div>
                            <div className="col-lg-6">
                                <div className="rider-features animate-on-scroll">
                                    {[
                                        { icon: FaShieldAlt, title: "Safety First", text: "Our rigorous driver screening and real-time trip monitoring ensure your safety is our top priority." },
                                        { icon: FaStar, title: "Quality Service", text: "Enjoy rides with professional, courteous drivers committed to providing an excellent experience." },
                                        { icon: FaMapMarkedAlt, title: "Convenient Booking", text: "Book your ride with ease using our user-friendly app, available 24/7 for your convenience." }
                                    ].map((feature, index) => (
                                        <div key={index} className="rider-feature">
                                            <div className="d-flex align-items-start">
                                                <div className="feature-icon">
                                                    <feature.icon className={theme === 'dark' ? 'icon-dark' : ''} />
                                                </div>
                                                <div>
                                                    <h5>{feature.title}</h5>
                                                    <p>{feature.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Modal for app availability */}
                <div className={`modal fade ${showModal ? 'show' : ''}`} style={{display: showModal ? 'block' : 'none'}} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title">Coming Soon!</h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <div className="modal-body">
                                <p className="mb-0">Fleet is not launched yet, but it will be coming to iOS and Android store soon!</p>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Close</button>
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Modal backdrop */}
                {showModal && <div className="modal-backdrop fade show" onClick={() => setShowModal(false)}></div>}
            </div>
            <Footer />
        </>
    );
};

export default Home;

