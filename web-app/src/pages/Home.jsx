import React from 'react';
import Navbar from '../components/Header';
import homeImage from '../assets/home.jpg';
import riderImage from '../assets/newRider.jpg';
import { FaClock, FaMoneyBillWave, FaUsers, FaShieldAlt, FaStar, FaMapMarkedAlt } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import './Home.css';

const Home = () => {
    console.log(process.env.REACT_APP_API_URL);

    return (
        <>
            <Navbar />
            <div className="home-page">
                {/* Home Section */}
                <section id="home" className="home-section d-flex align-items-center">
                    <div className="container">
                        <div className="row align-items-center">
                            <div className="col-lg-6 text-section">
                                <h1 className="display-3 font-weight-bold mb-4">Fleet</h1>
                                <p className="lead mb-4">A fair ride-share alternative. Experience reliable and affordable rides with Fleet.</p>
                                <a href="/register" className="btn btn-primary btn-lg px-5 py-3 rounded-pill">Get Started</a>
                            </div>
                            <div className="col-lg-6 image-section d-none d-lg-block">
                                <img src={homeImage || "/placeholder.svg"} alt="Fleet" className="img-fluid rounded shadow" />
                            </div>
                        </div>
                    </div>
                </section>

                {/* Drivers Section with 3 Benefit Cards */}
                <section id="drivers" className="drivers-section">
                    <div className="container">
                        <h2 className="display-4 font-weight-bold text-center mb-5">Why Drive with Us?</h2>
                        <div className="row">
                            {[
                                { icon: FaClock, title: "Flexible Hours", text: "Work when you want, with the flexibility to choose your own schedule. Drive part-time, full-time, or whenever you're available." },
                                { icon: FaMoneyBillWave, title: "Competitive Earnings", text: "Earn more with competitive rates and incentives. Your hard work deserves fair compensation." },
                                { icon: FaUsers, title: "Supportive Community", text: "Join a community of supportive drivers and a company that values your feedback. We're here to support you on and off the road." }
                            ].map((card, index) => (
                                <div key={index} className="col-md-4 mb-4">
                                    <div className="card h-100 shadow-sm hover-card">
                                        <div className="card-body text-center d-flex flex-column justify-content-center">
                                            <card.icon className="card-icon mb-3" />
                                            <h5 className="card-title font-weight-bold">{card.title}</h5>
                                            <p className="card-text">{card.text}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Redesigned Riders Section */}
                <section id="riders" className="riders-section">
                    <div className="container">
                        <h2 className="text-center">Experience the Fleet Difference</h2>
                        <div className="row align-items-center">
                            <div className="col-lg-6">
                                <img 
                                    src={riderImage || "/placeholder.svg"} 
                                    alt="Rider experience" 
                                    className="img-fluid"
                                />
                            </div>
                            <div className="col-lg-6">
                                <div className="rider-features">
                                    {[
                                        { icon: FaShieldAlt, title: "Safety First", text: "Our rigorous driver screening and real-time trip monitoring ensure your safety is our top priority." },
                                        { icon: FaStar, title: "Quality Service", text: "Enjoy rides with professional, courteous drivers committed to providing an excellent experience." },
                                        { icon: FaMapMarkedAlt, title: "Convenient Booking", text: "Book your ride with ease using our user-friendly app, available 24/7 for your convenience." }
                                    ].map((feature, index) => (
                                        <div key={index} className="rider-feature">
                                            <div className="d-flex align-items-start">
                                                <div className="feature-icon">
                                                    <feature.icon />
                                                </div>
                                                <div>
                                                    <h5>{feature.title}</h5>
                                                    <p>{feature.text}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="text-center">
                                        <a href="/register" className="btn btn-primary rounded-pill">
                                            Join as a Rider
                                        </a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
            <Navbar />
        </>
    );
};

export default Home;

