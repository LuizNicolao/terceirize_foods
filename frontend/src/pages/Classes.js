import React, { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaEye, FaHistory } from 'react-icons/fa';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import toast from 'react-hot-toast';
import { PermissionsContext } from '../contexts/PermissionsContext';

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
  padding: 20px;
  width: 100%;
  max-width: 600px;
  max-height: 98vh;
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
  gap: 6px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 13px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: var(--white);
  transition: border 0.2s;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: var(--white);
  transition: border 0.2s;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 1.5px solid #e0e0e0;
  border-radius: 8px;
  font-size: 15px;
  background: var(--white);
  min-height: 60px;
  resize: vertical;
  transition: border 0.2s;

  &:focus {
    border-color: var(--primary-green);
    outline: none;
  }
`;

const Button = styled.button`
  background: var(--primary-green);
  color: white;
  padding: 12px 20px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 10px;

  &:hover {
    background: var(--dark-green);
    transform: translateY(-1px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: var(--gray);
`;

const Classes = () => {
  const { permissions } = useContext(PermissionsContext) || {};
  const podeCriar = permissions?.classes?.criar;
  const podeEditar = permissions?.classes?.editar;
  const podeExcluir = permissions?.classes?.excluir;
  const podeVisualizar = permissions?.classes?.visualizar;

  const [classes, setClasses] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingClasse, setEditingClasse] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [subgrupoFilter, setSubgrupoFilter] = useState('todos');
  const [showAuditModal, setShowAuditModal] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue
  } = useForm();

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const [classesRes, subgruposRes] = await Promise.all([
        api.get('/classes'),
        api.get('/subgrupos')
      ]);
      setClasses(classesRes.data);
      setSubgrupos(subgruposRes.data);
      // Montar lista de grupos únicos
      const gruposUnicos = [];
      subgruposRes.data.forEach(sg => {
        if (!gruposUnicos.find(g => g.id === sg.grupo_id)) {
          gruposUnicos.push({ id: sg.grupo_id, nome: sg.grupo_nome });
        }
      });
      setGrupos(gruposUnicos);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast.error('Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Abrir modal para adicionar classe
  const handleAddClasse = () => {
    setEditingClasse(null);
    reset();
    setValue('status', '1');
    setShowModal(true);
  };

  // Abrir modal para editar classe
  const handleEditClasse = (classe) => {
    setEditingClasse(classe);
    setValue('nome', classe.nome);
    setValue('subgrupo_id', classe.subgrupo_id);
    setValue('descricao', classe.descricao);
    setValue('status', classe.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingClasse(null);
    reset();
  };

  // Salvar classe
  const onSubmit = async (data) => {
    try {
      if (editingClasse) {
        await api.put(`/classes/${editingClasse.id}`, data);
        toast.success('Classe atualizada com sucesso!');
      } else {
        await api.post('/classes', data);
        toast.success('Classe criada com sucesso!');
      }
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar classe:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar classe');
    }
  };

  // Excluir classe
  const handleDeleteClasse = async (classeId) => {
    if (window.confirm('Tem certeza que deseja excluir esta classe?')) {
      try {
        await api.delete(`/classes/${classeId}`);
        toast.success('Classe excluída com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir classe:', error);
        toast.error(error.response?.data?.error || 'Erro ao excluir classe');
      }
    }
  };

  // Filtros
  const filteredClasses = classes.filter(classe => {
    const matchesSearch = classe.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         classe.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || classe.status === parseInt(statusFilter);
    const matchesSubgrupo = subgrupoFilter === 'todos' || classe.subgrupo_id === parseInt(subgrupoFilter);
    return matchesSearch && matchesStatus && matchesSubgrupo;
  });

  // Auditoria (apenas visualização)
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
  };
  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
  };

  if (loading) {
    return (
      <Container>
        <div>Carregando classes...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Classes</Title>
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaHistory />
            Auditoria
          </AddButton>
          {podeCriar && (
            <AddButton onClick={handleAddClasse}>
              <FaPlus />
              Nova Classe
            </AddButton>
          )}
        </div>
      </Header>

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome ou descrição..."
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
        <FilterSelect
          value={subgrupoFilter}
          onChange={(e) => setSubgrupoFilter(e.target.value)}
        >
          <option value="todos">Todos os subgrupos</option>
          {subgrupos.map(sg => (
            <option key={sg.id} value={sg.id}>{sg.nome}</option>
          ))}
        </FilterSelect>
      </SearchContainer>

      <TableContainer>
        <Table>
          <thead>
            <tr>
              <Th>Nome</Th>
              <Th>Subgrupo</Th>
              <Th>Grupo</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredClasses.length === 0 ? (
              <tr>
                <Td colSpan="5">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' || subgrupoFilter !== 'todos'
                      ? 'Nenhuma classe encontrada com os filtros aplicados'
                      : 'Nenhuma classe cadastrada'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredClasses.map((classe) => (
                <tr key={classe.id}>
                  <Td>{classe.nome}</Td>
                  <Td>{classe.subgrupo_nome}</Td>
                  <Td>{classe.grupo_nome}</Td>
                  <Td>
                    <StatusBadge status={classe.status}>
                      {classe.status === 1 ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    {podeVisualizar && (
                      <ActionButton
                        className="view"
                        title="Visualizar"
                        onClick={() => handleEditClasse(classe)}
                      >
                        <FaEye />
                      </ActionButton>
                    )}
                    {podeEditar && (
                      <ActionButton
                        className="edit"
                        title="Editar"
                        onClick={() => handleEditClasse(classe)}
                      >
                        <FaEdit />
                      </ActionButton>
                    )}
                    {podeExcluir && (
                      <ActionButton
                        className="delete"
                        title="Excluir"
                        onClick={() => handleDeleteClasse(classe.id)}
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
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingClasse ? 'Editar Classe' : 'Nova Classe'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <FormGroup>
                <Label>Nome da Classe *</Label>
                <Input
                  type="text"
                  placeholder="Ex: BOVINO"
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />
                {errors.nome && <span style={{ color: 'red', fontSize: '11px' }}>{errors.nome.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Subgrupo *</Label>
                <Select {...register('subgrupo_id', { required: 'Subgrupo é obrigatório' })}>
                  <option value="">Selecione...</option>
                  {subgrupos.map(sg => (
                    <option key={sg.id} value={sg.id}>{sg.nome}</option>
                  ))}
                </Select>
                {errors.subgrupo_id && <span style={{ color: 'red', fontSize: '11px' }}>{errors.subgrupo_id.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Descrição</Label>
                <TextArea
                  placeholder="Descrição detalhada da classe"
                  {...register('descricao')}
                />
                {errors.descricao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.descricao.message}</span>}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select {...register('status', { required: 'Status é obrigatório' })}>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Select>
                {errors.status && <span style={{ color: 'red', fontSize: '11px' }}>{errors.status.message}</span>}
              </FormGroup>

              <Button type="submit">
                {editingClasse ? 'Atualizar Classe' : 'Cadastrar Classe'}
              </Button>
            </Form>
          </ModalContent>
        </Modal>
      )}

      {/* Modal de Auditoria (apenas visualização, padrão do sistema) */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>Auditoria - Classes</ModalTitle>
              <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
            </ModalHeader>
            <div style={{ padding: 16, color: '#888' }}>
              <p>Funcionalidade de auditoria para Classes. (Padrão do sistema)</p>
              <p>Consulte o backend para detalhes de logs e alterações.</p>
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Classes; 