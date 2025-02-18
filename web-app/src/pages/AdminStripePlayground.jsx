import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Row, Col } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { useStripe, useElements, CardElement, Elements } from '@stripe/react-stripe-js';

// Make sure to load your Stripe public key here
const stripePromise = loadStripe('pk_test_51QtMoYJyF40wM9B0Se1fgklXHRop2iczcT3HjYwnp8sJ6Si5MJaPzNHjlm06TXbPLR23RJZYFKA1XvQoy7HQFcfE00IXRjG8RP');

const AdminStripePlayground = () => {
    const [amount, setAmount] = useState('');
    const [currency, setCurrency] = useState('usd');
    const [email, setEmail] = useState('');
    const [paymentMethodId, setPaymentMethodId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [customerId, setCustomerId] = useState(null);  // Added state to store the customerId

    const stripe = useStripe();
    const elements = useElements();

    // Handle creating customer and associating payment method
    const handleCreateCustomer = async (e) => {
        e.preventDefault();
        if (!stripe || !elements) return;

        setIsLoading(true);

        const cardElement = elements.getElement(CardElement);

        // Create a payment method with Stripe's CardElement
        const { error, paymentMethod } = await stripe.createPaymentMethod({
            type: 'card',
            card: cardElement,
        });

        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        console.log("payment method");
        console.log(paymentMethod.id);
        setPaymentMethodId(paymentMethod.id);

        // Send payment method and email to backend to create customer
        try {
            console.log(paymentMethod.id);
            const response = await fetch(`${process.env.API_URL}/api/payment/create-customer`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ paymentMethodId: paymentMethod.id, email }),
            });

            const data = await response.json();

            if (data.customerId) {
                alert('Customer created successfully!');
                setCustomerId(data.customerId);  // Store the customerId for later use
            }
        } catch (error) {
            console.error('Error creating customer:', error);
            setIsLoading(false);
        }
    };

    // Handle charge (payment) on button click
    const handleCreateCharge = async () => {
        if (!customerId || !paymentMethodId) {
            alert("Customer or Payment Method is missing.");
            return;
        }

        // Fake amount for testing
        const fakeAmount = 10; // 10 USD for this example
        try {
            const response = await fetch(`${process.env.API_URL}/api/payment/create-charge`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ customerId, paymentMethodId, amount: fakeAmount }),
            });

            const data = await response.json();

            if (data.success) {
                alert('Fake charge processed successfully!');
                navigate('/admin');  // Navigate to the admin page or wherever you'd like after success
            } else {
                alert('Payment failed');
            }
        } catch (error) {
            console.error('Error creating charge:', error);
        }
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
                        <Card.Header as="h5">Create Customer</Card.Header>
                        <Card.Body>
                            <Form onSubmit={handleCreateCustomer}>
                                <Form.Group className="mb-3">
                                    <Form.Label>Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter email"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>Card Details</Form.Label>
                                    <div>
                                        <CardElement />
                                    </div>
                                </Form.Group>

                                {error && <p className="text-danger">{error}</p>}

                                <Button variant="primary" type="submit" disabled={isLoading}>
                                    {isLoading ? 'Creating Customer...' : 'Create Customer and Save Payment Method'}
                                </Button>
                            </Form>

                            {/* Display charge button after customer is created */}
                            {customerId && (
                                <Button variant="success" onClick={handleCreateCharge} className="mt-3">
                                    Create Charge
                                </Button>
                            )}
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

// Wrap the component with Elements provider
const AdminStripePlaygroundWrapper = () => (
    <Elements stripe={stripePromise}>
        <AdminStripePlayground />
    </Elements>
);

export default AdminStripePlaygroundWrapper;
