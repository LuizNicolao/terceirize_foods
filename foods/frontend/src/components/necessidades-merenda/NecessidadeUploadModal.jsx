import React, { useState, useEffect, useCallback } from 'react';
import { FaUpload, FaTimes, FaFilePdf, FaBuilding, FaSearch, FaCheckSquare, FaSquare, FaRoute } from 'react-icons/fa';
import { Button, Modal, Input } from '../ui';
import NecessidadesMerendaService from '../../services/necessidadesMerenda';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import RotasNutricionistasService from '../../services/rotasNutricionistas';
import UsuariosService from '../../services/usuarios';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const NecessidadeUploadModal = ({ isOpen, onClose, onProcessar, onPreview }) => {
  const { user } = useAuth();
  
  // Estados principais
  const [arquivo, setArquivo] = useState(null);
  const [processando, setProcessando] = useState(false);
  const [tipoSelecao, setTipoSelecao] = useState('filiais'); // 'filiais' ou 'rotas'
  
  // Estados para Filiais e Unidades
  const [filiais, setFiliais] = useState([]);
  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [buscaUnidades, setBuscaUnidades] = useState('');
  
  // Estados para Rotas de Nutricionistas
  const [rotasNutricionistas, setRotasNutricionistas] = useState([]);
  const [rotasSelecionadas, setRotasSelecionadas] = useState([]);
  const [loadingRotas, setLoadingRotas] = useState(false);

  // Carregar dados quando modal abrir
  useEffect(() => {
    if (isOpen) {
      carregarFiliais();
      carregarRotasNutricionistas();
    } else {
      // Limpar estados quando modal fechar
      setArquivo(null);
      setFiliaisSelecionadas([]);
      setUnidadesSelecionadas([]);
      setRotasSelecionadas([]);
      setBuscaUnidades('');
    }
  }, [isOpen]);

  // Carregar filiais do usuário
  const carregarFiliais = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoadingFiliais(true);
      const userResult = await UsuariosService.buscarPorId(user.id);
      
      if (userResult.success && userResult.data?.filiais) {
        setFiliais(userResult.data.filiais);
      } else {
        setFiliais([]);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      setFiliais([]);
    } finally {
      setLoadingFiliais(false);
    }
  }, [user?.id]);

  // Carregar rotas de nutricionistas
  const carregarRotasNutricionistas = useCallback(async () => {
    try {
      setLoadingRotas(true);
      const response = await RotasNutricionistasService.listar();
      
      if (response.success) {
        setRotasNutricionistas(response.data.rotas || []);
      } else {
        setRotasNutricionistas([]);
      }
    } catch (error) {
      console.error('Erro ao carregar rotas de nutricionistas:', error);
      setRotasNutricionistas([]);
    } finally {
      setLoadingRotas(false);
    }
  }, []);

  // Carregar unidades escolares baseado nas filiais selecionadas
  const carregarUnidadesEscolares = useCallback(async (filiaisIds) => {
    if (filiaisIds.length === 0) {
      setUnidadesEscolares([]);
      return;
    }

    try {
      setLoadingUnidades(true);
      const response = await UnidadesEscolaresService.listar({
        filial_id: filiaisIds.join(',')
      });
      if (response.success) {
        setUnidadesEscolares(response.data || []);
      } else {
        setUnidadesEscolares([]);
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUnidades(false);
    }
  }, []);

  // Funções para manipular seleções de filiais
  const handleFilialChange = useCallback(async (filialId, checked) => {
    if (checked) {
      const novasFiliais = [...filiaisSelecionadas, filialId];
      setFiliaisSelecionadas(novasFiliais);
      await carregarUnidadesEscolares(novasFiliais);
    } else {
      const novasFiliais = filiaisSelecionadas.filter(id => id !== filialId);
      setFiliaisSelecionadas(novasFiliais);
      // Remover unidades escolares da filial desmarcada
      setUnidadesSelecionadas(prev => {
        const filial = filiais.find(f => f.id === filialId);
        if (filial) {
          return prev.filter(unidadeId => {
            const unidade = unidadesEscolares.find(u => u.id === unidadeId);
            return unidade && unidade.filial_id !== filialId;
          });
        }
        return prev;
      });
      await carregarUnidadesEscolares(novasFiliais);
    }
  }, [filiaisSelecionadas, filiais, unidadesEscolares, carregarUnidadesEscolares]);

  // Funções para manipular seleções de unidades escolares
  const handleUnidadeChange = useCallback((unidadeId, checked) => {
    if (checked) {
      setUnidadesSelecionadas(prev => [...prev, unidadeId]);
    } else {
      setUnidadesSelecionadas(prev => prev.filter(id => id !== unidadeId));
    }
  }, []);

  // Funções para manipular seleções de rotas
  const handleRotaChange = useCallback((rotaId, checked) => {
    if (checked) {
      setRotasSelecionadas(prev => [...prev, rotaId]);
    } else {
      setRotasSelecionadas(prev => prev.filter(id => id !== rotaId));
    }
  }, []);

  // Funções para seleção em lote
  const handleSelecionarTodasFiliais = useCallback(() => {
    if (Array.isArray(filiais) && filiais.length > 0) {
      const todasFiliais = filiais.map(f => f.id);
      setFiliaisSelecionadas(todasFiliais);
      carregarUnidadesEscolares(todasFiliais);
    }
  }, [filiais, carregarUnidadesEscolares]);

  const handleDesselecionarTodasFiliais = useCallback(() => {
    setFiliaisSelecionadas([]);
    setUnidadesEscolares([]);
    setUnidadesSelecionadas([]);
  }, []);

  const handleSelecionarTodasUnidades = useCallback(() => {
    if (Array.isArray(unidadesEscolares) && unidadesEscolares.length > 0) {
      const todasUnidades = unidadesEscolares.map(u => u.id);
      setUnidadesSelecionadas(prev => {
        const novas = [...prev];
        todasUnidades.forEach(id => {
          if (!novas.includes(id)) {
            novas.push(id);
          }
        });
        return novas;
      });
    }
  }, [unidadesEscolares]);

  const handleDesselecionarTodasUnidades = useCallback(() => {
    setUnidadesSelecionadas([]);
  }, []);

  const handleSelecionarTodasRotas = useCallback(() => {
    if (Array.isArray(rotasNutricionistas) && rotasNutricionistas.length > 0) {
      const todasRotas = rotasNutricionistas.map(r => r.id);
      setRotasSelecionadas(todasRotas);
    }
  }, [rotasNutricionistas]);

  const handleDesselecionarTodasRotas = useCallback(() => {
    setRotasSelecionadas([]);
  }, []);

  // Filtrar unidades escolares por busca
  const unidadesFiltradas = Array.isArray(unidadesEscolares) 
    ? unidadesEscolares.filter(unidade => {
        if (!buscaUnidades) return true;
        return unidade.nome_escola?.toLowerCase().includes(buscaUnidades.toLowerCase());
      })
    : [];

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setArquivo(file);
    } else {
      toast.error('Por favor, selecione um arquivo PDF válido');
    }
  };

  const handleProcessar = async () => {
    if (!arquivo) {
      toast.error('Por favor, selecione um arquivo PDF');
      return;
    }

    // Validar seleções baseado no tipo
    if (tipoSelecao === 'filiais') {
      if (filiaisSelecionadas.length === 0) {
        toast.error('Por favor, selecione pelo menos uma filial');
        return;
      }
      if (unidadesSelecionadas.length === 0) {
        toast.error('Por favor, selecione pelo menos uma unidade escolar');
        return;
      }
    } else {
      if (rotasSelecionadas.length === 0) {
        toast.error('Por favor, selecione pelo menos uma rota de nutricionista');
        return;
      }
    }

    setProcessando(true);
    try {
      const formData = new FormData();
      formData.append('pdf', arquivo);
      
      if (tipoSelecao === 'filiais') {
        if (filiaisSelecionadas.length > 0) {
          formData.append('filiais_ids', filiaisSelecionadas.join(','));
        }
        if (unidadesSelecionadas.length > 0) {
          formData.append('unidades_ids', unidadesSelecionadas.join(','));
        }
      } else {
        if (rotasSelecionadas.length > 0) {
          formData.append('rotas_ids', rotasSelecionadas.join(','));
        }
      }

      const resultado = await NecessidadesMerendaService.gerarDePDF(formData);

      if (resultado.success) {
        toast.success('PDF processado com sucesso!');
        
        // Se há dados para preview, mostrar
        if (resultado.data && (resultado.data.necessidades || resultado.data.dados_processados)) {
          onPreview(resultado.data);
        } else {
          onProcessar(resultado.data);
        }
        
        handleClose();
      } else {
        toast.error(resultado.error || 'Erro ao processar PDF');
      }
    } catch (error) {
      console.error('Erro ao processar PDF:', error);
      toast.error('Erro ao processar PDF');
    } finally {
      setProcessando(false);
    }
  };

  const handleClose = () => {
    setArquivo(null);
    setFiliaisSelecionadas([]);
    setUnidadesSelecionadas([]);
    setRotasSelecionadas([]);
    setBuscaUnidades('');
    setTipoSelecao('filiais');
    setProcessando(false); // Reset do estado de processamento
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="📄 Gerar Necessidades de PDF"
      size="full"
    >
      <div className="space-y-6 max-h-[80vh] overflow-y-auto">
        {/* Upload do arquivo */}
        <div className="form-group">
          <label className="form-label">
            <FaFilePdf className="mr-2" />
            Arquivo PDF *
          </label>
          <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-gray-400 transition-colors">
            <div className="space-y-1 text-center">
              <FaFilePdf className="mx-auto h-12 w-12 text-gray-400" />
              <div className="flex text-sm text-gray-600">
                <label
                  htmlFor="pdf-upload"
                  className="relative cursor-pointer bg-white rounded-md font-medium text-green-600 hover:text-green-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-green-500"
                >
                  <span>Selecionar arquivo</span>
                  <input
                    id="pdf-upload"
                    name="pdf-upload"
                    type="file"
                    accept=".pdf"
                    className="sr-only"
                    onChange={handleFileSelect}
                  />
                </label>
                <p className="pl-1">ou arraste e solte aqui</p>
              </div>
              <p className="text-xs text-gray-500">PDF até 10MB</p>
              {arquivo && (
                <p className="text-sm text-green-600 font-medium">
                  ✓ {arquivo.name}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tipo de Seleção */}
        <div className="form-group">
          <label className="form-label">Tipo de Seleção</label>
          <div className="flex space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="filiais"
                checked={tipoSelecao === 'filiais'}
                onChange={(e) => setTipoSelecao(e.target.value)}
                className="mr-2"
              />
              Filiais e Unidades Escolares
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="rotas"
                checked={tipoSelecao === 'rotas'}
                onChange={(e) => setTipoSelecao(e.target.value)}
                className="mr-2"
              />
              Rotas de Nutricionistas
            </label>
          </div>
        </div>

        {/* Seleção de Filiais e Unidades */}
        {tipoSelecao === 'filiais' && (
          <div className="space-y-4">
            {/* Resumo da Seleção */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                📊 Resumo da Seleção
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-700">
                    <strong>{filiaisSelecionadas.length}</strong> filiais selecionadas
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                  <span className="text-gray-700">
                    <strong>{unidadesSelecionadas.length}</strong> unidades escolares
                  </span>
                </div>
              </div>
            </div>

            {/* Seleção de Filiais */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  <FaBuilding className="mr-2" />
                  Filiais ({filiaisSelecionadas.length} selecionadas)
                </h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelecionarTodasFiliais}
                    disabled={loadingFiliais}
                  >
                    <FaCheckSquare className="mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDesselecionarTodasFiliais}
                    disabled={loadingFiliais}
                  >
                    <FaSquare className="mr-1" />
                    Nenhuma
                  </Button>
                </div>
              </div>

              {loadingFiliais ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Carregando filiais...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {!Array.isArray(filiais) || filiais.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                      Nenhuma filial disponível para seu usuário
                    </div>
                  ) : (
                    filiais.map((filial) => {
                      const isChecked = filiaisSelecionadas.includes(filial.id);
                      return (
                        <label key={filial.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded border">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleFilialChange(filial.id, e.target.checked)}
                            className="mr-3 text-green-600 focus:ring-green-500 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 block truncate">
                              {filial.filial || 'Filial não informada'}
                            </span>
                            <div className="text-xs text-gray-500 truncate">
                              {filial.cidade || 'Cidade não informada'}/{filial.estado || 'Estado não informado'} - {filial.codigo_filial || 'Código não informado'}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>

            {/* Seleção de Unidades Escolares */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  <FaBuilding className="mr-2" />
                  Unidades Escolares ({unidadesSelecionadas.length} selecionadas)
                </h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelecionarTodasUnidades}
                    disabled={loadingUnidades || unidadesEscolares.length === 0}
                  >
                    <FaCheckSquare className="mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDesselecionarTodasUnidades}
                    disabled={loadingUnidades}
                  >
                    <FaSquare className="mr-1" />
                    Nenhuma
                  </Button>
                </div>
              </div>

              {filiaisSelecionadas.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  Selecione pelo menos uma filial para ver as unidades escolares disponíveis.
                </div>
              ) : loadingUnidades ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Carregando unidades escolares...</div>
                </div>
              ) : (
                <>
                  {/* Busca de Unidades */}
                  <div className="mb-3">
                    <div className="relative">
                      <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                      <Input
                        type="text"
                        placeholder="Buscar unidades escolares..."
                        value={buscaUnidades}
                        onChange={(e) => setBuscaUnidades(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {!Array.isArray(unidadesFiltradas) || unidadesFiltradas.length === 0 ? (
                      <div className="text-center py-4 text-gray-500">
                        {buscaUnidades ? 'Nenhuma unidade encontrada com o termo buscado.' : 'Nenhuma unidade escolar disponível para as filiais selecionadas.'}
                      </div>
                    ) : (
                      unidadesFiltradas.map((unidade) => {
                        const isChecked = unidadesSelecionadas.includes(unidade.id);
                        return (
                          <label key={unidade.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded border">
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={(e) => handleUnidadeChange(unidade.id, e.target.checked)}
                              className="mr-3 text-green-600 focus:ring-green-500 rounded"
                            />
                            <div className="flex-1 min-w-0">
                              <span className="text-sm font-medium text-gray-900 block truncate">
                                {unidade.nome_escola || 'Unidade não informada'}
                              </span>
                              <div className="text-xs text-gray-500 truncate">
                                {unidade.endereco || 'Endereço não informado'}
                              </div>
                            </div>
                          </label>
                        );
                      })
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Seleção de Rotas de Nutricionistas */}
        {tipoSelecao === 'rotas' && (
          <div className="space-y-4">
            {/* Resumo da Seleção */}
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h3 className="text-sm font-semibold text-green-700 mb-2">
                📊 Resumo da Seleção
              </h3>
              <div className="text-sm">
                <div className="flex items-center">
                  <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                  <span className="text-gray-700">
                    <strong>{rotasSelecionadas.length}</strong> rotas de nutricionistas selecionadas
                  </span>
                </div>
              </div>
            </div>

            {/* Seleção de Rotas */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900">
                  <FaRoute className="mr-2" />
                  Rotas de Nutricionistas ({rotasSelecionadas.length} selecionadas)
                </h3>
                <div className="flex space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleSelecionarTodasRotas}
                    disabled={loadingRotas}
                  >
                    <FaCheckSquare className="mr-1" />
                    Todas
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleDesselecionarTodasRotas}
                    disabled={loadingRotas}
                  >
                    <FaSquare className="mr-1" />
                    Nenhuma
                  </Button>
                </div>
              </div>

              {loadingRotas ? (
                <div className="text-center py-4">
                  <div className="text-gray-500">Carregando rotas de nutricionistas...</div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {!Array.isArray(rotasNutricionistas) || rotasNutricionistas.length === 0 ? (
                    <div className="col-span-2 text-center py-4 text-gray-500">
                      Nenhuma rota de nutricionista disponível
                    </div>
                  ) : (
                    rotasNutricionistas.map((rota) => {
                      const isChecked = rotasSelecionadas.includes(rota.id);
                      return (
                        <label key={rota.id} className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded border">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => handleRotaChange(rota.id, e.target.checked)}
                            className="mr-3 text-green-600 focus:ring-green-500 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-medium text-gray-900 block truncate">
                              {rota.codigo || 'Rota não informada'}
                            </span>
                            <div className="text-xs text-gray-500 truncate">
                              {rota.usuario_nome ? `Nutricionista: ${rota.usuario_nome}` : 'Sem nutricionista'}
                            </div>
                            <div className="text-xs text-gray-500 truncate">
                              {rota.status ? `Status: ${rota.status}` : 'Status não informado'}
                            </div>
                          </div>
                        </label>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-between items-center pt-6 border-t">
          <div className="text-sm text-gray-500">
            {processando && (
              <span className="text-orange-600">
                ⚠️ Processando... Se travou, clique em "Reset"
              </span>
            )}
          </div>
          <div className="flex space-x-3">
            {processando && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setProcessando(false)}
                className="text-orange-600 border-orange-300 hover:bg-orange-50"
              >
                Reset
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={processando}
            >
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            
            <Button
              onClick={handleProcessar}
              disabled={
                !arquivo || 
                processando || 
                (tipoSelecao === 'filiais' && (filiaisSelecionadas.length === 0 || unidadesSelecionadas.length === 0)) ||
                (tipoSelecao === 'rotas' && rotasSelecionadas.length === 0)
              }
            >
              <FaUpload className="mr-2" />
              {processando ? 'Processando...' : 'Processar PDF'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default NecessidadeUploadModal;
