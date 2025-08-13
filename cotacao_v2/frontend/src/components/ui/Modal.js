/**
 * Componente Modal reutilizável
 * Implementa diferentes tamanhos e funcionalidades
 */

import React, { useEffect } from 'react';
import './Modal.css';

const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  size = 'medium',
  closeOnOverlayClick = true,
  showCloseButton = true,
  className = '',
  ...props 
}) => {
  // Fechar modal com ESC
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.keyCode === 27 && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  // Fechar modal ao clicar no overlay
  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal modal--${size} ${className}`} {...props}>
        {title && (
          <div className="modal__header">
            <h2 className="modal__title">{title}</h2>
            {showCloseButton && (
              <button
                className="modal__close-btn"
                onClick={onClose}
                aria-label="Fechar modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M18 6L6 18M6 6L18 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
        <div className="modal__body">
          {children}
        </div>
      </div>
    </div>
  );
};

// Subcomponentes do Modal
Modal.Header = ({ children, className = '', ...props }) => (
  <div className={`modal__header ${className}`} {...props}>
    {children}
  </div>
);

Modal.Body = ({ children, className = '', ...props }) => (
  <div className={`modal__body ${className}`} {...props}>
    {children}
  </div>
);

Modal.Footer = ({ children, className = '', ...props }) => (
  <div className={`modal__footer ${className}`} {...props}>
    {children}
  </div>
);

Modal.Title = ({ children, className = '', ...props }) => (
  <h2 className={`modal__title ${className}`} {...props}>
    {children}
  </h2>
);

export default Modal;
