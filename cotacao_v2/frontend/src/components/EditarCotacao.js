import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Layout from './Layout';
import { calcularMelhoresPrecos, temMelhorPreco } from '../utils/priceUtils';
import * as XLSX from 'xlsx';
import styled from 'styled-components';
import FornecedorSearch from './FornecedorSearch';
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
  FaChevronDown,
  FaChevronUp,
  FaTimes as FaTimesIcon
} from 'react-icons/fa';
import { colors, shadows } from '../design-system';
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

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const ToggleButton = styled.button`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 14px;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: ${shadows.sm};

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`;

const SearchContainer = styled.div`
  margin-bottom: 20px;
`;

const SearchBox = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  max-width: 400px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 12px 40px 12px 16px;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 14px;
  background: ${colors.neutral.white};
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    box-shadow: 0 0 0 3px rgba(0, 114, 62, 0.1);
    outline: none;
  }

  &::placeholder {
    color: ${colors.neutral.gray};
  }
`;

const SearchClear = styled.button`
  position: absolute;
  right: 12px;
  background: none;
  border: none;
  color: ${colors.neutral.gray};
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
  }
`;

const SearchInfo = styled.div`
  margin-top: 8px;
  color: ${colors.neutral.gray};
  font-size: 12px;
`;

const TableWrapper = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: ${shadows.sm};
`;

const ProdutosTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.neutral.white};
  font-size: 14px;
`;

const TableHeader = styled.th`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid ${colors.primary.darkGreen};
`;

const TableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const TableRow = styled.tr`
  transition: background-color 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
  }

  &.produto-renegociacao-row {
    background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  }

  &.produto-renegociacao-row:hover {
    background: linear-gradient(135deg, #ffe0b2 0%, #ffcc02 100%);
  }
`;

const TableInput = styled.input`
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 14px;
  transition: all 0.3s ease;

  &:focus {
    border-color: ${colors.primary.green};
    outline: none;
  }

  &.best-price {
    background: ${colors.primary.green};
    color: ${colors.neutral.white};
    font-weight: 600;
  }

  &.best-price:focus {
    background: ${colors.primary.darkGreen};
  }
`;

const TotalCell = styled(TableCell)`
  font-weight: 600;
  color: ${colors.primary.green};
`;

const FornecedoresContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const FornecedorCard = styled(Card)`
  padding: 24px;
`;

const FornecedorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid ${colors.primary.green};
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

const RemoveButton = styled.button`
  background: ${colors.status.error};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${colors.hover.danger};
    transform: translateY(-1px);
  }
`;

const ExportButton = styled.button`
  background: ${colors.secondary.blue};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${colors.hover.secondary};
    transform: translateY(-1px);
  }
`;

const ImportButton = styled.button`
  background: ${colors.secondary.orange};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: ${colors.hover.warning || '#FF8A65'};
    transform: translateY(-1px);
  }
`;

const FornecedorInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const ProdutosTableTitle = styled.h4`
  color: ${colors.neutral.darkGray};
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
`;

const RemoveItemButton = styled.button`
  background: ${colors.status.error};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 10px;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.hover.danger};
    transform: scale(1.1);
  }
`;

const AddFornecedorButton = styled.button`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 16px;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }

  &:disabled {
    background: ${colors.neutral.gray};
    cursor: not-allowed;
    transform: none;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 16px;
  justify-content: flex-end;
  margin-top: 32px;
  padding-top: 24px;
  border-top: 2px solid ${colors.neutral.lightGray};
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  text-align: center;
`;

const LoadingIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  animation: spin 2s linear infinite;
`;

const LoadingTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
`;

const LoadingText = styled.p`
  color: ${colors.neutral.gray};
  font-size: 16px;
  margin: 0;
`;

const ErrorPlaceholder = styled(LoadingPlaceholder)``;

const ErrorIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  color: ${colors.status.error};
`;

const RetryButton = styled(Button)`
  margin-top: 16px;
`;

// Adicionar estilos CSS que estão faltando para garantir que a tela de edição tenha a mesma aparência da visualização
// Incluir estilos para responsividade, cores, bordas, shadows, etc.

// Estilos adicionais para garantir consistência visual
const Legend = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${colors.neutral.gray};
`;

const LegendColor = styled.div`
  width: 16px;
  height: 16px;
  border-radius: 4px;
  background: ${props => props.color || colors.neutral.gray};
`;

const ScrollButton = styled.button`
  position: fixed;
  bottom: 24px;
  right: 24px;
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  font-size: 18px;
  box-shadow: ${shadows.md};
  transition: all 0.3s ease;
  z-index: 1000;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-2px);
    box-shadow: ${shadows.lg};
  }

  @media (max-width: 768px) {
    bottom: 16px;
    right: 16px;
    width: 40px;
    height: 40px;
    font-size: 16px;
  }
`;

const ModalOverlay = styled.div`
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
  padding: 20px;
