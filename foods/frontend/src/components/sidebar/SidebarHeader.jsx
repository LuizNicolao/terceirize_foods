import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const SidebarHeader = ({ collapsed, onToggle }) => {
  return (
    <div className="p-5 border-b border-gray-200 text-center relative flex-shrink-0">
      <h2 className={`text-green-600 font-bold transition-all duration-300 ${
        collapsed ? 'text-base' : 'text-2xl'
      } whitespace-nowrap overflow-hidden text-ellipsis`}>
        {collapsed ? 'F' : 'Foods'}
      </h2>
      
      <button
        onClick={onToggle}
        className="absolute -right-3 top-1/2 transform -translate-y-1/2 bg-green-600 border-none rounded-full w-6 h-6 flex items-center justify-center text-white cursor-pointer transition-all duration-300 z-10 shadow-md hover:bg-green-700 hover:scale-110 md:-right-4 md:w-8 md:h-8"
      >
        {collapsed ? <FaChevronRight className="w-3 h-3 md:w-4 md:h-4" /> : <FaChevronLeft className="w-3 h-3 md:w-4 md:h-4" />}
      </button>
    </div>
  );
};

export default SidebarHeader;
