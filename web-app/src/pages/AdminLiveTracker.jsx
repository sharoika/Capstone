import React, { useState, useEffect } from 'react';
import { Container, Table, Badge } from 'react-bootstrap';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';

const AdminLiveTracker = () => {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        // Initial fetch
        fetchRides();
        
        // Set up polling every 5 seconds
        const interval = setInterval(fetchRides, 5000);
        
        // Cleanup interval on component unmount
        return () => clearInterval(interval);
    }, []);

    const fetchRides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/rides/active`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRides(response.data);
        } catch (error) {
            console.error('Error fetching active rides:', error);
        }
    };

    const getStatusBadge = (ride) => {
        if (!ride.driverID) {
            return <Badge bg="warning">Waiting for Driver</Badge>;
        }
        if (!ride.rideStarted) {
            return <Badge bg="info">Driver Assigned</Badge>;
        }
        if (!ride.rideFinished) {
            return <Badge bg="primary">In Progress</Badge>;
        }
        return <Badge bg="success">Completed</Badge>;
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Live Tracker" />
            <Container className="py-4">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Ride ID</th>
                            <th>Rider</th>
                            <th>Driver</th>
                            <th>Pickup Location</th>
                            <th>Dropoff Location</th>
                            <th>Status</th>
                            <th>Current Location</th>
                            <th>Time Started</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rides.map((ride) => (
                            <tr key={ride._id}>
                                <td>{ride._id}</td>
                                <td>
                                    {ride.riderID?.firstName} {ride.riderID?.lastName}
                                </td>
                                <td>
                                    {ride.driverID ? 
                                        `${ride.driverID.firstName} ${ride.driverID.lastName}` : 
                                        'Not Assigned'
                                    }
                                </td>
                                <td>{ride.pickupLocation}</td>
                                <td>{ride.dropoffLocation}</td>
                                <td>{getStatusBadge(ride)}</td>
                                <td>
                                    {ride.currentLocation ? 
                                        `${ride.currentLocation.lat}, ${ride.currentLocation.lng}` :
                                        'N/A'
                                    }
                                </td>
                                <td>
                                    {ride.rideStarted ? 
                                        new Date(ride.rideStartTime).toLocaleTimeString() :
                                        'Not Started'
                                    }
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default AdminLiveTracker;
