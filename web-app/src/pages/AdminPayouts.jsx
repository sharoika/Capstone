import React, { useState, useEffect } from 'react';
import { Container, Table } from 'react-bootstrap';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';

const AdminPayouts = () => {
    const [payouts, setPayouts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPayouts = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/payout-requests`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            console.log('Payout response:', response.data);
            setPayouts(response.data);
        } catch (error) {
            console.error('Error fetching payouts:', error.response || error);
            alert('Error fetching payouts');
        } finally {
            setLoading(false);
        }
    };

    const handleStatusChange = async (payoutId, status) => {
        try {
            const token = localStorage.getItem('token');
            await axios.post(
                `${process.env.REACT_APP_API_URL}/api/admin/payout-requests/${payoutId}/status`,
                { status },
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            fetchPayouts();
        } catch (error) {
            console.error('Error updating payout status:', error.response || error);
            alert('Error updating payout status');
        }
    };

    useEffect(() => {
        fetchPayouts();
        // Refresh every 30 seconds
        const interval = setInterval(fetchPayouts, 30000);
        return () => clearInterval(interval);
    }, []);

    if (loading) {
        return (
            <>
                <AdminHeader />
                <Container>
                    <h2>Loading payout requests...</h2>
                </Container>
            </>
        );
    }

    return (
        <>
            <AdminHeader />
            <Container>
                <h2 className="my-4">Payout Requests</h2>
                <Table striped bordered hover>
                    <thead>
                        <tr>
                            <th>Driver</th>
                            <th>Email</th>
                            <th>Amount</th>
                            <th>Requested Date</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {payouts.map((payout) => (
                            <tr key={payout._id}>
                                <td>{payout.driverID.firstName} {payout.driverID.lastName}</td>
                                <td>{payout.driverID.email}</td>
                                <td>${payout.amount.toFixed(2)}</td>
                                <td>{new Date(payout.requestedAt).toLocaleString()}</td>
                                <td>
                                    <select 
                                        value={payout.status}
                                        onChange={(e) => handleStatusChange(payout._id, e.target.value)}
                                        className={`form-select ${payout.status === 'PAID' ? 'text-success' : 'text-warning'}`}
                                    >
                                        <option value="AWAITING_PAYOUT">Awaiting Payout</option>
                                        <option value="PAID">Paid</option>
                                    </select>
                                </td>
                                <td>{payout.paidAt && new Date(payout.paidAt).toLocaleString()}</td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </Container>
        </>
    );
};

export default AdminPayouts; 