import React from 'react';
import { FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';

const Table = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <div className="overflow-x-auto">
      <table className={`min-w-full divide-y divide-gray-200 ${className}`} {...props}>
        {children}
      </table>
    </div>
  );
};

const TableHeader = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <thead className="bg-gray-50" {...props}>
      <tr className={className}>
        {children}
      </tr>
    </thead>
  );
};

const TableHeaderCell = ({
  children,
  sortable = false,
  sortDirection = null,
  onSort,
  className = '',
  ...props
}) => {
  const handleClick = () => {
    if (sortable && onSort) {
      onSort();
    }
  };

  const sortIcon = sortable ? (
    <span className="ml-2">
      {sortDirection === 'asc' ? (
        <FaSortUp className="w-4 h-4" />
      ) : sortDirection === 'desc' ? (
        <FaSortDown className="w-4 h-4" />
      ) : (
        <FaSort className="w-4 h-4 text-gray-400" />
      )}
    </span>
  ) : null;

  const classes = [
    'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider',
    sortable ? 'cursor-pointer hover:bg-gray-100' : '',
    className
  ].filter(Boolean).join(' ');

  return (
    <th
      className={classes}
      onClick={handleClick}
      {...props}
    >
      <div className="flex items-center">
        {children}
        {sortIcon}
      </div>
    </th>
  );
};

const TableBody = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <tbody className={`bg-white divide-y divide-gray-200 ${className}`} {...props}>
      {children}
    </tbody>
  );
};

const TableRow = ({
  children,
  className = '',
  hover = true,
  ...props
}) => {
  const hoverClass = hover ? 'hover:bg-gray-50' : '';
  const classes = [hoverClass, className].filter(Boolean).join(' ');
  
  return (
    <tr className={classes} {...props}>
      {children}
    </tr>
  );
};

const TableCell = ({
  children,
  className = '',
  ...props
}) => {
  return (
    <td className={`px-6 py-4 whitespace-nowrap text-sm text-gray-900 ${className}`} {...props}>
      {children}
    </td>
  );
};

const TableEmpty = ({
  message = 'Nenhum dado encontrado',
  icon: Icon,
  className = '',
  ...props
}) => {
  return (
    <tr {...props}>
      <td colSpan="100%" className={`px-6 py-12 text-center ${className}`}>
        <div className="flex flex-col items-center">
          {Icon && <Icon className="w-12 h-12 text-gray-400 mb-4" />}
          <p className="text-gray-500 text-sm">{message}</p>
        </div>
      </td>
    </tr>
  );
};

const TableLoading = ({
  columns = 5,
  rows = 3,
  className = '',
  ...props
}) => {
  return (
    <tr {...props}>
      <td colSpan="100%" className={`px-6 py-4 ${className}`}>
        <div className="animate-pulse">
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div key={rowIndex} className="flex space-x-4 mb-4">
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div
                  key={colIndex}
                  className="h-4 bg-gray-200 rounded flex-1"
                />
              ))}
            </div>
          ))}
        </div>
      </td>
    </tr>
  );
};

Table.Header = TableHeader;
Table.HeaderCell = TableHeaderCell;
Table.Body = TableBody;
Table.Row = TableRow;
Table.Cell = TableCell;
Table.Empty = TableEmpty;
Table.Loading = TableLoading;

export default Table;
