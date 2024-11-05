import React from 'react';
import backgroundImage from '../assets/home.jpg';
import './Home.css'; // Import the CSS file for custom styling

const Home = () => {
    return (
        <div className="home-page d-flex align-items-center text-light" style={{ height: '92vh' }}>
            <div className="container">
                <div className="row align-items-center h-100">
                    {/* Left Column - Text Section */}
                    <div className="col-md-6 text-section">
                        <h1 className="display-1 font-weight-bold mb-4">Fleet</h1>
                        <p className="lead mb-4">
                            A fair ride-share alternative. Experience reliable and affordable rides with Fleet.
                        </p>
                        <a 
                            href="/signup" 
                            className="btn btn-primary btn-lg px-5 py-3"
                            style={{ borderRadius: '30px' }}
                        >
                            Get Started
                        </a>
                    </div>

                    {/* Right Column - Image Section */}
                    <div className="col-md-6 image-section d-none d-md-block">
                        <img 
                            src={backgroundImage} 
                            alt="Fleet" 
                            className="img-fluid rounded"
                            style={{ maxHeight: '80vh', objectFit: 'cover' }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
