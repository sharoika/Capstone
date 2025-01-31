import React from 'react';
import { Table, Dropdown } from 'react-bootstrap';

const DriverTable = ({ drivers, onApprovalChange, onDocumentDownload }) => {
  return (
    <Table responsive hover className="mb-0">
      <thead>
        <tr>
          <th>Name</th>
          <th>Email</th>
          <th>Phone</th>
          <th>Vehicle</th>
          <th>Status</th>
          <th>Documents</th>
        </tr>
      </thead>
      <tbody>
        {drivers.map((driver) => (
          <tr key={driver._id}>
            <td>{driver.firstName} {driver.lastName}</td>
            <td className="text-break">{driver.email}</td>
            <td>{driver.phone}</td>
            <td>{driver.vehicleMake} {driver.vehicleModel}</td>
            <td>
              <select
                className={`form-select ${driver.applicationApproved ? 'bg-success' : 'bg-danger'}`}
                value={driver.applicationApproved.toString()}
                onChange={(e) => onApprovalChange(driver._id, e.target.value)}
              >
                <option value="true">Approved</option>
                <option value="false">Not Approved</option>
              </select>
            </td>
            <td>
              <Dropdown>
                <Dropdown.Toggle variant="primary" size="sm">
                  Download Documents ▼
                </Dropdown.Toggle>
                <Dropdown.Menu>
                  <Dropdown.Item onClick={() => onDocumentDownload(driver._id, 'license')}>License</Dropdown.Item>
                  <Dropdown.Item onClick={() => onDocumentDownload(driver._id, 'abstract')}>Abstract</Dropdown.Item>
                  <Dropdown.Item onClick={() => onDocumentDownload(driver._id, 'criminal')}>Criminal Record</Dropdown.Item>
                  <Dropdown.Item onClick={() => onDocumentDownload(driver._id, 'registration')}>Registration</Dropdown.Item>
                  <Dropdown.Item onClick={() => onDocumentDownload(driver._id, 'safety')}>Safety</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>
            </td>
          </tr>
        ))}
      </tbody>
    </Table>
  );
};

export default DriverTable;

