import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { usePermissions } from '../contexts/PermissionsContext';

const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const Title = styled.h1`
  color: var(--dark-gray);
  font-size: 28px;
  font-weight: 700;
  margin: 0;
`;

const AddButton = styled.button`
  background: var(--primary-green);
  color: var(--white);
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
`;

const SearchInput = styled.input`
  flex: 1;
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;
  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const FilterSelect = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  cursor: pointer;
  transition: all 0.3s ease;
  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const TableContainer = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const Th = styled.th`
  background-color: #f5f5f5;
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
  border-bottom: 1px solid #e0e0e0;
`;

const Td = styled.td`
  padding: 16px 12px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 14px;
  color: var(--dark-gray);
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.status === 1 ? 'var(--success-green)' : '#ffebee'};
  color: ${props => props.status === 1 ? 'white' : 'var(--error-red)'};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  margin-right: 8px;
  color: var(--gray);
  &:hover {
    background-color: var(--light-gray);
  }
  &.edit {
    color: var(--blue);
  }
  &.delete {
    color: var(--error-red);
  }
  &.view {
    color: var(--primary-green);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 32px;
  width: 100%;
  max-width: 600px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ModalTitle = styled.h2`
  color: var(--dark-gray);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  font-weight: 600;
  color: var(--dark-gray);
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 14px;
  border: 1.5px solid #e0e0e0;
  border-radius: 6px;
  font-size: 15px;
  background: var(--white);
  transition: border 0.2s;
  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  border: none;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  &.primary {
    background: var(--primary-green);
    color: var(--white);
  }
  &.secondary {
    background: var(--gray);
    color: var(--white);
  }
`;

const Filiais = () => {
  const { canCreate, canEdit, canDelete } = usePermissions();
  const [filiais, setFiliais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFilial, setEditingFilial] = useState(null);
  const [isViewMode, setIsViewMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar filiais
  const loadFiliais = async () => {
    try {
      setLoading(true);
      const response = await api.get('/filiais');
      setFiliais(response.data);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      toast.error('Erro ao carregar filiais');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFiliais();
  }, []);

  // Abrir modal para adicionar filial
  const handleAddFilial = () => {
    setEditingFilial(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para visualizar filial
  const handleViewFilial = (filial) => {
    setEditingFilial(filial);
    Object.keys(filial).forEach(key => setValue(key, filial[key]));
    setIsViewMode(true);
    setShowModal(true);
  };

  // Abrir modal para editar filial
  const handleEditFilial = (filial) => {
    setEditingFilial(filial);
    Object.keys(filial).forEach(key => setValue(key, filial[key]));
    setIsViewMode(false);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingFilial(null);
    setIsViewMode(false);
    reset();
  };

  // Salvar filial
  const onSubmit = async (data) => {
    try {
      if (editingFilial) {
        await api.put(`/filiais/${editingFilial.id}`, data);
        toast.success('Filial atualizada com sucesso!');
      } else {
        await api.post('/filiais', data);
        toast.success('Filial criada com sucesso!');
      }
      handleCloseModal();
      loadFiliais();
    } catch (error) {
      console.error('Erro ao salvar filial:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar filial');
    }
  };

  // Excluir filial
  const handleDeleteFilial = async (filialId) => {
    if (window.confirm('Tem certeza que deseja excluir esta filial?')) {
      try {
        await api.delete(`/filiais/${filialId}`);
        toast.success('Filial excluída com sucesso!');
        loadFiliais();
      } catch (error) {
        console.error('Erro ao excluir filial:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir filial');
      }
    }
  };

  // Filtrar filiais
  const filteredFiliais = filiais.filter(filial => {
    const matchesSearch = filial.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filial.cidade?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         filial.estado?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || filial.status === parseInt(statusFilter);
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando filiais...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Filiais</Title>
        {canCreate('filiais') && (
          <AddButton onClick={handleAddFilial}>
            <FaPlus />
            Adicionar Filial
          </AddButton>
        )}
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome, cidade ou estado..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </FilterSelect>
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Cidade</Th>
              <Th>Estado</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredFiliais.length === 0 ? (
              <tr>
                <Td colSpan="5">Nenhuma filial encontrada</Td>
              </tr>
            ) : (
              filteredFiliais.map((filial) => (
                <tr key={filial.id}>
                  <Td>{filial.nome}</Td>
                  <Td>{filial.cidade}</Td>
                  <Td>{filial.estado}</Td>
                  <Td>
                    <StatusBadge status={filial.status}>
                      {filial.status === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleViewFilial(filial)}
                    >
                      <FaEye />
                    </ActionButton>
                    {canEdit('filiais') && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditFilial(filial)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {canDelete('filiais') && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteFilial(filial.id)}
                      >
                        <FaTrash />
                      </ActionButton>
                    )}
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>{isViewMode ? 'Visualizar Filial' : editingFilial ? 'Editar Filial' : 'Adicionar Filial'}</ModalTitle>
              <Button onClick={handleCloseModal} className="secondary">Fechar</Button>
            </ModalHeader>
            <form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome</Label>
                <Input
                  type="text"
                  disabled={isViewMode}
                  {...register('nome', { required: 'Nome é obrigatório', minLength: { value: 3, message: 'Mínimo 3 caracteres' } })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>
              <FormGroup>
                <Label>Cidade</Label>
                <Input
                  type="text"
                  disabled={isViewMode}
                  {...register('cidade')}
                />
              </FormGroup>
              <FormGroup>
                <Label>Estado</Label>
                <Input
                  type="text"
                  disabled={isViewMode}
                  maxLength={2}
                  {...register('estado')}
                />
              </FormGroup>
              <FormGroup>
                <Label>Status</Label>
                <FilterSelect disabled={isViewMode} {...register('status')}>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </FilterSelect>
              </FormGroup>
              {/* Campos extras podem ser adicionados aqui conforme necessário */}
              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  {isViewMode ? 'Fechar' : 'Cancelar'}
                </Button>
                {!isViewMode && (
                  <Button type="submit" className="primary">
                    {editingFilial ? 'Atualizar' : 'Criar'}
                  </Button>
                )}
              </ButtonGroup>
            </form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Filiais; 