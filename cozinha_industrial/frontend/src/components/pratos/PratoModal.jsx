import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import tiposPratosService from '../../services/tiposPratos';
import { InformacoesBasicas, Vinculacoes, FiliaisCentrosCusto, ReceitasProdutos } from './sections';

/**
 * Modal para Prato
 */
const PratoModal = ({
  isOpen,
  onClose,
  onSubmit,
  prato,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo_prato_id: null,
    tipo_prato_nome: '',
    filiais: [],
    centros_custo: [],
    receitas: [],
    produtos: [],
    status: 1
  });

  const [errors, setErrors] = useState({});
  
  // Estados para dados
  const [tiposPratos, setTiposPratos] = useState([]);
  const [loadingTiposPratos, setLoadingTiposPratos] = useState(false);

  // Carregar tipos de pratos quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarTiposPratos();
    }
  }, [isOpen]);

  const carregarTiposPratos = async () => {
    setLoadingTiposPratos(true);
    try {
      let allTiposPratos = [];
      let page = 1;
      let hasMore = true;
      
      while (hasMore && page <= 50) {
        const result = await tiposPratosService.listar({
          page,
          limit: 100,
          status: 1
        });
        
        if (result.success && result.data && result.data.length > 0) {
          allTiposPratos = [...allTiposPratos, ...result.data];
          hasMore = result.data.length === 100;
          page++;
        } else {
          hasMore = false;
        }
      }
      
      setTiposPratos(allTiposPratos);
    } catch (error) {
      console.error('Erro ao carregar tipos de pratos:', error);
    } finally {
      setLoadingTiposPratos(false);
    }
  };

  // Limpar dados quando modal é fechado
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        nome: '',
        descricao: '',
        tipo_prato_id: null,
        tipo_prato_nome: '',
        filiais: [],
        centros_custo: [],
        receitas: [],
        produtos: [],
        status: 1
      });
      setErrors({});
    }
  }, [isOpen]);

  // Preencher dados quando prato é fornecido
  useEffect(() => {
    if (isOpen && prato) {
      setFormData({
        nome: prato.nome || '',
        descricao: prato.descricao || '',
        tipo_prato_id: prato.tipo_prato_id || null,
        tipo_prato_nome: prato.tipo_prato_nome || prato.tipo_prato || '',
        filiais: prato.filiais || [],
        centros_custo: prato.centros_custo || [],
        receitas: prato.receitas || [],
        produtos: prato.produtos || [],
        status: prato.status !== undefined ? prato.status : 1
      });
    }
  }, [isOpen, prato]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validação
    const newErrors = {};
    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome do prato é obrigatório';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Preparar dados para envio
    const dataToSubmit = {
      ...formData,
      produtos: formData.produtos.map(p => ({
        receita_id: p.receita_id || null,
        produto_origem_id: p.produto_origem_id,
        produto_origem_nome: p.produto_origem_nome || null,
        grupo_id: p.grupo_id || null,
        grupo_nome: p.grupo_nome || null,
        subgrupo_id: p.subgrupo_id || null,
        subgrupo_nome: p.subgrupo_nome || null,
        classe_id: p.classe_id || null,
        classe_nome: p.classe_nome || null,
        unidade_medida_id: p.unidade_medida_id || null,
        unidade_medida_sigla: p.unidade_medida_sigla || null,
        centro_custo_id: p.centro_custo_id,
        centro_custo_nome: p.centro_custo_nome || null,
        percapta: p.percapta ? parseFloat(p.percapta) : null
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
          ? 'Visualizar Prato' 
          : prato 
            ? 'Editar Prato' 
            : 'Novo Prato'
      }
      size="8xl"
    >
      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          {/* Primeira linha: Três colunas - Informações Básicas, Vinculações e Filiais e Centros de Custo */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Seção: Informações Básicas */}
            <InformacoesBasicas
              prato={prato}
              formData={formData}
              errors={errors}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />

            {/* Seção: Vinculações */}
            <Vinculacoes
              formData={formData}
              isViewMode={isViewMode}
              tiposPratos={tiposPratos}
              loadingTiposPratos={loadingTiposPratos}
              onInputChange={handleInputChange}
            />

            {/* Seção: Filiais e Centros de Custo */}
            <FiliaisCentrosCusto
              formData={formData}
              isViewMode={isViewMode}
              onInputChange={handleInputChange}
            />
          </div>

          {/* Seção: Receitas e Produtos */}
          <ReceitasProdutos
            formData={formData}
            isViewMode={isViewMode}
            onInputChange={handleInputChange}
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
                {prato ? 'Atualizar Prato' : 'Salvar Prato'}
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

export default PratoModal;

