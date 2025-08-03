import React from 'react';

const Table = ({ 
  children, 
  className = '',
  responsive = true 
}) => {
  const tableClasses = `min-w-full divide-y divide-gray-200 ${className}`;
  
  if (responsive) {
    return (
      <div className="overflow-x-auto">
        <table className={tableClasses}>
          {children}
        </table>
      </div>
    );
  }
  
  return (
    <table className={tableClasses}>
      {children}
    </table>
  );
};

const TableHeader = ({ children, className = '' }) => (
  <thead className="bg-gray-50">
    <tr>
      {React.Children.map(children, (child) => 
        React.cloneElement(child, { 
          className: `px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}` 
        })
      )}
    </tr>
  </thead>
);

const TableBody = ({ children, className = '' }) => (
  <tbody className={`bg-white divide-y divide-gray-200 ${className}`}>
    {children}
  </tbody>
);

const TableRow = ({ children, className = '', onClick, hover = true }) => {
  const rowClasses = `${hover ? 'hover:bg-gray-50' : ''} ${onClick ? 'cursor-pointer' : ''} ${className}`;
  
  return (
    <tr className={rowClasses} onClick={onClick}>
      {children}
    </tr>
  );
};

const TableCell = ({ children, className = '', align = 'left' }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${alignClasses[align]} ${className}`}>
      {children}
    </td>
  );
};

const TableHeaderCell = ({ children, className = '', align = 'left' }) => {
  const alignClasses = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  };
  
  return (
    <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${alignClasses[align]} ${className}`}>
      {children}
    </th>
  );
};

Table.Header = TableHeader;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.HeaderCell = TableHeaderCell;

export default Table; 