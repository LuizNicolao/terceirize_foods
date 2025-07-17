import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaFilter, FaEye, FaHistory, FaQuestionCircle, FaFileExcel, FaFilePdf } from 'react-icons/fa';
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
  padding: 24px;
  width: 100%;
  max-width: 1000px;
  max-height: 95vh;
  overflow-y: auto;
  
  /* Personalizar scrollbar */
  &::-webkit-scrollbar {
    width: 8px;
  }
  
  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primary-green);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--dark-green);
  }
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
  gap: 6px;
`;

const Label = styled.label`
  color: var(--dark-gray);
  font-weight: 600;
  font-size: 13px;
`;

const Input = styled.input`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const TextArea = styled.textarea`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: all 0.3s ease;

  &:focus {
    border-color: var(--primary-green);
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 2px solid #e0e0e0;
  border-radius: 6px;
  font-size: 14px;
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
  margin-top: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  border-radius: 6px;
  font-size: 13px;
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

const PriceDisplay = styled.span`
  font-weight: 600;
  color: var(--primary-green);
`;

const Produtos = () => {
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [subgrupos, setSubgrupos] = useState([]);
  const [classes, setClasses] = useState([]);
  const [marcas, setMarcas] = useState([]);
  const [unidades, setUnidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduto, setEditingProduto] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('todos');
  const [grupoFilter, setGrupoFilter] = useState('todos');
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditLogs, setAuditLogs] = useState([]);
  const [auditLoading, setAuditLoading] = useState(false);
  const [auditFilters, setAuditFilters] = useState({
    dataInicio: '',
    dataFim: '',
    acao: '',
    usuario_id: '',
    periodo: ''
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    watch
  } = useForm();

  // Carregar dados
  const loadData = async () => {
    try {
      setLoading(true);
      const [produtosRes, fornecedoresRes, gruposRes, subgruposRes, classesRes, marcasRes, unidadesRes] = await Promise.all([
        api.get('/produtos'),
        api.get('/fornecedores'),
        api.get('/grupos'),
        api.get('/subgrupos'),
        api.get('/classes'),
        api.get('/marcas'),
        api.get('/unidades')
      ]);

      setProdutos(produtosRes.data);
      setFornecedores(fornecedoresRes.data);
      setGrupos(gruposRes.data);
      setSubgrupos(subgruposRes.data);
      setClasses(classesRes.data);
      setMarcas(marcasRes.data);
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

  // Carregar logs de auditoria
  const loadAuditLogs = async () => {
    try {
      setAuditLoading(true);
      
      const params = new URLSearchParams();
      
      // Aplicar filtro de período se selecionado
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        // Usar filtros manuais se período não estiver selecionado
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      const response = await api.get(`/auditoria?${params.toString()}`);
      setAuditLogs(response.data.logs || []);
    } catch (error) {
      console.error('Erro ao carregar logs de auditoria:', error);
      toast.error('Erro ao carregar logs de auditoria');
    } finally {
      setAuditLoading(false);
    }
  };

  // Abrir modal de auditoria
  const handleOpenAuditModal = () => {
    setShowAuditModal(true);
    loadAuditLogs();
  };

  // Fechar modal de auditoria
  const handleCloseAuditModal = () => {
    setShowAuditModal(false);
    setAuditLogs([]);
    setAuditFilters({
      dataInicio: '',
      dataFim: '',
      acao: '',
      usuario_id: '',
      periodo: ''
    });
  };

  // Aplicar filtros de auditoria
  const handleApplyAuditFilters = () => {
    loadAuditLogs();
  };

  // Exportar auditoria para XLSX
  const handleExportXLSX = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/xlsx?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_produtos_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar XLSX:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Exportar auditoria para PDF
  const handleExportPDF = async () => {
    try {
      const params = new URLSearchParams();
      
      // Aplicar filtros atuais
      if (auditFilters.periodo) {
        const hoje = new Date();
        let dataInicio = new Date();
        
        switch (auditFilters.periodo) {
          case '7dias':
            dataInicio.setDate(hoje.getDate() - 7);
            break;
          case '30dias':
            dataInicio.setDate(hoje.getDate() - 30);
            break;
          case '90dias':
            dataInicio.setDate(hoje.getDate() - 90);
            break;
          default:
            break;
        }
        
        if (auditFilters.periodo !== 'todos') {
          params.append('data_inicio', dataInicio.toISOString().split('T')[0]);
        }
      } else {
        if (auditFilters.dataInicio) {
          params.append('data_inicio', auditFilters.dataInicio);
        }
        if (auditFilters.dataFim) {
          params.append('data_fim', auditFilters.dataFim);
        }
      }
      
      if (auditFilters.acao) {
        params.append('acao', auditFilters.acao);
      }
      if (auditFilters.usuario_id) {
        params.append('usuario_id', auditFilters.usuario_id);
      }
      
      // Adicionar filtro específico para produtos
      params.append('recurso', 'produtos');
      
      // Fazer download do arquivo
      const response = await api.get(`/auditoria/export/pdf?${params.toString()}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `auditoria_produtos_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar PDF:', error);
      toast.error('Erro ao exportar relatório');
    }
  };

  // Formatar data
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  // Obter label da ação
  const getActionLabel = (action) => {
    const actions = {
      'create': 'Criar',
      'update': 'Editar',
      'delete': 'Excluir',
      'login': 'Login',
      'logout': 'Logout',
      'view': 'Visualizar'
    };
    return actions[action] || action;
  };

  // Obter label do campo
  const getFieldLabel = (field) => {
    const labels = {
      'nome': 'Nome',
      'descricao': 'Descrição',
      'codigo_barras': 'Código de Barras',
      'preco_custo': 'Preço de Custo',
      'preco_venda': 'Preço de Venda',
      'estoque_atual': 'Estoque Atual',
      'estoque_minimo': 'Estoque Mínimo',
      'id_fornecedor': 'Fornecedor',
      'grupo_id': 'Grupo',
      'unidade_id': 'Unidade',
      'status': 'Status'
    };
    return labels[field] || field;
  };

  // Formatar valor do campo
  const formatFieldValue = (field, value) => {
    if (value === null || value === undefined || value === '') {
      return 'Não informado';
    }

    switch (field) {
      case 'preco_custo':
      case 'preco_venda':
        return formatPrice(value);
      case 'estoque_atual':
      case 'estoque_minimo':
        return value.toString();
      case 'id_fornecedor':
        return getFornecedorName(value);
      case 'grupo_id':
        return getGrupoName(value);
      case 'unidade_id':
        return getUnidadeName(value);
      case 'status':
        return value === 1 ? 'Ativo' : 'Inativo';
      default:
        return value;
    }
  };

  // Abrir modal para adicionar produto
  const handleAddProduto = () => {
    setEditingProduto(null);
    reset();
    setValue('status', '1'); // Define status como "Ativo" por padrão
    setShowModal(true);
  };

  // Abrir modal para editar produto
  const handleEditProduto = (produto) => {
    setEditingProduto(produto);
    setValue('codigo_produto', produto.codigo_produto);
    setValue('nome', produto.nome);
    setValue('descricao', produto.descricao);
    setValue('codigo_barras', produto.codigo_barras);
    setValue('referencia', produto.referencia);
    setValue('referencia_externa', produto.referencia_externa);
    setValue('referencia_mercado', produto.referencia_mercado);
    setValue('unidade_id', produto.unidade_id);
    setValue('quantidade', produto.quantidade);
    setValue('grupo_id', produto.grupo_id);
    setValue('subgrupo_id', produto.subgrupo_id);
    setValue('classe_id', produto.classe_id);
    setValue('marca_id', produto.marca_id);
    setValue('agrupamento_n3', produto.agrupamento_n3);
    setValue('agrupamento_n4', produto.agrupamento_n4);
    setValue('peso_liquido', produto.peso_liquido);
    setValue('peso_bruto', produto.peso_bruto);
    setValue('marca', produto.marca);
    setValue('fabricante', produto.fabricante);
    setValue('informacoes_adicionais', produto.informacoes_adicionais);
    setValue('prazo_validade', produto.prazo_validade);
    setValue('unidade_validade', produto.unidade_validade);
    setValue('regra_palet_un', produto.regra_palet_un);
    setValue('ficha_homologacao', produto.ficha_homologacao);
    setValue('registro_especifico', produto.registro_especifico);
    setValue('comprimento', produto.comprimento);
    setValue('largura', produto.largura);
    setValue('altura', produto.altura);
    setValue('volume', produto.volume);
    setValue('integracao_senior', produto.integracao_senior);
    setValue('ncm', produto.ncm);
    setValue('cest', produto.cest);
    setValue('cfop', produto.cfop);
    setValue('ean', produto.ean);
    setValue('cst_icms', produto.cst_icms);
    setValue('csosn', produto.csosn);
    setValue('aliquota_icms', produto.aliquota_icms);
    setValue('aliquota_ipi', produto.aliquota_ipi);
    setValue('aliquota_pis', produto.aliquota_pis);
    setValue('aliquota_cofins', produto.aliquota_cofins);
    setValue('preco_custo', produto.preco_custo);
    setValue('preco_venda', produto.preco_venda);
    setValue('estoque_atual', produto.estoque_atual);
    setValue('estoque_minimo', produto.estoque_minimo);
    setValue('fornecedor_id', produto.fornecedor_id);
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
        // Para edição, enviar apenas os campos que foram alterados
        const updateData = {};
        
        if (data.nome !== editingProduto.nome) {
          updateData.nome = data.nome;
        }
        
        if (data.codigo_barras !== editingProduto.codigo_barras) {
          updateData.codigo_barras = data.codigo_barras;
        }
        
        if (data.descricao !== editingProduto.descricao) {
          updateData.descricao = data.descricao;
        }
        
        if (data.preco_custo !== editingProduto.preco_custo) {
          updateData.preco_custo = data.preco_custo;
        }
        
        if (data.preco_venda !== editingProduto.preco_venda) {
          updateData.preco_venda = data.preco_venda;
        }
        
        if (data.estoque_atual !== editingProduto.estoque_atual) {
          updateData.estoque_atual = data.estoque_atual;
        }
        
        if (data.estoque_minimo !== editingProduto.estoque_minimo) {
          updateData.estoque_minimo = data.estoque_minimo;
        }
        
        if (data.fornecedor_id !== editingProduto.fornecedor_id) {
          updateData.fornecedor_id = data.fornecedor_id;
        }
        
        if (data.grupo_id !== editingProduto.grupo_id) {
          updateData.grupo_id = data.grupo_id;
        }
        
        if (data.unidade_id !== editingProduto.unidade_id) {
          updateData.unidade_id = data.unidade_id;
        }
        
        if (data.status !== editingProduto.status) {
          updateData.status = parseInt(data.status);
        }
        
        // Se não há campos para atualizar, mostrar erro
        if (Object.keys(updateData).length === 0) {
          toast.error('Nenhum campo foi alterado');
          return;
        }
        
        await api.put(`/produtos/${editingProduto.id}`, updateData);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Para criação, enviar todos os campos
        const createData = { ...data };
        if (createData.status) {
          createData.status = parseInt(createData.status);
        }
        await api.post('/produtos', createData);
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
        toast.error(error.response?.data?.error || 'Erro ao excluir produto');
      }
    }
  };

  // Filtrar produtos
  const filteredProdutos = produtos.filter(produto => {
    const matchesSearch = produto.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         produto.codigo_barras?.includes(searchTerm) ||
                         produto.descricao?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'todos' || produto.status === parseInt(statusFilter);
    const matchesGrupo = grupoFilter === 'todos' || produto.grupo_id === parseInt(grupoFilter);
    return matchesSearch && matchesStatus && matchesGrupo;
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

  // Buscar nome do subgrupo
  const getSubgrupoName = (subgrupoId) => {
    const subgrupo = subgrupos.find(sg => sg.id === subgrupoId);
    return subgrupo ? subgrupo.nome : 'N/A';
  };

  // Buscar nome da classe
  const getClasseName = (classeId) => {
    const classe = classes.find(c => c.id === classeId);
    return classe ? classe.nome : 'N/A';
  };

  // Buscar nome da marca
  const getMarcaName = (marcaId) => {
    const marca = marcas.find(m => m.id === marcaId);
    return marca ? marca.marca : 'N/A';
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
        <div style={{ display: 'flex', gap: '12px' }}>
          <AddButton 
            onClick={handleOpenAuditModal}
            style={{ background: 'var(--blue)', fontSize: '12px', padding: '8px 12px' }}
          >
            <FaQuestionCircle />
            Auditoria
          </AddButton>
          <AddButton onClick={handleAddProduto}>
            <FaPlus />
            Adicionar Produto
          </AddButton>
        </div>
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
          <option value="1">Ativo</option>
          <option value="0">Inativo</option>
        </FilterSelect>
        <FilterSelect
          value={grupoFilter}
          onChange={(e) => setGrupoFilter(e.target.value)}
        >
          <option value="todos">Todos os grupos</option>
          {grupos.map(grupo => (
            <option key={grupo.id} value={grupo.id}>{grupo.nome}</option>
          ))}
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
              <Th>Grupo</Th>
              <Th>Classe</Th>
              <Th>Marca</Th>
              <Th>Status</Th>
              <Th>Ações</Th>
            </tr>
          </thead>
          <tbody>
            {filteredProdutos.length === 0 ? (
              <tr>
                <Td colSpan="9">
                  <EmptyState>
                    {searchTerm || statusFilter !== 'todos' || grupoFilter !== 'todos'
                      ? 'Nenhum produto encontrado com os filtros aplicados'
                      : 'Nenhum produto cadastrado'
                    }
                  </EmptyState>
                </Td>
              </tr>
            ) : (
              filteredProdutos.map((produto) => (
                <tr key={produto.id}>
                  <Td>{produto.codigo_produto || produto.codigo_barras}</Td>
                  <Td>{produto.nome}</Td>
                  <Td>
                    <PriceDisplay>{formatPrice(produto.preco_venda)}</PriceDisplay>
                  </Td>
                  <Td>{produto.estoque_atual || 0}</Td>
                  <Td>{getGrupoName(produto.grupo_id)}</Td>
                  <Td>{getClasseName(produto.classe_id)}</Td>
                  <Td>{getMarcaName(produto.marca_id)}</Td>
                  <Td>
                    <StatusBadge status={produto.status === 1 ? 'ativo' : 'inativo'}>
                      {produto.status === 1 ? 'Ativo' : 'Inativo'}
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
              {/* Seção 1: Identificação Básica */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  📋 Identificação Básica
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Código do Produto</Label>
                    <Input
                      type="text"
                      placeholder="Ex: PROD001"
                      {...register('codigo_produto')}
                    />
                    {errors.codigo_produto && <span style={{ color: 'red', fontSize: '11px' }}>{errors.codigo_produto.message}</span>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Nome do Produto *</Label>
                    <Input
                      type="text"
                      placeholder="Nome do produto"
                      {...register('nome', { required: 'Nome é obrigatório' })}
                    />
                    {errors.nome && <span style={{ color: 'red', fontSize: '11px' }}>{errors.nome.message}</span>}
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Código de Barras</Label>
                    <Input
                      type="text"
                      placeholder="Código de barras"
                      {...register('codigo_barras')}
                    />
                    {errors.codigo_barras && <span style={{ color: 'red', fontSize: '11px' }}>{errors.codigo_barras.message}</span>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Referência</Label>
                    <Input
                      type="text"
                      placeholder="Referência interna"
                      {...register('referencia')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Referência Externa</Label>
                    <Input
                      type="text"
                      placeholder="Referência externa"
                      {...register('referencia_externa')}
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <Label>Descrição</Label>
                  <TextArea
                    placeholder="Descrição detalhada do produto..."
                    {...register('descricao')}
                  />
                  {errors.descricao && <span style={{ color: 'red', fontSize: '11px' }}>{errors.descricao.message}</span>}
                </FormGroup>
              </div>

              {/* Seção 2: Classificação */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  🏷️ Classificação
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
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
                  </FormGroup>

                  <FormGroup>
                    <Label>Subgrupo</Label>
                    <Select {...register('subgrupo_id')}>
                      <option value="">Selecione...</option>
                      {subgrupos.map(subgrupo => (
                        <option key={subgrupo.id} value={subgrupo.id}>
                          {subgrupo.nome}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Classe</Label>
                    <Select {...register('classe_id')}>
                      <option value="">Selecione...</option>
                      {classes.map(classe => (
                        <option key={classe.id} value={classe.id}>
                          {classe.nome}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Marca</Label>
                    <Select {...register('marca_id')}>
                      <option value="">Selecione...</option>
                      {marcas.map(marca => (
                        <option key={marca.id} value={marca.id}>
                          {marca.marca}
                        </option>
                      ))}
                    </Select>
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Agrupamento N3</Label>
                    <Input
                      type="text"
                      placeholder="Ex: BOVINO"
                      {...register('agrupamento_n3')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Agrupamento N4</Label>
                    <Input
                      type="text"
                      placeholder="Ex: PATINHO BOVINO EM CUBOS 1KG"
                      {...register('agrupamento_n4')}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Seção 3: Dimensões e Peso */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  📏 Dimensões e Peso
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
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
                  </FormGroup>

                  <FormGroup>
                    <Label>Quantidade</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="1.000"
                      {...register('quantidade')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Peso Líquido (kg)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      {...register('peso_liquido')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Peso Bruto (kg)</Label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      {...register('peso_bruto')}
                    />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Comprimento (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('comprimento')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Largura (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('largura')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Altura (cm)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('altura')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Volume (cm³)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('volume')}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Seção 4: Informações Fiscais */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  🧾 Informações Fiscais
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>NCM</Label>
                    <Input
                      type="text"
                      placeholder="Classificação NCM"
                      {...register('ncm')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>CEST</Label>
                    <Input
                      type="text"
                      placeholder="Código CEST"
                      {...register('cest')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>CFOP</Label>
                    <Input
                      type="text"
                      placeholder="Código CFOP"
                      {...register('cfop')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>EAN</Label>
                    <Input
                      type="text"
                      placeholder="Código EAN"
                      {...register('ean')}
                    />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>CST ICMS</Label>
                    <Input
                      type="text"
                      placeholder="CST ICMS"
                      {...register('cst_icms')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>CSOSN</Label>
                    <Input
                      type="text"
                      placeholder="CSOSN"
                      {...register('csosn')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Alíquota ICMS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('aliquota_icms')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Alíquota IPI (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('aliquota_ipi')}
                    />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Alíquota PIS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('aliquota_pis')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Alíquota COFINS (%)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('aliquota_cofins')}
                    />
                  </FormGroup>
                </div>
              </div>

              {/* Seção 5: Preços e Estoque */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  💰 Preços e Estoque
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Preço de Custo</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('preco_custo')}
                    />
                    {errors.preco_custo && <span style={{ color: 'red', fontSize: '11px' }}>{errors.preco_custo.message}</span>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Preço de Venda *</Label>
                    <Input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      {...register('preco_venda', { 
                        required: 'Preço de venda é obrigatório',
                        min: 0 
                      })}
                    />
                    {errors.preco_venda && <span style={{ color: 'red', fontSize: '11px' }}>{errors.preco_venda.message}</span>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Estoque Mínimo</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      {...register('estoque_minimo')}
                    />
                    {errors.estoque_minimo && <span style={{ color: 'red', fontSize: '11px' }}>{errors.estoque_minimo.message}</span>}
                  </FormGroup>

                  <FormGroup>
                    <Label>Estoque Atual</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      {...register('estoque_atual')}
                    />
                    {errors.estoque_atual && <span style={{ color: 'red', fontSize: '11px' }}>{errors.estoque_atual.message}</span>}
                  </FormGroup>
                </div>
              </div>

              {/* Seção 6: Informações Adicionais */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  ℹ️ Informações Adicionais
                </h3>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: '16px' }}>
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
                  </FormGroup>

                  <FormGroup>
                    <Label>Prazo de Validade</Label>
                    <Input
                      type="number"
                      placeholder="12"
                      {...register('prazo_validade')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Unidade Validade</Label>
                    <Select {...register('unidade_validade')}>
                      <option value="">Selecione...</option>
                      <option value="DIAS">Dias</option>
                      <option value="SEMANAS">Semanas</option>
                      <option value="MESES">Meses</option>
                      <option value="ANOS">Anos</option>
                    </Select>
                  </FormGroup>

                  <FormGroup>
                    <Label>Regra Palet (UN)</Label>
                    <Input
                      type="number"
                      placeholder="1200"
                      {...register('regra_palet_un')}
                    />
                  </FormGroup>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <FormGroup>
                    <Label>Ficha de Homologação</Label>
                    <Input
                      type="text"
                      placeholder="123456"
                      {...register('ficha_homologacao')}
                    />
                  </FormGroup>

                  <FormGroup>
                    <Label>Integração Senior</Label>
                    <Input
                      type="text"
                      placeholder="123654"
                      {...register('integracao_senior')}
                    />
                  </FormGroup>
                </div>

                <FormGroup>
                  <Label>Informações Adicionais</Label>
                  <TextArea
                    placeholder="Ex: PRODUTO COM 5% DE GORDURA"
                    {...register('informacoes_adicionais')}
                  />
                </FormGroup>

                <FormGroup>
                  <Label>Registro Específico</Label>
                  <Input
                    type="text"
                    placeholder="Ex: 1234456 CA, REGISTRO, MODELO, Nº SERIE"
                    {...register('registro_especifico')}
                  />
                </FormGroup>
              </div>

              {/* Seção 7: Status */}
              <div style={{ 
                background: '#f8f9fa', 
                padding: '16px', 
                borderRadius: '8px', 
                marginBottom: '16px' 
              }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>
                  ✅ Status
                </h3>
                
                <FormGroup>
                  <Label>Status</Label>
                  <Select {...register('status', { required: 'Status é obrigatório' })}>
                    <option value="">Selecione...</option>
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </Select>
                  {errors.status && <span style={{ color: 'red', fontSize: '11px' }}>{errors.status.message}</span>}
                </FormGroup>
              </div>

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

      {/* Modal de Auditoria */}
      {showAuditModal && (
        <Modal onClick={handleCloseAuditModal}>
          <ModalContent onClick={(e) => e.stopPropagation()} style={{ maxWidth: '95vw', maxHeight: '90vh', width: '1200px' }}>
            <ModalHeader>
              <ModalTitle>Relatório de Auditoria - Produtos</ModalTitle>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <button
                  onClick={handleExportXLSX}
                  title="Exportar para Excel"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFileExcel />
                  Excel
                </button>
                <button
                  onClick={handleExportPDF}
                  title="Exportar para PDF"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    background: 'var(--primary-green)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseOver={(e) => e.target.style.background = 'var(--dark-green)'}
                  onMouseOut={(e) => e.target.style.background = 'var(--primary-green)'}
                >
                  <FaFilePdf />
                  PDF
                </button>
                <CloseButton onClick={handleCloseAuditModal}>&times;</CloseButton>
              </div>
            </ModalHeader>

            {/* Filtros de Auditoria */}
            <div style={{ marginBottom: '24px', padding: '16px', background: '#f8f9fa', borderRadius: '8px' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: 'var(--dark-gray)' }}>Filtros</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Data Início
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataInicio}
                    onChange={(e) => setAuditFilters({...auditFilters, dataInicio: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Data Fim
                  </label>
                  <input
                    type="date"
                    value={auditFilters.dataFim}
                    onChange={(e) => setAuditFilters({...auditFilters, dataFim: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Ação
                  </label>
                  <select
                    value={auditFilters.acao}
                    onChange={(e) => setAuditFilters({...auditFilters, acao: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Todas as ações</option>
                    <option value="create">Criar</option>
                    <option value="update">Editar</option>
                    <option value="delete">Excluir</option>
                    <option value="login">Login</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Usuário
                  </label>
                  <select
                    value={auditFilters.usuario_id}
                    onChange={(e) => setAuditFilters({...auditFilters, usuario_id: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Todos os usuários</option>
                    {/* Aqui você pode adicionar a lista de usuários se necessário */}
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', color: 'var(--gray)' }}>
                    Período
                  </label>
                  <select
                    value={auditFilters.periodo}
                    onChange={(e) => setAuditFilters({...auditFilters, periodo: e.target.value})}
                    style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                  >
                    <option value="">Período personalizado</option>
                    <option value="7dias">Últimos 7 dias</option>
                    <option value="30dias">Últimos 30 dias</option>
                    <option value="90dias">Últimos 90 dias</option>
                    <option value="todos">Todos os registros</option>
                  </select>
                </div>
              </div>
              <button
                onClick={handleApplyAuditFilters}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'var(--primary-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleExportXLSX}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'var(--success-green)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                <FaFileExcel /> Exportar XLSX
              </button>
              <button
                onClick={handleExportPDF}
                style={{
                  marginTop: '12px',
                  padding: '8px 16px',
                  background: 'var(--info-blue)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  marginLeft: '10px'
                }}
              >
                <FaFilePdf /> Exportar PDF
              </button>
            </div>

            {/* Lista de Logs */}
            <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
              {auditLoading ? (
                <div style={{ textAlign: 'center', padding: '20px' }}>Carregando logs...</div>
              ) : auditLogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--gray)' }}>
                  Nenhum log encontrado com os filtros aplicados
                </div>
              ) : (
                <div>
                  <div style={{ marginBottom: '16px', fontSize: '14px', color: 'var(--gray)' }}>
                    {auditLogs.length} log(s) encontrado(s)
                  </div>
                  {auditLogs.map((log, index) => (
                    <div
                      key={index}
                      style={{
                        border: '1px solid #e0e0e0',
                        borderRadius: '8px',
                        padding: '16px',
                        marginBottom: '12px',
                        background: 'white'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            background: log.acao === 'create' ? '#e8f5e8' : 
                                       log.acao === 'update' ? '#fff3cd' : 
                                       log.acao === 'delete' ? '#f8d7da' : '#e3f2fd',
                            color: log.acao === 'create' ? '#2e7d32' : 
                                   log.acao === 'update' ? '#856404' : 
                                   log.acao === 'delete' ? '#721c24' : '#1976d2'
                          }}>
                            {getActionLabel(log.acao)}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                            por {log.usuario_nome || 'Usuário desconhecido'}
                          </span>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--gray)' }}>
                          {formatDate(log.timestamp)}
                        </span>
                      </div>
                      
                      {log.detalhes && (
                        <div style={{ fontSize: '12px', color: 'var(--dark-gray)' }}>
                          {log.detalhes.changes && (
                            <div style={{ marginBottom: '8px' }}>
                              <strong>Mudanças Realizadas:</strong>
                              <div style={{ marginLeft: '12px', marginTop: '8px' }}>
                                {Object.entries(log.detalhes.changes).map(([field, change]) => (
                                  <div key={field} style={{ 
                                    marginBottom: '6px', 
                                    padding: '8px', 
                                    background: '#f8f9fa', 
                                    borderRadius: '4px',
                                    border: '1px solid #e9ecef'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '4px' }}>
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px' }}>
                                      <span style={{ color: '#721c24' }}>
                                        <strong>Antes:</strong> {formatFieldValue(field, change.from)}
                                      </span>
                                      <span style={{ color: '#6c757d' }}>→</span>
                                      <span style={{ color: '#2e7d32' }}>
                                        <strong>Depois:</strong> {formatFieldValue(field, change.to)}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.requestBody && !log.detalhes.changes && (
                            <div>
                              <strong>Dados do Produto:</strong>
                              <div style={{ 
                                marginLeft: '12px', 
                                marginTop: '8px',
                                display: 'grid',
                                gridTemplateColumns: '1fr 1fr',
                                gap: '8px'
                              }}>
                                {Object.entries(log.detalhes.requestBody).map(([field, value]) => (
                                  <div key={field} style={{ 
                                    padding: '6px 8px', 
                                    background: '#f8f9fa', 
                                    borderRadius: '4px',
                                    border: '1px solid #e9ecef',
                                    fontSize: '11px'
                                  }}>
                                    <div style={{ fontWeight: 'bold', color: 'var(--dark-gray)', marginBottom: '2px' }}>
                                      {getFieldLabel(field)}:
                                    </div>
                                    <div style={{ color: '#2e7d32' }}>
                                      {formatFieldValue(field, value)}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          {log.detalhes.resourceId && (
                            <div style={{ 
                              marginTop: '8px', 
                              padding: '6px 8px', 
                              background: '#e3f2fd', 
                              borderRadius: '4px',
                              fontSize: '11px'
                            }}>
                              <strong>ID do Produto:</strong> 
                              <span style={{ color: '#1976d2', marginLeft: '4px' }}>
                                #{log.detalhes.resourceId}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </ModalContent>
        </Modal>
      )}
    </Container>
  );
};

export default Produtos; 