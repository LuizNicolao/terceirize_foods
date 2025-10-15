import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import { FaList, FaChartLine, FaHistory } from 'react-icons/fa';
import FoodsApiService from '../../services/FoodsApiService';
import { useAuth } from '../../contexts/AuthContext';
import RegistrosDiariosService from '../../services/registrosDiarios';
import MediasCalculadasTab from './MediasCalculadasTab';
import HistoricoTab from './HistoricoTab';

const RegistrosDiariosModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  registro = null,
  isViewMode = false
}) => {
  const { user } = useAuth();
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingEscolas, setLoadingEscolas] = useState(false);
  const [abaAtiva, setAbaAtiva] = useState('detalhes');
  const [medias, setMedias] = useState([]);
  const [loadingMedias, setLoadingMedias] = useState(false);
  const [historico, setHistorico] = useState([]);
  const [loadingHistorico, setLoadingHistorico] = useState(false);
  
  const [formData, setFormData] = useState({
    escola_id: '',
    nutricionista_id: user?.id || '',
    data: new Date().toISOString().split('T')[0],
    quantidades: {
      lanche_manha: 0,
      almoco: 0,
      lanche_tarde: 0,
      parcial: 0,
      eja: 0
    }
  });
  
  // Carregar TODAS as escolas quando modal abrir
  useEffect(() => {
    const carregarTodasEscolas = async () => {
      if (!isOpen) return;
      
      try {
        setLoadingEscolas(true);
        let todasEscolas = [];
        let page = 1;
        let hasMore = true;
        const limit = 100;
        
        // Buscar todas as escolas fazendo múltiplas requisições
        while (hasMore) {
          const result = await FoodsApiService.getUnidadesEscolares({
            page,
            limit,
            status: 'ativo'
          });
          
          if (result.success && result.data && result.data.length > 0) {
            todasEscolas = [...todasEscolas, ...result.data];
            
            if (result.data.length < limit) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
          
          // Limite de segurança
          if (page > 50) {
            hasMore = false;
          }
        }
        
        setUnidadesEscolares(todasEscolas);
      } catch (error) {
        console.error('Erro ao carregar escolas:', error);
        setUnidadesEscolares([]);
      } finally {
        setLoadingEscolas(false);
      }
    };
    
    carregarTodasEscolas();
  }, [isOpen]);
  
  // Carregar dados do registro ao editar
  useEffect(() => {
    if (registro && isOpen) {
      setFormData({
        escola_id: registro.escola_id || '',
        nutricionista_id: registro.nutricionista_id || user?.id || '',
        data: registro.data || new Date().toISOString().split('T')[0],
        quantidades: {
          lanche_manha: registro.lanche_manha || 0,
          almoco: registro.almoco || 0,
          lanche_tarde: registro.lanche_tarde || 0,
          parcial: registro.parcial || 0,
          eja: registro.eja || 0
        }
      });
    } else if (!registro && isOpen) {
      // Resetar para novo registro
      setFormData({
        escola_id: '',
        nutricionista_id: user?.id || '',
        data: new Date().toISOString().split('T')[0],
        quantidades: {
          lanche_manha: 0,
          almoco: 0,
          lanche_tarde: 0,
          parcial: 0,
          eja: 0
        }
      });
    }
  }, [registro, isOpen, user]);
  
  // Carregar registros existentes quando escola e data forem selecionados
  useEffect(() => {
    const carregarRegistrosExistentes = async () => {
      if (formData.escola_id && formData.data && !registro) {
        const result = await RegistrosDiariosService.buscarPorEscolaData(
          formData.escola_id,
          formData.data
        );
        
        if (result.success && result.data?.quantidades) {
          setFormData(prev => ({
            ...prev,
            quantidades: result.data.quantidades
          }));
        }
      }
    };
    
    carregarRegistrosExistentes();
  }, [formData.escola_id, formData.data, registro]);
  
  // Carregar médias quando aba de médias for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarMedias = async () => {
      if (isViewMode && abaAtiva === 'medias' && formData.escola_id) {
        setLoadingMedias(true);
        const result = await RegistrosDiariosService.listarMedias(formData.escola_id);
        if (result.success) {
          setMedias(result.data);
        }
        setLoadingMedias(false);
      }
    };
    
    carregarMedias();
  }, [abaAtiva, formData.escola_id, isViewMode]);
  
  // Carregar histórico quando aba de histórico for ativada (apenas em modo visualização)
  useEffect(() => {
    const carregarHistorico = async () => {
      if (isViewMode && abaAtiva === 'historico' && formData.escola_id) {
        setLoadingHistorico(true);
        // Simular histórico baseado no registro atual
        const historicoSimulado = [{
          acao: 'criacao',
          data_acao: registro?.data_cadastro || new Date(),
          escola_id: formData.escola_id,
          data: formData.data,
          nutricionista_id: formData.nutricionista_id,
          usuario_nome: user?.nome,
          valores: formData.quantidades
        }];
        setHistorico(historicoSimulado);
        setLoadingHistorico(false);
      }
    };
    
    carregarHistorico();
  }, [abaAtiva, formData, isViewMode, registro, user]);
  
  // Resetar aba ao abrir/fechar modal
  useEffect(() => {
    if (isOpen) {
      setAbaAtiva('detalhes');
    }
  }, [isOpen]);
  
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleQuantidadeChange = (tipo, value) => {
    setFormData(prev => ({
      ...prev,
      quantidades: {
        ...prev.quantidades,
        [tipo]: parseInt(value) || 0
      }
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.escola_id) {
      toast.error('Selecione uma escola');
      return;
    }
    
    if (!formData.data) {
      toast.error('Selecione uma data');
      return;
    }
    
    onSave(formData);
  };
  
  if (!isOpen) return null;
  
  const abas = [
    { id: 'detalhes', label: 'Registros Diários', icon: FaList },
    { id: 'medias', label: 'Médias Calculadas', icon: FaChartLine },
    { id: 'historico', label: 'Histórico', icon: FaHistory }
  ];
  
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Quantidade Servida' : registro ? 'Editar Quantidade Servida' : 'Nova Quantidade Servida'}
      size="xl"
    >
      {isViewMode && (
        <div className="mb-4">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {abas.map((aba) => {
                const Icon = aba.icon;
                const isActive = abaAtiva === aba.id;
                
                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`
                      group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm
                      ${isActive
                        ? 'border-green-500 text-green-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    <Icon
                      className={`
                        -ml-0.5 mr-2 h-5 w-5
                        ${isActive ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-500'}
                      `}
                    />
                    {aba.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      )}
      
      {/* Conteúdo das abas em modo visualização */}
      {isViewMode && abaAtiva === 'medias' && (
        <div className="max-h-96 overflow-y-auto">
          <MediasCalculadasTab medias={medias} loading={loadingMedias} />
        </div>
      )}
      
      {isViewMode && abaAtiva === 'historico' && (
        <div className="max-h-96 overflow-y-auto">
          <HistoricoTab historico={historico} loading={loadingHistorico} />
        </div>
      )}
      
      {/* Formulário (modo criar/editar ou aba detalhes em visualização) */}
      {(!isViewMode || abaAtiva === 'detalhes') && (
        <form onSubmit={handleSubmit} className="space-y-4">
        {/* Seleção de Escola e Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <SearchableSelect
              label="Escola *"
              value={formData.escola_id}
              onChange={(value) => handleInputChange('escola_id', value)}
              options={unidadesEscolares.map(escola => ({
                value: escola.id,
                label: escola.nome_escola,
                description: `${escola.cidade} - ${escola.rota_nome || 'Sem rota'}`
              }))}
              placeholder="Selecione uma escola..."
              disabled={isViewMode || loadingEscolas}
              required
              renderOption={(option) => (
                <div className="flex flex-col">
                  <span className="font-medium text-gray-900">{option.label}</span>
                  {option.description && (
                    <span className="text-xs text-gray-500 mt-1">{option.description}</span>
                  )}
                </div>
              )}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Data *
            </label>
            <Input
              type="date"
              value={formData.data}
              onChange={(e) => handleInputChange('data', e.target.value)}
              disabled={isViewMode}
              required
            />
          </div>
        </div>
        
        {/* Tabela de Quantidades */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Quantidade de Refeições Servidas
          </h3>
          
          <div className="space-y-3">
            {[
              { key: 'lanche_manha', label: 'Lanche Manhã', icon: '🥐' },
              { key: 'almoco', label: 'Almoço', icon: '🍽️' },
              { key: 'lanche_tarde', label: 'Lanche Tarde', icon: '🥤' },
              { key: 'parcial', label: 'Parcial', icon: '🍲' },
              { key: 'eja', label: 'EJA', icon: '📚' }
            ].map(refeicao => (
              <div key={refeicao.key} className="flex items-center gap-3">
                <span className="text-2xl">{refeicao.icon}</span>
                <label className="flex-1 text-sm font-medium text-gray-700">
                  {refeicao.label}
                </label>
                <Input
                  type="number"
                  min="0"
                  value={formData.quantidades[refeicao.key]}
                  onChange={(e) => handleQuantidadeChange(refeicao.key, e.target.value)}
                  disabled={isViewMode}
                  className="w-24 text-center"
                  placeholder="0"
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {registro ? 'Atualizar' : 'Salvar Registro'}
            </Button>
          </div>
        )}
        </form>
      )}
      
      {isViewMode && (
        <div className="flex justify-end pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      )}
    </Modal>
  );
};

export default RegistrosDiariosModal;

