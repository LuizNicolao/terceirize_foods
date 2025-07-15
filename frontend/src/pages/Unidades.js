import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaRulerCombined } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';

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
  background: ${props => props.status === 'ativo' ? 'var(--success-green)' : '#ffebee'};
  color: ${props => props.status === 'ativo' ? 'white' : 'var(--error-red)'};
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
  max-width: 500px;
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

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--gray);
  padding: 4px;

  &:hover {
    color: var(--error-red);
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 14px;
`;

const Input = styled.input`
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

const TextArea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;

  &.primary {
    background: var(--primary-green);
    color: var(--white);

    &:hover {
      background: var(--dark-green);
    }
  }

  &.secondary {
    background: var(--gray);
    color: var(--white);

    &:hover {
      background: var(--dark-gray);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray);
`;

const Unidades = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar unidades
  const loadUnidades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/unidades');
      setUnidades(response.data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnidades();
  }, []);

  // Abrir modal para adicionar unidade
  const handleAddUnidade = () => {
    setEditingUnidade(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para editar unidade
  const handleEditUnidade = (unidade) => {
    setEditingUnidade(unidade);
    setValue('nome', unidade.nome);
    setValue('abreviacao', unidade.abreviacao);
    setValue('descricao', unidade.descricao);
    setValue('status', unidade.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnidade(null);
    reset();
  };

  // Salvar unidade
  const onSubmit = async (data) => {
    try {
      if (editingUnidade) {
        await api.put(`/unidades/${editingUnidade.id}`, data);
        toast.success('Unidade atualizada com sucesso!');
      } else {
        await api.post('/unidades', data);
        toast.success('Unidade criada com sucesso!');
      }
      
      handleCloseModal();
      loadUnidades();
    } catch (error) {
      console.error('Erro ao salvar unidade:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar unidade');
    }
  };

  // Excluir unidade
  const handleDeleteUnidade = async (unidadeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      try {
        await api.delete(`/unidades/${unidadeId}`);
        toast.success('Unidade excluída com sucesso!');
        loadUnidades();
      } catch (error) {
        console.error('Erro ao excluir unidade:', error);
        toast.error('Erro ao excluir unidade');
      }
    }
  };

  // Filtrar unidades
  const filteredUnidades = unidades.filter(unidade => {
    const matchesSearch = unidade.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unidade.abreviacao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         unidade.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || unidade.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <Container>
        <div>Carregando unidades...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Unidades</Title>
        <AddButton onClick={handleAddUnidade}>
          <FaPlus />
          Adicionar Unidade
        </AddButton>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome, abreviação ou descrição..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="todos">Todos os status</option>
          <option value="ativo">Ativo</option>
          <option value="inativo">Inativo</option>
        </FilterSelect>
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Abreviação</Th>
              <Th>Descrição</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredUnidades.length === 0 ? (
              <tr>
                <Td colSpan="5">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhuma unidade encontrada com os filtros aplicados'
                      : 'Nenhuma unidade cadastrada'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredUnidades.map((unidade) => (
                <tr key={unidade.id}>
                  <Td>{unidade.nome}</Td>
                  <Td>{unidade.abreviacao}</Td>
                  <Td>{unidade.descricao}</Td>
                  <Td>
                    <StatusBadge status={unidade.status}>
                      {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleEditUnidade(unidade)}
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => handleEditUnidade(unidade)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDeleteUnidade(unidade.id)}
                    >
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </TableContainer>

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingUnidade ? 'Editar Unidade' : 'Adicionar Unidade'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome *</Label>
                <Input
                  type="text"
                  placeholder="Nome da unidade"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Abreviação *</Label>
                <Input
                  type="text"
                  placeholder="Ex: kg, l, un"
                  {...register('abreviacao', { required: 'Abreviação é obrigatória' })}
                />
                {errors.abreviacao && <span style={{ color: 'red', fontSize: '12px' }}>{errors.abreviacao.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <TextArea
                  placeholder="Descrição da unidade..."
                  {...register('descricao')}
                />
                {errors.descricao && <span style={{ color: 'red', fontSize: '12px' }}>{errors.descricao.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="">Selecione...</option>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '12px' }}>{errors.status.message}</span>}
              </FormGroup>

              <ButtonGroup>
                <Button type="button" className="secondary" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" className="primary">
                  {editingUnidade ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Unidades; 