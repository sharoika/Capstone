import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { FaUser, FaLock } from 'react-icons/fa';
import './Login.css';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginData = { username, password };

        try {
            const response = await axios.post(
                `${process.env.REACT_APP_API_URL}/api/admin/login`,
                loginData
            );

            const data = response.data;

            if (response.status === 200) {
                localStorage.setItem('token', data.token);
                navigate('/admin');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('An error occurred while logging in. Please try again.');
        }
    };

    return (
        <Container fluid className="login-container d-flex justify-content-center align-items-center">
            <Card className="login-card">
                <Card.Body>
                    <h2 className="text-center mb-4">Admin Login</h2>
                    {error && <Alert variant="danger">{error}</Alert>}
                    <Form onSubmit={handleLogin}>
                        <Form.Group className="mb-3">
                            <Form.Label>Username</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaUser />
                                </span>
                                <Form.Control
                                    type="text"
                                    placeholder="Enter your username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Password</Form.Label>
                            <div className="input-group">
                                <span className="input-group-text">
                                    <FaLock />
                                </span>
                                <Form.Control
                                    type="password"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />
                            </div>
                        </Form.Group>
                        <Button variant="primary" type="submit" className="w-100">
                            Login
                        </Button>
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default Login;

