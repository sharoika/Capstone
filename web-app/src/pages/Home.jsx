import React from 'react';
import Navbar from '../components/Header'; 
import homeImage from '../assets/home.jpg';
import riderImage from '../assets/newRider.jpg';
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import 'bootstrap/dist/js/bootstrap.bundle.min.js'; // Import Bootstrap JS

import './Home.css';

const Home = () => {

    console.log(process.env.REACT_APP_API_URL);

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
                                        <p className="card-text">Earn more with competitive rates and incentives. Your hard work deserves fair compensation.</p>
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
                <div id="riders" className="riders-section" style={{ backgroundColor: '#f8f9fa', padding: '4rem 0' }}>
                    <div className="container" style={{ minHeight: '80vh' }}>
                        <h1 className="display-4 font-weight-bold text-center mb-4">Riders</h1>
                        <div className="row align-items-center">
                            {/* Image Section */}
                            <div className="col-lg-6 d-flex justify-content-center mb-4">
                                <img
                                    src={riderImage}
                                    alt="Rider experience"
                                    className="img-fluid rounded"
                                    style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'cover' }}
                                />
                            </div>
                            {/* Text Section with Carousel */}
                            <div className="col-lg-6 text-center">
                                <div id="carouselExampleSlidesOnly" className="carousel slide" data-bs-ride="carousel">
                                    <div className="carousel-inner">
                                        <div className="carousel-item active">
                                            <p className="lead mb-4">Discover a new way to travel with Fleet. Affordable, reliable, and safe rides whenever you need them.</p>
                                        </div>
                                        <div className="carousel-item">
                                            <p className="lead mb-4">Enjoy a customized experience where you are in control.</p>
                                        </div>
                                        <div className="carousel-item">
                                            <p className="lead mb-4">Have peace of mind that your driver is getting paid a fair wage.</p>
                                        </div>
                                    </div>
                                    <button className="carousel-control-prev" type="button" data-bs-target="#carouselExampleSlidesOnly" data-bs-slide="prev">
                                        <span className="carousel-control-prev-icon" aria-hidden="true"></span>
                                    </button>
                                    <button className="carousel-control-next" type="button" data-bs-target="#carouselExampleSlidesOnly" data-bs-slide="next">
                                        <span className="carousel-control-next-icon" aria-hidden="true"></span>
                                    </button>
                                </div>
                                <div className="mt-4">
                                    <a href="/signup" className="btn btn-outline-primary btn-lg px-5 py-3" style={{ borderRadius: '30px' }}>
                                        Join as a Rider
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;