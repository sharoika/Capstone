import React, { useState } from 'react';
import { Table } from 'react-bootstrap';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const SortableTable = ({ columns, data, children, tableId }) => {
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: 'none'
  });

  const requestSort = (key) => {
    let direction = 'asc';
    
    if (sortConfig.key === key) {
      if (sortConfig.direction === 'asc') {
        direction = 'desc';
      } else if (sortConfig.direction === 'desc') {
        direction = 'none';
      }
    }
    
    setSortConfig({ key, direction });
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <FaSort className="ms-1 text-muted" size={12} />;
    }
    
    if (sortConfig.direction === 'asc') {
      return <FaSortUp className="ms-1 text-primary" size={12} />;
    }
    
    if (sortConfig.direction === 'desc') {
      return <FaSortDown className="ms-1 text-primary" size={12} />;
    }
    
    return <FaSort className="ms-1 text-muted" size={12} />;
  };

  const sortedData = React.useMemo(() => {
    if (sortConfig.direction === 'none' || !sortConfig.key) {
      return data;
    }

    return [...data].sort((a, b) => {
      const column = columns.find(col => col.key === sortConfig.key);
      
      if (!column) return 0;
      
      // Get values using accessor if provided, otherwise use key directly
      const aValue = column.accessor ? column.accessor(a) : a[sortConfig.key];
      const bValue = column.accessor ? column.accessor(b) : b[sortConfig.key];
      
      // Handle different data types
      if (aValue === null || aValue === undefined) return 1;
      if (bValue === null || bValue === undefined) return -1;
      
      // Compare based on data type
      if (typeof aValue === 'string') {
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        }
        return bValue.localeCompare(aValue);
      } else {
        if (sortConfig.direction === 'asc') {
          return aValue - bValue;
        }
        return bValue - aValue;
      }
    });
  }, [data, sortConfig, columns]);

  return (
    <Table responsive hover className="mb-0" id={tableId}>
      <thead>
        <tr>
          {columns.map((column) => (
            <th 
              key={column.key} 
              onClick={() => column.sortable !== false && requestSort(column.key)}
              style={{ cursor: column.sortable !== false ? 'pointer' : 'default' }}
              className={column.className || ''}
            >
              <div className="d-flex align-items-center">
                {column.label}
                {column.sortable !== false && getSortIcon(column.key)}
              </div>
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {children(sortedData)}
      </tbody>
    </Table>
  );
};

export default SortableTable;
