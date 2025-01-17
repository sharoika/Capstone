import React, { useState } from "react";
import axios from "axios";

const DriverRegistration = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    vehicleMake: "",
    vehicleModel: "",
  });

  const [files, setFiles] = useState({
    licenseDoc: null,
    abstractDoc: null,
    criminalRecordCheckDoc: null,
    vehicleRegistrationDoc: null,
    safetyInspectionDoc: null,
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validate that all required files are present
    const requiredFiles = ['licenseDoc', 'abstractDoc', 'criminalRecordCheckDoc', 'vehicleRegistrationDoc', 'safetyInspectionDoc'];
    const missingFiles = requiredFiles.filter(fileKey => !files[fileKey]);
    
    if (missingFiles.length > 0) {
      setError(`Please upload all required documents: ${missingFiles.join(', ')}`);
      return;
    }

    const data = new FormData();

    // Append form data
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    // Append files
    Object.keys(files).forEach((key) => {
      if (files[key]) {
        data.append(key, files[key]);
      }
    });

    try {
      console.log('Submitting form data:', Object.fromEntries(data.entries()));
      
      const response = await axios.post("http://localhost:5000/api/auth/driver/register", data, {
        headers: { 
          "Content-Type": "multipart/form-data"
        },
      });
      
      console.log('Registration response:', response.data);
      setSuccess("Driver registered successfully");
      // Reset form
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        vehicleMake: "",
        vehicleModel: "",
      });
      setFiles({
        licenseDoc: null,
        abstractDoc: null,
        criminalRecordCheckDoc: null,
        vehicleRegistrationDoc: null,
        safetyInspectionDoc: null,
      });
    } catch (error) {
      console.error("Error registering driver:", {
        response: error.response?.data,
        status: error.response?.status,
        error: error.message
      });
      
      setError(
        error.response?.data?.message || 
        error.message || 
        "An error occurred while registering."
      );
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h2 className="text-2xl font-bold mb-6">Driver Registration</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && <div className="p-3 bg-red-100 text-red-700 rounded">{error}</div>}
        {success && <div className="p-3 bg-green-100 text-green-700 rounded">{success}</div>}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Make</label>
            <input
              type="text"
              name="vehicleMake"
              value={formData.vehicleMake}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Model</label>
            <input
              type="text"
              name="vehicleModel"
              value={formData.vehicleModel}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
              required
            />
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Driver's License</label>
            <input
              type="file"
              name="licenseDoc"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Driver Abstract</label>
            <input
              type="file"
              name="abstractDoc"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Criminal Record Check</label>
            <input
              type="file"
              name="criminalRecordCheckDoc"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Vehicle Registration</label>
            <input
              type="file"
              name="vehicleRegistrationDoc"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Safety Inspection Document</label>
            <input
              type="file"
              name="safetyInspectionDoc"
              onChange={handleFileChange}
              className="w-full p-2 border rounded"
              accept=".pdf,.jpg,.jpeg,.png"
              required
            />
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default DriverRegistration;
