import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
                `${process.env.REACT_APP_API_URL}/api/auth/login`,
                loginData
            );

            const data = response.data;

            if (response.status === 200) {
                localStorage.setItem('token', data.token);
                navigate('/admin-dashboard');
            } else {
                setError(data.message);
            }
        } catch (error) {
            setError('An error occurred while logging in. Please try again.');
        }
    };

    return (
        <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
            <div className="card p-4 shadow" style={{ maxWidth: '400px', width: '100%' }}>
                <h3 className="text-center mb-4">Admin Login</h3>
                {error && <div className="alert alert-danger text-center" role="alert">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-3">
                        <label htmlFor="username" className="form-label">Username</label>
                        <input
                            type="text"
                            id="username"
                            className="form-control"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password</label>
                        <input
                            type="password"
                            id="password"
                            className="form-control"
                            placeholder="Enter your password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary w-100">Login</button>
                </form>
            </div>
        </div>
    );
};

export default Login;