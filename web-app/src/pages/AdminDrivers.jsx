import React, { useState, useEffect } from 'react';
import { Container, Button } from 'react-bootstrap';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import DriversTable from '../components/DriversTable';
import DriverEditModal from '../components/DriverEditModal';

const AdminDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchDrivers();
    }, []);

    const fetchDrivers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/drivers`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setDrivers(response.data);
        } catch (error) {
            console.error('Error fetching drivers:', error);
            alert('Error fetching drivers');
        }
    };

    const handleApprovalChange = async (id, value) => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.REACT_APP_API_URL}/api/admin/drivers/${id}/approval`,
                { approve: value === "true" },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );

            setDrivers((prevDrivers) =>
                prevDrivers.map((driver) =>
                    driver._id === id
                        ? { ...driver, applicationApproved: value === "true" }
                        : driver
                )
            );
        } catch (error) {
            console.error('Error updating approval status:', error);
            alert('Error updating approval status');
        }
    };

    const handleDriverClick = (driver) => {
        setSelectedDriver(driver);
        setShowEditModal(true);
    };

    const handleDriverUpdate = (updatedDriver) => {
        setDrivers(drivers.map(driver => 
            driver._id === updatedDriver._id ? updatedDriver : driver
        ));
    };

    const handleDocumentDownload = async (driverId, docType) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/auth/drivers/documents/${driverId}/${docType}`,
                {
                    headers: { 'Authorization': `Bearer ${token}` },
                    responseType: 'blob'
                }
            );

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${docType}-${driverId}.pdf`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            console.error('Error downloading document:', error);
            alert('Error downloading document');
        }
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Drivers Management</h1>
                <Button variant="secondary" onClick={() => navigate('/admin')}>Back</Button>
            </div>

            <DriversTable 
                drivers={drivers} 
                onApprovalChange={handleApprovalChange}
                onDriverClick={handleDriverClick}
                onDocumentDownload={handleDocumentDownload}
            />

            <DriverEditModal
                show={showEditModal}
                onHide={() => setShowEditModal(false)}
                driver={selectedDriver}
                onUpdate={handleDriverUpdate}
            />
        </Container>
    );
};

export default AdminDrivers;
