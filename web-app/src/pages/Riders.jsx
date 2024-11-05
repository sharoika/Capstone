import React from 'react';
import riderImage from '../assets/rider.jpg';
import './Riders.css'; // CSS file for custom styling

const Riders = () => {
    return (
        <div className="riders-page d-flex align-items-center text-dark" style={{ height: '92vh' }}>
            <div className="container">
                <div className="row align-items-center h-100">
                    {/* Left Column - Text Section */}
                    <div className="col-md-6 text-section">
                        <h1 className="display-1 font-weight-bold mb-4">Riders</h1>
                        <p className="lead mb-4">
                            Discover a new way to travel with Fleet. Affordable, reliable, and safe rides whenever you need them.
                        </p>
                        <a 
                            href="/signup" 
                            className="btn btn-primary btn-lg px-5 py-3"
                            style={{ borderRadius: '30px' }}
                        >
                            Join as a Rider
                        </a>
                    </div>

                    {/* Right Column - Image Section */}
                    <div className="col-md-6 image-section d-none d-md-block">
                        <img 
                            src={riderImage} 
                            alt="Rider experience" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '80vh', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Riders;
