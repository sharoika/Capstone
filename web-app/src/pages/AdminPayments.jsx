import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';
import SortableTable from '../components/SortableTable';

const AdminPayments = () => {
    const [rides, setRides] = useState([]);

    useEffect(() => {
        fetchRides();
    }, []);

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

    const columns = [
        { key: '_id', label: 'Ride ID', sortable: true },
        { key: 'rider', label: 'Rider', sortable: true, accessor: (ride) => `${ride.riderID?.firstName || ''} ${ride.riderID?.lastName || ''}` },
        { key: 'driver', label: 'Driver', sortable: true, accessor: (ride) => `${ride.driverID?.firstName || ''} ${ride.driverID?.lastName || ''}` },
        { key: 'distance', label: 'Distance', sortable: true, accessor: (ride) => ride.distance || 0 },
        { key: 'fare', label: 'Fare', sortable: true, accessor: (ride) => ride.fare || 0 },
        { key: 'tipAmount', label: 'Tip', sortable: true, accessor: (ride) => ride.tipAmount || 0 },
        { key: 'total', label: 'Total', sortable: true, accessor: (ride) => (parseFloat(ride.fare) || 0) + (parseFloat(ride.tipAmount) || 0) },
        { key: 'rideFinished', label: 'Status', sortable: true },
        { key: 'createdAt', label: 'Date', sortable: true, accessor: (ride) => new Date(ride.createdAt).getTime() },
    ];

    return (
        <div>
            <AdminHeader title="Admin Panel: Payments" />
            <Container className="py-4">
                <SortableTable columns={columns} data={rides}>
                    {(sortedRides) => 
                        sortedRides.map((ride) => (
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
                        ))
                    }
                </SortableTable>
            </Container>
        </div>
    );
};

export default AdminPayments;
