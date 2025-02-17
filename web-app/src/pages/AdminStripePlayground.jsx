import React, { useState } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const AdminStripePlayground = () => {
    const navigate = useNavigate();
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [description, setDescription] = useState('');

    const handleCreateCharge = async (e) => {
        e.preventDefault();
        // TODO: Implement Stripe charge creation
        alert('Stripe integration coming soon!');
    };

    return (
        <Container className="py-4">
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Stripe Playground</h1>
                <Button variant="secondary" onClick={() => navigate('/admin')}>
                    Back
                </Button>
            </div>

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
                                        <option value="cad">CAD</option>
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control
                                        type="text"
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

                <Col md={6}>
                    <Card>
                        <Card.Header as="h5">Recent Transactions</Card.Header>
                        <Card.Body>
                            <p className="text-muted">No transactions yet</p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default AdminStripePlayground; 