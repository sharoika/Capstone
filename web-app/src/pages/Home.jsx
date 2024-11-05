import React from 'react';
import Navbar from '../components/Header'; 
import homeImage from '../assets/home.jpg';
import riderImage from '../assets/rider.jpg';
import './Home.css';

const Home = () => {
    return (
        <>
            <Navbar />
            <div className="home-page">
                {/* Home Section */}
                <div id="home" className="home-section d-flex align-items-center" style={{ height: '92vh' }}>
                    <div className="container">
                        <div className="row align-items-center h-100">
                            <div className="col-md-6 text-section">
                                <h1 className="display-1 font-weight-bold mb-4">Fleet</h1>
                                <p className="lead mb-4">A fair ride-share alternative. Experience reliable and affordable rides with Fleet.</p>
                                <a href="/signup" className="btn btn-primary btn-lg px-5 py-3" style={{ borderRadius: '30px' }}>Get Started</a>
                            </div>
                            <div className="col-md-6 image-section d-none d-md-block">
                                <img src={homeImage} alt="Fleet" className="img-fluid rounded" style={{ maxHeight: '80vh', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Drivers Section with 3 Benefit Cards */}
                <div id="drivers" className="drivers-section d-flex align-items-center" style={{ height: '92vh' }}>
                    <div className="container">
                        <h1 className="display-1 font-weight-bold text-center mb-5">Why Drive with Us?</h1>
                        <div className="row">
                            <div className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h5 className="card-title font-weight-bold">Flexible Hours</h5>
                                        <p className="card-text">Work when you want, with the flexibility to choose your own schedule. Drive part-time, full-time, or whenever you’re available.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h5 className="card-title font-weight-bold">Competitive Earnings</h5>
                                        <p className="card-text">Earn more with competitive rates and incentives. Your hard work deserves fair compensation, with bonus opportunities available.</p>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-4 mb-4">
                                <div className="card h-100 shadow-sm">
                                    <div className="card-body text-center">
                                        <h5 className="card-title font-weight-bold">Supportive Community</h5>
                                        <p className="card-text">Join a community of supportive drivers and a company that values your feedback. We’re here to support you on and off the road.</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Riders Section */}
                <div id="riders" className="riders-section d-flex align-items-center" style={{ height: '92vh' }}>
                    <div className="container">
                        <div className="row align-items-center h-100">
                            <div className="col-md-6 text-section">
                                <h1 className="display-1 font-weight-bold mb-4">Riders</h1>
                                <p className="lead mb-4">Discover a new way to travel with Fleet. Affordable, reliable, and safe rides whenever you need them.</p>
                                <a href="/signup" className="btn btn-primary btn-lg px-5 py-3" style={{ borderRadius: '30px' }}>Join as a Rider</a>
                            </div>
                            <div className="col-md-6 image-section d-none d-md-block">
                                <img src={riderImage} alt="Rider experience" className="img-fluid rounded" style={{ maxHeight: '80vh', objectFit: 'cover' }} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;