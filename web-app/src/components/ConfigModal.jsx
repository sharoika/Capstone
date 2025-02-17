import React, { useState, useEffect } from 'react';
import { Modal, Form, Button } from 'react-bootstrap';
import axios from 'axios';

const ConfigModal = ({ show, onHide }) => {
    const [config, setConfig] = useState({
        maintenanceMode: false,
        locationUpdateFrequency: 30
    });

    useEffect(() => {
        if (show) fetchConfig();
    }, [show]);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/config`,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setConfig(response.data);
        } catch (error) {
            console.error('Error fetching configuration:', error);
            alert('Error fetching configuration');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/config`,
                config,
                { headers: { Authorization: `Bearer ${token}` } }
            );
            alert('Configuration updated successfully');
            onHide();
        } catch (error) {
            console.error('Error updating configuration:', error);
            alert('Failed to update configuration');
        }
    };

    return (
        <Modal show={show} onHide={onHide}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                        <Form.Check
                            type="switch"
                            id="maintenance-mode"
                            label="Maintenance Mode"
                            checked={config.maintenanceMode}
                            onChange={(e) => setConfig({
                                ...config,
                                maintenanceMode: e.target.checked
                            })}
                        />
                    </Form.Group>

                    <Form.Group className="mb-3">
                        <Form.Label>Location Update Frequency (seconds)</Form.Label>
                        <Form.Control
                            type="number"
                            value={config.locationUpdateFrequency}
                            onChange={(e) => setConfig({
                                ...config,
                                locationUpdateFrequency: parseInt(e.target.value)
                            })}
                            min="5"
                            max="60"
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

export default ConfigModal; 