import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import axios from 'axios';
import RiderEditModal from '../components/RiderEditModal';
import AdminHeader from '../components/AdminHeader';
import SortableTable from '../components/SortableTable';
import '../styles/AdminButtonReset.css';
import '../styles/AdminFadeReset.css';

const AdminRiders = () => {
    const [riders, setRiders] = useState([]);
    const [selectedRider, setSelectedRider] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

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

    const handleDeleteRider = async (id) => {
        if (window.confirm('Are you sure you want to delete this rider? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/admin/riders/${id}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setRiders(riders.filter(rider => rider._id !== id));
            } catch (error) {
                console.error('Error deleting rider:', error);
                alert('Error deleting rider');
            }
        }
    };

    const columns = [
        { key: 'name', label: 'Name', sortable: true, accessor: (rider) => `${rider.firstName} ${rider.lastName}` },
        { key: 'email', label: 'Email', sortable: true },
        { key: 'phone', label: 'Phone', sortable: true },
        { key: 'homeLocation', label: 'Home Location', sortable: true },
        { key: 'completedRides', label: 'Completed Rides', sortable: true, accessor: (rider) => rider.completedRides?.length || 0 },
        { key: 'actions', label: 'Actions', sortable: false },
    ];

    return (
        <div className="admin-dashboard">
            <AdminHeader title="Admin Panel: Riders" />
            <Container className="py-4">
                <SortableTable columns={columns} data={riders} tableId="admin-riders-table">
                    {(sortedRiders) =>
                        sortedRiders.map((rider) => (
                            <tr key={rider._id}>
                                <td>{rider.firstName} {rider.lastName}</td>
                                <td>{rider.email}</td>
                                <td>{rider.phone}</td>
                                <td>{rider.homeLocation}</td>
                                <td>{rider.completedRides?.length || 0}</td>
                                <td>
                                    <div className="d-flex gap-2">
                                        <Button
                                            variant="primary"
                                            className="admin-btn"
                                            onClick={() => handleRiderClick(rider)}
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="danger"
                                            className="admin-btn"
                                            onClick={() => handleDeleteRider(rider._id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    }
                </SortableTable>

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
