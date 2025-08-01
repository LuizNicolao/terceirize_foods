import React from 'react';
import styled from 'styled-components';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  padding: 16px;
`;

const PaginationButton = styled.button`
  background: ${props => props.$active ? 'var(--primary-green)' : 'var(--white)'};
  color: ${props => props.$active ? 'var(--white)' : 'var(--dark-gray)'};
  border: 2px solid ${props => props.$active ? 'var(--primary-green)' : '#e0e0e0'};
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: ${props => props.$disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.$disabled ? 0.5 : 1};

  &:hover:not(:disabled) {
    background: ${props => props.$active ? 'var(--dark-green)' : '#f5f5f5'};
    transform: translateY(-1px);
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: var(--dark-gray);
  font-size: 14px;
  margin: 0 16px;
`;

const Pagination = ({ 
  currentPage, 
  totalPages, 
  onPageChange, 
  totalItems, 
  itemsPerPage 
}) => {
  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const renderPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
    
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <PaginationButton
          key={i}
          $active={i === currentPage}
          onClick={() => onPageChange(i)}
        >
          {i}
        </PaginationButton>
      );
    }

    return pages;
  };

  if (totalPages <= 1) return null;

  return (
    <PaginationContainer>
      <PaginationButton
        $disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        title="Página anterior"
      >
        <FaChevronLeft />
      </PaginationButton>

      {renderPageNumbers()}

      <PaginationButton
        $disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        title="Próxima página"
      >
        <FaChevronRight />
      </PaginationButton>

      <PageInfo>
        Mostrando {startItem}-{endItem} de {totalItems} itens
      </PageInfo>
    </PaginationContainer>
  );
};

export default Pagination; 