import React, { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import ConfigModal from '../components/ConfigModal';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashboard.css';
import '../styles/AdminButtonReset.css';
import AdminHeader from '../components/AdminHeader';

const AdminDashboard = () => {
    const navigate = useNavigate();
    const [showConfigModal, setShowConfigModal] = useState(false);

    const buttonStyle = {
        padding: '8px 24px',  // Vertical and horizontal padding
        minWidth: 'fit-content'
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return;
        }
    }, [navigate]);

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Admin Panel" />
            <Container className="py-4">


                {/* Maintenance Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="dashboard-card">
                            <Card.Header as="h5" className="bg-primary text-white">
                                Maintenance
                            </Card.Header>
                            <Card.Body className="d-flex gap-3">
                                <Button
                                    variant="info"
                                    onClick={() => navigate('/admin/live-tracker')}
                                    style={buttonStyle}
                                >
                                    Live Tracker
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => setShowConfigModal(true)}
                                    style={buttonStyle}
                                >
                                    Edit Configuration
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Playground Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="dashboard-card">
                            <Card.Header as="h5" className="bg-primary text-white">
                                Playgrounds
                            </Card.Header>
                            <Card.Body className="d-flex gap-3">

                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Administration Section */}
                <Row className="mb-4">
                    <Col>
                        <Card className="dashboard-card">
                            <Card.Header as="h5" className="bg-primary text-white">
                                Administration
                            </Card.Header>
                            <Card.Body className="d-flex gap-3">
                                <Button
                                    variant="info"
                                    onClick={() => navigate('/admin/riders')}
                                    style={buttonStyle}
                                >
                                    Riders
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => navigate('/admin/drivers')}
                                    style={buttonStyle}
                                >
                                    Drivers
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => navigate('/admin/payments')}
                                    style={buttonStyle}
                                >
                                    Payments
                                </Button>
                                <Button
                                    variant="info"
                                    onClick={() => navigate('/admin/payouts')}
                                    style={buttonStyle}
                                >
                                    Payouts
                                </Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* Configuration Modal */}
                <ConfigModal
                    show={showConfigModal}
                    onHide={() => setShowConfigModal(false)}
                />
            </Container>
        </div>
    );
};

export default AdminDashboard;