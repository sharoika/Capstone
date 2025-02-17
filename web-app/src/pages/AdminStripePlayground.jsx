import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import AdminHeader from '../components/AdminHeader';

const AdminStripePlayground = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [description, setDescription] = useState('');

    const handleCreateCharge = async (e) => {
        e.preventDefault();
        alert('Stripe integration coming soon!');
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Stripe Playground" />
            <Container className="py-4">
                <Row>
                    <Col md={6}>
                        <Card>
                            <Card.Header as="h5">Create Payment</Card.Header>
                            <Card.Body>
                                <Form onSubmit={handleCreateCharge}>
                                    <Form.Group className="mb-3">
                                        <Form.Label>Amount</Form.Label>
                                        <Form.Control
                                            type="number"
                                            value={amount}
                                            onChange={(e) => setAmount(e.target.value)}
                                            placeholder="Enter amount"
                                            min="0.50"
                                            step="0.01"
                                            required
                                        />
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Currency</Form.Label>
                                        <Form.Select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                        >
                                            <option value="usd">USD</option>
                                            <option value="eur">EUR</option>
                                            <option value="gbp">GBP</option>
                                        </Form.Select>
                                    </Form.Group>

                                    <Form.Group className="mb-3">
                                        <Form.Label>Description</Form.Label>
                                        <Form.Control
                                            as="textarea"
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Payment description"
                                        />
                                    </Form.Group>

                                    <Button variant="primary" type="submit">
                                        Create Payment
                                    </Button>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default AdminStripePlayground;