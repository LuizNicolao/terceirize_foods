import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cotacoesService from '../services/cotacoes';
import { anexosService } from '../services/anexos';
import toast from 'react-hot-toast';

export const useEditarCotacao = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  
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
  const [cotacaoOriginal, setCotacaoOriginal] = useState(null);

  // Removido: locaisEntrega agora é buscado dinamicamente via FilialSearch

  const tiposFrete = [
    'CIF', 'FOB', 'FAS', 'EXW', 'CPT', 'CIP', 'DAP', 'DPU', 'DDP'
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
      
      const data = await cotacoesService.getCotacaoById(id);
      
      // Verificar se a cotação pode ser editada
      if (data.cotacao.status !== 'pendente' && data.cotacao.status !== 'renegociacao') {
        // Redirecionar para visualização em vez de mostrar erro
        navigate(`/visualizar-cotacao/${id}`);
        return;
      }
      
      setCotacaoOriginal(data);
      
      // Preencher formulário
      setFormData({
        id: data.cotacao.id || data.cotacao.numero || id, // Adicionar o ID da cotação
        comprador: data.cotacao.comprador || '',
        localEntrega: data.cotacao.local_entrega || '',
        tipoCompra: data.cotacao.tipo_compra || 'programada',
        motivoEmergencial: data.cotacao.motivo_emergencial || '',
        justificativa: data.cotacao.justificativa || '',
        produtos_renegociar: data.cotacao.produtos_renegociar || []
      });
      
      // Mapear produtos
      const produtosMapeados = (data.produtos || []).map(p => ({
        ...p,
        prazoEntrega: p.prazo_entrega || '',
        dataEntregaFn: p.data_entrega_fn || p.entrega || '',
        ultValorAprovado: p.ult_valor_aprovado || null,
        ultFornecedorAprovado: p.ult_fornecedor_aprovado || null,
        valorAnterior: p.valor_anterior || 0
      }));
      setProdutos(produtosMapeados);
      
      // Mapear fornecedores
      const fornecedoresMapeados = data.fornecedores?.map(f => ({
        ...f,
        produtos: f.produtos?.map(p => ({
          ...p,
          prazoEntrega: p.prazo_entrega || '',
          valorUnitario: parseFloat(p.valor_unitario) || 0,
          valor_unitario: parseFloat(p.valor_unitario) || 0, // Manter compatibilidade
          primeiroValor: parseFloat(p.primeiro_valor) || 0,
          valorAnterior: parseFloat(p.valor_anterior) || 0,
          dataEntregaFn: p.data_entrega_fn || '',
          difal: parseFloat(p.difal) || 0,
          ipi: parseFloat(p.ipi) || 0,
          total: parseFloat(p.total) || 0
        }))
      })) || [];
      
      setFornecedores(fornecedoresMapeados);
    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      setError(error.message || 'Erro ao carregar cotação');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
    setFornecedores(prevFornecedores => 
      prevFornecedores.map(f => 
        f.id === fornecedorId ? { ...f, [field]: value } : f
      )
    );
  };

  const updateProdutoFornecedor = (fornecedorId, produtoId, field, value) => {
    setFornecedores(prevFornecedores => {
      const updatedFornecedores = prevFornecedores.map(f => {
        if (f.id === fornecedorId) {
          const produtosAtualizados = f.produtos.map(p => {
            if (p.id === produtoId) {
              const updatedProduto = { ...p, [field]: value };
              
              if (field === 'valorUnitario') {
                const novoValor = parseFloat(value) || 0;
                const valorAtual = parseFloat(p.valorUnitario) || 0;
                const qtde = parseFloat(p.qtde) || 0;
                
                // Atualizar ambos os campos para compatibilidade
                updatedProduto.valorUnitario = novoValor;
                updatedProduto.valor_unitario = novoValor;
                
                // Lógica para gerenciar valores unitários
                if (novoValor > 0) {
                  // Se é o primeiro valor sendo definido
                  if (!updatedProduto.primeiroValor || updatedProduto.primeiroValor === 0) {
                    updatedProduto.primeiroValor = novoValor;
                  }
                  
                  // Se já existe um valor unitário atual e é diferente do novo
                  if (valorAtual > 0 && novoValor !== valorAtual) {
                    // Mover valor atual para valor_anterior
                    updatedProduto.valorAnterior = valorAtual;
                  }
                }
                
                // Calcular total considerando DIFAL e IPI
                const difal = parseFloat(updatedProduto.difal) || 0;
                const ipi = parseFloat(updatedProduto.ipi) || 0;
                const valorComImpostos = novoValor * (1 + (difal / 100)) + ipi;
                updatedProduto.total = qtde * valorComImpostos;
              } else if (field === 'difal' || field === 'ipi') {
                const qtde = parseFloat(p.qtde) || 0;
                const valorUnit = parseFloat(p.valorUnitario) || 0;
                const difal = field === 'difal' ? parseFloat(value) || 0 : parseFloat(p.difal) || 0;
                const ipi = field === 'ipi' ? parseFloat(value) || 0 : parseFloat(p.ipi) || 0;
                
                // Calcular total considerando DIFAL e IPI
                const valorComImpostos = valorUnit * (1 + (difal / 100)) + ipi;
                updatedProduto.total = qtde * valorComImpostos;
              }
              return updatedProduto;
            }
            return p;
          });
          return { ...f, produtos: produtosAtualizados };
        }
        return f;
      });
      
      return updatedFornecedores;
    });
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
        id: `forn_prod_${fornecedorId}_${produto.id}_${Date.now()}`,
        produto_id: produto.id,
        nome: produto.nome || produto.produto_nome || produto.descricao || '',
        qtde: produto.qtde || produto.quantidade || 0,
        un: produto.un || produto.unidade || '',
        valorUnitario: 0,
        valor_unitario: 0, // Manter compatibilidade
        primeiroValor: 0,
        valorAnterior: 0,
        total: 0,
        difal: 0,
        ipi: 0,
        prazoEntrega: produto.prazoEntrega || produto.prazo_entrega || '',
        dataEntregaFn: produto.dataEntregaFn || produto.data_entrega_fn || produto.entrega || '',
        ult_valor_aprovado: produto.ult_valor_aprovado || produto.ultimo_valor_aprovado_saving || produto.ultimoValorAprovado || null,
        ult_fornecedor_aprovado: produto.ult_fornecedor_aprovado || produto.ultimo_fornecedor_aprovado_saving || produto.ultimoFornecedorAprovado || null
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
      
      try {
        // Verificar anexos obrigatórios antes de enviar
        const validacoes = await anexosService.getValidacaoAnexos(id);
        
        const anexosObrigatorios = validacoes.filter(v => v.anexo_obrigatorio);
        const anexosEnviados = anexosObrigatorios.filter(v => v.anexo_enviado);
        
        if (anexosObrigatorios.length > 0 && anexosEnviados.length < anexosObrigatorios.length) {
          const fornecedoresPendentes = anexosObrigatorios
            .filter(v => !v.anexo_enviado)
            .map(v => v.fornecedor_nome)
            .join(', ');
          
          toast.error(`É obrigatório enviar anexos para os seguintes fornecedores: ${fornecedoresPendentes}. Isso pode ser necessário após alterações nos valores unitários.`);
          setSaving(false);
          return;
        }
        
        // Garantir que os dados estão no formato correto
        const fornecedoresFormatados = fornecedores.map(fornecedor => ({
          ...fornecedor,
          produtos: fornecedor.produtos.map(produto => ({
            ...produto,
            valorUnitario: parseFloat(produto.valorUnitario) || 0,
            valor_unitario: parseFloat(produto.valorUnitario) || 0, // Garantir compatibilidade
            total: parseFloat(produto.total) || 0,
            difal: parseFloat(produto.difal) || 0,
            ipi: parseFloat(produto.ipi) || 0,
            qtde: parseFloat(produto.qtde) || 0
          }))
        }));
        
        const cotacaoData = {
          ...formData,
          motivoFinal: formatarMotivoFinal(),
          produtos,
          fornecedores: fornecedoresFormatados
        };

        await cotacoesService.updateCotacao(id, cotacaoData);
        
        const mensagem = cotacaoOriginal?.status === 'renegociacao' 
          ? 'Cotação em renegociação atualizada com sucesso! Agora você pode reenviar para o supervisor.'
          : 'Cotação atualizada com sucesso!';
        
        toast.success(mensagem + ' Você permanecerá na página de edição.');
        // Recarregar os dados da cotação para mostrar as atualizações
        await fetchCotacao();
      } catch (error) {
        console.error('Erro ao atualizar cotação:', error);
        toast.error(`Erro ao atualizar cotação: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/cotacoes');
  };

  useEffect(() => {
    if (id) {
      fetchCotacao();
    }
  }, [id, fetchCotacao]);

  return {
    // Estados
    formData,
    errors,
    produtos,
    fornecedores,
    loading,
    error,
    saving,
    cotacaoOriginal,
    
    // Constantes
    tiposFrete,
    motivosEmergenciais,
    
    // Funções
    handleInputChange,
    updateFornecedor,
    updateProdutoFornecedor,
    removeFornecedor,
    removeProduto,
    addFornecedor,
    handleSubmit,
    handleCancel,
    fetchCotacao
  };
};