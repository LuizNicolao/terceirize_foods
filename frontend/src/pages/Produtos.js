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
  max-width: 700px;
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

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');

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
      const [produtosRes, fornecedoresRes, gruposRes, unidadesRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/fornecedores'),
        api.get('/grupos'),
        api.get('/unidades')
      ]);
      
      setProdutos(produtosRes.data);
      setFornecedores(fornecedoresRes.data);
      setGrupos(gruposRes.data);
      setUnidades(unidadesRes.data);
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

  // Abrir modal para adicionar produto
  const handleAddProduto = () => {
    setEditingProduto(null);
    reset();
    setShowModal(true);
  };

  // Abrir modal para editar produto
  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setValue('nome', produto.nome);
    setValue('codigo', produto.codigo);
    setValue('descricao', produto.descricao);
    setValue('preco_custo', produto.preco_custo);
    setValue('preco_venda', produto.preco_venda);
    setValue('estoque_minimo', produto.estoque_minimo);
    setValue('estoque_atual', produto.estoque_atual);
    setValue('fornecedor_id', produto.fornecedor_id);
    setValue('grupo_id', produto.grupo_id);
    setValue('unidade_id', produto.unidade_id);
    setValue('status', produto.status);
    setShowModal(true);
  };

  // Fechar modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProduto(null);
    reset();
  };

  // Salvar produto
  const onSubmit = async (data) => {
    try {
      if (editingProduto) {
        await api.put(`/produtos/${editingProduto.id}`, data);
        toast.success('Produto atualizado com sucesso!');
      } else {
        await api.post('/produtos', data);
        toast.success('Produto criado com sucesso!');
      }
      
      handleCloseModal();
      loadData();
    } catch (error) {
      console.error('Erro ao salvar produto:', error);
      toast.error(error.response?.data?.error || 'Erro ao salvar produto');
    }
  };

  // Excluir produto
  const handleDeleteProduto = async (produtoId) => {
    if (window.confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await api.delete(`/produtos/${produtoId}`);
        toast.success('Produto excluído com sucesso!');
        loadData();
      } catch (error) {
        console.error('Erro ao excluir produto:', error);
        toast.error('Erro ao excluir produto');
      }
    }
  };

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo?.includes(searchTerm) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || produto.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Formatar preço
  const formatPrice = (price) => {
    if (!price) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(price);
  };

  // Buscar nome do fornecedor
  const getFornecedorName = (fornecedorId) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    return fornecedor ? fornecedor.razao_social : 'N/A';
  };

  // Buscar nome do grupo
  const getGrupoName = (grupoId) => {
    const grupo = grupos.find(g => g.id === grupoId);
    return grupo ? grupo.nome : 'N/A';
  };

  // Buscar nome da unidade
  const getUnidadeName = (unidadeId) => {
    const unidade = unidades.find(u => u.id === unidadeId);
    return unidade ? unidade.nome : 'N/A';
  };

  if (loading) {
    return (
      <Container>
        <div>Carregando produtos...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>Produtos</Title>
        <AddButton onClick={handleAddProduto}>
          <FaPlus />
          Adicionar Produto
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
              <Th>Código</Th>
              <Th>Nome</Th>
              <Th>Preço Venda</Th>
              <Th>Estoque</Th>
              <Th>Fornecedor</Th>
              <Th>Grupo</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.length === 0 ? (
              <tr>
                <Td colSpan="8">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum produto encontrado com os filtros aplicados'
                      : 'Nenhum produto cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredProdutos.map((produto) => (
                <tr key={produto.id}>
                  <Td>{produto.codigo}</Td>
                  <Td>{produto.nome}</Td>
                  <Td>{formatPrice(produto.preco_venda)}</Td>
                  <Td>{produto.estoque_atual || 0}</Td>
                  <Td>{getFornecedorName(produto.fornecedor_id)}</Td>
                  <Td>{getGrupoName(produto.grupo_id)}</Td>
                  <Td>
                    <StatusBadge status={produto.status}>
                      {produto.status === 'ativo' ? 'Ativo' : 'Inativo'}
                    </StatusBadge>
                  </Td>
                  <Td>
                    <ActionButton
                      className="view"
                      title="Visualizar"
                      onClick={() => handleEditProduto(produto)}
                    >
                      <FaEye />
                    </ActionButton>
                    <ActionButton
                      className="edit"
                      title="Editar"
                      onClick={() => handleEditProduto(produto)}
                    >
                      <FaEdit />
                    </ActionButton>
                    <ActionButton
                      className="delete"
                      title="Excluir"
                      onClick={() => handleDeleteProduto(produto.id)}
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
                {editingProduto ? 'Editar Produto' : 'Adicionar Produto'}
              </ModalTitle>
              <CloseButton onClick={handleCloseModal}>&times;</CloseButton>
            </ModalHeader>

            <Form onSubmit={handleSubmit(onSubmit)}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Código *</Label>
                  <Input
                    type="text"
                    placeholder="Código do produto"
                    {...register('codigo', { required: 'Código é obrigatório' })}
                  />
                  {errors.codigo && <span style={{ color: 'red', fontSize: '12px' }}>{errors.codigo.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Nome *</Label>
                  <Input
                    type="text"
                    placeholder="Nome do produto"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                  />
                  {errors.nome && <span style={{ color: 'red', fontSize: '12px' }}>{errors.nome.message}</span>}
                </FormGroup>
              </div>

              <FormGroup>
                <Label>Descrição</Label>
                <TextArea
                  placeholder="Descrição detalhada do produto..."
                  {...register('descricao')}
                />
                {errors.descricao && <span style={{ color: 'red', fontSize: '12px' }}>{errors.descricao.message}</span>}
              </FormGroup>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Preço de Custo</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...register('preco_custo')}
                  />
                  {errors.preco_custo && <span style={{ color: 'red', fontSize: '12px' }}>{errors.preco_custo.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Preço de Venda *</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0,00"
                    {...register('preco_venda', { required: 'Preço de venda é obrigatório' })}
                  />
                  {errors.preco_venda && <span style={{ color: 'red', fontSize: '12px' }}>{errors.preco_venda.message}</span>}
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Estoque Mínimo</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register('estoque_minimo')}
                  />
                  {errors.estoque_minimo && <span style={{ color: 'red', fontSize: '12px' }}>{errors.estoque_minimo.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Estoque Atual</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    {...register('estoque_atual')}
                  />
                  {errors.estoque_atual && <span style={{ color: 'red', fontSize: '12px' }}>{errors.estoque_atual.message}</span>}
                </FormGroup>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                <FormGroup>
                  <Label>Fornecedor</Label>
                  <Select {...register('fornecedor_id')}>
                    <option value="">Selecione...</option>
                    {fornecedores.map(fornecedor => (
                      <option key={fornecedor.id} value={fornecedor.id}>
                        {fornecedor.razao_social}
                      </option>
                    ))}
                  </Select>
                  {errors.fornecedor_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.fornecedor_id.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Grupo</Label>
                  <Select {...register('grupo_id')}>
                    <option value="">Selecione...</option>
                    {grupos.map(grupo => (
                      <option key={grupo.id} value={grupo.id}>
                        {grupo.nome}
                      </option>
                    ))}
                  </Select>
                  {errors.grupo_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.grupo_id.message}</span>}
                </FormGroup>

                <FormGroup>
                  <Label>Unidade</Label>
                  <Select {...register('unidade_id')}>
                    <option value="">Selecione...</option>
                    {unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </Select>
                  {errors.unidade_id && <span style={{ color: 'red', fontSize: '12px' }}>{errors.unidade_id.message}</span>}
                </FormGroup>
              </div>

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
                  {editingProduto ? 'Atualizar' : 'Criar'}
                </Button>
              </ButtonGroup>
            </Form>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Produtos; 