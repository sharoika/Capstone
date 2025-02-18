import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Form, Button, Alert, Card } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaPhone, FaHome } from 'react-icons/fa';
import './Register.css';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        password: '',
        email: '',
        phone: '',
        address: ''
    });
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        const registerData = {
            first_name: formData.firstName,
            last_name: formData.lastName,
            password: formData.password,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, registerData, {
                withCredentials: false,
            });

            if (response.status === 201) {
                setSuccess('Registration successful!');
                setTimeout(() => {
                    navigate('/login');
                }, 2000);
            } else {
                setError(response.data.message || 'Registration failed.');
            }
        } catch (error) {
            console.error('Error during registration:', error);
            setError('An error occurred while registering.');
        }
    };

    return (
        <Container className="mt-5">
            <Row className="justify-content-center">
                <Col md={8} lg={6}>
                    <Card className="shadow-lg">
                        <Card.Body className="p-5">
                            <h2 className="text-center mb-4">User Registration</h2>
                            <Form onSubmit={handleRegister}>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><FaUser className="me-2" />First Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="firstName"
                                                value={formData.firstName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your first name"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label><FaUser className="me-2" />Last Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="lastName"
                                                value={formData.lastName}
                                                onChange={handleChange}
                                                required
                                                placeholder="Enter your last name"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label><FaEnvelope className="me-2" />Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your email"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label><FaLock className="me-2" />Password</Form.Label>
                                    <Form.Control
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your password"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label><FaPhone className="me-2" />Phone Number</Form.Label>
                                    <Form.Control
                                        type="tel"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your phone number"
                                    />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label><FaHome className="me-2" />Home Address</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="Enter your home address"
                                    />
                                </Form.Group>
                                <div className="d-grid">
                                    <Button variant="primary" type="submit" size="lg">
                                        Register
                                    </Button>
                                </div>
                            </Form>
                            {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
                            {success && <Alert variant="success" className="mt-3">{success}</Alert>}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
