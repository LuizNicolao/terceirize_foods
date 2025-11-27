import React, { useEffect, useState } from 'react';
import { Modal, Input, Button, SearchableSelect } from '../ui';
import almoxarifadoService from '../../services/almoxarifadoService';
import centroCustoService from '../../services/centroCusto';
import FiliaisService from '../../services/filiais';
import UnidadesEscolaresService from '../../services/unidadesEscolares';

const AlmoxarifadoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  almoxarifado, 
  isViewMode 
}) => {
  const [codigoGerado, setCodigoGerado] = useState('');
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);
  const [filiais, setFiliais] = useState([]);
  const [carregandoFiliais, setCarregandoFiliais] = useState(false);
  const [centrosCusto, setCentrosCusto] = useState([]);
  const [carregandoCentrosCusto, setCarregandoCentrosCusto] = useState(false);
  const [filialSelecionada, setFilialSelecionada] = useState('');
  const [centroCustoId, setCentroCustoId] = useState('');
  const [tipoVinculo, setTipoVinculo] = useState('filial');
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [carregandoUnidadesEscolares, setCarregandoUnidadesEscolares] = useState(false);
  const [unidadeEscolarSelecionada, setUnidadeEscolarSelecionada] = useState('');
  const [nomeAlmoxarifado, setNomeAlmoxarifado] = useState('');

  // Carregar filiais ativas
  useEffect(() => {
    const carregarFiliais = async () => {
      if (isOpen) {
        setCarregandoFiliais(true);
        try {
          const response = await FiliaisService.buscarAtivas();
          if (response.success) {
            setFiliais(response.data || []);
          }
        } catch (error) {
          console.error('Erro ao carregar filiais:', error);
        } finally {
          setCarregandoFiliais(false);
        }
      }
    };

    carregarFiliais();
  }, [isOpen]);

  // Carregar unidades escolares quando filial for selecionada e tipo for unidade_escolar
  useEffect(() => {
    const carregarUnidadesEscolares = async () => {
      if (isOpen && filialSelecionada && tipoVinculo === 'unidade_escolar') {
        setCarregandoUnidadesEscolares(true);
        try {
          // Buscar unidades escolares ativas e filtrar por filial
          const response = await UnidadesEscolaresService.buscarAtivas();
          if (response.success) {
            // Filtrar por filial
            let unidadesFiltradas = (response.data || []).filter(
              ue => String(ue.filial_id) === String(filialSelecionada)
            );

            // Buscar almoxarifados do tipo unidade_escolar para excluir unidades que já têm almoxarifado
            const almoxarifadosResponse = await almoxarifadoService.listar({
              status: 1,
              limit: 1000 // Buscar todos os ativos
            });

            if (almoxarifadosResponse.success && almoxarifadosResponse.data) {
              // Obter ID da unidade atual do almoxarifado sendo editado (se houver)
              const unidadeAtualId = almoxarifado && almoxarifado.unidade_escolar_id 
                ? String(almoxarifado.unidade_escolar_id) 
                : null;

              // Obter IDs de unidades que já têm almoxarifado (exceto o atual se estiver editando)
              const unidadesComAlmoxarifado = almoxarifadosResponse.data
                .filter(almox => 
                  almox.tipo_vinculo === 'unidade_escolar' && 
                  almox.unidade_escolar_id &&
                  (!almoxarifado || String(almox.id) !== String(almoxarifado.id)) // Excluir o atual se estiver editando
                )
                .map(almox => String(almox.unidade_escolar_id));

              // Filtrar unidades que já têm almoxarifado, mas incluir a unidade atual se estiver editando
              unidadesFiltradas = unidadesFiltradas.filter(
                ue => !unidadesComAlmoxarifado.includes(String(ue.id)) || String(ue.id) === unidadeAtualId
              );
            }

            setUnidadesEscolares(unidadesFiltradas);
          } else {
            setUnidadesEscolares([]);
          }
        } catch (error) {
          console.error('Erro ao carregar unidades escolares:', error);
          setUnidadesEscolares([]);
        } finally {
          setCarregandoUnidadesEscolares(false);
        }
      } else {
        setUnidadesEscolares([]);
        setUnidadeEscolarSelecionada('');
      }
    };

    carregarUnidadesEscolares();
  }, [filialSelecionada, tipoVinculo, isOpen, almoxarifado]);

  // Preencher nome automaticamente quando unidade escolar for selecionada (criação e edição)
  useEffect(() => {
    if (tipoVinculo === 'unidade_escolar' && unidadeEscolarSelecionada && unidadesEscolares.length > 0) {
      const unidadeSelecionada = unidadesEscolares.find(ue => String(ue.id) === String(unidadeEscolarSelecionada));
      if (unidadeSelecionada && unidadeSelecionada.nome_escola) {
        // Atualizar nome automaticamente tanto na criação quanto na edição
        setNomeAlmoxarifado(`ALM - ${unidadeSelecionada.nome_escola}`);
      }
    } else if (tipoVinculo === 'filial') {
      // Se mudou para filial, limpar o nome apenas se não estiver editando
      // Se estiver editando e mudou para filial, manter o nome atual (não limpar)
      if (!almoxarifado) {
        setNomeAlmoxarifado('');
      }
    }
  }, [unidadeEscolarSelecionada, unidadesEscolares, tipoVinculo, almoxarifado]);

  // Carregar centros de custo quando filial for selecionada
  useEffect(() => {
    const carregarCentrosCusto = async () => {
      if (isOpen && filialSelecionada) {
        setCarregandoCentrosCusto(true);
        try {
          const response = await centroCustoService.buscarAtivos();
          if (response.success) {
            // Filtrar por filial selecionada (comparar como string para garantir compatibilidade)
            const filialIdNum = parseInt(filialSelecionada);
            const centrosFiltrados = (response.data || []).filter(
              cc => String(cc.filial_id) === String(filialSelecionada) || cc.filial_id === filialIdNum
            );
            setCentrosCusto(centrosFiltrados);
          }
        } catch (error) {
          console.error('Erro ao carregar centros de custo:', error);
          setCentrosCusto([]);
        } finally {
          setCarregandoCentrosCusto(false);
        }
      } else if (!filialSelecionada) {
        setCentrosCusto([]);
      }
    };

    carregarCentrosCusto();
  }, [filialSelecionada, isOpen]);

  // Carregar próximo código e atualizar estados quando almoxarifado mudar
  useEffect(() => {
    const carregarProximoCodigo = async () => {
      if (!almoxarifado && isOpen) {
        setCarregandoCodigo(true);
        try {
          const response = await almoxarifadoService.obterProximoCodigo();
          if (response.success) {
            setCodigoGerado(response.data.proximoCodigo);
          } else {
            setCodigoGerado('Erro ao gerar código');
          }
        } catch (error) {
          console.error('Erro ao obter próximo código:', error);
          setCodigoGerado('Erro ao gerar código');
        } finally {
          setCarregandoCodigo(false);
        }
        // Limpar estados quando criar novo
        setFilialSelecionada('');
        setCentroCustoId('');
        setTipoVinculo('filial');
        setUnidadeEscolarSelecionada('');
        setNomeAlmoxarifado('');
      } else if (almoxarifado) {
        setCodigoGerado(almoxarifado.codigo || '');
        // Atualizar filial e centro de custo quando almoxarifado for carregado
        const filialId = almoxarifado.filial_id ? String(almoxarifado.filial_id) : '';
        const centroCustoIdValue = almoxarifado.centro_custo_id ? String(almoxarifado.centro_custo_id) : '';
        const tipoVinculoValue = almoxarifado.tipo_vinculo || 'filial';
        const unidadeEscolarIdValue = almoxarifado.unidade_escolar_id ? String(almoxarifado.unidade_escolar_id) : '';
        setFilialSelecionada(filialId);
        setCentroCustoId(centroCustoIdValue);
        setTipoVinculo(tipoVinculoValue);
        setUnidadeEscolarSelecionada(unidadeEscolarIdValue);
        setNomeAlmoxarifado(almoxarifado.nome || '');
      }
    };

    carregarProximoCodigo();
  }, [almoxarifado, isOpen]);

  // Limpar estados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setFilialSelecionada('');
      setCentroCustoId('');
      setCentrosCusto([]);
      setTipoVinculo('filial');
      setUnidadeEscolarSelecionada('');
      setUnidadesEscolares([]);
      setNomeAlmoxarifado('');
    }
  }, [isOpen]);

  const handleFilialChange = (e) => {
    const novaFilial = e.target.value;
    setFilialSelecionada(novaFilial);
    // Limpar centro de custo e unidade escolar selecionados quando mudar a filial
    setCentroCustoId('');
    setUnidadeEscolarSelecionada('');
  };

  const handleTipoVinculoChange = (e) => {
    const novoTipo = e.target.value;
    setTipoVinculo(novoTipo);
    // Limpar unidade escolar quando mudar o tipo
    setUnidadeEscolarSelecionada('');
    // Se voltar para filial, limpar também o nome e unidades escolares
    if (novoTipo === 'filial') {
      setUnidadesEscolares([]);
      // Se estiver editando e mudou para filial, manter o nome atual (não limpar)
      // Se estiver criando novo, limpar o nome
      if (!almoxarifado) {
        setNomeAlmoxarifado('');
      }
    } else if (novoTipo === 'unidade_escolar') {
      // Se mudou para unidade_escolar, limpar o nome (será preenchido quando selecionar unidade)
      setNomeAlmoxarifado('');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Almoxarifado' : almoxarifado ? 'Editar Almoxarifado' : 'Adicionar Almoxarifado'}
      size="xl"
    >
      <form onSubmit={(e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = {
          nome: tipoVinculo === 'unidade_escolar' ? nomeAlmoxarifado : formData.get('nome'),
          codigo: codigoGerado || formData.get('codigo'),
          filial_id: formData.get('filial_id'),
          tipo_vinculo: tipoVinculo,
          unidade_escolar_id: tipoVinculo === 'unidade_escolar' ? (unidadeEscolarSelecionada || formData.get('unidade_escolar_id')) : null,
          centro_custo_id: formData.get('centro_custo_id'),
          observacoes: formData.get('observacoes'),
          status: formData.get('status')
        };
        onSubmit(data);
      }} className="space-y-4">
        {/* Campo hidden para unidade_escolar_id (para compatibilidade com FormData) */}
        <input type="hidden" name="unidade_escolar_id" value={unidadeEscolarSelecionada} />

        {/* Seleção de Tipo de Vínculo - criação e edição */}
        {!isViewMode && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <Input
              label="Tipo de Vínculo *"
              name="tipo_vinculo"
              type="select"
              value={tipoVinculo}
              onChange={handleTipoVinculoChange}
              required
            >
              <option value="filial">Almoxarifado para Filial</option>
              <option value="unidade_escolar">Almoxarifado para Unidade Escolar</option>
            </Input>
            <p className="text-xs text-gray-600 mt-2">
              {tipoVinculo === 'filial' 
                ? 'Um almoxarifado vinculado à filial pode ser usado por múltiplas unidades escolares da filial.'
                : 'Cada unidade escolar pode ter apenas um almoxarifado vinculado.'}
            </p>
          </div>
        )}

        {/* Cards organizados */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Código"
                name="codigo"
                value={codigoGerado}
                disabled={true}
                placeholder={carregandoCodigo ? "Carregando..." : "Código gerado automaticamente"}
              />
              <Input
                label="Nome *"
                name="nome"
                value={nomeAlmoxarifado || (almoxarifado?.nome || '')}
                onChange={(e) => {
                  if (tipoVinculo === 'filial') {
                    setNomeAlmoxarifado(e.target.value);
                  }
                }}
                disabled={isViewMode || tipoVinculo === 'unidade_escolar'}
                required
                placeholder={tipoVinculo === 'unidade_escolar' ? "Preenchido automaticamente" : "Ex: Almox Geral Cozinha"}
              />
              <Input
                label="Status"
                name="status"
                type="select"
                defaultValue={almoxarifado ? (almoxarifado.status === 1 ? '1' : '0') : '1'}
                disabled={isViewMode}
              >
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card: Vínculo */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Vínculo
            </h3>
            <div className="space-y-3">
              {/* Tipo de Vínculo - apenas em visualização */}
              {isViewMode && almoxarifado && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de Vínculo
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900">
                    {almoxarifado.tipo_vinculo === 'unidade_escolar' ? 'Unidade Escolar' : 'Filial'}
                  </div>
                </div>
              )}

              <Input
                label="Filial *"
                name="filial_id"
                type="select"
                value={filialSelecionada}
                onChange={handleFilialChange}
                disabled={isViewMode || carregandoFiliais}
                required
              >
                <option value="">{carregandoFiliais ? 'Carregando...' : 'Selecione uma filial'}</option>
                {filiais.map(filial => (
                  <option key={filial.id} value={String(filial.id)}>
                    {filial.codigo_filial} - {filial.filial}
                  </option>
                ))}
              </Input>

              {/* Unidade Escolar - Edição */}
              {tipoVinculo === 'unidade_escolar' && !isViewMode && filialSelecionada && (
                <SearchableSelect
                  label="Unidade Escolar *"
                  value={unidadeEscolarSelecionada}
                  onChange={(value) => setUnidadeEscolarSelecionada(value)}
                  options={unidadesEscolares.map(unidade => ({
                    value: String(unidade.id),
                    label: `${unidade.codigo_teknisa} - ${unidade.nome_escola}`,
                    description: `${unidade.cidade}/${unidade.estado}`
                  }))}
                  placeholder={
                    carregandoUnidadesEscolares
                      ? 'Carregando unidades escolares...'
                      : 'Digite para buscar unidade escolar...'
                  }
                  disabled={!filialSelecionada || carregandoUnidadesEscolares}
                  loading={carregandoUnidadesEscolares}
                  required
                  filterBy={(option, searchTerm) => {
                    const label = option.label?.toLowerCase() || '';
                    const description = option.description?.toLowerCase() || '';
                    const term = searchTerm.toLowerCase();
                    return label.includes(term) || description.includes(term);
                  }}
                />
              )}

              {/* Unidade Escolar - Visualização */}
              {isViewMode && almoxarifado && almoxarifado.tipo_vinculo === 'unidade_escolar' && almoxarifado.unidade_escolar_nome && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Unidade Escolar
                  </label>
                  <div className="bg-white border border-gray-300 rounded-md px-3 py-2 text-sm text-gray-900">
                    {almoxarifado.unidade_escolar_codigo} - {almoxarifado.unidade_escolar_nome}
                  </div>
                </div>
              )}

              <Input
                label="Centro de Custo *"
                name="centro_custo_id"
                type="select"
                value={centroCustoId}
                onChange={(e) => setCentroCustoId(e.target.value)}
                disabled={isViewMode || !filialSelecionada || carregandoCentrosCusto}
                required
              >
                <option value="">
                  {!filialSelecionada 
                    ? 'Selecione primeiro uma filial' 
                    : carregandoCentrosCusto 
                      ? 'Carregando...' 
                      : 'Selecione um centro de custo'}
                </option>
                {centrosCusto.map(centroCusto => (
                  <option key={centroCusto.id} value={String(centroCusto.id)}>
                    {centroCusto.codigo} - {centroCusto.nome}
                  </option>
                ))}
              </Input>
            </div>
          </div>
        </div>

        {/* Card: Observações */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Observações
          </h3>
          <Input
            label=""
            name="observacoes"
            type="textarea"
            defaultValue={almoxarifado?.observacoes}
            disabled={isViewMode}
            rows={3}
            placeholder="Regras de uso, localização física, etc..."
          />
        </div>

        {/* Botões de ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          {!isViewMode && (
            <Button type="submit" variant="primary" size="lg">
              {almoxarifado ? 'Atualizar Almoxarifado' : 'Salvar'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default AlmoxarifadoModal;

