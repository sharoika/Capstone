import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Admin from './pages/AdminDashboard';
import Login from './pages/Login';
import DriverRegistration from './pages/DriverRegistration';
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
        <Route path="/admin-dashboard" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
