import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';
import tiposReceitasService from '../../services/tiposReceitas';
import { InformacoesBasicas, Vinculacoes, ProdutosReceita, FiliaisCentrosCusto } from './sections';

/**
 * Modal para Receita
 */
const ReceitaModal = ({
  isOpen,
  onClose,
  onSubmit,
  receita,
  isViewMode = false,
  isDuplicating = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    filiais: [],
    centros_custo: [],
    tipo_receita_id: null,
    tipo_receita_nome: '',
    status: 1,
    produtos: []
  });

  const [produtoForm, setProdutoForm] = useState({
    grupo_id: null,
    produto_origem_id: null,
    percapta_sugerida: ''
  });

  const [errors, setErrors] = useState({});
  
  // Estados para dados do Foods
  // Filiais e centros de custo são carregados pelo componente FiliaisCentrosCusto
  const [grupos, setGrupos] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [tiposReceitas, setTiposReceitas] = useState([]);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingProdutosOrigem, setLoadingProdutosOrigem] = useState(false);
  const [loadingTiposReceitas, setLoadingTiposReceitas] = useState(false);

  // Carregar grupos, produtos origem e tipos de receitas quando modal abrir
  // Filiais e centros de custo são carregados pelo componente FiliaisCentrosCusto
  useEffect(() => {
    if (isOpen) {
      carregarGrupos();
      carregarProdutosOrigem(); // Carregar todos os produtos inicialmente
      carregarTiposReceitas();
    }
  }, [isOpen]);

  const carregarGrupos = async () => {
    setLoadingGrupos(true);
    try {
      // Buscar todos os grupos ativos
      let allGrupos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getGruposAtivos({
          page,
          limit: 100
        });
        
        if (result.success && result.data) {
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allGrupos = [...allGrupos, ...items];
          
          // Verificar se há mais páginas
          if (result.pagination) {
            hasMore = page < result.pagination.pages;
            page++;
          } else {
            hasMore = items.length === 100;
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      setGrupos(allGrupos);
    } catch (error) {
      console.error('Erro ao carregar grupos:', error);
    } finally {
      setLoadingGrupos(false);
    }
  };

  const carregarProdutosOrigem = async (grupoId = null) => {
    setLoadingProdutosOrigem(true);
    try {
      // Buscar todos os produtos origem (múltiplas páginas se necessário)
      let allProdutos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const params = {
          page,
          limit: 100,
          status: 1 // Apenas ativos
        };
        
        // Adicionar filtro de grupo se selecionado
        if (grupoId) {
          params.grupo_id = grupoId;
        }
        
        const result = await FoodsApiService.getProdutosOrigem(params);
        
        if (result.success && result.data && result.data.length > 0) {
          allProdutos = [...allProdutos, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setProdutosOrigem(allProdutos);
    } catch (error) {
      console.error('Erro ao carregar produtos origem:', error);
    } finally {
      setLoadingProdutosOrigem(false);
    }
  };

  const carregarTiposReceitas = async () => {
    setLoadingTiposReceitas(true);
    try {
      // Buscar todos os tipos de receitas ativos
      let allTiposReceitas = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await tiposReceitasService.listar({
          page,
          limit: 100,
          status: 1 // Apenas ativos
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allTiposReceitas = [...allTiposReceitas, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setTiposReceitas(allTiposReceitas);
    } catch (error) {
      console.error('Erro ao carregar tipos de receitas:', error);
    } finally {
      setLoadingTiposReceitas(false);
    }
  };

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        descricao: '',
        filiais: [],
        centros_custo: [],
        tipo_receita_id: null,
        tipo_receita_nome: '',
        status: 1,
        produtos: [],
        receita_original_id: null
      });
      setProdutoForm({
        grupo_id: null,
        produto_origem_id: null,
        percapta_sugerida: ''
      });
      setErrors({});
    }
  }, [isOpen]);

  // Preencher dados quando receita é fornecida
  useEffect(() => {
    if (isOpen && receita) {
      // Formatar percapita dos produtos para 4 casas decimais
      const produtosFormatados = (receita.produtos || []).map(produto => {
        if (produto.percapta_sugerida !== null && produto.percapta_sugerida !== undefined) {
          const valorNumerico = parseFloat(produto.percapta_sugerida);
          if (!isNaN(valorNumerico)) {
            return {
              ...produto,
              percapta_sugerida: parseFloat(valorNumerico.toFixed(6))
            };
          }
        }
        return produto;
      });

      // Converter dados antigos para arrays (compatibilidade)
      const filiais = receita.filiais || (receita.filial_id ? [{ id: receita.filial_id, nome: receita.filial_nome || receita.filial || '' }] : []);
      const centrosCusto = receita.centros_custo || (receita.centro_custo_id ? [{ 
        id: receita.centro_custo_id, 
        nome: receita.centro_custo_nome || receita.centro_custo || '',
        filial_id: receita.filial_id || null,
        filial_nome: receita.filial_nome || receita.filial || null
      }] : []);

      setFormData({
        nome: receita.nome || '',
        descricao: receita.descricao || '',
        filiais: filiais,
        centros_custo: centrosCusto,
        tipo_receita_id: receita.tipo_receita_id || null,
        tipo_receita_nome: receita.tipo_receita_nome || receita.tipo_receita || '',
        status: receita.status !== undefined ? receita.status : 1,
        produtos: produtosFormatados,
        receita_original_id: receita.receita_original_id || receita.id || null
      });
    }
  }, [isOpen, receita]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo e campos relacionados
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
    
    // Limpar erros relacionados quando campos de vinculação são preenchidos
    if (field === 'filiais' && value && value.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.filiais;
        return newErrors;
      });
    }
    if (field === 'centros_custo' && value && value.length > 0) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.centros_custo;
        return newErrors;
      });
    }
    if (field === 'tipo_receita_id' && value) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors.tipo_receita_id;
        return newErrors;
      });
    }
  };

  const handleProdutoFormChange = (field, value) => {
    setProdutoForm(prev => ({
      ...prev,
      [field]: value
    }));

    // Limpar erros quando o campo for preenchido
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleAddProduto = () => {
    // Validação: apenas produto origem é obrigatório para adicionar
    if (!produtoForm.produto_origem_id) {
      setErrors(prev => ({
        ...prev,
        produto_origem: 'Produto origem é obrigatório'
      }));
      return;
    }

    // Buscar o produto completo para obter todos os dados
    const produtoSelecionado = produtosOrigem.find(p => p.id === produtoForm.produto_origem_id);
    
    if (!produtoSelecionado) {
      return;
    }

    setFormData(prev => ({
      ...prev,
      produtos: [
        ...prev.produtos,
        {
          produto_origem: produtoSelecionado.nome || '', // Manter para compatibilidade
          produto_origem_id: produtoSelecionado.id,
          grupo_id: produtoSelecionado.grupo_id || null,
          grupo_nome: produtoSelecionado.grupo_nome || null,
          subgrupo_id: produtoSelecionado.subgrupo_id || null,
          subgrupo_nome: produtoSelecionado.subgrupo_nome || null,
          classe_id: produtoSelecionado.classe_id || null,
          classe_nome: produtoSelecionado.classe_nome || null,
          unidade_medida_id: produtoSelecionado.unidade_medida_id || null,
          unidade_medida_sigla: produtoSelecionado.unidade_medida_sigla || null,
          percapta_sugerida: produtoForm.percapta_sugerida || null
        }
      ]
    }));

    setProdutoForm(prev => ({
      grupo_id: prev.grupo_id, // Manter o grupo selecionado
      produto_origem_id: null,
      percapta_sugerida: ''
    }));

    // Limpar erros de produto
    setErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors.produto_origem;
      return newErrors;
    });
  };

  const handleRemoveProduto = (index) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProdutoPercapta = (index, percapta) => {
    // Validar e limitar a 6 casas decimais
    let valor = percapta;
    
    // Se for string vazia ou '0', permitir
    if (valor === '' || valor === '0' || valor === null || valor === undefined) {
      setFormData(prev => ({
        ...prev,
        produtos: prev.produtos.map((produto, i) => 
          i === index 
            ? { ...produto, percapta_sugerida: valor === '' || valor === null || valor === undefined ? null : 0 }
            : produto
        )
      }));
      return;
    }
    
    // Converter para string para processar
    const valorStr = valor.toString();
    
    // Limitar a 6 casas decimais
    if (valorStr.includes('.')) {
      const partes = valorStr.split('.');
      if (partes[1] && partes[1].length > 6) {
        valor = `${partes[0]}.${partes[1].substring(0, 6)}`;
      }
    }
    
    // Também verificar se tem vírgula (formato brasileiro)
    if (valorStr.includes(',')) {
      const partes = valorStr.split(',');
      if (partes[1] && partes[1].length > 6) {
        valor = `${partes[0]}.${partes[1].substring(0, 6)}`;
      } else {
        valor = valorStr.replace(',', '.');
      }
    }
    
    const valorNumerico = parseFloat(valor);
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.map((produto, i) => 
        i === index 
          ? { ...produto, percapta_sugerida: !isNaN(valorNumerico) ? valorNumerico : null }
          : produto
      )
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome da receita é obrigatório';
    }

    // Validar campos obrigatórios de vinculações
    if (!formData.filiais || formData.filiais.length === 0) {
      newErrors.filiais = 'Selecione pelo menos uma filial';
    }
    if (!formData.centros_custo || formData.centros_custo.length === 0) {
      newErrors.centros_custo = 'Selecione pelo menos um centro de custo';
    }
    if (!formData.tipo_receita_id) {
      newErrors.tipo_receita_id = 'Tipo de Receita é obrigatório';
    }

    // Validar que todos os produtos tenham percapita preenchido
    if (formData.produtos && formData.produtos.length > 0) {
      const produtosSemPercapta = formData.produtos.filter(p => 
        !p.percapta_sugerida || p.percapta_sugerida === '' || p.percapta_sugerida === null
      );
      if (produtosSemPercapta.length > 0) {
        newErrors.produtos = 'Todos os produtos devem ter percapita preenchido';
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      // Incluir receita_original_id apenas se for duplicação
      receita_original_id: isDuplicating && formData.receita_original_id ? formData.receita_original_id : undefined,
      produtos: formData.produtos.map(p => ({
        produto_origem: p.produto_origem || '', // Manter para compatibilidade
        produto_origem_id: p.produto_origem_id || null,
        grupo_id: p.grupo_id || null,
        grupo_nome: p.grupo_nome || null,
        subgrupo_id: p.subgrupo_id || null,
        subgrupo_nome: p.subgrupo_nome || null,
        classe_id: p.classe_id || null,
        classe_nome: p.classe_nome || null,
        unidade_medida_id: p.unidade_medida_id || null,
        unidade_medida_sigla: p.unidade_medida_sigla || null,
        percapta_sugerida: p.percapta_sugerida ? parseFloat(p.percapta_sugerida) : null
      }))
    };

    // Remover campos undefined para não enviar
    Object.keys(dataToSubmit).forEach(key => {
      if (dataToSubmit[key] === undefined) {
        delete dataToSubmit[key];
      }
    });

    onSubmit(dataToSubmit);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Receita' 
          : isDuplicating
            ? 'Duplicar Receita'
            : receita 
              ? 'Editar Receita' 
              : 'Nova Receita'
      }
      size="6xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Primeira linha: Três colunas - Informações Básicas, Vinculações e Filiais e Centros de Custo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Seção: Informações Básicas */}
            <InformacoesBasicas
              receita={receita}
              formData={formData}
              errors={errors}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />

            {/* Seção: Vinculações */}
            <Vinculacoes
              formData={formData}
              isViewMode={isViewMode}
              tiposReceitas={tiposReceitas}
              loadingTiposReceitas={loadingTiposReceitas}
              onInputChange={handleInputChange}
              errors={errors}
            />

            {/* Seção: Filiais e Centros de Custo */}
            <FiliaisCentrosCusto
              formData={formData}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />
          </div>

          {/* Seção: Produtos da Receita */}
          <ProdutosReceita
            formData={formData}
            produtoForm={produtoForm}
            isViewMode={isViewMode}
            grupos={grupos}
            produtosOrigem={produtosOrigem}
            loadingGrupos={loadingGrupos}
            loadingProdutosOrigem={loadingProdutosOrigem}
            onProdutoFormChange={handleProdutoFormChange}
            onAddProduto={handleAddProduto}
            onRemoveProduto={handleRemoveProduto}
            onUpdateProdutoPercapta={handleUpdateProdutoPercapta}
            onCarregarProdutosOrigem={carregarProdutosOrigem}
            errors={errors}
          />

          {/* Botões */}
          {!isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="outline"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                {isDuplicating 
                  ? 'Duplicar Receita' 
                  : receita 
                    ? 'Atualizar Receita' 
                    : 'Salvar Receita'}
              </Button>
            </div>
          )}

          {isViewMode && (
            <div className="flex justify-end gap-2 pt-4 border-t border-gray-200">
              <Button
                type="button"
                onClick={onClose}
                variant="primary"
              >
                Fechar
              </Button>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default ReceitaModal;

