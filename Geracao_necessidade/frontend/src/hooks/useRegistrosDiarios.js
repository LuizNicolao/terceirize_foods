/**
 * Hook customizado para Registros Diários
 * Gerencia estado e operações relacionadas a registros diários
 */

import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import registrosDiariosService from '../services/registrosDiariosService';
import { useBaseEntity } from './common/useBaseEntity';
import { useFilters } from './common/useFilters';

export const useRegistrosDiarios = () => {
  // Hook base para funcionalidades CRUD
  const baseEntity = useBaseEntity('registros-diarios', registrosDiariosService, {
    initialItemsPerPage: 20,
    initialFilters: {},
    enableStats: true,
    enableDelete: true
  });

  // Hook de filtros customizados
  const customFilters = useFilters({});
  
  // Estados específicos dos registros diários
  const [escolas, setEscolas] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  
  // Estados do formulário
  const [data, setData] = useState('');
  const [selectedEscolaId, setSelectedEscolaId] = useState('');
  const [medias, setMedias] = useState({
    media_eja_parcial: 0,
    media_eja_almoco: 0,
    media_eja_lanche: 0,
    media_eja_eja: 0,
    media_almoco_parcial: 0,
    media_almoco_almoco: 0,
    media_almoco_lanche: 0,
    media_almoco_eja: 0,
    media_parcial_parcial: 0,
    media_parcial_almoco: 0,
    media_parcial_lanche: 0,
    media_parcial_eja: 0,
    media_lanche_parcial: 0,
    media_lanche_almoco: 0,
    media_lanche_lanche: 0,
    media_lanche_eja: 0
  });

  // Estados de busca de escola
  const [buscaEscola, setBuscaEscola] = useState('');
  const [mostrarDropdownEscolas, setMostrarDropdownEscolas] = useState(false);
  const [escolasFiltradas, setEscolasFiltradas] = useState([]);
  const [indiceSelecionadoEscola, setIndiceSelecionadoEscola] = useState(-1);

  /**
   * Carrega escolas
   */
  const loadEscolas = useCallback(async () => {
    setLoadingEscolas(true);
    try {
      // Aqui você implementaria a chamada para carregar escolas
      // const response = await escolasService.getAll();
      // setEscolas(response.data);
      
      // Por enquanto, dados mockados
      setEscolas([]);
    } catch (error) {
      console.error('Erro ao carregar escolas:', error);
      toast.error('Erro ao carregar escolas');
    } finally {
      setLoadingEscolas(false);
    }
  }, []);

  /**
   * Filtra escolas baseado na busca
   */
  const filtrarEscolas = useCallback(() => {
    if (!buscaEscola.trim()) {
      setEscolasFiltradas([]);
      return;
    }

    const filtradas = escolas.filter(escola =>
      escola.nome_escola.toLowerCase().includes(buscaEscola.toLowerCase()) ||
      escola.rota.toLowerCase().includes(buscaEscola.toLowerCase())
    );

    setEscolasFiltradas(filtradas);
    setIndiceSelecionadoEscola(-1);
  }, [escolas, buscaEscola]);

  /**
   * Seleciona uma escola
   */
  const selecionarEscola = useCallback((escola) => {
    setBuscaEscola(escola.nome_escola);
    setSelectedEscolaId(escola.id);
    setMostrarDropdownEscolas(false);
    setEscolasFiltradas([]);
  }, []);

  /**
   * Manipula mudanças nas médias
   */
  const handleMediasChange = useCallback((tipoMedia, periodo, value) => {
    const fieldName = `${tipoMedia}_${periodo}`;
    setMedias(prev => ({
      ...prev,
      [fieldName]: value
    }));
  }, []);

  /**
   * Limpa o formulário
   */
  const handleClear = useCallback(() => {
    setData('');
    setSelectedEscolaId('');
    setBuscaEscola('');
    setMedias({
      media_eja_parcial: 0,
      media_eja_almoco: 0,
      media_eja_lanche: 0,
      media_eja_eja: 0,
      media_almoco_parcial: 0,
      media_almoco_almoco: 0,
      media_almoco_lanche: 0,
      media_almoco_eja: 0,
      media_parcial_parcial: 0,
      media_parcial_almoco: 0,
      media_parcial_lanche: 0,
      media_parcial_eja: 0,
      media_lanche_parcial: 0,
      media_lanche_almoco: 0,
      media_lanche_lanche: 0,
      media_lanche_eja: 0
    });
  }, []);

  /**
   * Salva o registro
   */
  const handleSave = useCallback(async () => {
    if (!data || !selectedEscolaId) {
      toast.error('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const dadosRegistro = {
      data,
      escola_id: selectedEscolaId,
      ...medias
    };

    try {
      await baseEntity.onSubmit(dadosRegistro);
      handleClear();
    } catch (error) {
      console.error('Erro ao salvar registro:', error);
    }
  }, [data, selectedEscolaId, medias, baseEntity, handleClear]);

  // Efeitos
  useEffect(() => {
    loadEscolas();
  }, [loadEscolas]);

  useEffect(() => {
    filtrarEscolas();
  }, [filtrarEscolas]);

  return {
    // Estados do hook base
    ...baseEntity,
    
    // Estados específicos
    escolas,
    loadingEscolas,
    data,
    setData,
    selectedEscolaId,
    setSelectedEscolaId,
    medias,
    buscaEscola,
    setBuscaEscola,
    mostrarDropdownEscolas,
    setMostrarDropdownEscolas,
    escolasFiltradas,
    indiceSelecionadoEscola,
    setIndiceSelecionadoEscola,
    
    // Handlers específicos
    handleMediasChange,
    handleClear,
    handleSave,
    selecionarEscola,
    
    // Filtros customizados
    ...customFilters
  };
};
