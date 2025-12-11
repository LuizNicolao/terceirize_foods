import React, { useState, useEffect } from 'react';
import { FaSave, FaEdit, FaEye, FaTimes } from 'react-icons/fa';
import { Modal, Button, ConfirmModal } from '../ui';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';
import cardapiosService from '../../services/cardapios';
import {
  InformacoesBasicas,
  Filiais,
  CentrosCusto,
  Contratos,
  ProdutosComerciais,
  PeriodosAtendimento,
  Calendario
} from './sections';
import toast from 'react-hot-toast';

/**
 * Modal principal de Cardápio
 * Orquestra todas as seções do formulário
 */
const CardapioModal = ({
  isOpen,
  onClose,
  onSubmit,
  cardapio = null,
  isViewMode = false,
  onCreate,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState('basicas');
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState({});

  // Estado do formulário
  const [formData, setFormData] = useState({
    nome: '',
    mes_referencia: '',
    ano_referencia: '',
    numero_semanas: '4',
    status: 'ativo',
    filiais: [],
    centros_custo: [],
    contratos: [],
    produtos_comerciais: [],
    periodos_atendimento: [],
    pratos: []
  });

  const isEditing = Boolean(cardapio);
  const {
    markDirty,
    resetDirty,
    requestClose,
    showConfirm,
    confirmClose,
    cancelClose,
    confirmTitle,
    confirmMessage
  } = useUnsavedChangesPrompt();

  // Carregar dados do cardápio se estiver editando
  useEffect(() => {
    if (isOpen) {
      if (isEditing && cardapio) {
        carregarDadosEdicao();
      } else {
        resetForm();
      }
      // Resetar dirty quando abrir o modal (especialmente em modo de visualização)
      if (isViewMode) {
        resetDirty();
      }
    }
  }, [isOpen, cardapio, isViewMode, resetDirty]);

  const resetForm = () => {
    setFormData({
      nome: '',
      mes_referencia: '',
      ano_referencia: '',
      numero_semanas: '4',
      status: 'ativo',
      filiais: [],
      centros_custo: [],
      contratos: [],
      produtos_comerciais: [],
      periodos_atendimento: [],
      pratos: []
    });
    setErrors({});
    setActiveTab('basicas');
    resetDirty();
  };

  const carregarDadosEdicao = async () => {
    if (!cardapio?.id) return;

    try {
      // Buscar dados completos do cardápio
      const response = await cardapiosService.buscarPorId(cardapio.id);
      if (response.success && response.data) {
        const cardapioCompleto = response.data;
        setFormData({
          nome: cardapioCompleto.nome || '',
          mes_referencia: String(cardapioCompleto.mes_referencia || ''),
          ano_referencia: String(cardapioCompleto.ano_referencia || ''),
          numero_semanas: String(cardapioCompleto.numero_semanas || '4'),
          status: cardapioCompleto.status || 'ativo',
          filiais: cardapioCompleto.filiais || [],
          centros_custo: cardapioCompleto.centros_custo || [],
          contratos: cardapioCompleto.contratos || [],
          produtos_comerciais: cardapioCompleto.produtos_comerciais || [],
          periodos_atendimento: cardapioCompleto.periodos_atendimento || [],
          pratos: cardapioCompleto.pratos || []
        });
      } else {
        // Fallback: usar dados básicos se a busca falhar
        setFormData({
          nome: cardapio.nome || '',
          mes_referencia: String(cardapio.mes_referencia || ''),
          ano_referencia: String(cardapio.ano_referencia || ''),
          numero_semanas: String(cardapio.numero_semanas || '4'),
          status: cardapio.status || 'ativo',
          filiais: [],
          centros_custo: [],
          contratos: [],
          produtos_comerciais: [],
          periodos_atendimento: [],
          pratos: []
        });
      }
      // Resetar dirty após carregar dados (especialmente importante em modo de visualização)
      resetDirty();
    } catch (error) {
      console.error('Erro ao carregar dados de edição:', error);
      toast.error('Erro ao carregar dados do cardápio');
      // Fallback: usar dados básicos em caso de erro
      setFormData({
        nome: cardapio.nome || '',
        mes_referencia: String(cardapio.mes_referencia || ''),
        ano_referencia: String(cardapio.ano_referencia || ''),
        numero_semanas: String(cardapio.numero_semanas || '4'),
        status: cardapio.status || 'ativo',
        filiais: [],
        centros_custo: [],
        contratos: [],
        produtos_comerciais: [],
        periodos_atendimento: [],
        pratos: []
      });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Só marcar como dirty se não estiver em modo de visualização
    if (!isViewMode) {
      markDirty();
    }
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.nome || formData.nome.trim() === '') {
      newErrors.nome = 'Nome é obrigatório';
    }

    if (!formData.mes_referencia) {
      newErrors.mes_referencia = 'Mês de referência é obrigatório';
    }

    if (!formData.ano_referencia) {
      newErrors.ano_referencia = 'Ano de referência é obrigatório';
    }

    if (!formData.numero_semanas) {
      newErrors.numero_semanas = 'Número de semanas é obrigatório';
    }

    if ((formData.contratos || []).length === 0 && (formData.centros_custo || []).length === 0) {
      newErrors.contratos = 'É necessário selecionar pelo menos um contrato ou centro de custo';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor, corrija os erros no formulário');
      return;
    }

    setSaving(true);

    try {
      // Preparar dados para envio
      const dados = {
        nome: formData.nome,
        mes_referencia: parseInt(formData.mes_referencia),
        ano_referencia: parseInt(formData.ano_referencia),
        numero_semanas: parseInt(formData.numero_semanas),
        status: formData.status,
        filiais: (formData.filiais || []).map(f => ({
          id: f.id,
          nome: f.nome || ''
        })),
        centros_custo: (formData.centros_custo || []).map(cc => ({
          id: cc.id,
          nome: cc.nome || ''
        })),
        contratos: (formData.contratos || []).map(c => c.id),
        produtos_comerciais: (formData.produtos_comerciais || []).map(p => ({
          id: p.id,
          nome_comercial: p.nome_comercial || p.nome || '',
          grupo_id: p.grupo_id || null,
          grupo_nome: p.grupo_nome || null,
          subgrupo_id: p.subgrupo_id || null,
          subgrupo_nome: p.subgrupo_nome || null,
          classe_id: p.classe_id || null,
          classe_nome: p.classe_nome || null
        })),
        periodos_atendimento: (formData.periodos_atendimento || []).map(p => p.id),
        pratos: (formData.pratos || []).map(p => ({
          data: p.data,
          periodo_atendimento_id: p.periodo_atendimento_id,
          prato_id: p.prato_id,
          produto_comercial_id: p.produto_comercial_id || null,
          ordem: p.ordem || 1
        }))
      };

      let response;
      if (isEditing) {
        response = await onUpdate(cardapio.id, dados);
      } else {
        response = await onCreate(dados);
      }

      if (response && response.success) {
        resetDirty();
        onClose();
        setTimeout(() => {
          if (onSubmit) {
            onSubmit();
          }
        }, 300);
      }
    } catch (error) {
      console.error('Erro ao salvar cardápio:', error);
      toast.error('Erro ao salvar cardápio');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal 
        isOpen={isOpen && !showConfirm} 
        onClose={() => isViewMode ? onClose() : requestClose(onClose)} 
        size="full" 
        hideCloseButton={true}
      >
        <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : isEditing ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {isViewMode ? 'Visualizar Cardápio' : isEditing ? 'Editar Cardápio' : 'Novo Cardápio'}
                </h2>
                <p className="text-sm text-gray-600">
                  {isViewMode ? 'Visualizando informações do cardápio' : isEditing ? 'Editando informações do cardápio' : 'Preencha as informações do novo cardápio'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => isViewMode ? onClose() : requestClose(onClose)}
                className="p-2"
              >
                <FaTimes className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6">
            {/* Navegação por Abas */}
            <div className="mb-6 border-b border-gray-200">
              <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
                <button
                  type="button"
                  onClick={() => setActiveTab('basicas')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'basicas'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Informações Gerais
                  {(((formData.filiais || []).length > 0) || 
                    ((formData.contratos || []).length > 0) || 
                    ((formData.produtos_comerciais || []).length > 0) || 
                    ((formData.periodos_atendimento || []).length > 0)) && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {((formData.filiais || []).length > 0 ? 1 : 0) + 
                       ((formData.contratos || []).length > 0 ? 1 : 0) + 
                       ((formData.produtos_comerciais || []).length > 0 ? 1 : 0) + 
                       ((formData.periodos_atendimento || []).length > 0 ? 1 : 0)}
                    </span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('calendario')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                    activeTab === 'calendario'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Calendário
                  {(formData.pratos || []).length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                      {(formData.pratos || []).length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Conteúdo das Abas */}
            <div className="space-y-6 min-h-[400px] max-h-[75vh] overflow-y-auto">
              {activeTab === 'basicas' && (
                <div className="space-y-4">
                  {/* Primeira linha: 4 cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* Card 1: Informações Básicas */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                      Informações Básicas
                    </h3>
                    <InformacoesBasicas
                      nome={formData.nome}
                      mesReferencia={formData.mes_referencia}
                      anoReferencia={formData.ano_referencia}
                      numeroSemanas={formData.numero_semanas}
                      status={formData.status}
                      isViewMode={isViewMode}
                      errors={errors}
                      onNomeChange={(value) => handleInputChange('nome', value)}
                      onMesReferenciaChange={(value) => handleInputChange('mes_referencia', value)}
                      onAnoReferenciaChange={(value) => handleInputChange('ano_referencia', value)}
                      onNumeroSemanasChange={(value) => handleInputChange('numero_semanas', value)}
                      onStatusChange={(value) => handleInputChange('status', value)}
                    />
                  </div>

                  {/* Card 2: Filiais */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                      Filiais
                      {(formData.filiais || []).length > 0 && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {(formData.filiais || []).length}
                        </span>
                      )}
                    </h3>
                    <Filiais
                      formData={formData}
                      isViewMode={isViewMode}
                      onInputChange={handleInputChange}
                    />
                  </div>

                  {/* Card 3: Centros de Custo */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                      Centros de Custo
                      {(formData.centros_custo || []).length > 0 && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {(formData.centros_custo || []).length}
                        </span>
                      )}
                    </h3>
                    <CentrosCusto
                      formData={formData}
                      isViewMode={isViewMode}
                      onInputChange={handleInputChange}
                    />
                  </div>

                  {/* Card 4: Contratos */}
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                      Contratos
                      {(formData.contratos || []).length > 0 && (
                        <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                          {(formData.contratos || []).length}
                        </span>
                      )}
                    </h3>
                    <Contratos
                      formData={formData}
                      isViewMode={isViewMode}
                      onInputChange={handleInputChange}
                    />
                  </div>
                </div>

                  {/* Segunda linha: 2 cards divididos ao meio */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Card 5: Tipos de Cardápio */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                        Tipos de Cardápio
                        {(formData.produtos_comerciais || []).length > 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {(formData.produtos_comerciais || []).length}
                          </span>
                        )}
                      </h3>
                <ProdutosComerciais
                  formData={formData}
                  isViewMode={isViewMode}
                  onInputChange={handleInputChange}
                />
                    </div>

                    {/* Card 6: Períodos de Atendimento */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                        Períodos de Atendimento
                        {(formData.periodos_atendimento || []).length > 0 && (
                          <span className="ml-2 bg-green-100 text-green-800 text-xs font-semibold px-2 py-0.5 rounded-full">
                            {(formData.periodos_atendimento || []).length}
                          </span>
                        )}
                      </h3>
                <PeriodosAtendimento
                  formData={formData}
                  isViewMode={isViewMode}
                  onInputChange={handleInputChange}
                />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'calendario' && (
                <Calendario
                  formData={formData}
                  isViewMode={isViewMode}
                  onInputChange={handleInputChange}
                />
              )}
            </div>

            {/* Botões de ação */}
            {!isViewMode && (
              <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => isViewMode ? onClose() : requestClose(onClose)}
                  disabled={saving}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={saving}
                >
                  {saving ? 'Salvando...' : isEditing ? 'Atualizar' : 'Criar'} Cardápio
                </Button>
              </div>
            )}
          </form>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Descartar"
        cancelText="Continuar editando"
        variant="danger"
      />
    </>
  );
};

export default CardapioModal;

