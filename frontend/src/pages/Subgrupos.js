import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTimes, FaSave } from 'react-icons/fa';
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

const SearchContainer = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  align-items: center;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  min-width: 300px;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }

  @media (max-width: 768px) {
    min-width: 200px;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  background: var(--white);

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const Table = styled.div`
  background: var(--white);
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
`;

const TableHeader = styled.div`
  background: #f8f9fa;
  padding: 16px 20px;
  border-bottom: 1px solid #e0e0e0;
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 1fr 120px;
  gap: 16px;
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
`;

const TableRow = styled.div`
  padding: 16px 20px;
  border-bottom: 1px solid #f0f0f0;
  display: grid;
  grid-template-columns: 1fr 2fr 2fr 1fr 120px;
  gap: 16px;
  align-items: center;
  transition: background-color 0.2s ease;

  &:hover {
    background-color: #f8f9fa;
  }

  &:last-child {
    border-bottom: none;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  background: ${props => props.$active ? 'var(--success-green)' : 'var(--gray)'};
  color: white;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 4px;

  &.edit {
    background: var(--blue);
    color: white;

    &:hover {
      background: #0056b3;
    }
  }

  &.delete {
    background: var(--error-red);
    color: white;

    &:hover {
      background: #c82333;
    }
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: var(--white);
  border-radius: 12px;
  padding: 24px;
  width: 90%;
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
  font-size: 20px;
  font-weight: 600;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 20px;
  color: var(--gray);
  cursor: pointer;
  padding: 4px;

  &:hover {
    color: var(--dark-gray);
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
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: var(--primary-green);
  }
`;

const FormButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
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
        <Button className="primary" onClick={handleCreate}>
          <FaPlus />
          Novo Subgrupo
        </Button>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar subgrupos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Select
          value={selectedGrupo}
          onChange={(e) => setSelectedGrupo(e.target.value)}
        >
          <option value="">Todos os grupos</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>
              {grupo.nome}
            </option>
          ))}
        </Select>
      </SearchContainer>

      {subgrupos.length === 0 ? (
        <EmptyState>Nenhum subgrupo encontrado</EmptyState>
      ) : (
        <Table>
          <TableHeader>
            <div>ID</div>
            <div>Nome</div>
            <div>Grupo</div>
            <div>Status</div>
            <div>Ações</div>
          </TableHeader>

          {filteredSubgrupos.map(subgrupo => (
            <TableRow key={subgrupo.id}>
              <div>{subgrupo.id}</div>
              <div>{subgrupo.nome}</div>
              <div>{subgrupo.grupo_nome}</div>
              <div>
                <StatusBadge $active={subgrupo.status === 1}>
                  {subgrupo.status === 1 ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </div>
              <ActionButtons>
                <ActionButton
                  className="edit"
                  onClick={() => handleEdit(subgrupo)}
                  disabled={saving}
                >
                  <FaEdit />
                  Editar
                </ActionButton>
                <ActionButton
                  className="delete"
                  onClick={() => handleDelete(subgrupo.id)}
                  disabled={saving}
                >
                  <FaTrash />
                  Excluir
                </ActionButton>
              </ActionButtons>
            </TableRow>
          ))}
        </Table>
      )}

      {showModal && (
        <Modal>
          <ModalContent>
            <ModalHeader>
              <ModalTitle>
                {editingSubgrupo ? 'Editar Subgrupo' : 'Novo Subgrupo'}
              </ModalTitle>
              <CloseButton onClick={() => setShowModal(false)}>
                <FaTimes />
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
                  <FaSave />
                  {saving ? 'Salvando...' : (editingSubgrupo ? 'Atualizar' : 'Criar')}
                </Button>
                <Button
                  type="button"
                  className="secondary"
                  onClick={() => setShowModal(false)}
                  disabled={saving}
                >
                  <FaTimes />
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