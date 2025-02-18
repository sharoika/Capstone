import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';

const AdminPayments = () => {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        fetchRides();
    }, []);

    const fetchRides = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.API_URL}/api/admin/rides`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRides(response.data);
        } catch (error) {
            console.error('Error fetching rides:', error);
            alert('Error fetching rides');
        }
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Payments" />
            <Container className="py-4">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Ride ID</th>
                            <th>Rider</th>
                            <th>Driver</th>
                            <th>Distance</th>
                            <th>Fare</th>
                            <th>Tip</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Date</th>
                        </tr>
                    </thead>
                    <tbody>
                        {rides.map((ride) => (
                            <tr key={ride._id}>
                                <td>{ride._id}</td>
                                <td>{ride.riderID?.firstName} {ride.riderID?.lastName}</td>
                                <td>{ride.driverID?.firstName} {ride.driverID?.lastName}</td>
                                <td>{ride.distance?.toFixed(2) || 0} km</td>
                                <td>${ride.fare?.toFixed(2) || '0.00'}</td>
                                <td>${ride.tipAmount?.toFixed(2) || '0.00'}</td>
                                <td>${((parseFloat(ride.fare) || 0) + (parseFloat(ride.tipAmount) || 0)).toFixed(2)}</td>
                                <td>{ride.rideFinished ? 'Completed' : 'In Progress'}</td>
                                <td>{new Date(ride.createdAt).toLocaleDateString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </div>
    );
};

export default AdminPayments;
