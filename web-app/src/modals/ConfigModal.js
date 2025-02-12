import React, { useState, useEffect } from 'react';
import { Button, Modal, Form } from 'react-bootstrap';
import axios from 'axios';

const ConfigModal = ({ show, handleClose }) => {
    const [config, setConfig] = useState({ maintenanceMode: false, locationFrequency: '' });

    useEffect(() => {
        if (show) fetchConfig();
    }, [show]);

    const fetchConfig = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/configuration`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setConfig(response.data);
        } catch (error) {
            console.error('Error fetching configuration:', error);
        }
    };

    const handleSave = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL}/api/configuration`, config, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Configuration updated successfully');
            handleClose();
        } catch (error) {
            console.error('Error updating configuration:', error);
            alert('Failed to update configuration');
        }
    };

    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Configuration</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form>
                    <Form.Group className="mb-3">
                        <Form.Label>Maintenance Mode</Form.Label>
                        <Form.Check
                            type="checkbox"
                            label="Enable Maintenance Mode"
                            checked={config.maintenanceMode}
                            onChange={(e) => setConfig({ ...config, maintenanceMode: e.target.checked })}
                        />
                    </Form.Group>
                    <Form.Group className="mb-3">
                        <Form.Label>Location Frequency</Form.Label>
                        <Form.Control
                            type="number"
                            value={config.locationFrequency}
                            onChange={(e) => setConfig({ ...config, locationFrequency: e.target.value })}
                        />
                    </Form.Group>
                </Form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary" onClick={handleSave}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfigModal;
