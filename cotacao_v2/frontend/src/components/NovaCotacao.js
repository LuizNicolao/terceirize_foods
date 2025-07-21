import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import * as XLSX from 'xlsx';
import Layout from './Layout';
import styled from 'styled-components';
import { 
  FaSave, 
  FaTimes, 
  FaUser, 
  FaMapMarkerAlt, 
  FaShoppingCart,
  FaExclamationTriangle,
  FaFileUpload,
  FaPlus,
  FaTrash,
  FaDownload,
  FaUpload,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';
import { colors, typography, shadows, cardStyles } from '../design-system';
import { Button, Card } from '../design-system/components';

// Componentes estilizados
const Container = styled.div`
  padding: 24px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  color: ${colors.neutral.darkGray};
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

const FormContainer = styled(Card)`
  padding: 32px;
  margin-bottom: 24px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const FormSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  color: ${colors.neutral.darkGray};
  font-weight: 600;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const Input = styled.input`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &.error {
    border-color: ${colors.status.error};
  }

  &.disabled {
    background-color: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: ${colors.neutral.white};
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
  }

  &.error {
    border-color: ${colors.status.error};
  }
`;

const Textarea = styled.textarea`
  padding: 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  font-family: inherit;
  resize: vertical;
  min-height: 100px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &.error {
    border-color: ${colors.status.error};
  }
`;

const ErrorMessage = styled.span`
  color: ${colors.status.error};
  font-size: 12px;
  margin-top: 4px;
`;

const RadioGroup = styled.div`
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 8px 12px;
  border-radius: 6px;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
  }

  input[type="radio"] {
    width: 16px;
    height: 16px;
    accent-color: ${colors.primary.green};
  }

  .radio-label {
    font-size: 14px;
    color: ${colors.neutral.darkGray};
    font-weight: 500;
  }
`;

const FileInput = styled.input`
  padding: 12px 16px;
  border: 2px dashed #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  background: ${colors.neutral.white};
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    border-color: ${colors.primary.green};
  }

  &:focus {
    outline: none;
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
  }
`;

const FileHelp = styled.p`
  color: ${colors.neutral.gray};
  font-size: 12px;
  margin: 8px 0 0 0;
`;

const ProdutosInfo = styled.div`
  background: ${colors.neutral.lightGray};
  padding: 16px;
  border-radius: 8px;
  border-left: 4px solid ${colors.primary.green};
`;

const DuplicadosInfo = styled.p`
  color: ${colors.secondary.orange};
  font-size: 14px;
  margin: 8px 0 0 0;
  font-weight: 500;
`;

const FornecedoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FornecedorCard = styled(Card)`
  padding: 24px;
  border: 1px solid #e0e0e0;
`;

const FornecedorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e0e0e0;
`;

const FornecedorTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const FornecedorActions = styled.div`
  display: flex;
  gap: 12px;
`;

const ActionButton = styled.button`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &.export {
    background: ${colors.secondary.blue};
    color: ${colors.neutral.white};

    &:hover {
      background: #1976D2;
    }
  }

  &.import {
    background: ${colors.primary.green};
    color: ${colors.neutral.white};

    &:hover {
      background: #005a2e;
    }
  }

  &.remove {
    background: ${colors.status.error};
    color: ${colors.neutral.white};

    &:hover {
      background: #d32f2f;
    }
  }
`;

const TableContainer = styled.div`
  margin-top: 20px;
`;

const TableTitle = styled.h4`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  border: 1px solid #e0e0e0;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.neutral.white};
`;

const Th = styled.th`
  background-color: ${colors.neutral.lightGray};
  padding: 12px 8px;
  text-align: left;
  font-weight: 600;
  color: ${colors.neutral.darkGray};
  font-size: 12px;
  border-bottom: 1px solid #e0e0e0;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 8px;
  border-bottom: 1px solid #f0f0f0;
  font-size: 12px;
  color: ${colors.neutral.darkGray};

  &.read-only {
    background: ${colors.neutral.lightGray};
    font-weight: 500;
  }

  &.total-cell {
    font-weight: 600;
    color: ${colors.primary.green};
  }
`;

const TableInput = styled.input`
  padding: 6px 8px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 12px;
  width: 100%;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
  }
