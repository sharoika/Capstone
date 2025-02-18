import React, { useState, useEffect } from 'react';
import { Container } from 'react-bootstrap';
import axios from 'axios';
import DriversTable from '../components/DriversTable';
import DriverEditModal from '../components/DriverEditModal';
import AdminHeader from '../components/AdminHeader';

const AdminDrivers = () => {
    const [drivers, setDrivers] = useState([]);
    const [selectedDriver, setSelectedDriver] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);

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

    const handleDeleteDriver = async (id) => {
        if (window.confirm('Are you sure you want to delete this driver? This action cannot be undone.')) {
            try {
                const token = localStorage.getItem('token');
                await axios.delete(
                    `${process.env.REACT_APP_API_URL}/api/admin/drivers/${id}`,
                    { headers: { 'Authorization': `Bearer ${token}` } }
                );
                setDrivers(drivers.filter(driver => driver._id !== id));
            } catch (error) {
                console.error('Error deleting driver:', error);
                alert('Error deleting driver');
            }
        }
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Drivers" />
            <Container className="py-4">
                <DriversTable 
                    drivers={drivers} 
                    onApprovalChange={handleApprovalChange}
                    onDriverClick={handleDriverClick}
                    onDocumentDownload={handleDocumentDownload}
                    onDeleteDriver={handleDeleteDriver}
                />
                
                <DriverEditModal
                    show={showEditModal}
                    onHide={() => setShowEditModal(false)}
                    driver={selectedDriver}
                    onUpdate={handleDriverUpdate}
                />
            </Container>
        </div>
    );
};

export default AdminDrivers;
