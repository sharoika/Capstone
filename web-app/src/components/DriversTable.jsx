import React from 'react';
import { Dropdown, Button } from 'react-bootstrap';
import SortableTable from './SortableTable';

const DriverTable = ({ drivers, onApprovalChange, onDocumentDownload, onDriverClick, onDeleteDriver, tableId }) => {
  const columns = [
    { key: 'name', label: 'Name', sortable: true, accessor: (driver) => `${driver.firstName} ${driver.lastName}` },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'phone', label: 'Phone', sortable: true },
    { key: 'vehicle', label: 'Vehicle', sortable: true, accessor: (driver) => `${driver.vehicleMake} ${driver.vehicleModel}` },
    { key: 'applicationApproved', label: 'Status', sortable: true },
    { key: 'documents', label: 'Documents', sortable: false },
    { key: 'actions', label: 'Actions', sortable: false },
  ];

  return (
    <SortableTable columns={columns} data={drivers} tableId={tableId || "admin-drivers-table"}>
      {(sortedDrivers) => 
        sortedDrivers.map((driver) => (
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
                <Dropdown.Toggle variant="primary" className="admin-btn" size="sm">
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
            <td>
              <div className="d-flex gap-2">
                <Button 
                  variant="primary" 
                  className="admin-btn"
                  onClick={() => onDriverClick(driver)}
                >
                  Edit
                </Button>
                <Button 
                  variant="danger" 
                  className="admin-btn"
                  onClick={() => onDeleteDriver(driver._id)}
                >
                  Delete
                </Button>
              </div>
            </td>
          </tr>
        ))
      }
    </SortableTable>
  );
};

export default DriverTable;
