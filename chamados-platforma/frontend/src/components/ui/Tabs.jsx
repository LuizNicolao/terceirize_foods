import React from 'react';

const Tabs = ({ tabs, activeTab, onTabChange, className = '' }) => {
  return (
    <div className={`bg-gray-50 border-b border-gray-200 ${className}`}>
      <nav className="flex space-x-1 overflow-x-auto px-2" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`
                whitespace-nowrap py-3 px-4 border-b-2 font-medium text-sm transition-colors
                ${
                  isActive
                    ? 'border-green-500 text-green-600 bg-white'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }
              `}
              disabled={tab.disabled}
            >
              {tab.icon && <tab.icon className="inline-block w-4 h-4 mr-2" />}
              {tab.label}
              {tab.badge && (
                <span
                  className={`
                    ml-2 py-0.5 px-2 rounded-full text-xs font-medium
                    ${isActive ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'}
                  `}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Tabs;

