import React from 'react';
import FoodsAlmoxarifadosTable from 'foods-frontend/src/components/almoxarifado/AlmoxarifadosTable';

/**
 * Componente adaptador para AlmoxarifadosTable
 * Converte props booleanas para funções conforme esperado pelo componente do Foods
 */
const AlmoxarifadosTable = (props) => {
  const { canView, canEdit, canDelete, onView, onEdit, onDelete, almoxarifados, ...otherProps } = props;

  // Converter para funções que retornam booleanos
  const canViewFn = (tela) => {
    if (typeof canView === 'function') {
      return canView(tela);
    }
    return canView;
  };
  
  const canEditFn = (tela) => {
    if (typeof canEdit === 'function') {
      return canEdit(tela);
    }
    return canEdit;
  };
  
  const canDeleteFn = (tela) => {
    if (typeof canDelete === 'function') {
      return canDelete(tela);
    }
    return canDelete;
  };

  // Wrapper para onView, onEdit, onDelete para converter ID em objeto
  const handleView = (id) => {
    if (onView && almoxarifados) {
      const almoxarifado = almoxarifados.find(a => a.id === id);
      if (almoxarifado) {
        onView(almoxarifado);
      }
    }
  };

  const handleEdit = (id) => {
    if (onEdit && almoxarifados) {
      const almoxarifado = almoxarifados.find(a => a.id === id);
      if (almoxarifado) {
        onEdit(almoxarifado);
      }
    }
  };

  const handleDelete = (id) => {
    if (onDelete && almoxarifados) {
      const almoxarifado = almoxarifados.find(a => a.id === id);
      if (almoxarifado) {
        onDelete(almoxarifado);
      }
    }
  };

  return (
    <FoodsAlmoxarifadosTable
      {...otherProps}
      almoxarifados={almoxarifados}
      canView={canViewFn}
      canEdit={canEditFn}
      canDelete={canDeleteFn}
      onView={handleView}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />
  );
};

export default AlmoxarifadosTable;

