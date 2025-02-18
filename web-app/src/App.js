import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import AdminRiders from './pages/AdminRiders';
import AdminDrivers from './pages/AdminDrivers';
import AdminLiveTracker from './pages/AdminLiveTracker';
import AdminPayments from './pages/AdminPayments';
import './App.css';
import { Navigate } from 'react-router-dom';
import './styles/AdminStyles.css';


function App() {
  var token = localStorage.getItem('token');

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={token ? <AdminDashboard /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/riders"
          element={token ? <AdminRiders /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/drivers"
          element={token ? <AdminDrivers /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/live-tracker"
          element={token ? <AdminLiveTracker /> : <Navigate to="/login" replace />}
        />
        <Route
          path="/admin/payments"
          element={token ? <AdminPayments /> : <Navigate to="/login" replace />}
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
