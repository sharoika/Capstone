import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [firstName, setFirstName] = useState(''); // First name field
    const [lastName, setLastName] = useState(''); // Last name field
    const [password, setPassword] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [address, setAddress] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();

        const registerData = {
            first_name: firstName,
            last_name: lastName,
            password,
            email,
            phone,
            address,
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
        <div>
            <h2>User Registration</h2>
            <input
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
            />
            <input
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
            />
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
            />
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
            <input
                type="text"
                placeholder="Phone Number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
            />
            <input
                type="text"
                placeholder="Home Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
            />
            <button onClick={handleRegister}>Register</button>
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {success && <div style={{ color: 'green' }}>{success}</div>}
        </div>
    );
};

export default Register;
