import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Table, Form, Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminDashboard.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]);
    const [drivers, setDrivers] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setUsers(response.data);
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchDrivers = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    throw new Error('No authentication token found');
                }
                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/drivers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                });
                setDrivers(response.data);
            } catch (error) {
                console.error('Error fetching drivers:', error);
            }
        };

        fetchUsers();
        fetchDrivers();
    }, [navigate]);

    const handleApprovalChange = async (id, value) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/${id}/approval`,
                { approve: value === 'true' },
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === id ? { ...driver, applicationApproved: value === 'true' } : driver
                )
            );
        } catch (error) {
            console.error('Error updating approval status:', error);
        }
    };

    const handleDocumentDownload = async (driverId, docType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/documents/${driverId}/${docType}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    },
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
                <Row className="mb-4">
                    <Col>
                        <h1 className="text-center dashboard-title">Admin Dashboard</h1>
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
                                    <div className="table-responsive">
                                        <Table striped bordered hover>
                                            <thead>
                                                <tr>
                                                    <th>Driver ID</th>
                                                    <th>Name</th>
                                                    <th>Email</th>
                                                    <th>Phone</th>
                                                    <th>Vehicle</th>
                                                    <th>Status</th>
                                                    <th>Documents</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {drivers.map((driver) => (
                                                    <tr key={driver._id}>
                                                        <td>{driver.driverID}</td>
                                                        <td>{driver.firstName} {driver.lastName}</td>
                                                        <td>{driver.email}</td>
                                                        <td>{driver.phone}</td>
                                                        <td>{driver.vehicleMake} {driver.vehicleModel}</td>
                                                        <td>
                                                            <Form.Select
                                                                size="sm"
                                                                value={driver.applicationApproved ? 'true' : 'false'}
                                                                onChange={(e) => handleApprovalChange(driver._id, e.target.value)}
                                                                className={driver.applicationApproved ? 'bg-success text-white' : 'bg-danger text-white'}
                                                            >
                                                                <option value="true">Approved</option>
                                                                <option value="false">Not Approved</option>
                                                            </Form.Select>
                                                        </td>
                                                        <td>
                                                            <div className="d-flex gap-2">
                                                                <Button size="sm" onClick={() => handleDocumentDownload(driver._id, 'license')}>
                                                                    License
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleDocumentDownload(driver._id, 'abstract')}>
                                                                    Abstract
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleDocumentDownload(driver._id, 'criminal')}>
                                                                    Criminal Record
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleDocumentDownload(driver._id, 'registration')}>
                                                                    Registration
                                                                </Button>
                                                                <Button size="sm" onClick={() => handleDocumentDownload(driver._id, 'safety')}>
                                                                    Safety
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminDashboard;

