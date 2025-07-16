import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaBox } from 'react-icons/fa';
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
  gap: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-weight: 600;
  color: var(--dark-gray);
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

const Select = styled.select`
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

const FormButtons = styled.div`
  display: flex;
  gap: 12px;
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
  display: flex;
  align-items: center;
  gap: 8px;

  &.primary {
    background: var(--primary-green);
    color: var(--white);

    &:hover {
      background: var(--dark-green);
    }
  }

  &.secondary {
    background: var(--light-gray);
    color: var(--dark-gray);

    &:hover {
      background: #d0d0d0;
    }
  }

  &.danger {
    background: var(--error-red);
    color: var(--white);

    &:hover {
      background: #c82333;
    }
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  color: var(--gray);
  font-size: 16px;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: var(--gray);
  font-size: 16px;
`;

const Subgrupos = () => {
  const [subgrupos, setSubgrupos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingSubgrupo, setEditingSubgrupo] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGrupo, setSelectedGrupo] = useState('');

  useEffect(() => {
    loadSubgrupos();
    loadGrupos();
  }, []);

  const loadSubgrupos = async () => {
    try {
      setLoading(true);
      const response = await api.get('/subgrupos');
      setSubgrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar subgrupos:', error);
      toast.error('Erro ao carregar subgrupos');
    } finally {
      setLoading(false);
    }
  };

  const loadGrupos = async () => {
    try {
      const response = await api.get('/grupos');
      setGrupos(response.data);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    }
  };

  const handleCreate = () => {
    setEditingSubgrupo(null);
    setShowModal(true);
  };

  const handleEdit = (subgrupo) => {
    setEditingSubgrupo(subgrupo);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir este subgrupo?')) {
      return;
    }

    try {
      setSaving(true);
      await api.delete(`/subgrupos/${id}`);
      toast.success('Subgrupo excluído com sucesso!');
      loadSubgrupos();
    } catch (error) {
      console.error('Erro ao excluir subgrupo:', error);
      toast.error(error.response?.data?.error || 'Erro ao excluir subgrupo');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
      nome: formData.get('nome'),
      grupo_id: parseInt(formData.get('grupo_id')),
      status: formData.get('status') === 'ativo' ? 1 : 0
    };

    try {
      setSaving(true);
      
      if (editingSubgrupo) {
        await api.put(`/subgrupos/${editingSubgrupo.id}`, data);
        toast.success('Subgrupo atualizado com sucesso!');
      } else {
        await api.post('/subgrupos', data);
        toast.success('Subgrupo criado com sucesso!');
      }
      
      setShowModal(false);
      loadSubgrupos();
    } catch (error) {
      console.error('Erro ao salvar subgrupo:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar subgrupo');
    } finally {
      setSaving(false);
    }
  };

  const filteredSubgrupos = subgrupos.filter(subgrupo => {
    const matchesSearch = subgrupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subgrupo.grupo_nome?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGrupo = !selectedGrupo || subgrupo.grupo_id === parseInt(selectedGrupo);
    return matchesSearch && matchesGrupo;
  });

  if (loading) {
    return (
      <Container>
        <LoadingSpinner>Carregando subgrupos...</LoadingSpinner>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Subgrupos</Title>
        <AddButton onClick={handleCreate}>
          <FaPlus />
          Novo Subgrupo
        </AddButton>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar subgrupos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <FilterSelect
          value={selectedGrupo}
          onChange={(e) => setSelectedGrupo(e.target.value)}
        >
          <option value="">Todos os grupos</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nome}
            </option>
          ))}
        </FilterSelect>
      </SearchContainer>

      {subgrupos.length === 0 ? (
        <EmptyState>Nenhum subgrupo encontrado</EmptyState>
      ) : (
        <TableContainer>
          <Table>
            <thead>
              <tr>
                <Th>ID</Th>
                <Th>Nome</Th>
                <Th>Grupo</Th>
                <Th>Status</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredSubgrupos.map(subgrupo => (
                <tr key={subgrupo.id}>
                  <Td>{subgrupo.id}</Td>
                  <Td>{subgrupo.nome}</Td>
                  <Td>{subgrupo.grupo_nome}</Td>
                  <Td>
                    <StatusBadge status={subgrupo.status === 1 ? 'ativo' : 'inativo'}>
                      {subgrupo.status === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="edit"
                      onClick={() => handleEdit(subgrupo)}
                      disabled={saving}
                      title="Editar"
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      onClick={() => handleDelete(subgrupo.id)}
                      disabled={saving}
                      title="Excluir"
                    >
                      <FaTrash />
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        </TableContainer>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingSubgrupo ? 'Editar Subgrupo' : 'Novo Subgrupo'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                ×
              </CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              <FormGroup>
                <Label htmlFor="nome">Nome do Subgrupo</Label>
                <Input
                  id="nome"
                  name="nome"
                  type="text"
                  defaultValue={editingSubgrupo?.nome || ''}
                  required
                  minLength={3}
                />
              </FormGroup>

              <FormGroup>
                <Label htmlFor="grupo_id">Grupo</Label>
                <Select
                  id="grupo_id"
                  name="grupo_id"
                  defaultValue={editingSubgrupo?.grupo_id || ''}
                  required
                >
                  <option value="">Selecione um grupo</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </Select>
              </FormGroup>

              <FormGroup>
                <Label htmlFor="status">Status</Label>
                <Select
                  id="status"
                  name="status"
                  defaultValue={editingSubgrupo?.status === 1 ? 'ativo' : 'inativo'}
                  required
                >
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </Select>
              </FormGroup>

              <FormButtons>
                <Button
                  type="submit"
                  className="primary"
                  disabled={saving}
                >
                  <FaPlus />
                  {saving ? 'Salvando...' : (editingSubgrupo ? 'Atualizar' : 'Criar')}
                </Button>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
              </FormButtons>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Subgrupos; 