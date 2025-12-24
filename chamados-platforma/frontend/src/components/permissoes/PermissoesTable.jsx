import React, { useState } from 'react';
import { FaEye, FaEdit, FaTrash, FaUserCog, FaSort, FaSortUp, FaSortDown, FaFilter } from 'react-icons/fa';
import { Button, Table } from '../ui';

const PermissoesTable = ({ 
  usuarios, 
  canView, 
  canEdit, 
  canDelete, 
  onUserSelect, 
  getStatusLabel
}) => {
  const [sortField, setSortField] = useState('nome');
  const [sortDirection, setSortDirection] = useState('asc');
  const [filters, setFilters] = useState({
    nivel: 'todos',
    tipo: 'todos',
    status: 'todos'
  });

  // Função para ordenar usuários
  const sortUsuarios = (usuarios) => {
    return [...usuarios].sort((a, b) => {
      let aValue = a[sortField] || '';
      let bValue = b[sortField] || '';
      
      if (sortField === 'nome' || sortField === 'email') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }
      
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  };

  // Função para filtrar usuários
  const filterUsuarios = (usuarios) => {
    return usuarios.filter(usuario => {
      if (filters.nivel !== 'todos' && usuario.nivel_de_acesso !== filters.nivel) return false;
      if (filters.tipo !== 'todos' && usuario.tipo_de_acesso !== filters.tipo) return false;
      if (filters.status !== 'todos' && usuario.status !== filters.status) return false;
      return true;
    });
  };

  // Função para lidar com ordenação
  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Função para lidar com filtros
  const handleFilter = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Função para limpar todos os filtros
  const clearAllFilters = () => {
    setFilters({
      nivel: 'todos',
      tipo: 'todos',
      status: 'todos'
    });
  };

  // Verificar se há filtros ativos
  const hasActiveFilters = Object.values(filters).some(value => value !== 'todos');

  // Aplicar ordenação e filtros
  const usuariosProcessados = filterUsuarios(sortUsuarios(usuarios));

  // Componente de cabeçalho clicável
  const SortableHeader = ({ field, children, className = "" }) => {
    const isActive = sortField === field;
    const getSortIcon = () => {
      if (!isActive) return <FaSort className="ml-1 text-gray-400" />;
      return sortDirection === 'asc' 
        ? <FaSortUp className="ml-1 text-green-600" />
        : <FaSortDown className="ml-1 text-green-600" />;
    };

    return (
      <th 
        className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors ${className}`}
        onClick={() => handleSort(field)}
      >
        <div className="flex items-center">
          {children}
          {getSortIcon()}
        </div>
      </th>
    );
  };

  // Componente de cabeçalho com filtro
  const FilterableHeader = ({ field, children, filterType, className = "" }) => {
    const getFilterOptions = () => {
      switch (filterType) {
        case 'nivel':
          return [
            { value: 'todos', label: 'Todos' },
            { value: 'I', label: 'I' },
            { value: 'II', label: 'II' },
            { value: 'III', label: 'III' }
          ];
        case 'tipo':
          return [
            { value: 'todos', label: 'Todos' },
            { value: 'administrador', label: 'Admin' },
            { value: 'coordenador', label: 'Coord' },
            { value: 'administrativo', label: 'Adm' },
            { value: 'gerente', label: 'Gerente' },
            { value: 'supervisor', label: 'Super' }
          ];
        case 'status':
          return [
            { value: 'todos', label: 'Todos' },
            { value: 'ativo', label: 'Ativo' },
            { value: 'inativo', label: 'Inativo' }
          ];
        default:
          return [];
      }
    };

    return (
      <th className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${className}`}>
        <div className="flex items-center justify-between">
          <span>{children}</span>
          <div className="relative group">
            <FaFilter className="ml-1 text-gray-400 cursor-pointer hover:text-gray-600" />
            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 min-w-[120px]">
              <select
                value={filters[field]}
                onChange={(e) => handleFilter(field, e.target.value)}
                className="w-full p-2 text-xs border-0 focus:ring-0 focus:outline-none"
              >
                {getFilterOptions().map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </th>
    );
  };

  if (usuarios.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 text-gray-500 text-sm sm:text-base">
        Nenhum usuário encontrado
      </div>
    );
  }

  return (
    <>
      {/* Indicador de filtros ativos */}
      {hasActiveFilters && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-blue-800">
              <FaFilter className="text-blue-600" />
              <span>Filtros ativos:</span>
              {filters.nivel !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Nível: {filters.nivel}
                </span>
              )}
              {filters.tipo !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Tipo: {filters.tipo}
                </span>
              )}
              {filters.status !== 'todos' && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Status: {filters.status}
                </span>
              )}
            </div>
            <button
              onClick={clearAllFilters}
              className="text-xs text-blue-600 hover:text-blue-800 underline"
            >
              Limpar filtros
            </button>
          </div>
          <div className="mt-2 text-xs text-blue-700">
            Mostrando {usuariosProcessados.length} de {usuarios.length} usuários
          </div>
        </div>
      )}

      {/* Versão Desktop - Tabela completa */}
      <div className="hidden xl:block bg-white rounded-lg shadow-sm overflow-hidden">
        <Table>
          <thead className="bg-gray-50">
            <tr>
              <SortableHeader field="id">ID</SortableHeader>
              <SortableHeader field="nome">Nome</SortableHeader>
              <SortableHeader field="email">Email</SortableHeader>
              <FilterableHeader field="nivel" filterType="nivel">Nível</FilterableHeader>
              <FilterableHeader field="tipo" filterType="tipo">Tipo</FilterableHeader>
              <FilterableHeader field="status" filterType="status">Status</FilterableHeader>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Permissões</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {usuariosProcessados.map((usuario) => (
              <tr key={usuario.id} className="hover:bg-gray-50">
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{usuario.id}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{usuario.nome}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{usuario.email}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{usuario.nivel_de_acesso || '-'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">{usuario.tipo_de_acesso || '-'}</td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                    usuario.status === 'ativo' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {getStatusLabel(usuario.status)}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {usuario.permissoes_count || 0} tela(s)
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-900">
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={() => onUserSelect(usuario.id)}
                      title="Gerenciar Permissões"
                    >
                      <FaUserCog className="text-purple-600 text-sm" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      {/* Versão Mobile e Tablet - Cards */}
      <div className="xl:hidden space-y-3">
        {usuariosProcessados.map((usuario) => (
          <div key={usuario.id} className="bg-white rounded-lg shadow-sm p-4 border">
            <div className="flex justify-between items-start mb-3">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{usuario.nome}</h3>
                <p className="text-gray-600 text-xs">ID: {usuario.id}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => onUserSelect(usuario.id)}
                  title="Gerenciar Permissões"
                  className="p-2"
                >
                  <FaUserCog className="text-purple-600 text-sm" />
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <span className="text-gray-500">Email:</span>
                <p className="font-medium truncate">{usuario.email}</p>
              </div>
              <div>
                <span className="text-gray-500">Nível:</span>
                <p className="font-medium">{usuario.nivel_de_acesso || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Tipo:</span>
                <p className="font-medium">{usuario.tipo_de_acesso || '-'}</p>
              </div>
              <div>
                <span className="text-gray-500">Status:</span>
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                  usuario.status === 'ativo' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}>
                  {getStatusLabel(usuario.status)}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-gray-500">Permissões:</span>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 ml-2">
                  {usuario.permissoes_count || 0} tela(s)
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
};

export default PermissoesTable;
