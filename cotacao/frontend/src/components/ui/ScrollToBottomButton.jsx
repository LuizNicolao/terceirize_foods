import React, { useState, useEffect } from 'react';
import { FaArrowDown, FaArrowUp } from 'react-icons/fa';

const ScrollToBottomButton = ({ 
  containerRef, 
  threshold = 100, 
  className = '',
  position = 'fixed' 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Se não há containerRef, usar o scroll do body
      if (!containerRef?.current) {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight;
        const clientHeight = document.documentElement.clientHeight;
        
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
        const distanceFromTop = scrollTop;
        
        // Mostrar botão quando estiver a mais de threshold do final OU do início
        const shouldShow = distanceFromBottom > threshold || distanceFromTop > threshold;
        setIsVisible(shouldShow);
        
        // Determinar se está no final da página
        setIsAtBottom(distanceFromBottom <= threshold);
        return;
      }
      
      const container = containerRef.current;
      const scrollTop = container.scrollTop;
      const scrollHeight = container.scrollHeight;
      const clientHeight = container.clientHeight;
      
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      const distanceFromTop = scrollTop;
      
      // Mostrar botão quando estiver a mais de threshold do final OU do início
      const shouldShow = distanceFromBottom > threshold || distanceFromTop > threshold;
      setIsVisible(shouldShow);
      
      // Determinar se está no final do container
      setIsAtBottom(distanceFromBottom <= threshold);
    };

    const container = containerRef?.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      // Verificar estado inicial
      handleScroll();
      
      return () => container.removeEventListener('scroll', handleScroll);
    } else {
      // Se não há container, usar scroll do window
      window.addEventListener('scroll', handleScroll);
      // Verificar estado inicial
      handleScroll();
      
      return () => window.removeEventListener('scroll', handleScroll);
    }
  }, [containerRef, threshold]);

  const handleClick = () => {
    if (isAtBottom) {
      // Se está no final, ir para o topo
      if (containerRef?.current) {
        containerRef.current.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });
      }
    } else {
      // Se está no topo, ir para o final
      if (containerRef?.current) {
        containerRef.current.scrollTo({
          top: containerRef.current.scrollHeight,
          behavior: 'smooth'
        });
      } else {
        window.scrollTo({
          top: document.documentElement.scrollHeight,
          behavior: 'smooth'
        });
      }
    }
  };

  if (!isVisible) return null;

  const baseClasses = `scroll-to-bottom-btn ${position === 'fixed' ? 'fixed' : 'absolute'} bottom-4 right-4 z-50`;
  const buttonClasses = `${baseClasses} ${className}`;

  return (
    <button
      onClick={handleClick}
      className={buttonClasses}
      title={isAtBottom ? "Voltar ao início" : "Ir ao final"}
    >
      {isAtBottom ? (
        <FaArrowUp className="text-white" size={16} />
      ) : (
        <FaArrowDown className="text-white" size={16} />
      )}
    </button>
  );
};

export default ScrollToBottomButton;
