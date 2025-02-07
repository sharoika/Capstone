import React, { useEffect, useState } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import ConfigModal from '../modals/ConfigModal';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import DriversTable from '../components/DriversTable';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const [showConfigModal, setShowConfigModal] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        const fetchData = async () => {
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            try {
                const [usersResponse, driversResponse] = await Promise.all([
                    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    }),
                    axios.get(`${process.env.REACT_APP_API_URL}/api/auth/drivers`, {
                        headers: { 'Authorization': `Bearer ${token}` },
                    })
                ]);

                setUsers(usersResponse.data);
                setDrivers(driversResponse.data);
            } catch (error) {
                console.error('Error fetching data:', error);
                // Handle error (e.g., show error message to user)
            }
        };

        fetchData();
    }, [navigate]);

    const handleApprovalChange = async (id, value) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/${id}/approval`,
                { approve: value === "true" },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === id
                        ? { ...driver, applicationApproved: value === "true" }
                        : driver
                )
            );
        } catch (error) {
            console.error('Error updating approval status:', error);
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === id
                        ? { ...driver, applicationApproved: !driver.applicationApproved }
                        : driver
                )
            );
            alert('Error updating approval status');
        }
    };

    const handleDocumentDownload = async (driverId, docType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/documents/${driverId}/${docType}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${docType}-${driverId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document');
        }
    };

    return (
        <div className="admin-dashboard">
            <Container className="dashboard-container">

                <Row className="mt-4">
                    <Col>
                        <h1 className="text-center dashboard-title">Admin Dashboard</h1>
                    </Col>
                    <Col className="text-center">
                        <Button variant="warning" onClick={() => setShowConfigModal(true)}>
                            Edit Configuration
                        </Button>
                    </Col>
                </Row>

                <Row className="mb-4">
                    <Col>
                        <Card className="dashboard-card">
                            <Card.Header as="h5" className="bg-primary text-white">
                                Users
                            </Card.Header>
                            <Card.Body>
                                {users.length === 0 ? (
                                    <p>No users found</p>
                                ) : (
                                    <ul className="list-unstyled user-list">
                                        {users.map((user) => (
                                            <li key={user._id}>
                                                <i className="fas fa-user me-2"></i>
                                                {user.first_name} {user.last_name}
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Row>
                    <Col>
                        <Card className="dashboard-card">
                            <Card.Header as="h5" className="bg-success text-white">
                                Drivers
                            </Card.Header>
                            <Card.Body>
                                {drivers.length === 0 ? (
                                    <p>No drivers found</p>
                                ) : (
                                    <DriversTable
                                        drivers={drivers}
                                        onApprovalChange={handleApprovalChange}
                                        onDocumentDownload={handleDocumentDownload}
                                    />
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
            <ConfigModal show={showConfigModal} handleClose={() => setShowConfigModal(false)} />
        </div>
    );
};

export default AdminDashboard;