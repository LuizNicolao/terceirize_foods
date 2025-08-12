import React from 'react';
import { FaEye, FaEdit, FaTrash, FaHistory } from 'react-icons/fa';
import { Table, Pagination } from '../ui';
import CadastroFilterBar from '../CadastroFilterBar';

const AjudantesTable = ({
  ajudantes,
  filiais,
  canEdit,
  canDelete,
  canView,
  onEdit,
  onDelete,
  onView,
  onAuditView,
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  searchTerm,
  onSearch
}) => {
  const getStatusBadge = (status) => {
    const statusConfig = {
      ativo: { color: 'green', text: 'Ativo' },
      inativo: { color: 'red', text: 'Inativo' },
      ferias: { color: 'yellow', text: 'Em Férias' },
      licenca: { color: 'orange', text: 'Em Licença' }
    };

    const config = statusConfig[status] || { color: 'gray', text: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${config.color}-100 text-${config.color}-800`}>
        {config.text}
      </span>
    );
  };

  const getFilialName = (filialId) => {
    if (!filialId) return '-';
    const filial = filiais.find(f => f.id === filialId);
    return filial ? filial.filial : '-';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const TableActions = ({ ajudante }) => (
    <div className="flex items-center space-x-2">
      {canView && (
        <button
          onClick={() => onView(ajudante)}
          className="text-blue-600 hover:text-blue-800 transition-colors"
          title="Visualizar"
        >
          <FaEye size={16} />
        </button>
      )}
      
      {canEdit && (
        <button
          onClick={() => onEdit(ajudante)}
          className="text-green-600 hover:text-green-800 transition-colors"
          title="Editar"
        >
          <FaEdit size={16} />
        </button>
      )}
      
      {canDelete && (
        <button
          onClick={() => onDelete(ajudante.id)}
          className="text-red-600 hover:text-red-800 transition-colors"
          title="Excluir"
        >
          <FaTrash size={16} />
        </button>
      )}
      
      <button
        onClick={() => onAuditView('ajudantes', ajudante.id)}
        className="text-purple-600 hover:text-purple-800 transition-colors"
        title="Histórico"
      >
        <FaHistory size={16} />
      </button>
    </div>
  );

  const columns = [
    { key: 'nome', label: 'Nome', sortable: true },
    { key: 'cpf', label: 'CPF', sortable: true },
    { key: 'telefone', label: 'Telefone', sortable: false },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'filial', label: 'Filial', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
    { key: 'data_admissao', label: 'Data Admissão', sortable: true },
    { key: 'actions', label: 'Ações', sortable: false }
  ];

  const data = ajudantes.map(ajudante => ({
    ...ajudante,
    filial: getFilialName(ajudante.filial_id),
    data_admissao: formatDate(ajudante.data_admissao),
    actions: <TableActions ajudante={ajudante} />
  }));

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Filter Bar */}
      <CadastroFilterBar
        searchTerm={searchTerm}
        onSearch={onSearch}
        placeholder="Buscar ajudantes..."
      />

      {/* Desktop Table */}
      <div className="hidden md:block">
        <Table
          columns={columns}
          data={data}
          emptyMessage="Nenhum ajudante encontrado"
        />
      </div>

      {/* Mobile Cards */}
      <div className="md:hidden">
        <div className="p-4 space-y-4">
          {ajudantes.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              Nenhum ajudante encontrado
            </div>
          ) : (
            ajudantes.map((ajudante) => (
              <div key={ajudante.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900">{ajudante.nome}</h3>
                    <p className="text-sm text-gray-600">{ajudante.cpf || '-'}</p>
                  </div>
                  <TableActions ajudante={ajudante} />
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Telefone:</span>
                    <p className="text-gray-600">{ajudante.telefone || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Email:</span>
                    <p className="text-gray-600">{ajudante.email || '-'}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Filial:</span>
                    <p className="text-gray-600">{getFilialName(ajudante.filial_id)}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Status:</span>
                    <div className="mt-1">{getStatusBadge(ajudante.status)}</div>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-gray-700">Data Admissão:</span>
                    <p className="text-gray-600">{formatDate(ajudante.data_admissao)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={onPageChange}
        onItemsPerPageChange={onItemsPerPageChange}
      />
    </div>
  );
};

export default AjudantesTable;
