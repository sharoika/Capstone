import React from 'react';
import { Button, Container } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';

const AdminHeader = ({ title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isMainAdminPanel = location.pathname === '/admin';

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('userType');
        navigate('/login');
    };

    return (
        <Container fluid className="py-3 px-4 bg-light border-bottom">
            <div className="d-flex justify-content-between align-items-center">
                <div style={{ width: '100px' }}>
                    {!isMainAdminPanel && (
                        <Button
                            variant="secondary"
                            onClick={() => navigate('/admin')}
                        >
                            Back
                        </Button>
                    )}
                </div>
                <h4 className="mb-0 text-center flex-grow-1">{title}</h4>
                <div style={{ width: '100px' }} className="text-end">
                    <Button
                        variant="danger"
                        onClick={handleLogout}
                    >
                        Logout
                    </Button>
                </div>
            </div>
        </Container>
    );
};

export default AdminHeader; 