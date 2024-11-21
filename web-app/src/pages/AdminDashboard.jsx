import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]); // State to store fetched users
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage

                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
                    withCredentials: true,  // Ensure cookies are sent with the request
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass token in Authorization header
                    },
                });
                

                console.log(response.data); // Log the fetched users
                setUsers(response.data); // Update the users state with the fetched data
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        fetchUsers();
    }, [navigate]); // The effect runs on mount and whenever navigate changes

    return (
        <div>
            <h2>Admin Dashboard</h2>
            {users.length === 0 ? (
                <p>No users found</p>
            ) : (
                <ul>
                    {users.map((user) => (
                        <li key={user._id}>{user.first_name} {user.last_name}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};

export default AdminDashboard;
