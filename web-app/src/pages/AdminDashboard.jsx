import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = () => {
    const [users, setUsers] = useState([]); // State to store fetched users
    const [drivers, setDrivers] = useState([]); // State to store fetched drivers
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage

                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/users`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass token in Authorization header
                    },
                });

                setUsers(response.data); // Update the users state with the fetched data
            } catch (error) {
                console.error('Error fetching users:', error);
            }
        };

        const fetchDrivers = async () => {
            try {
                const token = localStorage.getItem('token'); // Get token from localStorage

                if (!token) {
                    throw new Error('No authentication token found');
                }

                const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/drivers`, {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass token in Authorization header
                    },
                });

                setDrivers(response.data); // Update the drivers state with the fetched data
            } catch (error) {
                console.error('Error fetching drivers:', error);
            }
        };

        fetchUsers(); // Fetch users
        fetchDrivers(); // Fetch drivers
    }, [navigate]);

    const handleApprovalChange = async (id, value) => {
        try {
            const token = localStorage.getItem('token'); // Get token from localStorage

            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/${id}/approval`,
                { approve: value === 'true' }, // Convert string to boolean
                {
                    headers: {
                        'Authorization': `Bearer ${token}`, // Pass token in Authorization header
                    },
                }
            );

            // Update the driver's approval status in the UI
            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === id ? { ...driver, applicationApproved: value === 'true' } : driver
                )
            );
        } catch (error) {
            console.error('Error updating approval status:', error);
        }
    };

    return (
        <div className="container mt-5">
            <h2 className="text-center mb-4">Admin Dashboard</h2>

            {/* Users Section */}
            <section className="mb-5">
                <h3>Users</h3>
                {users.length === 0 ? (
                    <p>No users found</p>
                ) : (
                    <ul className="list-group">
                        {users.map((user) => (
                            <li key={user._id} className="list-group-item">
                                {user.first_name} {user.last_name}
                            </li>
                        ))}
                    </ul>
                )}
            </section>

            {/* Drivers Section */}
            <section>
                <h3>Drivers</h3>
                {drivers.length === 0 ? (
                    <p>No drivers found</p>
                ) : (
                    <table className="table table-striped table-bordered">
                        <thead className="table-dark">
                            <tr>
                                <th>Driver ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>Vehicle</th>
                                <th>Application Approved</th>
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
                                        <select
                                            className="form-select"
                                            value={driver.applicationApproved ? 'true' : 'false'}
                                            onChange={(e) => handleApprovalChange(driver._id, e.target.value)}
                                        >
                                            <option value="true">True</option>
                                            <option value="false">False</option>
                                        </select>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </section>
        </div>
    );
};

export default AdminDashboard;