`;

const ModalContent = styled.div`
  background: ${colors.neutral.white};
  border-radius: 12px;
  box-shadow: ${shadows.lg};
  max-width: 90vw;
  max-height: 90vh;
  overflow: hidden;
  display: flex;
  flex-direction: column;

  &.modal-large {
    width: 1200px;
    height: 80vh;
  }

  @media (max-width: 768px) {
    width: 95vw;
    height: 90vh;
    margin: 10px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid ${colors.neutral.lightGray};
  background: ${colors.neutral.white};
`;

const ModalTitle = styled.h3`
  color: ${colors.neutral.darkGray};
  font-size: 18px;
  font-weight: 600;
  margin: 0;
`;

const ModalClose = styled.button`
  background: none;
  border: none;
  color: ${colors.neutral.gray};
  cursor: pointer;
  font-size: 20px;
  padding: 4px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
    color: ${colors.neutral.darkGray};
  }
`;

const ModalBody = styled.div`
  padding: 24px;
  overflow-y: auto;
  flex: 1;
`;

const ImportProductsContainer = styled.div`
  h4 {
    color: ${colors.neutral.darkGray};
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 16px 0;
  }
`;

const NoProductsMessage = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: ${colors.neutral.gray};

  p {
    margin: 8px 0 0 0;
  }
`;

const ImportTableContainer = styled.div`
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: ${shadows.sm};
  margin-bottom: 20px;
`;

const ImportProductsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: ${colors.neutral.white};
  font-size: 14px;
`;

const ImportTableHeader = styled.th`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  padding: 16px 12px;
  text-align: left;
  font-weight: 600;
  font-size: 14px;
  border-bottom: 2px solid ${colors.primary.darkGreen};
`;

const ImportTableCell = styled.td`
  padding: 12px;
  border-bottom: 1px solid #e0e0e0;
  vertical-align: middle;
`;

const ImportTableRow = styled.tr`
  transition: background-color 0.3s ease;

  &:hover {
    background: ${colors.neutral.lightGray};
  }
`;

const FornecedoresSelection = styled.div`
  margin-top: 20px;
  padding: 16px;
  background: ${colors.neutral.lightGray};
  border-radius: 8px;
`;

const FornecedorCheckbox = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  cursor: pointer;

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    accent-color: ${colors.primary.green};
  }

  span.disabled {
    color: ${colors.neutral.gray};
    cursor: not-allowed;
  }
`;

const StatusBadge = styled.span`
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: ${colors.neutral.white};

  &.novo {
    background: ${colors.primary.green};
  }

  &.parcial {
    background: ${colors.secondary.orange};
  }

  &.ja-existe {
    background: ${colors.neutral.gray};
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding: 20px 24px;
  border-top: 1px solid ${colors.neutral.lightGray};
  background: ${colors.neutral.white};
`;

const ConfirmButton = styled.button`
  background: ${colors.primary.green};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.primary.darkGreen};
    transform: translateY(-1px);
  }
`;

const CancelButton = styled.button`
  background: ${colors.neutral.gray};
  color: ${colors.neutral.white};
  border: none;
  border-radius: 6px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background: ${colors.neutral.darkGray};
    transform: translateY(-1px);
  }
`;

const BadgeRenegociacao = styled.span`
  background: linear-gradient(45deg, ${colors.secondary.orange}, #FF8A65);
  color: ${colors.neutral.white};
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  animation: pulseRenegociacao 2s infinite;
  margin-left: 8px;

  @keyframes pulseRenegociacao {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.7; }
  }
`;

const ProdutoRenegociacaoNome = styled.span`
  color: #424242;
  font-weight: 600;
`;

const ProdutoRenegociacaoRow = styled(TableRow)`
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
`;

const ValorAnterior = styled.span`
  font-weight: 600;
  cursor: help;
  transition: color 0.3s ease;

  &.melhorou {
    color: ${colors.primary.green};
  }

  &.melhorou:hover {
    color: ${colors.primary.darkGreen};
  }

  &.piorou {
    color: ${colors.status.error};
  }

  &.piorou:hover {
    color: ${colors.hover.danger};
  }

  &.igual {
    color: ${colors.secondary.orange};
  }

  &.igual:hover {
    color: #FF8A65;
  }
`;

const SectionTitle = styled.h2`
  color: ${colors.neutral.darkGray};
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 24px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  border-bottom: 2px solid ${colors.primary.green};
  padding-bottom: 12px;
`;

