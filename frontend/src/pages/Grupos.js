import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaLayerGroup } from 'react-icons/fa';
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



const Grupos = () => {
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGrupo, setEditingGrupo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar grupos
  const loadGrupos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
      toast.error('Erro ao carregar grupos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadGrupos();
  }, []);

  // Abrir modal para adicionar grupo
  const handleAddGrupo = () => {
    setEditingGrupo(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para editar grupo
  const handleEditGrupo = (grupo) => {
    setEditingGrupo(grupo);
    setValue('nome', grupo.nome);
    setValue('descricao', grupo.descricao);
    setValue('codigo', grupo.codigo);
    setValue('status', grupo.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingGrupo(null);
    reset();
  };

  // Salvar grupo
  const onSubmit = async (data) => {
    try {
      if (editingGrupo) {
        await api.put(`/grupos/${editingGrupo.id}`, data);
        toast.success('Grupo atualizado com sucesso!');
      } else {
        await api.post('/grupos', data);
        toast.success('Grupo criado com sucesso!');
      }
      
      handleCloseModal();
      loadGrupos();
    } catch (error) {
      console.error('Erro ao salvar grupo:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar grupo');
    }
  };

  // Excluir grupo
  const handleDeleteGrupo = async (grupoId) => {
    if (window.confirm('Tem certeza que deseja excluir este grupo?')) {
      try {
        await api.delete(`/grupos/${grupoId}`);
        toast.success('Grupo excluído com sucesso!');
        loadGrupos();
      } catch (error) {
        console.error('Erro ao excluir grupo:', error);
        toast.error('Erro ao excluir grupo');
      }
    }
  };

  // Filtrar grupos
  const filteredGrupos = grupos.filter(grupo => {
    const matchesSearch = grupo.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         grupo.codigo?.includes(searchTerm) ||
                         grupo.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || grupo.status === statusFilter;
    return matchesSearch && matchesStatus;
  });



  if (loading) {
    return (
      <Container>
        <div>Carregando grupos...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Grupos</Title>
        <AddButton onClick={handleAddGrupo}>
          <FaPlus />
          Adicionar Grupo
        </AddButton>
      </Header>



      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome, código ou descrição..."
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
              <Th>Código</Th>
              <Th>Descrição</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredGrupos.length === 0 ? (
              <tr>
                <Td colSpan="5">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum grupo encontrado com os filtros aplicados'
                      : 'Nenhum grupo cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredGrupos.map((grupo) => (
                <tr key={grupo.id}>
                  <Td>{grupo.nome}</Td>
                  <Td>{grupo.codigo}</Td>
                  <Td>{grupo.descricao}</Td>
                  <Td>
                    <StatusBadge status={grupo.status}>
                      {grupo.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleEditGrupo(grupo)}
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => handleEditGrupo(grupo)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDeleteGrupo(grupo.id)}
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
                {editingGrupo ? 'Editar Grupo' : 'Adicionar Grupo'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome do Grupo *</Label>
                <Input
                  type="text"
                  placeholder="Nome do grupo"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Código</Label>
                <Input
                  type="text"
                  placeholder="Código do grupo"
                  {...register('codigo')}
                />
                {errors.codigo && <span style={{ color: 'red', fontSize: '12px' }}>{errors.codigo.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <TextArea
                  placeholder="Descrição do grupo..."
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
                  {editingGrupo ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Grupos; 