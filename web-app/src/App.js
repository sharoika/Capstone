import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import axios from 'axios';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminRiders from './pages/AdminRiders';
import AdminDrivers from './pages/AdminDrivers';
import AdminLiveTracker from './pages/AdminLiveTracker';
import AdminPayments from './pages/AdminPayments';
import AdminPayouts from './pages/AdminPayouts';
import './App.css';
import { Navigate } from 'react-router-dom';
import './styles/AdminStyles.css';

const checkAdmin = async () => {
  try {
    const token = localStorage.getItem('token');

    if (!token) {
      return false;
    }

    const response = await axios.get(
      `${process.env.REACT_APP_API_URL}/api/admin/check-admin`,
      { headers: { 'Authorization': `Bearer ${token}` } }
    );

    if (response.data.isAdmin) {
      return true;
    } else {
      return false;
    }
  } catch (error) {
    return false;
  }
};

function App() {

  const isAdmin = checkAdmin();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={isAdmin ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/riders"
          element={isAdmin ? <AdminRiders /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/drivers"
          element={isAdmin ? <AdminDrivers /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/live-tracker"
          element={isAdmin ? <AdminLiveTracker /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/payments"
          element={isAdmin ? <AdminPayments /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/payouts"
          element={isAdmin ? <AdminPayouts /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
