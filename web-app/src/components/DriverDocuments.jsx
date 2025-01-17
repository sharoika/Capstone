import React from 'react';
import { Dropdown } from 'react-bootstrap';

const DriverDocuments = ({ driverId, onDownload }) => {
  const documents = [
    { type: 'license', label: 'License' },
    { type: 'abstract', label: 'Abstract' },
    { type: 'criminal', label: 'Criminal Record' },
    { type: 'registration', label: 'Registration' },
    { type: 'safety', label: 'Safety' }
  ];

  return (
    <Dropdown>
      <Dropdown.Toggle variant="primary" id={`dropdown-${driverId}`}>
        Download Documents
      </Dropdown.Toggle>
      <Dropdown.Menu>
        {documents.map(doc => (
          <Dropdown.Item key={doc.type} onClick={() => onDownload(driverId, doc.type)}>
            {doc.label}
          </Dropdown.Item>
        ))}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default DriverDocuments;