import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';
import tiposReceitasService from '../../services/tiposReceitas';
import { InformacoesBasicas, Vinculacoes, ProdutosReceita } from './sections';

/**
 * Modal para Receita
 */
const ReceitaModal = ({
  isOpen,
  onClose,
  onSubmit,
  receita,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    filial_id: null,
    filial_nome: '',
    centro_custo_id: null,
    centro_custo_nome: '',
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
  const [filiais, setFiliais] = useState([]);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [produtosOrigem, setProdutosOrigem] = useState([]);
  const [tiposReceitas, setTiposReceitas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingCentrosCusto, setLoadingCentrosCusto] = useState(false);
  const [loadingGrupos, setLoadingGrupos] = useState(false);
  const [loadingProdutosOrigem, setLoadingProdutosOrigem] = useState(false);
  const [loadingTiposReceitas, setLoadingTiposReceitas] = useState(false);

  // Carregar filiais, centros de custo, grupos, produtos origem e tipos de receitas quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
      carregarCentrosCusto();
      carregarGrupos();
      carregarProdutosOrigem(); // Carregar todos os produtos inicialmente
      carregarTiposReceitas();
    }
  }, [isOpen]);

  const carregarFiliais = async () => {
    setLoadingFiliais(true);
    try {
      // Buscar todas as filiais (múltiplas páginas se necessário)
      let allFiliaisData = [];
      let page = 1;
      const limit = 100;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getFiliais({
          page,
          limit
        });
        
        if (result.success && result.data) {
          // Verificar se é uma resposta HATEOAS ou direta
          let items = [];
          if (result.data.items) {
            items = result.data.items;
          } else if (Array.isArray(result.data)) {
            items = result.data;
          } else if (result.data.data) {
            items = result.data.data;
          }
          
          allFiliaisData = [...allFiliaisData, ...items];
          
          // Verificar se há mais páginas
          if (items.length < limit) {
            hasMore = false;
          } else {
            page++;
          }
        } else {
          hasMore = false;
        }
      }
      
      // Filtrar apenas a filial "CD TOLEDO"
      // O campo que contém o nome da filial é 'filial'
      allFiliaisData = allFiliaisData.filter(filial => {
        if (filial.filial) {
          const filialNome = filial.filial.toLowerCase().trim();
          // Verificar se contém "cd toledo" ou apenas "toledo"
          return filialNome.includes('cd toledo') || 
                 filialNome === 'toledo' ||
                 filialNome.includes('toledo');
        }
        // Se não tiver informação de filial, não incluir
        return false;
      });
      
      setFiliais(allFiliaisData);
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  const carregarCentrosCusto = async () => {
    setLoadingCentrosCusto(true);
    try {
      // Buscar todos os centros de custo (múltiplas páginas se necessário)
      let allCentrosCusto = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await FoodsApiService.getCentrosCusto({
          page,
          limit: 100
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allCentrosCusto = [...allCentrosCusto, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      // Aplicar filtro para "CD TOLEDO"
      allCentrosCusto = allCentrosCusto.filter(centroCusto => 
        centroCusto.filial_nome && 
        (centroCusto.filial_nome.toLowerCase().includes('cd toledo') || 
        centroCusto.filial_nome.toLowerCase().includes('toledo'))
      );
      
      setCentrosCusto(allCentrosCusto);
    } catch (error) {
      console.error('Erro ao carregar centros de custo:', error);
    } finally {
      setLoadingCentrosCusto(false);
    }
  };

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
        filial_id: null,
        filial_nome: '',
        centro_custo_id: null,
        centro_custo_nome: '',
        tipo_receita_id: null,
        tipo_receita_nome: '',
        status: 1,
        produtos: []
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
      setFormData({
        nome: receita.nome || '',
        descricao: receita.descricao || '',
        filial_id: receita.filial_id || null,
        filial_nome: receita.filial_nome || receita.filial || '',
        centro_custo_id: receita.centro_custo_id || null,
        centro_custo_nome: receita.centro_custo_nome || receita.centro_custo || '',
        tipo_receita_id: receita.tipo_receita_id || null,
        tipo_receita_nome: receita.tipo_receita_nome || receita.tipo_receita || '',
        status: receita.status !== undefined ? receita.status : 1,
        produtos: receita.produtos || []
      });
    }
  }, [isOpen, receita]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleProdutoFormChange = (field, value) => {
    setProdutoForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleAddProduto = () => {
    if (!produtoForm.produto_origem_id) {
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
  };

  const handleRemoveProduto = (index) => {
    setFormData(prev => ({
      ...prev,
      produtos: prev.produtos.filter((_, i) => i !== index)
    }));
  };

  const handleUpdateProdutoPercapta = (index, percapta) => {
    // Validar e limitar a 3 casas decimais
    let valor = percapta;
    if (valor !== '' && valor !== null && valor !== undefined) {
      if (valor.toString().includes('.')) {
        const partes = valor.toString().split('.');
        if (partes[1] && partes[1].length > 3) {
          valor = `${partes[0]}.${partes[1].substring(0, 3)}`;
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
    } else {
      // Permitir campo vazio
      setFormData(prev => ({
        ...prev,
        produtos: prev.produtos.map((produto, i) => 
          i === index 
            ? { ...produto, percapta_sugerida: null }
            : produto
        )
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome da receita é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      produtos: formData.produtos.map(p => ({
        produto_origem: p.produto_origem || '', // Manter para compatibilidade
        produto_origem_id: p.produto_origem_id || null,
        grupo_id: p.grupo_id || null,
        grupo_nome: p.grupo_nome || null,
        subgrupo_id: p.subgrupo_id || null,
        subgrupo_nome: p.subgrupo_nome || null,
        classe_id: p.classe_id || null,
        classe_nome: p.classe_nome || null,
        percapta_sugerida: p.percapta_sugerida ? parseFloat(p.percapta_sugerida) : null
      }))
    };

    onSubmit(dataToSubmit);
  };


  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        isViewMode 
          ? 'Visualizar Receita' 
          : receita 
            ? 'Editar Receita' 
            : 'Nova Receita'
      }
      size="6xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Primeira linha: Informações Básicas e Vinculações lado a lado */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
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
              filiais={filiais}
              centrosCusto={centrosCusto}
              tiposReceitas={tiposReceitas}
              loadingFiliais={loadingFiliais}
              loadingCentrosCusto={loadingCentrosCusto}
              loadingTiposReceitas={loadingTiposReceitas}
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
                {receita ? 'Atualizar Receita' : 'Salvar Receita'}
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

