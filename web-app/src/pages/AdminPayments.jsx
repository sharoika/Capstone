import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AdminPayments = () => {
    const [rides, setRides] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchRides = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/api/admin/rides`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setRides(response.data);
            } catch (error) {
                console.error('Error fetching rides:', error);
                alert('Error fetching rides');
            }
        };

        fetchRides();
    }, []);

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Payments Management</h1>
                <Button variant="secondary" onClick={() => navigate('/admin')}>Back</Button>
            </div>
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
                    </tr>
                </thead>
                <tbody>
                    {rides.map((ride) => (
                        <tr key={ride._id}>
                            <td>{ride._id}</td>
                            <td>{ride.riderID?.firstName} {ride.riderID?.lastName}</td>
                            <td>{ride.driverID?.firstName} {ride.driverID?.lastName}</td>
                            <td>{ride.distance} km</td>
                            <td>${ride.fare}</td>
                            <td>${ride.tipAmount}</td>
                            <td>${(parseFloat(ride.fare) + parseFloat(ride.tipAmount)).toFixed(2)}</td>
                            <td>{ride.rideFinished ? 'Completed' : 'In Progress'}</td>
                        </tr>
                    ))}
                </tbody>
            </Table>
        </Container>
    );
};

export default AdminPayments;
