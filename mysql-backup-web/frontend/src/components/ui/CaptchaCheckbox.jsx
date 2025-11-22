import React, { useState } from 'react'
import { FaCheck, FaShieldAlt } from 'react-icons/fa'

const CaptchaCheckbox = ({ 
  isChecked, 
  onChange, 
  disabled = false, 
  error = null,
  className = "",
  required = true
}) => {
  const [hasInteracted, setHasInteracted] = useState(false)

  const handleClick = () => {
    if (!disabled) {
      setHasInteracted(true)
      onChange(!isChecked)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleClick()
    }
  }

  const showError = error && hasInteracted

  return (
    <div className={`${className}`}>
      <div className="flex items-start space-x-3">
        <div
          role="checkbox"
          aria-checked={isChecked}
          tabIndex={disabled ? -1 : 0}
          onClick={handleClick}
          onKeyDown={handleKeyDown}
          className={`
            relative w-5 h-5 border-2 rounded cursor-pointer transition-colors flex items-center justify-center
            ${disabled 
              ? 'bg-gray-100 border-gray-300 cursor-not-allowed' 
              : isChecked 
                ? 'bg-green-600 border-green-600' 
                : showError
                  ? 'bg-white border-red-500'
                  : 'bg-white border-gray-400 hover:border-green-500'
            }
            ${showError ? 'ring-2 ring-red-200' : ''}
          `}
        >
          {isChecked && (
            <FaCheck 
              className="text-white text-xs" 
              style={{ filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.2))' }}
            />
          )}
        </div>
        
        <div className="flex-1">
          <label 
            className={`
              text-sm cursor-pointer select-none
              ${disabled ? 'text-gray-400 cursor-not-allowed' : 'text-gray-700'}
            `}
            onClick={handleClick}
          >
            <div className="flex items-center space-x-2">
              <FaShieldAlt className="text-green-600 text-sm" />
              <span>
                Não sou um robô
                {required && <span className="text-red-500 ml-1">*</span>}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Marque esta caixa para confirmar que você é humano
            </p>
          </label>
        </div>
      </div>
      
      {showError && (
        <p className="text-sm text-red-600 mt-2 flex items-center">
          <span className="mr-1">⚠</span>
          {error}
        </p>
      )}
    </div>
  )
}

export default CaptchaCheckbox