`;

const ConsolidadoBadge = styled.span`
  margin-left: 4px;
  font-size: 10px;
  color: ${colors.secondary.orange};
`;

const RemoveItemButton = styled.button`
  background: ${colors.status.error};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 4px;
  width: 24px;
  height: 24px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: #d32f2f;
  }
`;

const AddFornecedorButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
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
  margin-top: 16px;

  &:hover {
    background: #005a2e;
  }

  &:disabled {
    background: ${colors.neutral.gray};
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid #e0e0e0;
`;

const CancelButton = styled(Button)`
  background: ${colors.neutral.gray};
  color: ${colors.neutral.white};
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

  &:hover {
    background: ${colors.neutral.darkGray};
  }
`;

const SubmitButton = styled(Button)`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
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

  &:hover {
    background: #005a2e;
  }
`;

const ScrollButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  cursor: pointer;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: #005a2e;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
`;

const NovaCotacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    comprador: user.name || '',
    localEntrega: '',
    tipoCompra: 'programada',
    motivoEmergencial: '',
    justificativa: ''
  });

  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [planilhaCarregada, setPlanilhaCarregada] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);

  const locaisEntrega = [
    'CD CHAPECO',
    'CD CURITIBANOS',
    'COZINHA TOLEDO',
    'MANUTENCAO CHAPECO',
    'MANUTENCAO CURITIBANOS'
  ];

  const tiposFrete = [
    'CIF',
    'FOB',
    'FAS',
    'EXW',
    'CPT',
    'CIP',
    'DAP',
    'DPU',
    'DDP'
  ];

  const motivosEmergenciais = [
    'Atraso fornecedor',
    'Aumento de consumo',
    'Substituição/Reposição de produtos (ponto a ponto)',
    'Troca de cardápio',
    'Implantação',
    'Substituição de equipamento/utensílio por dano',
    'Notificação',
    'Outro(s)'
  ];

  // Função para gerar ID único baseado nos dados do produto
  const gerarIdUnico = (dados) => {
    const str = JSON.stringify(dados);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return `prod_${Math.abs(hash)}_${Date.now()}`;
  };

  // Função para gerar ID único para fornecedor
  const gerarIdFornecedor = () => {
    return `forn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // Função para gerar ID único para produto do fornecedor
  const gerarIdProdutoFornecedor = (fornecedorId, produtoOriginalId) => {
    return `forn_prod_${fornecedorId}_${produtoOriginalId}_${Date.now()}`;
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: ''
      }));
    }

    if (field === 'tipoCompra' && (value === 'programada' || value === 'tag')) {
      setFormData(prev => ({
        ...prev,
        motivoEmergencial: '',
        justificativa: ''
      }));
      setErrors(prev => ({
        ...prev,
        motivoEmergencial: '',
        justificativa: ''
      }));
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        // Extrair dados das colunas específicas
        const produtosExtraidos = [];
        const produtosUnicos = new Map(); // Para detectar duplicatas

        for (let i = 1; i < jsonData.length; i++) { // Pular cabeçalho
          const row = jsonData[i];
          if (row && row.length >= 6) {
            const qtde = parseFloat(row[2]) || 0; // Coluna C
            const valorUnitario = 0; // Inicialmente zero
            
            // Dados do produto para identificação única
            const dadosProduto = {
              nome: row[4] || '', // Coluna E
              qtde: qtde,
              un: row[5] || '', // Coluna F
              entrega: row[1] || '' // Coluna B
            };

            // Gerar ID único baseado nos dados do produto
            const produtoId = gerarIdUnico(dadosProduto);
            
            // Verificar se já existe um produto similar
            const chaveUnica = `${dadosProduto.nome}_${dadosProduto.qtde}_${dadosProduto.un}`;
            
            if (produtosUnicos.has(chaveUnica)) {
              // Produto duplicado - incrementar quantidade
              const produtoExistente = produtosUnicos.get(chaveUnica);
              produtoExistente.qtde += qtde;
              produtoExistente.total = produtoExistente.qtde * produtoExistente.valorUnitario;
            } else {
              // Novo produto
              const novoProduto = {
                id: produtoId,
                idOriginal: i, // ID da linha original na planilha
                entrega: row[1] || '', // Coluna B - Prazo Entrega
                qtde: qtde, // Coluna C - Qtd
                codigo: row[3] || '', // Coluna D (se existir)
                nome: row[4] || '', // Coluna E - Produto
                un: row[5] || '', // Coluna F - UN
                prazoEntrega: row[1] || '', // Coluna B - Prazo Entrega (editável)
                ultValorAprovado: '', // Campo de leitura (sem função por enquanto)
                ultFornecedorAprovado: '', // Campo de leitura (sem função por enquanto)
                valorAnterior: '', // Campo de leitura (sem função por enquanto)
                valorUnitario: valorUnitario, // Campo editável
                valorUnitarioDifalFrete: '', // Campo de leitura (sem função por enquanto)
                dataEntregaFn: row[1] || '', // Coluna B - Data Entrega Fn (editável)
                total: qtde * valorUnitario, // Calculado automaticamente
                isDuplicado: false, // Flag para identificar produtos que foram somados
                produtosOriginais: [i], // Array com IDs das linhas originais
                difal: 0, // Novo campo
                ipi: 0 // Novo campo
              };
              
              produtosExtraidos.push(novoProduto);
              produtosUnicos.set(chaveUnica, novoProduto);
            }
          }
        }

        setProdutos(produtosExtraidos);
        setPlanilhaCarregada(true);
        
        const totalProdutos = produtosExtraidos.length;
        const produtosDuplicados = produtosExtraidos.filter(p => p.isDuplicado).length;
        
        let mensagem = `Planilha carregada com sucesso! ${totalProdutos} produtos únicos encontrados.`;
        if (produtosDuplicados > 0) {
          mensagem += ` ${produtosDuplicados} produtos duplicados foram consolidados.`;
        }
        
        alert(mensagem);
      } catch (error) {
        console.error('Erro ao processar planilha:', error);
        alert('Erro ao processar a planilha. Verifique se o arquivo está no formato correto.');
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const addFornecedor = () => {
    const fornecedorId = gerarIdFornecedor();
    const novoFornecedor = {
      id: fornecedorId,
      nome: '',
      prazoPagamento: '',
      tipoFrete: '',
      valorFrete: 0,
      produtos: produtos.map(produto => ({
        ...produto,
        id: gerarIdProdutoFornecedor(fornecedorId, produto.id), // ID único para produto do fornecedor
        valorUnitario: 0, // Inicialmente zero
        total: produto.qtde * 0, // Calculado automaticamente
        difal: 0, // Novo campo
        ipi: 0 // Novo campo
      }))
    };
    setFornecedores([...fornecedores, novoFornecedor]);
  };

  const removeFornecedor = (fornecedorId) => {
    setFornecedores(fornecedores.filter(f => f.id !== fornecedorId));
  };

  const updateFornecedor = (fornecedorId, field, value) => {
    setFornecedores(fornecedores.map(f => 
      f.id === fornecedorId ? { ...f, [field]: value } : f
    ));
  };

  const updateProdutoFornecedor = (fornecedorId, produtoId, field, value) => {
    setFornecedores(fornecedores.map(f => {
      if (f.id === fornecedorId) {
        const produtosAtualizados = f.produtos.map(p => {
          if (p.id === produtoId) {
            const updatedProduto = { ...p, [field]: value };
            
            // O total agora é apenas Qtd × Valor Unitário, ignorando difal e ipi
            if (field === 'valorUnitario' || field === 'difal' || field === 'ipi') {
              const qtde = parseFloat(p.qtde) || 0;
              const valorUnit = field === 'valorUnitario' ? parseFloat(value) || 0 : parseFloat(p.valorUnitario) || 0;
              updatedProduto.total = qtde * valorUnit;
            }
            return updatedProduto;
          }
          return p;
        });
        return { ...f, produtos: produtosAtualizados };
      }
      return f;
    }));
  };

  const removeProduto = (fornecedorId, produtoId) => {
    setFornecedores(fornecedores.map(f => {
      if (f.id === fornecedorId) {
        const produtosAtualizados = f.produtos.filter(p => p.id !== produtoId);
        return { ...f, produtos: produtosAtualizados };
      }
      return f;
    }));
  };

  // Função para obter estatísticas dos produtos
  const getEstatisticasProdutos = () => {
    const stats = {
      totalProdutos: produtos.length,
      produtosDuplicados: produtos.filter(p => p.isDuplicado).length,
      totalQuantidade: produtos.reduce((sum, p) => sum + p.qtde, 0),
      fornecedores: fornecedores.length,
      produtosPorFornecedor: fornecedores.map(f => ({
        fornecedorId: f.id,
        fornecedorNome: f.nome,
        totalProdutos: f.produtos.length,
        valorTotal: f.produtos.reduce((sum, p) => sum + p.total, 0)
      }))
    };
    return stats;
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.localEntrega) {
      newErrors.localEntrega = 'Local de entrega é obrigatório';
    }

    if (formData.tipoCompra === 'emergencial') {
      if (!formData.motivoEmergencial) {
        newErrors.motivoEmergencial = 'Motivo da compra emergencial é obrigatório';
      }
      if (!formData.justificativa) {
        newErrors.justificativa = 'Justificativa é obrigatória';
      }
    }

    if (!planilhaCarregada) {
      newErrors.planilha = 'É necessário carregar uma planilha com os produtos';
    }

    if (fornecedores.length === 0) {
      newErrors.fornecedores = 'É necessário adicionar pelo menos um fornecedor';
    } else {
      // Verifica se pelo menos um fornecedor tem nome preenchido
      const fornecedoresComNome = fornecedores.filter(f => f.nome && f.nome.trim() !== '');
      if (fornecedoresComNome.length === 0) {
        newErrors.fornecedores = 'Pelo menos um fornecedor deve ter o nome preenchido';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const formatarMotivoFinal = () => {
    if (formData.tipoCompra === 'programada') {
      return 'Compra Programada';
    }
    
    if (formData.tipoCompra === 'tag') {
      return 'TAG';
    }

    const motivo = formData.motivoEmergencial;
    const justificativa = formData.justificativa;

    switch (motivo) {
      case 'Atraso fornecedor':
        return `Atraso fornecedor - ${justificativa}`;
      case 'Substituição/Reposição de produtos (ponto a ponto)':
        return `Substituição/Reposição de produtos - ${justificativa}`;
      case 'Outro(s)':
        return `Outro(s) - ${justificativa}`;
      default:
        return justificativa;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      const estatisticas = getEstatisticasProdutos();
      const cotacaoData = {
        ...formData,
        motivoFinal: formatarMotivoFinal(),
        dataCriacao: new Date().toISOString(),
        status: 'pendente',
        produtos,
        fornecedores,
        estatisticas,
        metadata: {
          totalProdutosUnicos: estatisticas.totalProdutos,
          produtosDuplicadosConsolidados: estatisticas.produtosDuplicados,
          totalQuantidade: estatisticas.totalQuantidade,
          totalFornecedores: estatisticas.fornecedores
        }
      };

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(cotacaoData)
        });

        if (response.ok) {
          const result = await response.json();
          alert('Cotação criada com sucesso!');
          navigate('/cotacoes');
        } else {
          const errorData = await response.json();
          console.error('Erro ao criar cotação:', errorData);
          alert(`Erro ao criar cotação: ${errorData.message || 'Erro desconhecido'}`);
        }
      } catch (error) {
        console.error('Erro na requisição:', error);
        alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      }
    }
  };

  const handleCancel = () => {
    navigate('/cotacoes');
  };

  // Funções de controle do scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      
      // Mostrar botão quando scrollar mais de 300px
      setShowScrollButton(scrollTop > 300);
      
      // Verificar se está no final da página
      const isBottom = scrollTop + windowHeight >= documentHeight - 100;
      setIsAtBottom(isBottom);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleScrollClick = () => {
    if (isAtBottom) {
      // Se está no final, ir para o topo
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      // Se não está no final, ir para o final
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }
  };

  const getPlaceholderText = () => {
    const motivo = formData.motivoEmergencial;
    
    switch (motivo) {
      case 'Atraso fornecedor':
        return 'Informe o fornecedor que não entregou na data';
      case 'Substituição/Reposição de produtos (ponto a ponto)':
        return 'Informe o fornecedor que gerou o problema';
      case 'Outro(s)':
        return 'Descreva detalhadamente o(s) motivo(s) da compra emergencial';
      default:
        return 'Descreva detalhadamente o motivo da compra emergencial';
    }
  };

  const getFieldLabel = () => {
    const motivo = formData.motivoEmergencial;
    
    switch (motivo) {
      case 'Atraso fornecedor':
        return 'Fornecedor com Atraso';
      case 'Substituição/Reposição de produtos (ponto a ponto)':
        return 'Fornecedor que Gerou o Problema';
      default:
        return 'Justificativa Detalhada';
    }
  };

  const formatarValor = (valor) => {
    if (valor === 0 || valor === '') return '';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  // Função para exportar dados do fornecedor
  const exportarFornecedor = (fornecedor) => {
    try {
      // Criar dados para o Excel
      const dados = [
        ['Dados do Fornecedor'],
        ['Nome do Fornecedor', fornecedor.nome || ''],
        ['Prazo de Pagamento', fornecedor.prazoPagamento || ''],
        ['Frete', fornecedor.valorFrete || 0],
        [''],
        ['Produtos'],
        ['Produto', 'Quantidade', 'UN', 'Prazo Entrega', 'Valor Unit.', 'Data Entrega Fn']
      ];

      // Adicionar produtos
      fornecedor.produtos.forEach(produto => {
        dados.push([
          produto.nome,
          produto.qtde,
          produto.un,
          produto.prazoEntrega || '',
          produto.valorUnitario || 0,
          produto.dataEntregaFn || ''
        ]);
      });

      // Criar workbook
      const ws = XLSX.utils.aoa_to_sheet(dados);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Fornecedor');

      // Nome do arquivo
      const data = new Date().toISOString().split('T')[0];
      const nomeArquivo = `Cotacao_${fornecedor.nome || 'Fornecedor'}_${data}.xlsx`;

      // Download
      XLSX.writeFile(wb, nomeArquivo);
    } catch (error) {
      console.error('Erro ao exportar fornecedor:', error);
      alert('Erro ao exportar dados do fornecedor');
    }
  };

  // Função para importar dados do fornecedor
  const importarFornecedor = async (fornecedorId, file) => {
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const dados = XLSX.utils.sheet_to_json(firstSheet, { header: 1, raw: false });

      // Extrair dados do fornecedor
      const prazoPagamento = dados[2]?.[1] || '';
      const frete = parseFloat(dados[3]?.[1]) || 0;

      // Atualizar dados do fornecedor
      setFornecedores(prev => prev.map(f => {
        if (f.id === fornecedorId) {
          return {
            ...f,
            prazoPagamento,
            valorFrete: frete
          };
        }
        return f;
      }));

      // Processar produtos (a partir da linha 8)
      const produtos = dados.slice(7);
      const colIndices = {
        produto: 0,
        quantidade: 1,
        un: 2,
        prazoEntrega: 3,
        valorUnitario: 4,
        dataEntregaFn: 5
      };

      setFornecedores(prev => prev.map(f => {
        if (f.id === fornecedorId) {
          const produtosAtualizados = f.produtos.map(produto => {
            const produtoDados = produtos.find(p => p[colIndices.produto] === produto.nome);
            
            if (produtoDados) {
              const novoValorUnitario = parseFloat(produtoDados[colIndices.valorUnitario]) || 0;
              const dataEntregaFn = produtoDados[colIndices.dataEntregaFn] || '';
              
              return {
                ...produto,
                valorUnitario: novoValorUnitario,
                dataEntregaFn,
                total: produto.qtde * novoValorUnitario
              };
            }
            return produto;
          });

          return { ...f, produtos: produtosAtualizados };
        }
        return f;
      }));

      alert('Dados importados com sucesso!');
    } catch (error) {
      console.error('Erro ao importar fornecedor:', error);
      alert('Erro ao importar dados do fornecedor. Verifique se o arquivo está no formato correto.');
    }
  };

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Nova Cotação</Title>
          <Subtitle>Preencha os dados para criar uma nova cotação</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Seção 1: Informações Básicas */}
          <FormContainer>
            <FormSection>
              <SectionTitle>
                <FaUser />
                Informações Básicas
              </SectionTitle>
              
              <FormRow>
                <FormGroup>
                  <Label>
                    <FaUser />
                    Comprador
                  </Label>
                  <Input
                  type="text"
                  value={formData.comprador}
                  disabled
                    className="disabled"
                  />
                </FormGroup>
                
                <FormGroup>
                  <Label>
                    <FaMapMarkerAlt />
                    Local de Entrega *
                  </Label>
                  <Select
                  value={formData.localEntrega}
                  onChange={(e) => handleInputChange('localEntrega', e.target.value)}
                    className={errors.localEntrega ? 'error' : ''}
                >
                  <option value="">Selecione o local de entrega</option>
                  {locaisEntrega.map((local) => (
                    <option key={local} value={local}>
                      {local}
                    </option>
                  ))}
                  </Select>
                {errors.localEntrega && (
                    <ErrorMessage>{errors.localEntrega}</ErrorMessage>
                  )}
                </FormGroup>
              </FormRow>

              <FormRow>
                <FormGroup>
                  <Label>
                    <FaShoppingCart />
                    Tipo de Compra *
                  </Label>
                  <RadioGroup>
                    <RadioOption>
                    <input
                      type="radio"
                      name="tipoCompra"
                      value="programada"
                      checked={formData.tipoCompra === 'programada'}
                      onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                    />
                    <span className="radio-label">Compra Programada</span>
                    </RadioOption>
                    <RadioOption>
                    <input
                      type="radio"
                      name="tipoCompra"
                      value="emergencial"
                      checked={formData.tipoCompra === 'emergencial'}
                      onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                    />
                    <span className="radio-label">Compra Emergencial</span>
                    </RadioOption>
                    <RadioOption>
                    <input
                      type="radio"
                      name="tipoCompra"
                      value="tag"
                      checked={formData.tipoCompra === 'tag'}
                      onChange={(e) => handleInputChange('tipoCompra', e.target.value)}
                    />
                    <span className="radio-label">TAG</span>
                    </RadioOption>
                  </RadioGroup>
                </FormGroup>
              </FormRow>
            </FormSection>
          </FormContainer>

          {/* Seção 2: Motivo Emergencial */}
          {formData.tipoCompra === 'emergencial' && (
            <FormContainer>
              <FormSection>
                <SectionTitle>
                  <FaExclamationTriangle />
                  Motivo da Compra Emergencial
                </SectionTitle>
                
                <FormRow>
                  <FormGroup>
                    <Label>Motivo *</Label>
                    <Select
                    value={formData.motivoEmergencial}
                    onChange={(e) => handleInputChange('motivoEmergencial', e.target.value)}
                      className={errors.motivoEmergencial ? 'error' : ''}
                  >
                    <option value="">Selecione o motivo</option>
                    {motivosEmergenciais.map((motivo) => (
                      <option key={motivo} value={motivo}>
                        {motivo}
                      </option>
                    ))}
                    </Select>
                  {errors.motivoEmergencial && (
                      <ErrorMessage>{errors.motivoEmergencial}</ErrorMessage>
                  )}
                  </FormGroup>
                
                {formData.motivoEmergencial && (
                    <FormGroup>
                      <Label>{getFieldLabel()} *</Label>
                      <Textarea
                      value={formData.justificativa}
                      onChange={(e) => handleInputChange('justificativa', e.target.value)}
                      placeholder={getPlaceholderText()}
                        className={errors.justificativa ? 'error' : ''}
                      rows="4"
                    />
                    {errors.justificativa && (
                        <ErrorMessage>{errors.justificativa}</ErrorMessage>
                    )}
                    </FormGroup>
                )}
                </FormRow>
              </FormSection>
            </FormContainer>
          )}

          {/* Seção 3: Upload de Planilha */}
          <FormContainer>
            <FormSection>
              <SectionTitle>
                <FaFileUpload />
                Produtos da Cotação
              </SectionTitle>
              
              <FormGroup>
                <Label>
                  <FaFileUpload />
                  Upload da Planilha XLSX *
                </Label>
                <FileInput
                  type="file"
                  accept=".xlsx,.xls"
                  onChange={handleFileUpload}
                />
                <FileHelp>
                  A planilha deve conter as colunas: Entrega (B), Qtde (C), Código (D), Nome (E), UN (F)
                </FileHelp>
                {errors.planilha && (
                  <ErrorMessage>{errors.planilha}</ErrorMessage>
                )}
              </FormGroup>

            {planilhaCarregada && (
                <ProdutosInfo>
                <p><strong>{produtos.length} produtos únicos</strong> carregados da planilha</p>
                {produtos.some(p => p.isDuplicado) && (
                    <DuplicadosInfo>
                    <strong>⚠️ Produtos duplicados foram consolidados automaticamente</strong>
                    </DuplicadosInfo>
                )}
                </ProdutosInfo>
            )}
            </FormSection>
          </FormContainer>

          {/* Seção 4: Fornecedores */}
          <FormContainer>
            <FormSection>
              <SectionTitle>
                <FaUser />
                Fornecedores
              </SectionTitle>
            
            {errors.fornecedores && (
                <ErrorMessage>{errors.fornecedores}</ErrorMessage>
            )}

              <FornecedoresContainer>
              {fornecedores.map((fornecedor, index) => (
                  <FornecedorCard key={fornecedor.id}>
                    <FornecedorHeader>
                      <FornecedorTitle>Fornecedor {index + 1}</FornecedorTitle>
                      <FornecedorActions>
                        <ActionButton
                        type="button"
                        onClick={() => exportarFornecedor(fornecedor)}
                          className="export"
                        title="Exportar dados para o fornecedor"
                      >
                          <FaDownload />
                        Exportar
                        </ActionButton>
                        <ActionButton
                          type="button"
                          className="import"
                          title="Importar dados do fornecedor"
                        >
                          <FaUpload />
                        Importar
                        <input
                          type="file"
                          accept=".xlsx,.xls"
                          onChange={(e) => {
                            if (e.target.files[0]) {
                              importarFornecedor(fornecedor.id, e.target.files[0]);
                              e.target.value = '';
                            }
                          }}
                          style={{ display: 'none' }}
                        />
                        </ActionButton>
                        <ActionButton
                        type="button"
                        onClick={() => removeFornecedor(fornecedor.id)}
                          className="remove"
                      >
                          <FaTrash />
                        Remover
                        </ActionButton>
                      </FornecedorActions>
                    </FornecedorHeader>
                  
                                      <FormRow>
                      <FormGroup>
                        <Label>Nome do Fornecedor *</Label>
                        <Input
                          type="text"
                          value={fornecedor.nome}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'nome', e.target.value)}
                          placeholder="Nome do fornecedor"
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label>Prazo de Pagamento</Label>
                        <Input
                          type="text"
                          value={fornecedor.prazoPagamento}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'prazoPagamento', e.target.value)}
                          placeholder="Ex: 30/60/90 dias"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormRow>
                      <FormGroup>
                        <Label>Tipo de Frete</Label>
                        <Select
                          value={fornecedor.tipoFrete}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'tipoFrete', e.target.value)}
                        >
                          <option value="">Selecione o tipo de frete</option>
                          {tiposFrete.map((tipo) => (
                            <option key={tipo} value={tipo}>
                              {tipo}
                            </option>
                          ))}
                        </Select>
                      </FormGroup>
                      
                      <FormGroup>
                        <Label>Valor do Frete</Label>
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          value={fornecedor.valorFrete}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'valorFrete', parseFloat(e.target.value) || 0)}
                          placeholder="R$ 0,00"
                        />
                      </FormGroup>
                    </FormRow>

                  {/* Tabela de Produtos do Fornecedor */}
                  {planilhaCarregada && (
                    <TableContainer>
                      <TableTitle>Produtos do Fornecedor</TableTitle>
                      <TableWrapper>
                        <Table>
                          <thead>
                            <tr>
                              <Th>Produto</Th>
                              <Th>Qtd</Th>
                              <Th>UN</Th>
                              <Th>Prazo Entrega</Th>
                              <Th>Ult. Vlr. Aprovado</Th>
                              <Th>Ult. Fornecedor Aprovado</Th>
                              <Th>Valor Anterior</Th>
                              <Th>Valor Unit.</Th>
                              <Th>Difal</Th>
                              <Th>IPI</Th>
                              <Th>Valor Unit. Difal/Frete</Th>
                              <Th>Data Entrega Fn</Th>
                              <Th>Total</Th>
                              <Th>Ações</Th>
                            </tr>
                          </thead>
                          <tbody>
                            {fornecedor.produtos.map((produto) => (
                              <tr key={produto.id}>
                                <Td className="read-only">
                                  {produto.nome}
                                  {produto.isDuplicado && (
                                    <ConsolidadoBadge title="Produto consolidado de múltiplas linhas">
                                      🔗
                                    </ConsolidadoBadge>
                                  )}
                                </Td>
                                <Td className="read-only">{produto.qtde}</Td>
                                <Td className="read-only">{produto.un}</Td>
                                <Td>
                                  <TableInput
                                    type="text"
                                    value={produto.prazoEntrega}
                                    onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'prazoEntrega', e.target.value)}
                                    placeholder="Prazo"
                                  />
                                </Td>
                                <Td className="read-only">{produto.ultValorAprovado || '-'}</Td>
                                <Td className="read-only">{produto.ultFornecedorAprovado || '-'}</Td>
                                <Td className="read-only">{produto.valorAnterior || '-'}</Td>
                                <Td>
                                  <TableInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={produto.valorUnitario}
                                    onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                                    placeholder="R$"
                                  />
                                </Td>
                                <Td>
                                  <TableInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={produto.difal}
                                    onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'difal', parseFloat(e.target.value) || 0)}
                                    placeholder="R$"
                                  />
                                </Td>
                                <Td>
                                  <TableInput
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={produto.ipi}
                                    onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'ipi', parseFloat(e.target.value) || 0)}
                                    placeholder="R$"
                                  />
                                </Td>
                                <Td className="read-only">{produto.valorUnitarioDifalFrete || '-'}</Td>
                                <Td>
                                  <TableInput
                                    type="text"
                                    value={produto.dataEntregaFn}
                                    onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'dataEntregaFn', e.target.value)}
                                    placeholder="Data"
                                  />
                                </Td>
                                <Td className="read-only total-cell">
                                  {formatarValor(produto.total)}
                                </Td>
                                <Td>
                                  <RemoveItemButton
                                    type="button"
                                    onClick={() => removeProduto(fornecedor.id, produto.id)}
                                    title="Remover produto"
                                  >
                                    ✕
                                  </RemoveItemButton>
                                </Td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </TableWrapper>
                    </TableContainer>
                  )}
                  </FornecedorCard>
                ))}
                
                <AddFornecedorButton
                type="button"
                onClick={addFornecedor}
                disabled={!planilhaCarregada}
              >
                  <FaPlus />
                  Adicionar Fornecedor
                </AddFornecedorButton>
              </FornecedoresContainer>
            </FormSection>
          </FormContainer>

          <ButtonGroup>
            <CancelButton onClick={handleCancel}>
              <FaTimes />
              Cancelar
            </CancelButton>
            <SubmitButton type="submit">
              <FaSave />
              Criar Cotação
            </SubmitButton>
          </ButtonGroup>
        </Form>
        
        {/* Botão de scroll dinâmico */}
        {showScrollButton && (
          <ScrollButton
            type="button"
            onClick={handleScrollClick}
            title={isAtBottom ? "Ir para o topo" : "Ir para o final"}
          >
            {isAtBottom ? <FaArrowUp /> : <FaArrowDown />}
          </ScrollButton>
        )}
      </Container>
    </Layout>
  );
};

export default NovaCotacao; 