import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import Login from './pages/Login';
import DriverRegistration from './pages/DriverRegistration';
import AdminRiders from './pages/AdminRiders';
import AdminDrivers from './pages/AdminDrivers';
import AdminLiveTracker from './pages/AdminLiveTracker';
import AdminPayments from './pages/AdminPayments';
import AdminStripePlayground from './pages/AdminStripePlayground';
import './App.css';
import Register from './pages/Register';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/driver-registration" element={<DriverRegistration />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/riders" element={<AdminRiders />} />
        <Route path="/admin/drivers" element={<AdminDrivers />} />
        <Route path="/admin/live-tracker" element={<AdminLiveTracker />} />
        <Route path="/admin/payments" element={<AdminPayments />} />
        <Route path="/admin/stripe" element={<AdminStripePlayground />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
