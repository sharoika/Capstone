import React from 'react';
import backgroundImage from '../assets/home.png';

const Home = () => {
    return (
        <>
            <div className="image-section d-none d-md-block"
                style={{
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    height: '92vh',
                    paddingLeft: '20px',
                    paddingRight: '20px',
                }}
            >
                <div className="container h-100">
                    <div className="row w-100 h-100">
                        <div className="col-md-6 mb-5 text-dark text-center text-md-start" style={{ marginTop: '20%' }}>
                            <h1 className="display-1 font-weight-bold mb-5">Fleet</h1> {/* Changed to display-1 */}
                            <p className="display-6">A fair ride share alternative.</p>
                        </div>
                        <div className="col-md-6 d-none d-md-block">
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Home;
