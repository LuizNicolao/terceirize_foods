import { useState, useEffect, useCallback } from 'react';
import { useMediasEscolas } from './useMediasEscolas';
import { useRegistrosDiarios } from './useRegistrosDiarios';
import { useNecessidades } from './useNecessidades';
import { usePermissions } from '../contexts/PermissionsContext';
import { useModal } from './useModal';
import toast from 'react-hot-toast';

export const useMediasEscolasPage = () => {
  const { canView, canCreate, canEdit, canDelete, loading: permissionsLoading } = usePermissions();
  
  // Hook para médias por escolas
  const {
    escolas,
    medias,
    loading: mediasLoading,
    error: mediasError,
    carregarMedias,
    carregarEscolas
  } = useMediasEscolas();

  // Hook para registros diários
  const {
    items: registros,
    loading: registrosLoading,
    error: registrosError,
    loadItems: carregarRegistros,
    onSubmit: criarRegistro,
    handleDeleteItem: deletarRegistro
  } = useRegistrosDiarios();

  // Hook para calcular médias por período
  const { calcularMediasPorPeriodo } = useNecessidades();

  // Hook para gerenciamento do modal
  const {
    showModal: isRegistroModalOpen,
    viewMode: isViewMode,
    editingItem: selectedRegistro,
    handleAdd: handleAddRegistro,
    handleView: handleViewRegistro,
    handleEdit: handleEditRegistro,
    handleCloseModal: handleCloseRegistroModal
  } = useModal();

  // Estados específicos
  const [registroModalLoading, setRegistroModalLoading] = useState(false);
  const [mediasCalculadas, setMediasCalculadas] = useState(null);

  // Verificar permissões
  const canViewMedias = canView('medias-escolas');
  const canCreateMedias = canCreate('medias-escolas');
  const canEditMedias = canEdit('medias-escolas');
  const canDeleteMedias = canDelete('medias-escolas');
  
  const canViewRegistros = canView('registros-diarios');
  const canCreateRegistros = canCreate('registros-diarios');
  const canEditRegistros = canEdit('registros-diarios');
  const canDeleteRegistros = canDelete('registros-diarios');

  // Função para converter médias calculadas para o formato da tabela
  const converterMediasParaTabela = useCallback((mediasCalculadas) => {
    if (!mediasCalculadas) return null;
    
    // Retornar as médias calculadas diretamente no formato que o componente MediasCalculadas espera
    // O componente já sabe como processar o formato { tipo_media: { media: valor, quantidade_registros: count } }
    return mediasCalculadas;
  }, []);

  // Função personalizada para fechar o modal e limpar estados
  const handleCloseModalWithCleanup = useCallback(() => {
    setMediasCalculadas(null);
    handleCloseRegistroModal();
  }, []);

  // Carregar dados quando as permissões estiverem prontas
  useEffect(() => {
    if (!permissionsLoading && canViewMedias) {
      carregarMedias();
    }
    if (!permissionsLoading && canViewRegistros) {
      carregarRegistros();
    }
  }, [permissionsLoading, canViewMedias, canViewRegistros]);

  // Funções para registros diários
  const handleAddRegistroWrapper = useCallback(() => {
    if (!canCreateRegistros) {
      toast.error('Você não tem permissão para criar registros');
      return;
    }
    setMediasCalculadas(null);
    handleAddRegistro();
  }, [canCreateRegistros, handleAddRegistro]);

  const handleViewRegistroWrapper = useCallback(async (registro) => {
    try {
      const registrosIndividuais = (registros || []).filter(r => 
        r.escola_id === registro.escola_id && r.data === registro.data
      );
      
      const registroCompleto = {
        escola_id: registro.escola_id,
        data: registro.data,
        medias: {}
      };
      
      registrosIndividuais.forEach(r => {
        // Usar o tipo_media diretamente (agora são os 5 tipos simplificados)
        registroCompleto.medias[r.tipo_media] = r.valor;
      });
      
      try {
        const dataFormatada = new Date(registro.data).toISOString().split('T')[0];
        const mediasCalculadas = await calcularMediasPorPeriodo(registro.escola_id, dataFormatada);
        const mediasFormatadas = converterMediasParaTabela(mediasCalculadas);
        setMediasCalculadas(mediasFormatadas);
      } catch (error) {
        console.error('Erro ao calcular médias:', error);
        setMediasCalculadas(null);
      }
      
      handleViewRegistro(registroCompleto);
    } catch (error) {
      console.error('Erro ao carregar registro para visualização:', error);
      toast.error('Erro ao carregar registro');
    }
  }, [registros, calcularMediasPorPeriodo, converterMediasParaTabela, handleViewRegistro]);

  const handleEditRegistroWrapper = useCallback(async (registro) => {
    if (!canEditRegistros) {
      toast.error('Você não tem permissão para editar registros');
      return;
    }
    
    try {
      const registrosIndividuais = (registros || []).filter(r => 
        r.escola_id === registro.escola_id && r.data === registro.data
      );
      
      const registroCompleto = {
        escola_id: registro.escola_id,
        data: registro.data,
        medias: {}
      };
      
      registrosIndividuais.forEach(r => {
        // Usar o tipo_media diretamente (agora são os 5 tipos simplificados)
        registroCompleto.medias[r.tipo_media] = r.valor;
      });
      
      try {
        const dataFormatada = new Date(registro.data).toISOString().split('T')[0];
        const mediasCalculadas = await calcularMediasPorPeriodo(registro.escola_id, dataFormatada);
        const mediasFormatadas = converterMediasParaTabela(mediasCalculadas);
        setMediasCalculadas(mediasFormatadas);
      } catch (error) {
        console.error('Erro ao calcular médias:', error);
        setMediasCalculadas(null);
      }
      
      handleEditRegistro(registroCompleto);
    } catch (error) {
      toast.error('Erro ao carregar dados para edição');
      console.error('Erro ao editar registro:', error);
    }
  }, [canEditRegistros, registros, calcularMediasPorPeriodo, converterMediasParaTabela, handleEditRegistro]);

  const handleDeleteRegistro = useCallback(async (registro) => {
    if (!canDeleteRegistros) {
      toast.error('Você não tem permissão para excluir registros');
      return;
    }

    if (window.confirm(`Tem certeza que deseja excluir o registro de ${new Date(registro.data).toLocaleDateString('pt-BR')}?`)) {
      const registrosIndividuais = (registros || []).filter(r => 
        r.escola_id === registro.escola_id && r.data === registro.data
      );
      
      let todosSucessos = true;
      for (const registroIndividual of registrosIndividuais) {
        try {
          await deletarRegistro(registroIndividual);
        } catch (error) {
          todosSucessos = false;
          toast.error('Erro ao excluir registro');
          break;
        }
      }
      
      if (todosSucessos) {
        toast.success('Registro excluído com sucesso!');
      }
    }
  }, [canDeleteRegistros, registros, deletarRegistro]);

  const handleSaveRegistro = useCallback(async (dados) => {
    setRegistroModalLoading(true);
    
    try {
      if (selectedRegistro) {
        const dadosComEdit = { 
          ...dados, 
          isEdit: true,
          dataOriginal: selectedRegistro.data
        };
        
        await criarRegistro(dadosComEdit);
        toast.success('Registro atualizado com sucesso!');
      } else {
        await criarRegistro(dados);
        toast.success('Registro criado com sucesso!');
      }

      handleCloseModalWithCleanup();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
      toast.error('Erro ao salvar registro');
    } finally {
      setRegistroModalLoading(false);
    }
  }, [selectedRegistro, criarRegistro, handleCloseModalWithCleanup]);

  return {
    // Estados
    escolas,
    medias,
    registros,
    mediasCalculadas,
    permissionsLoading,
    mediasLoading,
    registrosLoading,
    registroModalLoading,
    isRegistroModalOpen,
    isViewMode,
    selectedRegistro,
    mediasError,
    registrosError,
    
    // Permissões
    canViewMedias,
    canCreateMedias,
    canEditMedias,
    canDeleteMedias,
    canViewRegistros,
    canCreateRegistros,
    canEditRegistros,
    canDeleteRegistros,
    
    // Handlers
    handleAddRegistroWrapper,
    handleViewRegistroWrapper,
    handleEditRegistroWrapper,
    handleDeleteRegistro,
    handleSaveRegistro,
    handleCloseModalWithCleanup
  };
};
