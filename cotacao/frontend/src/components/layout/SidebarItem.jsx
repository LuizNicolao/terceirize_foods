import React from 'react';
import { Link } from 'react-router-dom';
import { FaStar, FaRegStar } from 'react-icons/fa';

const SidebarItem = ({ 
  item, 
  isActive, 
  collapsed, 
  isFavorite, 
  onToggleFavorite, 
  onItemClick 
}) => {
  const Icon = item.icon;

  return (
    <Link 
      to={item.path}
      className={`
        flex items-center px-5 py-2.5 text-gray-700 text-decoration-none transition-all duration-300 border-l-3 border-transparent text-sm
        hover:bg-gray-50 hover:text-green-500 hover:border-l-green-500
        ${isActive ? 'bg-green-100 text-green-500 border-l-green-500 font-semibold' : ''}
      `}
      onClick={onItemClick}
    >
      <div className={`${collapsed ? 'mr-0' : 'mr-3'} text-base min-w-5 text-center ${isActive ? 'text-green-500' : 'inherit'}`}>
        <Icon />
      </div>
      <span className={`
        text-sm font-medium whitespace-nowrap overflow-hidden text-ellipsis flex-1
        ${collapsed ? 'hidden' : 'block'}
      `}>
        {item.label}
      </span>
      <button
        className={`
          bg-transparent border-none cursor-pointer p-1 rounded transition-all duration-200 ml-2
          ${collapsed ? 'hidden' : 'block'}
          ${isFavorite ? 'text-yellow-400' : 'text-gray-300'}
          hover:bg-yellow-50 hover:scale-110
        `}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onToggleFavorite(item);
        }}
        title={isFavorite ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
      >
        {isFavorite ? <FaStar /> : <FaRegStar />}
      </button>
    </Link>
  );
};

export default SidebarItem;
