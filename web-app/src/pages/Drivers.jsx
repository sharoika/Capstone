import React from 'react';
import driverImage from '../assets/driver.jpg';
import './Drivers.css'; // CSS file for custom styling

const Drivers = () => {
    return (
        <div className="drivers-page d-flex align-items-center text-dark" style={{ height: '92vh' }}>
            <div className="container">
                <div className="row align-items-center h-100">
                    {/* Left Column - Text Section */}
                    <div className="col-md-6 text-section">
                        <h1 className="display-1 font-weight-bold mb-4">Drivers</h1>
                        <p className="lead mb-4">
                            Join Fleet as a driver and be part of a fair and reliable ride-share experience. Earn more with flexible hours and a supportive community.
                        </p>
                        <a 
                            href="/apply" 
                            className="btn btn-primary btn-lg px-5 py-3"
                            style={{ borderRadius: '30px' }}
                        >
                            Apply Now
                        </a>
                    </div>

                    {/* Right Column - Image Section */}
                    <div className="col-md-6 image-section d-none d-md-block">
                        <img 
                            src={driverImage} 
                            alt="Driver" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '80vh', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Drivers;
