import React from 'react';
import { Pagination } from '../../ui';

/**
 * Seção de Navegação (Paginação)
 */
const NavegacaoUnidades = ({
  unidadesItemsPerPage,
  unidadesPage,
  unidadesTotalPages,
  unidadesTotalItems,
  loadingUnidades,
  onItemsPerPageChange,
  onPageChange
}) => {
  if (unidadesTotalPages <= 1) {
    return null;
  }

  return (
    <Pagination
      currentPage={unidadesPage}
      totalPages={unidadesTotalPages}
      totalItems={unidadesTotalItems}
      itemsPerPage={unidadesItemsPerPage}
      onPageChange={onPageChange}
      onItemsPerPageChange={onItemsPerPageChange}
    />
  );
};

export default NavegacaoUnidades;

