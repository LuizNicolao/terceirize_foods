import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { api } from '../services/api';

const Container = styled.div`
  padding: 20px;
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 10px;
`;

const Title = styled.h1`
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  background: ${props => props.$primary ? '#007bff' : '#6c757d'};
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background 0.3s;

  &:hover {
    background: ${props => props.$primary ? '#0056b3' : '#545b62'};
  }

  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

const SearchContainer = styled.div`
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  flex: 1;
  min-width: 200px;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
`;

const Th = styled.th`
  background: #f8f9fa;
  padding: 12px;
  text-align: left;
  font-weight: 600;
  color: #333;
  border-bottom: 2px solid #dee2e6;
`;

const Td = styled.td`
  padding: 12px;
  border-bottom: 1px solid #dee2e6;
  color: #333;
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 500;
  background: ${props => props.$active ? '#d4edda' : '#f8d7da'};
  color: ${props => props.$active ? '#155724' : '#721c24'};
`;

const ActionButton = styled.button`
  background: ${props => {
    if (props.$edit) return '#ffc107';
    if (props.$delete) return '#dc3545';
    return '#6c757d';
  }};
  color: ${props => props.$edit ? '#212529' : 'white'};
  border: none;
  padding: 6px 12px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  margin-right: 5px;
  transition: background 0.3s;

  &:hover {
    background: ${props => {
      if (props.$edit) return '#e0a800';
      if (props.$delete) return '#c82333';
      return '#545b62';
    }};
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  padding: 30px;
  border-radius: 8px;
  width: 90%;
  max-width: 500px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  color: #333;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
`;

const Label = styled.label`
  font-weight: 500;
  color: #333;
`;

const Input = styled.input`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 5px;
`;

const SuccessMessage = styled.div`
  color: #155724;
  background: #d4edda;
  padding: 10px;
  border-radius: 5px;
  margin-bottom: 20px;
`;

const Pagination = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
`;

const PageButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #ddd;
  background: ${props => props.$active ? '#007bff' : 'white'};
  color: ${props => props.$active ? 'white' : '#333'};
  cursor: pointer;
  border-radius: 4px;
  
  &:hover {
    background: ${props => props.$active ? '#0056b3' : '#f8f9fa'};
  }
  
  &:disabled {
    background: #f8f9fa;
    color: #6c757d;
    cursor: not-allowed;
  }
`;

const LoadingSpinner = styled.div`
  text-align: center;
  padding: 20px;
  color: #666;
`;

const Unidades = () => {
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingUnidade, setEditingUnidade] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    sigla: '',
    status: 1
  });
  const [errors, setErrors] = useState({});
  const [successMessage, setSuccessMessage] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  useEffect(() => {
    fetchUnidades();
  }, [pagination.page, search]);

  const fetchUnidades = async () => {
    try {
      setLoading(true);
      const response = await api.get('/unidades', {
        params: {
          page: pagination.page,
          limit: pagination.limit,
          search
        }
      });
      setUnidades(response.data.unidades);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error('Erro ao buscar unidades:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    try {
      if (editingUnidade) {
        await api.put(`/unidades/${editingUnidade.id}`, formData);
        setSuccessMessage('Unidade atualizada com sucesso!');
      } else {
        await api.post('/unidades', formData);
        setSuccessMessage('Unidade criada com sucesso!');
      }

      setShowModal(false);
      setEditingUnidade(null);
      setFormData({ nome: '', sigla: '', status: 1 });
      fetchUnidades();

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error.response?.data?.error) {
        setErrors({ general: error.response.data.error });
      } else if (error.response?.data?.details) {
        const validationErrors = {};
        error.response.data.details.forEach(detail => {
          validationErrors[detail.path] = detail.msg;
        });
        setErrors(validationErrors);
      } else {
        setErrors({ general: 'Erro ao salvar unidade' });
      }
    }
  };

  const handleEdit = (unidade) => {
    setEditingUnidade(unidade);
    setFormData({
      nome: unidade.nome,
      sigla: unidade.sigla,
      status: unidade.status
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta unidade?')) {
      return;
    }

    try {
      await api.delete(`/unidades/${id}`);
      setSuccessMessage('Unidade excluída com sucesso!');
      fetchUnidades();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      if (error.response?.data?.error) {
        alert(error.response.data.error);
      } else {
        alert('Erro ao excluir unidade');
      }
    }
  };

  const handleNew = () => {
    setEditingUnidade(null);
    setFormData({ nome: '', sigla: '', status: 1 });
    setErrors({});
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingUnidade(null);
    setFormData({ nome: '', sigla: '', status: 1 });
    setErrors({});
  };

  const handlePageChange = (page) => {
    setPagination(prev => ({ ...prev, page }));
  };

  if (loading && unidades.length === 0) {
    return <LoadingSpinner>Carregando...</LoadingSpinner>;
  }

  return (
    <Container>
      <Header>
        <Title>Gerenciar Unidades</Title>
        <Button $primary onClick={handleNew}>
          Nova Unidade
        </Button>
      </Header>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}

      <SearchContainer>
        <SearchInput
          type="text"
          placeholder="Buscar por nome ou sigla..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </SearchContainer>

      <Table>
        <thead>
          <tr>
            <Th>Nome</Th>
            <Th>Sigla</Th>
            <Th>Status</Th>
            <Th>Ações</Th>
          </tr>
        </thead>
        <tbody>
          {unidades.map((unidade) => (
            <tr key={unidade.id}>
              <Td>{unidade.nome}</Td>
              <Td>{unidade.sigla}</Td>
              <Td>
                <StatusBadge $active={unidade.status === 1}>
                  {unidade.status === 1 ? 'Ativo' : 'Inativo'}
                </StatusBadge>
              </Td>
              <Td>
                <ActionButton $edit onClick={() => handleEdit(unidade)}>
                  Editar
                </ActionButton>
                <ActionButton $delete onClick={() => handleDelete(unidade.id)}>
                  Excluir
                </ActionButton>
              </Td>
            </tr>
          ))}
        </tbody>
      </Table>

      {unidades.length === 0 && !loading && (
        <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
          Nenhuma unidade encontrada
        </div>
      )}

      {pagination.totalPages > 1 && (
        <Pagination>
          <PageButton
            onClick={() => handlePageChange(pagination.page - 1)}
            disabled={pagination.page === 1}
          >
            Anterior
          </PageButton>
          
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <PageButton
              key={page}
              $active={page === pagination.page}
              onClick={() => handlePageChange(page)}
            >
              {page}
            </PageButton>
          ))}
          
          <PageButton
            onClick={() => handlePageChange(pagination.page + 1)}
            disabled={pagination.page === pagination.totalPages}
          >
            Próxima
          </PageButton>
        </Pagination>
      )}

      {showModal && (
        <Modal onClick={handleCloseModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalHeader>
              <ModalTitle>
                {editingUnidade ? 'Editar Unidade' : 'Nova Unidade'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit}>
              {errors.general && (
                <ErrorMessage>{errors.general}</ErrorMessage>
              )}

              <FormGroup>
                <Label>Nome *</Label>
                <Input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  placeholder="Digite o nome da unidade"
                  required
                />
                {errors.nome && <ErrorMessage>{errors.nome}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Sigla *</Label>
                <Input
                  type="text"
                  value={formData.sigla}
                  onChange={(e) => setFormData({ ...formData, sigla: e.target.value })}
                  placeholder="Ex: KG, L, UN"
                  required
                />
                {errors.sigla && <ErrorMessage>{errors.sigla}</ErrorMessage>}
              </FormGroup>

              <FormGroup>
                <Label>Status</Label>
                <Select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: parseInt(e.target.value) })}
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </Select>
                {errors.status && <ErrorMessage>{errors.status}</ErrorMessage>}
              </FormGroup>

              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <Button type="button" onClick={handleCloseModal}>
                  Cancelar
                </Button>
                <Button type="submit" $primary>
                  {editingUnidade ? 'Atualizar' : 'Criar'}
                </Button>
              </div>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Unidades; 