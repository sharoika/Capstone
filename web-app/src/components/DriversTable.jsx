import React from 'react';
import { Table, Form } from 'react-bootstrap';
import DriverDocuments from './DriverDocuments'; // Assuming this component exists

const DriverTable = ({ drivers, onApprovalChange, onDocumentDownload }) => {
  return (
    <div className="table-responsive">
      <Table striped bordered hover className="w-100" style={{ tableLayout: 'fixed' }}>
        <thead>
          <tr>
            <th style={{ width: '10%' }}>Driver ID</th>
            <th style={{ width: '15%' }}>Name</th>
            <th style={{ width: '20%' }}>Email</th>
            <th style={{ width: '12%' }}>Phone</th>
            <th style={{ width: '15%' }}>Vehicle</th>
            <th style={{ width: '13%' }}>Status</th>
            <th style={{ width: '15%' }}>Documents</th>
          </tr>
        </thead>
        <tbody>
          {drivers.map((driver) => (
            <tr key={driver._id}>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver.driverID}</td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver.firstName} {driver.lastName}</td>
              <td style={{ wordBreak: 'break-word' }}>{driver.email}</td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver.phone}</td>
              <td style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{driver.vehicleMake} {driver.vehicleModel}</td>
              <td>
                <Form.Select
                  size="sm"
                  value={driver.applicationApproved ? 'true' : 'false'}
                  onChange={(e) => onApprovalChange(driver._id, e.target.value)}
                  className={driver.applicationApproved ? 'bg-success text-white' : 'bg-danger text-white'}
                >
                  <option value="true">Approved</option>
                  <option value="false">Not Approved</option>
                </Form.Select>
              </td>
              <td>
                <DriverDocuments driverId={driver._id} onDownload={onDocumentDownload} />
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default DriverTable;