const EditarCotacao = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user: authUser } = useAuth();
  
  const [formData, setFormData] = useState({
    comprador: '',
    localEntrega: '',
    tipoCompra: 'programada',
    motivoEmergencial: '',
    justificativa: ''
  });

  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [produtosExpanded, setProdutosExpanded] = useState(false);
  const [searchFornecedor, setSearchFornecedor] = useState('');
  const [searchProduto, setSearchProduto] = useState('');
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [isAtBottom, setIsAtBottom] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [importProducts, setImportProducts] = useState([]);
  const [selectedImportProducts, setSelectedImportProducts] = useState({});
  const [selectedFornecedores, setSelectedFornecedores] = useState({});
  const [cotacaoOriginal, setCotacaoOriginal] = useState(null);

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

  const fetchCotacao = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${id}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        
        // Verificar se a cotação pode ser editada (apenas pendente ou renegociacao)
        if (data.status !== 'pendente' && data.status !== 'renegociacao') {
          setError(`Não é possível editar uma cotação com status "${data.status}". Apenas cotações pendentes ou em renegociação podem ser editadas.`);
          setLoading(false);
          return;
        }
        
        // Salvar dados originais da cotação
        setCotacaoOriginal(data);
        
        // Preencher formulário com dados da cotação
        setFormData({
          comprador: data.comprador || '',
          localEntrega: data.local_entrega || '',
          tipoCompra: data.tipo_compra || 'programada',
          motivoEmergencial: data.motivo_emergencial || '',
          justificativa: data.justificativa || '',
          produtos_renegociar: data.produtos_renegociar || [] // Adiciona produtos em renegociação
        });
        
        // Mapear produtos para garantir que dataEntregaFn e prazoEntrega existam
        const produtosMapeados = (data.produtos || []).map(p => ({
          ...p,
          prazoEntrega: p.prazo_entrega || '',
          dataEntregaFn: p.data_entrega_fn || p.entrega || ''
        }));
        setProdutos(produtosMapeados);
        

        
        // Mapear os produtos dos fornecedores com os nomes corretos dos campos
        const fornecedoresMapeados = data.fornecedores?.map(f => ({
          ...f,
          produtos: f.produtos?.map(p => ({
            ...p,
            prazoEntrega: p.prazo_entrega || '',
            valorUnitario: parseFloat(p.valor_unitario) || 0,
            primeiroValor: parseFloat(p.primeiro_valor) || 0,
            valorAnterior: parseFloat(p.valor_anterior) || 0,
            dataEntregaFn: p.data_entrega_fn || '',
            difal: parseFloat(p.difal) || 0,
            ipi: parseFloat(p.ipi) || 0,
            total: parseFloat(p.total) || 0
          }))
        })) || [];
        
        setFornecedores(fornecedoresMapeados);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar cotação');
      }
    } catch (error) {
      setError('Erro ao conectar com o servidor');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchCotacao();
  }, [fetchCotacao]);

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
            
            // Se o valor unitário está sendo alterado, atualizar o valor anterior
            if (field === 'valorUnitario') {
              const novoValor = parseFloat(value) || 0;
              const valorAtual = parseFloat(p.valorUnitario) || 0;
              
              // Se o valor mudou, salvar o valor atual como anterior
              if (novoValor !== valorAtual && valorAtual > 0) {
                updatedProduto.valorAnterior = valorAtual;
              }
              
              // Atualizar o total
              const qtde = parseFloat(p.qtde) || 0;
              updatedProduto.total = qtde * novoValor;
            } else if (field === 'difal' || field === 'ipi') {
              // O total agora é apenas Qtd × Valor Unitário, ignorando difal e ipi
              const qtde = parseFloat(p.qtde) || 0;
              const valorUnit = parseFloat(p.valorUnitario) || 0;
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

  const removeFornecedor = (fornecedorId) => {
    setFornecedores(fornecedores.filter(f => f.id !== fornecedorId));
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

  const addFornecedor = () => {
    const fornecedorId = `forn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const novoFornecedor = {
      id: fornecedorId,
      nome: '',
      prazoPagamento: '',
      tipoFrete: '',
      valorFrete: 0,
              produtos: produtos.map(produto => ({
          ...produto,
          id: `forn_prod_${fornecedorId}_${produto.id}_${Date.now()}`,
          produto_id: produto.id, // Garante que produto_id será enviado
          valorUnitario: 0,
          primeiroValor: 0, // Primeiro valor será 0 inicialmente
          valorAnterior: 0, // Valor anterior será 0 inicialmente
          total: produto.qtde * 0,
          difal: 0,
          ipi: 0,
          prazoEntrega: produto.prazoEntrega || produto.prazo_entrega || '',
          dataEntregaFn: produto.dataEntregaFn || produto.data_entrega_fn || produto.entrega || ''
        }))
    };
    setFornecedores([...fornecedores, novoFornecedor]);
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

    if (produtos.length === 0) {
      newErrors.produtos = 'É necessário ter produtos na cotação';
    }

    if (fornecedores.length === 0) {
      newErrors.fornecedores = 'É necessário adicionar pelo menos um fornecedor';
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
      setSaving(true);
      
      const cotacaoData = {
        ...formData,
        motivoFinal: formatarMotivoFinal(),
        produtos,
        fornecedores
      };

      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL || 'http://82.29.57.43:5000'}/api/cotacoes/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(cotacaoData)
        });

        if (response.ok) {
          // Verificar se a cotação estava em renegociação
          const mensagem = cotacaoOriginal?.status === 'renegociacao' 
            ? 'Cotação em renegociação atualizada com sucesso! Agora você pode reenviar para o supervisor.'
            : 'Cotação atualizada com sucesso!';
          alert(mensagem);
          navigate('/cotacoes');
        } else {
          const errorData = await response.json();
          alert(`Erro ao atualizar cotação: ${errorData.message || 'Erro desconhecido'}`);
        }
      } catch (error) {
        alert('Erro ao conectar com o servidor. Verifique se o backend está rodando.');
      } finally {
        setSaving(false);
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

  // Funções para importação de produtos
  const handleImportFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      processImportFile(file);
    }
  };

  const processImportFile = async (file) => {
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Extrair produtos (pular cabeçalho)
      const produtosExtraidos = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 6) {
          const qtde = parseFloat(row[2]) || 0; // Coluna C
          const codigo = row[3] || ''; // Coluna D
          const nome = row[4] || ''; // Coluna E
          const un = row[5] || ''; // Coluna F
          const entrega = row[1] || ''; // Coluna B

          if (codigo && nome) {
            produtosExtraidos.push({
              id: `import_${Date.now()}_${i}`,
              codigo,
              nome,
              qtde,
              un,
              entrega,
              prazoEntrega: entrega,
              dataEntregaFn: entrega,
              valorUnitario: 0,
              difal: 0,
              ipi: 0,
              total: 0
            });
          }
        }
      }

      // Verificar quais produtos já existem nos fornecedores
      const produtosFiltrados = produtosExtraidos.filter(produto => {
        const produtosExistentes = [];
        fornecedores.forEach(fornecedor => {
          fornecedor.produtos.forEach(produtoExistente => {
            if (produtoExistente.nome === produto.nome) {
              produtosExistentes.push(fornecedor.nome);
            }
          });
        });
        
        // Incluir apenas produtos que não existem em todos os fornecedores
        return produtosExistentes.length < fornecedores.length;
      });

      setImportProducts(produtosFiltrados);
      setShowImportModal(true);
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      alert('Erro ao processar o arquivo. Verifique se o formato está correto.');
    }
  };

  const handleProductSelection = (productId, checked) => {
    setSelectedImportProducts(prev => ({
      ...prev,
      [productId]: checked
    }));
  };

  const handleFornecedorSelection = (productId, fornecedorId, checked) => {
    setSelectedFornecedores(prev => ({
      ...prev,
      [`${productId}_${fornecedorId}`]: checked
    }));
  };

  const confirmImport = () => {
    const produtosSelecionados = importProducts.filter(p => selectedImportProducts[p.id]);
    
    if (produtosSelecionados.length === 0) {
      alert('Selecione pelo menos um produto para importar.');
      return;
    }

    // Verificar se há fornecedores selecionados
    let algumFornecedorSelecionado = false;
    produtosSelecionados.forEach(produto => {
      fornecedores.forEach(fornecedor => {
        if (selectedFornecedores[`${produto.id}_${fornecedor.id}`]) {
          algumFornecedorSelecionado = true;
        }
      });
    });

    if (!algumFornecedorSelecionado) {
      alert('Selecione pelo menos um fornecedor para cada produto.');
      return;
    }

    // Adicionar produtos aos fornecedores selecionados
    setFornecedores(prev => prev.map(fornecedor => {
      const produtosParaAdicionar = produtosSelecionados.filter(produto => 
        selectedFornecedores[`${produto.id}_${fornecedor.id}`]
      );

      if (produtosParaAdicionar.length > 0) {
        const novosProdutos = produtosParaAdicionar.map(produto => ({
          ...produto,
          id: `forn_prod_${fornecedor.id}_${produto.codigo}_${Date.now()}`,
          valorUnitario: 0,
          total: 0
        }));

        return {
          ...fornecedor,
          produtos: [...fornecedor.produtos, ...novosProdutos]
        };
      }
      return fornecedor;
    }));

    // Limpar estados
    setShowImportModal(false);
    setImportProducts([]);
    setSelectedImportProducts({});
    setSelectedFornecedores({});

    alert('Produtos importados com sucesso!');
  };

  const closeImportModal = () => {
    setShowImportModal(false);
    setImportProducts([]);
    setSelectedImportProducts({});
    setSelectedFornecedores({});
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

  // Calcular melhores preços entre fornecedores
  const melhoresPrecos = calcularMelhoresPrecos(fornecedores);

  // Funções de filtro
  const filteredFornecedores = fornecedores.filter(fornecedor =>
    fornecedor.nome.toLowerCase().includes(searchFornecedor.toLowerCase())
  );

  const filteredProdutos = (fornecedorId) => {
    const fornecedor = fornecedores.find(f => f.id === fornecedorId);
    if (!fornecedor) return [];
    
    return fornecedor.produtos.filter(produto =>
      produto.nome.toLowerCase().includes(searchProduto.toLowerCase())
    );
  };

  // Função auxiliar para verificar se um produto está em renegociação
  const isProdutoEmRenegociacao = (produto) => {
    if (!formData.produtos_renegociar || formData.produtos_renegociar.length === 0) {
      return false;
    }
    
    return formData.produtos_renegociar.some(
      p => p.produto_id === produto.id.toString() || p.produto_id === produto.produto_id?.toString()
    );
  };

  if (loading) {
    return (
      <Layout>
        <LoadingPlaceholder>
          <LoadingIcon>⏱</LoadingIcon>
          <LoadingTitle>Carregando cotação...</LoadingTitle>
          <LoadingText>Aguarde um momento</LoadingText>
        </LoadingPlaceholder>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <ErrorPlaceholder>
          <ErrorIcon>✗</ErrorIcon>
          <LoadingTitle>Erro ao carregar cotação</LoadingTitle>
          <LoadingText>{error}</LoadingText>
          <RetryButton onClick={fetchCotacao}>
            Tentar Novamente
          </RetryButton>
        </ErrorPlaceholder>
      </Layout>
    );
  }

  return (
    <Layout>
      <Container>
        <Header>
          <Title>Editar Cotação #{id}</Title>
          <Subtitle>Modifique os dados da cotação conforme necessário</Subtitle>
        </Header>

        <Form onSubmit={handleSubmit}>
          {/* Seção 1: Informações Básicas */}
          <FormContainer>
            <SectionTitle>Informações Básicas</SectionTitle>
            
            <FormRow>
              <FormGroup>
                <Label htmlFor="comprador">
                  <FaUser /> Comprador
                </Label>
                <Input
                  type="text"
                  id="comprador"
                  value={formData.comprador}
                  disabled
                  className="disabled"
                />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="localEntrega">
                  <FaMapMarkerAlt /> Local de Entrega *
                </Label>
                <Select
                  id="localEntrega"
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
                  <FaShoppingCart /> Tipo de Compra *
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
          </FormContainer>

          {/* Seção 2: Motivo Emergencial */}
          {formData.tipoCompra === 'emergencial' && (
            <FormContainer>
              <SectionTitle>
                <FaExclamationTriangle /> Motivo da Compra Emergencial
              </SectionTitle>
              
              <FormRow>
                <FormGroup>
                  <Label htmlFor="motivoEmergencial">Motivo *</Label>
                  <Select
                    id="motivoEmergencial"
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
                    <Label htmlFor="justificativa">{getFieldLabel()} *</Label>
                    <Textarea
                      id="justificativa"
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
            </FormContainer>
          )}

          {/* Seção 3: Produtos */}
          <FormContainer>
            <SectionHeader>
              <SectionTitle>Produtos ({produtos.length})</SectionTitle>
              <ToggleButton
                type="button"
                onClick={() => setProdutosExpanded(!produtosExpanded)}
                title={produtosExpanded ? 'Recolher produtos' : 'Expandir produtos'}
              >
                {produtosExpanded ? <FaChevronUp /> : <FaChevronDown />}
              </ToggleButton>
            </SectionHeader>
            
            {errors.produtos && (
              <ErrorMessage>{errors.produtos}</ErrorMessage>
            )}

            {produtosExpanded && produtos.length > 0 && (
              <TableWrapper>
                <ProdutosTable>
                  <thead>
                    <tr>
                      <TableHeader>Produto</TableHeader>
                      <TableHeader>Qtd</TableHeader>
                      <TableHeader>UN</TableHeader>
                      <TableHeader>Prazo Entrega</TableHeader>
                      <TableHeader>Ult. Vlr. Aprovado</TableHeader>
                      <TableHeader>Ult. Fornecedor Aprovado</TableHeader>
                      <TableHeader>Valor Anterior</TableHeader>
                    </tr>
                  </thead>
                  <tbody>
                    {produtos.map((produto, index) => (
                      <TableRow key={produto.id || index}>
                        <TableCell>{produto.nome}</TableCell>
                        <TableCell>{produto.qtde}</TableCell>
                        <TableCell>{produto.un}</TableCell>
                        <TableCell>{produto.prazo_entrega || '-'}</TableCell>
                        <TableCell>{produto.ult_valor_aprovado || '-'}</TableCell>
                        <TableCell>{produto.ult_fornecedor_aprovado || '-'}</TableCell>
                        <TableCell>{produto.valor_anterior || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </tbody>
                </ProdutosTable>
              </TableWrapper>
            )}
          </FormContainer>

          {/* Seção 4: Fornecedores */}
          <FormContainer>
            <SectionHeader>
              <SectionTitle>Fornecedores</SectionTitle>
              <Legend>
                <LegendItem>
                  <LegendColor color={colors.primary.green}></LegendColor>
                  Melhor preço
                </LegendItem>
              </Legend>
              {fornecedores.length > 0 && (
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{
                    background: colors.secondary.orange,
                    color: colors.neutral.white,
                    border: 'none',
                    borderRadius: '6px',
                    padding: '8px 12px',
                    fontSize: '12px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    <FaFileUpload /> Importar Novos Produtos
                    <input
                      type="file"
                      accept=".xlsx,.xls"
                      onChange={handleImportFileChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                </div>
              )}
            </SectionHeader>
            
            {errors.fornecedores && (
              <ErrorMessage>{errors.fornecedores}</ErrorMessage>
            )}

            {/* Barra de pesquisa de fornecedores */}
            {fornecedores.length > 0 && (
              <SearchContainer>
                <SearchBox>
                  <SearchInput
                    type="text"
                    placeholder="🔍 Pesquisar fornecedor..."
                    value={searchFornecedor}
                    onChange={(e) => setSearchFornecedor(e.target.value)}
                  />
                  {searchFornecedor && (
                    <SearchClear
                      type="button"
                      onClick={() => setSearchFornecedor('')}
                      title="Limpar pesquisa"
                    >
                      <FaTimesIcon />
                    </SearchClear>
                  )}
                </SearchBox>
                {searchFornecedor && (
                  <SearchInfo>
                    {filteredFornecedores.length} de {fornecedores.length} fornecedores encontrados
                  </SearchInfo>
                )}
              </SearchContainer>
            )}

            <FornecedoresContainer>
              {filteredFornecedores.map((fornecedor, index) => (
                <FornecedorCard key={fornecedor.id}>
                  <FornecedorHeader>
                    <FornecedorTitle>Fornecedor {index + 1}</FornecedorTitle>
                    <FornecedorActions>
                      <ExportButton
                        type="button"
                        onClick={() => exportarFornecedor(fornecedor)}
                        title="Exportar dados para o fornecedor"
                      >
                        <FaDownload /> Exportar
                      </ExportButton>
                      <ImportButton as="label">
                        <FaUpload /> Importar
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
                      </ImportButton>
                      <RemoveButton
                        type="button"
                        onClick={() => removeFornecedor(fornecedor.id)}
                      >
                        <FaTrash /> Remover
                      </RemoveButton>
                    </FornecedorActions>
                  </FornecedorHeader>
                  
                  <FornecedorInfo>
                    <FormRow>
                      <FormGroup>
                        <Label>Nome do Fornecedor *</Label>
                        <FornecedorSearch
                          value={fornecedor.nome || ''}
                          onChange={(value) => updateFornecedor(fornecedor.id, 'nome', value)}
                          placeholder="Buscar fornecedor no sistema..."
                          onSelect={(fornecedorSelecionado) => {
                            if (fornecedorSelecionado) {
                              updateFornecedor(fornecedor.id, 'nome', fornecedorSelecionado.razao_social || fornecedorSelecionado.nome_fantasia);
                            }
                          }}
                        />
                      </FormGroup>
                      
                      <FormGroup>
                        <Label>Prazo de Pagamento</Label>
                        <Input
                          type="text"
                          value={fornecedor.prazoPagamento || ''}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'prazoPagamento', e.target.value)}
                          placeholder="Ex: 30/60/90 dias"
                        />
                      </FormGroup>
                    </FormRow>

                    <FormRow>
                      <FormGroup>
                        <Label>Tipo de Frete</Label>
                        <Select
                          value={fornecedor.tipoFrete || ''}
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
                          value={fornecedor.valorFrete || 0}
                          onChange={(e) => updateFornecedor(fornecedor.id, 'valorFrete', parseFloat(e.target.value) || 0)}
                          placeholder="R$ 0,00"
                        />
                      </FormGroup>
                    </FormRow>
                  </FornecedorInfo>

                  {/* Tabela de Produtos do Fornecedor */}
                  {fornecedor.produtos && fornecedor.produtos.length > 0 && (
                    <div>
                      <ProdutosTableTitle>Produtos do Fornecedor</ProdutosTableTitle>
                      
                      {/* Barra de pesquisa de produtos */}
                      {fornecedor.produtos.length > 0 && (
                        <SearchContainer>
                          <SearchBox>
                            <SearchInput
                              type="text"
                              placeholder="🔍 Pesquisar produto..."
                              value={searchProduto}
                              onChange={(e) => setSearchProduto(e.target.value)}
                            />
                            {searchProduto && (
                              <SearchClear
                                type="button"
                                onClick={() => setSearchProduto('')}
                                title="Limpar pesquisa"
                              >
                                ✕
                              </SearchClear>
                            )}
                          </SearchBox>
                          {searchProduto && (
                            <SearchInfo>
                              {filteredProdutos(fornecedor.id).length} de {fornecedor.produtos.length} produtos encontrados
                            </SearchInfo>
                          )}
                        </SearchContainer>
                      )}
                      
                      <TableWrapper>
                        <ProdutosTable>
                          <thead>
                            <tr>
                              <TableHeader>Produto</TableHeader>
                              <TableHeader>Qtd</TableHeader>
                              <TableHeader>UN</TableHeader>
                              <TableHeader>Prazo Entrega</TableHeader>
                              <TableHeader>Ult. Vlr. Aprovado</TableHeader>
                              <TableHeader>Ult. Fornecedor Aprovado</TableHeader>
                              <TableHeader>Valor Anterior</TableHeader>
                              <TableHeader>Valor Unit.</TableHeader>
                              <TableHeader>Difal</TableHeader>
                              <TableHeader>IPI</TableHeader>
                              <TableHeader>Valor Unit. Difal/Frete</TableHeader>
                              <TableHeader>Data Entrega Fn</TableHeader>
                              <TableHeader>Total</TableHeader>
                              <TableHeader>Ações</TableHeader>
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProdutos(fornecedor.id).map((produto) => {
                              // Verifica se o produto está em renegociação
                              const emRenegociacao = isProdutoEmRenegociacao(produto);
                              return (
                                <TableRow key={produto.id} className={emRenegociacao ? 'produto-renegociacao-row' : ''}>
                                  <TableCell>
                                    <span className={emRenegociacao ? 'produto-renegociacao-nome' : ''}>
                                      {produto.nome}
                                      {emRenegociacao && (
                                        <BadgeRenegociacao>Renegociação</BadgeRenegociacao>
                                      )}
                                    </span>
                                  </TableCell>
                                  <TableCell>{produto.qtde}</TableCell>
                                  <TableCell>{produto.un}</TableCell>
                                  <TableCell>
                                    <TableInput
                                      type="text"
                                      value={produto.prazoEntrega || ''}
                                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'prazoEntrega', e.target.value)}
                                      placeholder="Prazo"
                                    />
                                  </TableCell>
                                  <TableCell>{produto.ultValorAprovado || '-'}</TableCell>
                                  <TableCell>{produto.ultFornecedorAprovado || '-'}</TableCell>
                                  <TableCell>
                                    {produto.valorAnterior && produto.valorAnterior > 0 ? (
                                      <ValorAnterior 
                                        className={`${produto.valorUnitario < produto.valorAnterior ? 'melhorou' : produto.valorUnitario > produto.valorAnterior ? 'piorou' : 'igual'}`}
                                        title={
                                          produto.valorUnitario < produto.valorAnterior 
                                            ? 'Preço melhorou em relação ao valor anterior' 
                                            : produto.valorUnitario > produto.valorAnterior 
                                            ? 'Preço piorou em relação ao valor anterior' 
                                            : 'Preço igual ao valor anterior'
                                        }
                                      >
                                        {produto.valorUnitario < produto.valorAnterior ? '↓ ' : produto.valorUnitario > produto.valorAnterior ? '↑ ' : '='} {formatarValor(produto.valorAnterior)}
                                      </ValorAnterior>
                                    ) : '-'}
                                  </TableCell>
                                  <TableCell>
                                    <TableInput
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={produto.valorUnitario || 0}
                                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'valorUnitario', parseFloat(e.target.value) || 0)}
                                      className={temMelhorPreco(produto, fornecedor, melhoresPrecos) ? 'best-price' : ''}
                                      placeholder="R$"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TableInput
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={produto.difal || 0}
                                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'difal', parseFloat(e.target.value) || 0)}
                                      placeholder="R$"
                                    />
                                  </TableCell>
                                  <TableCell>
                                    <TableInput
                                      type="number"
                                      step="0.01"
                                      min="0"
                                      value={produto.ipi || 0}
                                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'ipi', parseFloat(e.target.value) || 0)}
                                      placeholder="R$"
                                    />
                                  </TableCell>
                                  <TableCell>{produto.valorUnitarioDifalFrete || '-'}</TableCell>
                                  <TableCell>
                                    <TableInput
                                      type="text"
                                      value={produto.dataEntregaFn || ''}
                                      onChange={(e) => updateProdutoFornecedor(fornecedor.id, produto.id, 'dataEntregaFn', e.target.value)}
                                      placeholder="Data"
                                    />
                                  </TableCell>
                                  <TotalCell>
                                    {formatarValor(produto.total)}
                                  </TotalCell>
                                  <TableCell>
                                    <RemoveItemButton
                                      type="button"
                                      onClick={() => removeProduto(fornecedor.id, produto.id)}
                                      title="Remover produto"
                                    >
                                      ✕
                                    </RemoveItemButton>
                                  </TableCell>
                                </TableRow>
                              );
                            })}
                          </tbody>
                        </ProdutosTable>
                      </TableWrapper>
                    </div>
                  )}
                </FornecedorCard>
              ))}
              
              <AddFornecedorButton
                type="button"
                onClick={addFornecedor}
                disabled={produtos.length === 0}
              >
                <FaPlus /> Adicionar Fornecedor
              </AddFornecedorButton>
            </FornecedoresContainer>
          </FormContainer>

          <FormActions>
            <Button type="button" onClick={handleCancel} variant="secondary">
              <FaTimes /> Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={saving}>
              <FaSave /> {saving ? 'Salvando...' : 'Salvar Alterações'}
            </Button>
          </FormActions>
        </Form>
        
        {/* Botão de scroll dinâmico */}
        {showScrollButton && (
          <ScrollButton
            type="button"
            onClick={handleScrollClick}
            title={isAtBottom ? "Ir para o topo" : "Ir para o final"}
          >
            {isAtBottom ? '⬆' : '⬇'}
          </ScrollButton>
        )}

        {/* Modal de Importação de Produtos */}
        {showImportModal && (
          <ModalOverlay onClick={closeImportModal}>
            <ModalContent className="modal-large" onClick={(e) => e.stopPropagation()}>
              <ModalHeader>
                <ModalTitle>Importar Novos Produtos</ModalTitle>
                <ModalClose onClick={closeImportModal}>
                  ×
                </ModalClose>
              </ModalHeader>
              
              <ModalBody>
                <ImportProductsContainer>
                  <h4>Produtos Disponíveis para Importação</h4>
                  
                  {importProducts.length === 0 ? (
                    <NoProductsMessage>
                      <p>Nenhum produto novo encontrado no arquivo.</p>
                      <p>Todos os produtos já existem nos fornecedores.</p>
                    </NoProductsMessage>
                  ) : (
                    <>
                      <ImportTableContainer>
                        <ImportProductsTable>
                          <thead>
                            <tr>
                              <ImportTableHeader>
                                <input
                                  type="checkbox"
                                  onChange={(e) => {
                                    importProducts.forEach(produto => {
                                      handleProductSelection(produto.id, e.target.checked);
                                    });
                                  }}
                                />
                              </ImportTableHeader>
                              <ImportTableHeader>Produto</ImportTableHeader>
                              <ImportTableHeader>Código</ImportTableHeader>
                              <ImportTableHeader>Quantidade</ImportTableHeader>
                              <ImportTableHeader>UN</ImportTableHeader>
                              <ImportTableHeader>Fornecedores</ImportTableHeader>
                              <ImportTableHeader>Status</ImportTableHeader>
                            </tr>
                          </thead>
                          <tbody>
                            {importProducts.map((produto) => {
                              const produtosExistentes = [];
                              fornecedores.forEach(fornecedor => {
                                fornecedor.produtos.forEach(produtoExistente => {
                                  if (produtoExistente.nome === produto.nome) {
                                    produtosExistentes.push(fornecedor.nome);
                                  }
                                });
                              });
                              
                              return (
                                <ImportTableRow key={produto.id}>
                                  <ImportTableCell>
                                    <input
                                      type="checkbox"
                                      checked={selectedImportProducts[produto.id] || false}
                                      onChange={(e) => handleProductSelection(produto.id, e.target.checked)}
                                    />
                                  </ImportTableCell>
                                  <ImportTableCell>{produto.nome}</ImportTableCell>
                                  <ImportTableCell>{produto.codigo}</ImportTableCell>
                                  <ImportTableCell>{produto.qtde}</ImportTableCell>
                                  <ImportTableCell>{produto.un}</ImportTableCell>
                                  <ImportTableCell>
                                    <FornecedoresSelection>
                                      {fornecedores.map(fornecedor => {
                                        const jaExiste = produtosExistentes.includes(fornecedor.nome);
                                        return (
                                          <FornecedorCheckbox key={fornecedor.id}>
                                            <input
                                              type="checkbox"
                                              checked={selectedFornecedores[`${produto.id}_${fornecedor.id}`] || false}
                                              disabled={jaExiste}
                                              onChange={(e) => handleFornecedorSelection(produto.id, fornecedor.id, e.target.checked)}
                                            />
                                            <span className={jaExiste ? 'disabled' : ''}>
                                              {fornecedor.nome}
                                              {jaExiste && <StatusBadge className="ja-existe">Já existe</StatusBadge>}
                                            </span>
                                          </FornecedorCheckbox>
                                        );
                                      })}
                                    </FornecedoresSelection>
                                  </ImportTableCell>
                                  <ImportTableCell>
                                    {produtosExistentes.length === 0 ? (
                                      <StatusBadge className="novo">Novo</StatusBadge>
                                    ) : (
                                      <StatusBadge className="parcial">
                                        Existe em {produtosExistentes.length} fornecedor{produtosExistentes.length > 1 ? 'es' : ''}
                                      </StatusBadge>
                                    )}
                                  </ImportTableCell>
                                </ImportTableRow>
                              );
                            })}
                          </tbody>
                        </ImportProductsTable>
                      </ImportTableContainer>
                      
                      <ModalActions>
                        <CancelButton onClick={closeImportModal}>
                          Cancelar
                        </CancelButton>
                        <ConfirmButton onClick={confirmImport}>
                          Confirmar Importação
                        </ConfirmButton>
                      </ModalActions>
                    </>
                  )}
                </ImportProductsContainer>
              </ModalBody>
            </ModalContent>
          </ModalOverlay>
        )}
      </Container>
    </Layout>
  );
};

export default EditarCotacao; 