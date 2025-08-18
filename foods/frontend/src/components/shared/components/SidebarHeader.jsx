import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

export const SidebarHeader = ({ collapsed, toggleCollapse }) => {
  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
      {/* Logo */}
      <div className="flex items-center">
        <h2 className={`font-bold text-green-600 transition-all duration-300 ${
          collapsed ? 'text-lg' : 'text-2xl'
        } ${collapsed ? 'opacity-0' : 'opacity-100'}`}>
          Foods
        </h2>
      </div>

      {/* Toggle Button */}
      <button
        onClick={toggleCollapse}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-green-600 hover:bg-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center transition-all duration-200 hover:scale-110 shadow-md"
      >
        {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </button>
    </div>
  );
};
