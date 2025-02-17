import React, { useState, useEffect } from 'react';
import { Container, Table, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import RiderEditModal from '../components/RiderEditModal';
import AdminHeader from '../components/AdminHeader';

const AdminRiders = () => {
    const [riders, setRiders] = useState([]);
    const [selectedRider, setSelectedRider] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchRiders();
    }, []);

    const fetchRiders = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/riders`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRiders(response.data);
        } catch (error) {
            console.error('Error fetching riders:', error);
            alert('Error fetching riders');
        }
    };

    const handleRiderClick = (rider) => {
        setSelectedRider(rider);
        setShowEditModal(true);
    };

    const handleRiderUpdate = (updatedRider) => {
        setRiders(riders.map(rider => 
            rider._id === updatedRider._id ? updatedRider : rider
        ));
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Riders" />
            <Container className="py-4">
                <Table striped bordered hover responsive>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Home Location</th>
                            <th>Completed Rides</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {riders.map((rider) => (
                            <tr key={rider._id}>
                                <td>{rider.firstName} {rider.lastName}</td>
                                <td>{rider.email}</td>
                                <td>{rider.phone}</td>
                                <td>{rider.homeLocation}</td>
                                <td>{rider.completedRides?.length || 0}</td>
                                <td>
                                    <Button 
                                        variant="primary" 
                                        size="sm"
                                        onClick={() => handleRiderClick(rider)}
                                    >
                                        Edit
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>

                <RiderEditModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    rider={selectedRider}
                    onUpdate={handleRiderUpdate}
                />
            </Container>
        </div>
    );
};

export default AdminRiders;
