import React, { useState, useEffect } from 'react';
import { FaTimes, FaSave, FaBuilding, FaUser, FaExchangeAlt, FaFileAlt, FaSchool, FaWarehouse } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import FiliaisService from '../../services/filiais';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import UsuariosService from '../../services/usuarios';

const PatrimoniosMovimentacaoForm = ({
  isOpen,
  onClose,
  movimentacaoData,
  onMovimentacaoDataChange,
  patrimonio,
  saving,
  onSubmit
}) => {
  const { user } = useAuth();
  const [filiais, setFiliais] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [loadingUnidades, setLoadingUnidades] = useState(false);
  const [tipoLocal, setTipoLocal] = useState('filial'); // 'filial' ou 'unidade_escolar'
  const [unidadesEscolaresFiltradas, setUnidadesEscolaresFiltradas] = useState([]);
  const [validationError, setValidationError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadFiliais();
      loadUnidadesEscolares();
      // Preencher automaticamente o responsável com o usuário logado
      if (user && movimentacaoData && !movimentacaoData.responsavel_id) {
        onMovimentacaoDataChange('responsavel_id', user.id);
      }
    }
  }, [isOpen, user, onMovimentacaoDataChange]);

  // Filtrar unidades escolares baseado na filial de origem do patrimônio
  useEffect(() => {
    if (patrimonio && patrimonio.local_atual_id) {
      let filialOrigemId = null;
      
      // Determinar a filial de origem
      if (patrimonio.tipo_local_atual === 'filial') {
        filialOrigemId = parseInt(patrimonio.local_atual_id);
      } else if (patrimonio.tipo_local_atual === 'unidade_escolar') {
        // Buscar a filial da unidade escolar
        const unidade = unidadesEscolares.find(ue => parseInt(ue.id) === parseInt(patrimonio.local_atual_id));
        filialOrigemId = unidade ? parseInt(unidade.filial_id) : null;
      }

      if (filialOrigemId) {
        // Filtrar apenas unidades escolares da mesma filial
        const filtradas = unidadesEscolares.filter(ue => 
          parseInt(ue.filial_id) === parseInt(filialOrigemId)
        );
        setUnidadesEscolaresFiltradas(filtradas);
      } else {
        setUnidadesEscolaresFiltradas([]);
      }
    }
  }, [patrimonio, unidadesEscolares]);

  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      
      // Buscar filiais às quais o usuário tem acesso
      if (user && user.id) {
        try {
          // Usar o serviço de usuários que já tem autenticação configurada
          const result = await UsuariosService.buscarPorId(user.id);
          if (result.success && result.data && result.data.filiais) {
            setFiliais(result.data.filiais);
            return;
          }
        } catch (error) {
          console.error('Erro ao buscar filiais do usuário:', error);
        }
      }
      
      // Usuário sem filiais vinculadas não pode movimentar patrimônios
      console.warn('Usuário sem filiais vinculadas - acesso restrito');
      setFiliais([]);
      return;
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
      // Fallback: tentar listar com limite alto
      try {
        const fallbackResult = await FiliaisService.listar({ limit: 1000, page: 1 });
        if (fallbackResult.success) {
          setFiliais(fallbackResult.data || []);
        }
      } catch (fallbackError) {
        console.error('Erro no fallback:', fallbackError);
      }
    } finally {
      setLoadingFiliais(false);
    }
  };

  const loadUnidadesEscolares = async () => {
    try {
      setLoadingUnidades(true);
      
      // Buscar unidades escolares das filiais às quais o usuário tem acesso
      if (user && user.id) {
        try {
          // Usar o serviço de usuários que já tem autenticação configurada
          const result = await UsuariosService.buscarPorId(user.id);
          if (result.success && result.data && result.data.filiais) {
            const filiaisIds = result.data.filiais.map(f => f.id);
            
            // Buscar unidades escolares das filiais permitidas
            const unidadesResult = await UnidadesEscolaresService.buscarAtivas();
            if (unidadesResult.success) {
              const unidadesFiltradas = unidadesResult.data.filter(ue => 
                filiaisIds.includes(parseInt(ue.filial_id))
              );
              setUnidadesEscolares(unidadesFiltradas);
              return;
            }
          }
        } catch (error) {
          console.error('Erro ao buscar filiais do usuário:', error);
        }
      }
      
      // Usuário sem filiais vinculadas não pode movimentar patrimônios
      console.warn('Usuário sem filiais vinculadas - acesso restrito');
      setUnidadesEscolares([]);
      return;
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      setUnidadesEscolares([]);
    } finally {
      setLoadingUnidades(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validação das regras de movimentação
    setValidationError('');
    
    if (!movimentacaoData) {
      setValidationError('Dados de movimentação não encontrados.');
      return;
    }
    
    if (tipoLocal === 'unidade_escolar') {
      const unidadeDestino = unidadesEscolares.find(ue => ue.id === movimentacaoData.local_destino_id);
      
      if (patrimonio.tipo_local_atual === 'unidade_escolar') {
        // Movimentação entre unidades escolares: verificar se são da mesma filial
        const unidadeOrigem = unidadesEscolares.find(ue => ue.id === patrimonio.local_atual_id);
        
        if (unidadeOrigem?.filial_id !== unidadeDestino?.filial_id) {
          setValidationError('Não é permitido movimentar patrimônios entre unidades escolares de filiais diferentes.');
          return;
        }
      } else if (patrimonio.tipo_local_atual === 'filial') {
        // Movimentação de filial para unidade escolar: verificar se a unidade pertence à filial
        if (unidadeDestino?.filial_id !== patrimonio.local_atual_id) {
          setValidationError('Não é permitido movimentar patrimônios de uma filial para uma unidade escolar que não pertence a ela.');
          return;
        }
      }
    } else if (tipoLocal === 'filial') {
      if (patrimonio.tipo_local_atual === 'unidade_escolar') {
        // Movimentação de unidade escolar para filial: verificar se a unidade pertence à filial
        const unidadeOrigem = unidadesEscolares.find(ue => ue.id === patrimonio.local_atual_id);
        
        if (unidadeOrigem?.filial_id !== movimentacaoData.local_destino_id) {
          setValidationError('Não é permitido movimentar patrimônios de uma unidade escolar para uma filial diferente da qual ela pertence.');
          return;
        }
      }
    }
    
    onSubmit();
  };

  const handleTipoLocalChange = (tipo) => {
    setTipoLocal(tipo);
    // Atualizar o tipo_local_destino no estado global
    onMovimentacaoDataChange('tipo_local_destino', tipo);
    // Limpar o local selecionado quando mudar o tipo
    onMovimentacaoDataChange('local_destino_id', '');
  };

  const getLocalName = (id, tipo) => {
    if (tipo === 'filial') {
      const filial = filiais.find(f => f.id === parseInt(id));
      return filial ? filial.filial : '';
    } else {
      const unidade = unidadesEscolares.find(u => u.id === parseInt(id));
      return unidade ? unidade.nome_escola : '';
    }
  };

  if (!isOpen || !patrimonio) return null;

  // Verificar se o usuário tem filiais vinculadas
  if (filiais.length === 0 && !loadingFiliais) {
    return (
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Movimentar Patrimônio"
        size="xl"
      >
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h4 className="font-medium text-red-900 mb-2 flex items-center">
              <FaBuilding className="mr-2" />
              Acesso Restrito
            </h4>
            <div className="text-sm text-red-800">
              <p className="mb-2">
                <strong>Você não pode movimentar patrimônios.</strong>
              </p>
              <p>
                É necessário ter filiais vinculadas ao seu usuário para realizar movimentações.
                Entre em contato com o administrador do sistema.
              </p>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button type="button" variant="secondary" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Movimentar Patrimônio"
      size="xl"
    >
      <div className="space-y-6">
        {/* Informações do Patrimônio */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h4 className="font-medium text-gray-900 mb-3 pb-2 border-b-2 border-blue-500">
            Patrimônio Selecionado
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Número:</span>
              <span className="ml-2 font-medium">{patrimonio.numero_patrimonio}</span>
            </div>
            <div>
              <span className="text-gray-500">Produto:</span>
              <span className="ml-2 font-medium">{patrimonio.nome_produto || 'Produto não informado'}</span>
            </div>
            <div>
              <span className="text-gray-500">Local Atual:</span>
              <span className="ml-2 font-medium">{patrimonio.local_atual_nome || 'Local não informado'}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium">{patrimonio.status}</span>
            </div>
          </div>
        </div>



        {/* Formulário */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Seleção do Local de Destino */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Local de Destino *
          </label>
          
          {/* Radio buttons para tipo de local */}
          <div className="flex space-x-6">
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoLocal"
                value="filial"
                checked={tipoLocal === 'filial'}
                onChange={(e) => handleTipoLocalChange(e.target.value)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <FaWarehouse className="mr-2 text-gray-600" />
              Filial
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="tipoLocal"
                value="unidade_escolar"
                checked={tipoLocal === 'unidade_escolar'}
                onChange={(e) => handleTipoLocalChange(e.target.value)}
                className="mr-3 text-blue-600 focus:ring-blue-500"
              />
              <FaSchool className="mr-2 text-gray-600" />
              Unidade Escolar
            </label>
          </div>

          {/* Dropdown para seleção do local */}
          {tipoLocal === 'filial' ? (
            <SearchableSelect
              options={filiais.map(filial => ({
                value: filial.id,
                label: `${filial.filial} - ${filial.cidade}/${filial.estado}`
              }))}
              value={movimentacaoData?.local_destino_id || ''}
              onChange={(value) => onMovimentacaoDataChange('local_destino_id', value)}
              placeholder="Selecione a filial de destino"
              disabled={loadingFiliais}
            />
          ) : (
            <SearchableSelect
              options={unidadesEscolaresFiltradas.map(unidade => ({
                value: unidade.id,
                label: `${unidade.nome_escola} - ${unidade.cidade}/${unidade.estado}`
              }))}
              value={movimentacaoData?.local_destino_id || ''}
              onChange={(value) => onMovimentacaoDataChange('local_destino_id', value)}
              placeholder={
                unidadesEscolaresFiltradas.length === 0 
                  ? "Nenhuma unidade escolar disponível para esta filial"
                  : "Selecione a unidade escolar de destino"
              }
              disabled={loadingUnidades || unidadesEscolaresFiltradas.length === 0}
            />
          )}
        </div>

        {/* Exibição de erro de validação */}
        {validationError && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <div className="flex">
              <div className="flex-shrink-0">
                <FaTimes className="h-5 w-5 text-red-400" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro de Validação</h3>
                <div className="mt-2 text-sm text-red-700">
                  {validationError}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Motivo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaExchangeAlt className="inline mr-2 text-gray-500" />
              Motivo da Movimentação
            </label>
            <Input
              type="select"
              value={movimentacaoData?.motivo || ''}
              onChange={(e) => onMovimentacaoDataChange('motivo', e.target.value)}
            >
              <option value="transferencia">Transferência</option>
              <option value="manutencao">Manutenção</option>
              <option value="devolucao">Devolução</option>
              <option value="outro">Outro</option>
            </Input>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FaFileAlt className="inline mr-2 text-gray-500" />
              Observações
            </label>
            <Input
              type="textarea"
              placeholder="Observações sobre a movimentação..."
              value={movimentacaoData?.observacoes || ''}
              onChange={(e) => onMovimentacaoDataChange('observacoes', e.target.value)}
              rows={4}
            />
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Movimentando...
                </>
              ) : (
                <>
                  <FaExchangeAlt className="mr-2" />
                  Movimentar
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default PatrimoniosMovimentacaoForm;
