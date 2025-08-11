import React from 'react';
import { Table, LoadingSpinner } from '../../ui';
import AjudantesActions from './AjudantesActions';

const AjudantesTable = ({
  ajudantes,
  loading,
  canView,
  canEdit,
  canDelete,
  onView,
  onEdit,
  onDelete
}) => {
  const getStatusLabel = (status) => {
    const statusMap = {
      ativo: { label: 'Ativo', color: 'text-green-600 bg-green-100' },
      inativo: { label: 'Inativo', color: 'text-red-600 bg-red-100' },
      ferias: { label: 'Em Férias', color: 'text-yellow-600 bg-yellow-100' },
      licenca: { label: 'Em Licença', color: 'text-orange-600 bg-orange-100' }
    };
    return statusMap[status] || { label: status, color: 'text-gray-600 bg-gray-100' };
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const columns = [
    {
      key: 'nome',
      label: 'Nome',
      render: (ajudante) => (
        <div className="font-medium text-gray-900">{ajudante.nome}</div>
      )
    },
    {
      key: 'cpf',
      label: 'CPF',
      render: (ajudante) => (
        <div className="text-gray-600">{ajudante.cpf || '-'}</div>
      )
    },
    {
      key: 'telefone',
      label: 'Telefone',
      render: (ajudante) => (
        <div className="text-gray-600">{ajudante.telefone || '-'}</div>
      )
    },
    {
      key: 'email',
      label: 'Email',
      render: (ajudante) => (
        <div className="text-gray-600">{ajudante.email || '-'}</div>
      )
    },
    {
      key: 'filial_nome',
      label: 'Filial',
      render: (ajudante) => (
        <div className="text-gray-600">{ajudante.filial_nome || '-'}</div>
      )
    },
    {
      key: 'status',
      label: 'Status',
      render: (ajudante) => {
        const status = getStatusLabel(ajudante.status);
        return (
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        );
      }
    },
    {
      key: 'data_admissao',
      label: 'Data de Admissão',
      render: (ajudante) => (
        <div className="text-gray-600">{formatDate(ajudante.data_admissao)}</div>
      )
    },
    {
      key: 'actions',
      label: 'Ações',
      render: (ajudante) => (
        <AjudantesActions
          ajudante={ajudante}
          canView={canView}
          canEdit={canEdit}
          canDelete={canDelete}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      )
    }
  ];

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Table
      data={ajudantes}
      columns={columns}
      emptyMessage="Nenhum ajudante encontrado"
    />
  );
};

export default AjudantesTable;
