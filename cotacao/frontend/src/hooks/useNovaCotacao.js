import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import cotacoesService from '../services/cotacoes';
import { anexosService } from '../services/anexos';
import * as XLSX from 'xlsx';
import toast from 'react-hot-toast';

export const useNovaCotacao = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    comprador: user?.name || '',
    localEntrega: '',
    tipoCompra: 'programada',
    motivoEmergencial: '',
    justificativa: ''
  });

  const [errors, setErrors] = useState({});
  const [produtos, setProdutos] = useState([]);
  const [fornecedores, setFornecedores] = useState([]);
  const [planilhaCarregada, setPlanilhaCarregada] = useState(false);
  const [saving, setSaving] = useState(false);

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
    setFornecedores(prevFornecedores => {
      return prevFornecedores.map(f => 
        f.id === fornecedorId ? { ...f, [field]: value } : f
      );
    });
  };

  const updateProdutoFornecedor = (fornecedorId, produtoId, field, value) => {
    setFornecedores(prevFornecedores => {
      return prevFornecedores.map(f => {
        if (f.id === fornecedorId) {
          const produtosAtualizados = f.produtos.map(p => {
            if (p.id === produtoId) {
              const updatedProduto = { ...p, [field]: value };
              
              if (field === 'valorUnitario') {
                const novoValor = parseFloat(value) || 0;
                const valorAtual = parseFloat(p.valorUnitario) || 0;
                const qtde = parseFloat(p.qtde) || 0;
                
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
                
                updatedProduto.total = qtde * novoValor;
              } else if (field === 'difal' || field === 'ipi') {
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
      });
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
          ...produto,
          id: `forn_prod_${fornecedorId}_${produto.id}_${Date.now()}`,
          produto_id: produto.id,
          valorUnitario: 0,
          primeiroValor: 0,
          valorAnterior: 0,
          total: 0,
          difal: 0,
          ipi: 0,
          prazoEntrega: produto.prazoEntrega || '',
          dataEntregaFn: produto.dataEntregaFn || produto.entrega || ''
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
      newErrors.produtos = 'É necessário importar uma planilha com produtos';
    }

    if (fornecedores.length === 0) {
      newErrors.fornecedores = 'É necessário adicionar pelo menos um fornecedor';
    }

    // Validar se todos os fornecedores têm nome ou CNPJ
    fornecedores.forEach((fornecedor, index) => {
      if ((!fornecedor.nome || fornecedor.nome.trim() === '') && (!fornecedor.cnpj || fornecedor.cnpj.trim() === '')) {
        newErrors[`fornecedor_${index}_nome`] = 'Nome do fornecedor é obrigatório';
      }
    });

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
        // Calcular estatísticas
        const estatisticas = {
          produtos: produtos.length,
          fornecedores: fornecedores.length
        };


        
        const cotacaoData = {
          comprador: formData.comprador,
          local_entrega: formData.localEntrega,
          tipo_compra: formData.tipoCompra,
          motivo_emergencial: formData.motivoEmergencial,
          justificativa: formData.justificativa,
          motivoFinal: formatarMotivoFinal(),
          produtos,
          fornecedores,
          estatisticas
        };

        // Criar a cotação primeiro
        const cotacaoCriada = await cotacoesService.createCotacao(cotacaoData);
        
        // Verificar se há fornecedores que precisam de anexos
        if (fornecedores.length > 0) {
          // Aguardar um pouco para o backend processar
          await new Promise(resolve => setTimeout(resolve, 1000));
          
          // Verificar anexos obrigatórios
          const cotacaoId = cotacaoCriada.data?.id || cotacaoCriada.id || cotacaoCriada.numero;
          
          if (!cotacaoId) {
            toast.success('Cotação criada com sucesso!');
            return;
          }
          
          const validacoes = await anexosService.getValidacaoAnexos(cotacaoId);
          const anexosObrigatorios = validacoes.filter(v => v.anexo_obrigatorio);
          
          if (anexosObrigatorios.length > 0) {
            toast.success('Cotação criada com sucesso! Agora você precisa enviar os anexos obrigatórios.');
            // Redirecionar para edição para permitir upload de anexos
            navigate(`/editar-cotacao/${cotacaoId}`);
            return;
          }
        }
        
        // Redirecionar para editar cotação após criação bem-sucedida
        const cotacaoId = cotacaoCriada.data?.id || cotacaoCriada.id || cotacaoCriada.numero;
        toast.success('Cotação criada com sucesso! Redirecionando para edição...');
        navigate(`/editar-cotacao/${cotacaoId}`);
      } catch (error) {
        console.error('Erro ao criar cotação:', error);
        toast.error(`Erro ao criar cotação: ${error.message || 'Erro desconhecido'}`);
      } finally {
        setSaving(false);
      }
    }
  };

  const handleCancel = () => {
    navigate('/cotacoes');
  };

  // Funções para upload de planilha
  const handleFileUpload = async (file) => {
    try {
      const data = new Uint8Array(await file.arrayBuffer());
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

      // Processar produtos da planilha
      const produtosExtraidos = [];
      for (let i = 1; i < jsonData.length; i++) {
        const row = jsonData[i];
        if (row && row.length >= 6) {
          const qtde = parseFloat(row[2]) || 0;
          const codigo = row[3] || '';
          const nome = row[4] || '';
          const un = row[5] || '';
          const entrega = row[1] || '';

          if (codigo && nome) {
            produtosExtraidos.push({
              id: `produto_${Date.now()}_${i}`,
              codigo,
              nome,
              qtde,
              un,
              entrega,
              prazoEntrega: entrega,
              dataEntregaFn: entrega
            });
          }
        }
      }

      setProdutos(produtosExtraidos);
      setPlanilhaCarregada(true);
      
      // Atualizar fornecedores existentes com novos produtos
      if (fornecedores.length > 0) {
        setFornecedores(fornecedores.map(fornecedor => ({
          ...fornecedor,
          produtos: produtosExtraidos.map(produto => ({
            ...produto,
            id: `forn_prod_${fornecedor.id}_${produto.id}_${Date.now()}`,
            produto_id: produto.id,
            valorUnitario: 0,
            total: 0,
            difal: 0,
            ipi: 0
          }))
        })));
      }

      toast.success('Planilha importada com sucesso!');
    } catch (error) {
      console.error('Erro ao processar arquivo:', error);
      toast.error('Erro ao processar o arquivo. Verifique se o formato está correto.');
    }
  };

  return {
    // Estados
    formData,
    errors,
    produtos,
    fornecedores,
    planilhaCarregada,
    saving,
    
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
    handleFileUpload
  };
};
