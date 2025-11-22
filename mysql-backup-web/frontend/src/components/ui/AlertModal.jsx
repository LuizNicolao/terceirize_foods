import React from 'react'
import { FaExclamationTriangle, FaCheckCircle, FaInfoCircle, FaTimes } from 'react-icons/fa'

const AlertModal = ({ 
  isOpen, 
  onClose, 
  message,
  title,
  type = 'info' // 'success', 'error', 'warning', 'info'
}) => {
  if (!isOpen) return null

  const typeConfig = {
    success: {
      icon: FaCheckCircle,
      iconColor: 'text-green-500',
      titleColor: 'text-green-500',
      title: title || 'Sucesso',
      buttonColor: 'bg-green-500 hover:bg-green-600'
    },
    error: {
      icon: FaExclamationTriangle,
      iconColor: 'text-red-500',
      titleColor: 'text-red-500',
      title: title || 'Erro',
      buttonColor: 'bg-red-500 hover:bg-red-600'
    },
    warning: {
      icon: FaExclamationTriangle,
      iconColor: 'text-yellow-500',
      titleColor: 'text-yellow-500',
      title: title || 'Atenção',
      buttonColor: 'bg-yellow-500 hover:bg-yellow-600'
    },
    info: {
      icon: FaInfoCircle,
      iconColor: 'text-blue-500',
      titleColor: 'text-blue-500',
      title: title || 'Informação',
      buttonColor: 'bg-blue-500 hover:bg-blue-600'
    }
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[9999]"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-lg p-6 max-w-lg w-11/12 max-h-[80vh] overflow-y-auto shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-200">
          <h3 className={`${config.titleColor} text-lg font-semibold m-0 flex items-center gap-2`}>
            <Icon />
            {config.title}
          </h3>
          <button 
            className="bg-transparent border-none cursor-pointer text-gray-500 text-lg p-1 rounded transition-colors hover:bg-gray-100 hover:text-gray-700"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="text-gray-700 text-sm leading-relaxed whitespace-pre-line">
          {message}
        </div>
        
        <div className="flex justify-end mt-5 pt-4 border-t border-gray-200">
          <button 
            className={`${config.buttonColor} text-white px-5 py-2.5 rounded-md text-sm font-semibold border-none cursor-pointer transition-colors`}
            onClick={onClose}
          >
            Entendi
          </button>
        </div>
      </div>
    </div>
  )
}

export default AlertModal

