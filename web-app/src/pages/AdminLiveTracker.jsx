import React, { useState, useEffect } from 'react';
import { Container, Badge, Alert, Spinner } from 'react-bootstrap';
import axios from 'axios';
import AdminHeader from '../components/AdminHeader';
import SortableTable from '../components/SortableTable';

const AdminLiveTracker = () => {
    const [rides, setRides] = useState([]);
    const [locations, setLocations] = useState([]);
    const [loading, setLoading] = useState({ rides: true, locations: true });
    const [error, setError] = useState({ rides: null, locations: null });

    useEffect(() => {
        // Initial fetch
        fetchRides();
        fetchLocations();
        
        // Set up polling every 5 seconds for rides and locations
        const ridesInterval = setInterval(fetchRides, 5000);
        const locationsInterval = setInterval(fetchLocations, 5000);
        
        // Cleanup intervals on component unmount
        return () => {
            clearInterval(ridesInterval);
            clearInterval(locationsInterval);
        };
    }, []);

    const fetchRides = async () => {
        setLoading(prev => ({ ...prev, rides: true }));
        setError(prev => ({ ...prev, rides: null }));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/admin/rides/active`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setRides(response.data);
            setError(prev => ({ ...prev, rides: null }));
        } catch (error) {
            console.error('Error fetching active rides:', error);
            setError(prev => ({ 
                ...prev, 
                rides: 'Failed to load active rides. The API endpoint may not be available yet.' 
            }));
        } finally {
            setLoading(prev => ({ ...prev, rides: false }));
        }
    };

    const fetchLocations = async () => {
        setLoading(prev => ({ ...prev, locations: true }));
        setError(prev => ({ ...prev, locations: null }));
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(
                `${process.env.REACT_APP_API_URL}/api/location/all`,
                { headers: { 'Authorization': `Bearer ${token}` } }
            );
            setLocations(response.data);
            setError(prev => ({ ...prev, locations: null }));
        } catch (error) {
            console.error('Error fetching locations:', error);
            setError(prev => ({ 
                ...prev, 
                locations: 'Failed to load locations. The API endpoint may not be available yet.' 
            }));
        } finally {
            setLoading(prev => ({ ...prev, locations: false }));
        }
    };

    const getStatusBadge = (ride) => {
        if (!ride.driverID) {
            return <Badge bg="warning">Waiting for Driver</Badge>;
        }
        if (!ride.rideStarted) {
            return <Badge bg="info">Driver Assigned</Badge>;
        }
        if (!ride.rideFinished) {
            return <Badge bg="primary">In Progress</Badge>;
        }
        return <Badge bg="success">Completed</Badge>;
    };

    const rideColumns = [
        { key: '_id', label: 'Ride ID', sortable: true },
        { key: 'rider', label: 'Rider', sortable: true, accessor: (ride) => `${ride.riderID?.firstName || ''} ${ride.riderID?.lastName || ''}` },
        { key: 'driver', label: 'Driver', sortable: true, accessor: (ride) => ride.driverID ? `${ride.driverID.firstName} ${ride.driverID.lastName}` : 'Not Assigned' },
        { key: 'pickupLocation', label: 'Pickup Location', sortable: true },
        { key: 'dropoffLocation', label: 'Dropoff Location', sortable: true },
        { key: 'status', label: 'Status', sortable: true, accessor: (ride) => {
            if (!ride.driverID) return 0;
            if (!ride.rideStarted) return 1;
            if (!ride.rideFinished) return 2;
            return 3;
        }},
        { key: 'currentLocation', label: 'Current Location', sortable: false },
        { key: 'rideStartTime', label: 'Time Started', sortable: true, accessor: (ride) => ride.rideStarted ? new Date(ride.rideStartTime).getTime() : 0 },
    ];

    const locationColumns = [
        { key: 'userId', label: 'User ID', sortable: true },
        { key: 'rideId', label: 'Ride ID', sortable: true },
        { key: 'location', label: 'Location', sortable: false, accessor: (location) => `${location.location.lat}, ${location.location.long}` },
        { key: 'timestamp', label: 'Timestamp', sortable: true, accessor: (location) => new Date(location.timestamp).getTime() },
    ];

    const renderRidesContent = () => {
        if (loading.rides && rides.length === 0) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }

        if (error.rides && rides.length === 0) {
            return <Alert variant="warning">{error.rides}</Alert>;
        }

        if (rides.length === 0) {
            return <Alert variant="info">No active rides found.</Alert>;
        }

        return (
            <SortableTable columns={rideColumns} data={rides}>
                {(sortedRides) => 
                    sortedRides.map((ride) => (
                        <tr key={ride._id}>
                            <td>{ride._id}</td>
                            <td>
                                {ride.riderID?.firstName} {ride.riderID?.lastName}
                            </td>
                            <td>
                                {ride.driverID ? 
                                    `${ride.driverID.firstName} ${ride.driverID.lastName}` : 
                                    'Not Assigned'
                                }
                            </td>
                            <td>{ride.pickupLocation}</td>
                            <td>{ride.dropoffLocation}</td>
                            <td>{getStatusBadge(ride)}</td>
                            <td>
                                {ride.currentLocation ? 
                                    `${ride.currentLocation.lat}, ${ride.currentLocation.lng}` :
                                    'N/A'
                                }
                            </td>
                            <td>
                                {ride.rideStarted ? 
                                    new Date(ride.rideStartTime).toLocaleTimeString() :
                                    'Not Started'
                                }
                            </td>
                        </tr>
                    ))
                }
            </SortableTable>
        );
    };

    const renderLocationsContent = () => {
        if (loading.locations && locations.length === 0) {
            return (
                <div className="text-center my-5">
                    <Spinner animation="border" role="status">
                        <span className="visually-hidden">Loading...</span>
                    </Spinner>
                </div>
            );
        }

        if (error.locations && locations.length === 0) {
            return <Alert variant="warning">{error.locations}</Alert>;
        }

        if (locations.length === 0) {
            return <Alert variant="info">No location data found.</Alert>;
        }

        return (
            <SortableTable columns={locationColumns} data={locations}>
                {(sortedLocations) => 
                    sortedLocations.map((location) => (
                        <tr key={location._id}>
                            <td>{location.userId}</td>
                            <td>{location.rideId || 'N/A'}</td>
                            <td>{`${location.location.lat}, ${location.location.long}`}</td>
                            <td>{new Date(location.timestamp).toLocaleString()}</td>
                        </tr>
                    ))
                }
            </SortableTable>
        );
    };

    return (
        <div>
            <AdminHeader title="Admin Panel: Live Tracker" />
            <Container className="py-4">
                <h3 className="mb-3">Active Rides</h3>
                {renderRidesContent()}

                <h3 className="mt-5 mb-3">Locations</h3>
                {renderLocationsContent()}
            </Container>
        </div>
    );
};

export default AdminLiveTracker;
