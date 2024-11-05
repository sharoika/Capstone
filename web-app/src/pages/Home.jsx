import React from 'react';
import Navbar from '../components/Header'; 
import homeImage from '../assets/home.jpg';
import driverImage from '../assets/driver.jpg';
import riderImage from '../assets/rider.jpg';
import './Home.css';

const Home = () => {
    return (
        <>
            <Navbar /> {/* Navbar is shown at the top of the Home component */}
            <div className="home-page">
                {/* Sections for Home, Drivers, and Riders */}
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

                {/* Drivers Section */}
                <div id="drivers" className="drivers-section d-flex align-items-center" style={{ height: '92vh' }}>
                    <div className="container">
                        <div className="row align-items-center h-100">
                            <div className="col-md-6 text-section">
                                <h1 className="display-1 font-weight-bold mb-4">Drivers</h1>
                                <p className="lead mb-4">Join Fleet as a driver and be part of a fair and reliable ride-share experience. Earn more with flexible hours and a supportive community.</p>
                                <a href="/apply" className="btn btn-primary btn-lg px-5 py-3" style={{ borderRadius: '30px' }}>Apply Now</a>
                            </div>
                            <div className="col-md-6 image-section d-none d-md-block">
                                <img src={driverImage} alt="Driver" className="img-fluid rounded" style={{ maxHeight: '80vh', objectFit: 'cover' }} />
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
