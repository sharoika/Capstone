import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const DriverEditModal = ({ show, onHide, driver, onUpdate }) => {
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        vehicleMake: '',
        vehicleModel: '',
        vehicleYear: '',
        vehiclePlate: ''
    });

    // Update form data when driver changes or modal opens
    useEffect(() => {
        if (driver) {
            setFormData({
                firstName: driver.firstName || '',
                lastName: driver.lastName || '',
                email: driver.email || '',
                phone: driver.phone || '',
                vehicleMake: driver.vehicleMake || '',
                vehicleModel: driver.vehicleModel || '',
                vehicleYear: driver.vehicleYear || '',
                vehiclePlate: driver.vehiclePlate || ''
            });
        }
    }, [driver, show]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.put(
                `${process.env.API_URL}/api/admin/drivers/${driver._id}`,
                formData,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            onUpdate({ ...driver, ...formData });
            onHide();
        } catch (error) {
            console.error('Error updating driver:', error);
            alert('Error updating driver');
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Driver</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.firstName}
                            onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.lastName}
                            onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            required
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Phone</Form.Label>
                        <Form.Control
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vehicle Make</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.vehicleMake}
                            onChange={(e) => setFormData({ ...formData, vehicleMake: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vehicle Model</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.vehicleModel}
                            onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vehicle Year</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.vehicleYear}
                            onChange={(e) => setFormData({ ...formData, vehicleYear: e.target.value })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Vehicle Plate</Form.Label>
                        <Form.Control
                            type="text"
                            value={formData.vehiclePlate}
                            onChange={(e) => setFormData({ ...formData, vehiclePlate: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onHide}>
                    Close
                </Button>
                <Button variant="primary" onClick={handleSubmit}>
                    Save Changes
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default DriverEditModal; 