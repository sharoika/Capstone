import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // Import useNavigate instead of useHistory

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate = useNavigate(); // Use useNavigate for redirection

    const handleLogin = async (e) => {
        e.preventDefault();

        const loginData = {
            username: username, // Get the value from the input field
            password: password, // Get the value from the input field
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/login`, loginData, {
                headers: {
                  Authorization: localStorage.getItem("token"),
                },
              });

            const data = response.data;

            console.log(response);
            if (response.status == 200) {
                console.log('Login successful:', data);
                // Store the token in localStorage
                localStorage.setItem('token', data.token);
                // Redirect to the admin dashboard
                navigate('/admin-dashboard');  // Use navigate() instead of history.push()
            } else {
                console.error('Login failed:', data.message);
                setError(data.message); // Show error if login failed
            }
        } catch (error) {
            console.error('Error during login:', error);
            setError('An error occurred while logging in.');
        }
    };

    return (
        <div>
            <h2>Admin Login</h2>
            <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <button onClick={handleLogin}>Login</button>
            {error && <div>{error}</div>}
        </div>
    );
};

export default Login;
