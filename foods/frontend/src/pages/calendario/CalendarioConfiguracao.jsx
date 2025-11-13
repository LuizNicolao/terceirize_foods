import React, { useState, useEffect } from 'react';
import { FaCog, FaArrowLeft, FaSave, FaPlus, FaTrash, FaCalendarCheck, FaTruck, FaShoppingCart, FaExclamationTriangle, FaCalendarTimes } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, Input, Modal, SearchableSelect } from '../../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import FiliaisService from '../../services/filiais';
import UnidadesEscolaresService from '../../services/unidadesEscolares';

const CalendarioConfiguracao = () => {
  const { user } = usePermissions();
  const {
    loading,
    configuracao,
    carregarConfiguracao,
    configurarDiasUteis,
    configurarDiasAbastecimento,
    configurarDiasConsumo,
    adicionarFeriado,
    removerFeriado,
    diasNaoUteis,
    adicionarDiaNaoUtil,
    removerDiaNaoUtil
  } = useCalendario();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [diasUteis, setDiasUteis] = useState([]);
  const [diasAbastecimento, setDiasAbastecimento] = useState([]);
  const [diasConsumo, setDiasConsumo] = useState([]);
  const [modalFeriado, setModalFeriado] = useState(false);
  const [formFeriado, setFormFeriado] = useState({
    data: '',
    nome_feriado: '',
    observacoes: ''
  });
  const [modalDiaNaoUtil, setModalDiaNaoUtil] = useState(false);
  const [formDiaNaoUtil, setFormDiaNaoUtil] = useState({
    data: '',
    descricao: '',
    tipo_destino: 'global',
    filial_id: '',
    unidades_escola_ids: [],
    observacoes: ''
  });
  const [filiais, setFiliais] = useState([]);
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loadingListas, setLoadingListas] = useState(false);

  const opcoesDiasSemana = [
    { value: 1, label: 'Segunda-feira' },
    { value: 2, label: 'Terça-feira' },
    { value: 3, label: 'Quarta-feira' },
    { value: 4, label: 'Quinta-feira' },
    { value: 5, label: 'Sexta-feira' },
    { value: 6, label: 'Sábado' },
    { value: 7, label: 'Domingo' }
  ];

  useEffect(() => {
    carregarConfiguracao(ano);
  }, [ano, carregarConfiguracao]);

  useEffect(() => {
    if (configuracao) {
      setDiasUteis(configuracao.dias_uteis?.map(d => d.dia_semana_numero) || []);
      setDiasAbastecimento(configuracao.dias_abastecimento?.map(d => d.dia_semana_numero) || []);
      setDiasConsumo(configuracao.dias_consumo?.map(d => d.dia_semana_numero) || []);
    }
  }, [configuracao]);

  useEffect(() => {
    const carregarListasAuxiliares = async () => {
      try {
        setLoadingListas(true);
        const [filiaisResult, unidadesResult] = await Promise.all([
          FiliaisService.buscarAtivas(),
          UnidadesEscolaresService.buscarAtivas()
        ]);

        if (filiaisResult.success) {
          setFiliais(filiaisResult.data || []);
        }

        if (unidadesResult.success) {
          setUnidadesEscolares(unidadesResult.data || []);
        }
      } catch (error) {
        console.error('Erro ao carregar listas auxiliares do calendário:', error);
      } finally {
        setLoadingListas(false);
      }
    };

    carregarListasAuxiliares();
  }, []);

  const handleAnoChange = (novoAno) => {
    setAno(novoAno);
  };

  const handleDiaToggle = (tipo, diaNumero) => {
    switch (tipo) {
      case 'util':
        setDiasUteis(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
      case 'abastecimento':
        setDiasAbastecimento(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
      case 'consumo':
        setDiasConsumo(prev => 
          prev.includes(diaNumero) 
            ? prev.filter(d => d !== diaNumero)
            : [...prev, diaNumero]
        );
        break;
    }
  };

  const handleSalvarDiasUteis = async () => {
    const sucesso = await configurarDiasUteis(ano, diasUteis);
    if (sucesso) {
      toast.success('Dias úteis salvos com sucesso!');
    }
  };

  const handleSalvarDiasAbastecimento = async () => {
    const sucesso = await configurarDiasAbastecimento(ano, diasAbastecimento);
    if (sucesso) {
      toast.success('Dias de abastecimento salvos com sucesso!');
    }
  };

  const handleSalvarDiasConsumo = async () => {
    const sucesso = await configurarDiasConsumo(ano, diasConsumo);
    if (sucesso) {
      toast.success('Dias de consumo salvos com sucesso!');
    }
  };

  const handleAdicionarFeriado = () => {
    setFormFeriado({
      data: '',
      nome_feriado: '',
      observacoes: ''
    });
    setModalFeriado(true);
  };

  const handleSalvarFeriado = async () => {
    if (!formFeriado.data || !formFeriado.nome_feriado) {
      toast.error('Data e nome do feriado são obrigatórios');
      return;
    }

    const sucesso = await adicionarFeriado(formFeriado);
    if (sucesso) {
      setModalFeriado(false);
      setFormFeriado({
        data: '',
        nome_feriado: '',
        observacoes: ''
      });
    }
  };

  const handleRemoverFeriado = async (data) => {
    if (window.confirm('Tem certeza que deseja remover este feriado?')) {
      const sucesso = await removerFeriado(data);
      if (sucesso) {
        toast.success('Feriado removido com sucesso!');
      }
    }
  };

  const handleAdicionarDiaNaoUtil = () => {
    setFormDiaNaoUtil({
      data: '',
      descricao: '',
      tipo_destino: 'global',
      filial_id: '',
      unidades_escola_ids: [],
      observacoes: ''
    });
    setModalDiaNaoUtil(true);
  };

  const handleTipoDestinoChange = (valor) => {
    setFormDiaNaoUtil((prev) => ({
      ...prev,
      tipo_destino: valor,
      filial_id: valor === 'filial' ? prev.filial_id : '',
      unidades_escola_ids: valor === 'unidade' ? prev.unidades_escola_ids : []
    }));
  };

  const handleSalvarDiaNaoUtil = async () => {
    if (!formDiaNaoUtil.data || !formDiaNaoUtil.descricao) {
      toast.error('Data e descrição são obrigatórias');
      return;
    }

    if (formDiaNaoUtil.tipo_destino === 'filial' && !formDiaNaoUtil.filial_id) {
      toast.error('Selecione a filial vinculada ao dia não útil');
      return;
    }

    if (formDiaNaoUtil.tipo_destino === 'unidade') {
      const unidadesSelecionadas = formDiaNaoUtil.unidades_escola_ids || [];
      if (!formDiaNaoUtil.filial_id) {
        toast.error('Selecione a filial para listar as unidades');
        return;
      }

      if (unidadesSelecionadas.length === 0) {
        toast.error('Selecione pelo menos uma unidade escolar');
        return;
      }

      let sucessoGlobal = true;
      for (const unidadeId of unidadesSelecionadas) {
        const payloadUnidade = {
          data: formDiaNaoUtil.data,
          descricao: formDiaNaoUtil.descricao,
          observacoes: formDiaNaoUtil.observacoes || null,
          tipo_destino: 'unidade',
          filial_id: null,
          unidade_escolar_id: parseInt(unidadeId, 10)
        };

        const sucesso = await adicionarDiaNaoUtil(payloadUnidade);
        if (!sucesso) {
          sucessoGlobal = false;
        }
      }

      if (sucessoGlobal) {
        toast.success('Dia não útil configurado para as unidades selecionadas');
        setModalDiaNaoUtil(false);
      }
      return;
    }

    const payload = {
      data: formDiaNaoUtil.data,
      descricao: formDiaNaoUtil.descricao,
      observacoes: formDiaNaoUtil.observacoes || null,
      tipo_destino: formDiaNaoUtil.tipo_destino,
      filial_id: formDiaNaoUtil.tipo_destino === 'filial' ? parseInt(formDiaNaoUtil.filial_id, 10) : null,
      unidade_escolar_id: null
    };

    const sucesso = await adicionarDiaNaoUtil(payload);
    if (sucesso) {
      setModalDiaNaoUtil(false);
    }
  };

  const handleRemoverDiaNaoUtil = async (dia) => {
    if (!dia || !dia.id) return;
    if (window.confirm('Tem certeza que deseja remover este dia não útil?')) {
      await removerDiaNaoUtil(dia.id, dia.data);
    }
  };

  const handleFilialChangeDiaNaoUtil = (valor) => {
    setFormDiaNaoUtil((prev) => ({
      ...prev,
      filial_id: valor,
      unidades_escola_ids: []
    }));
  };

  const handleToggleUnidadeSelecionada = (unidadeId) => {
    setFormDiaNaoUtil((prev) => {
      const idNumber = parseInt(unidadeId, 10);
      const atual = new Set(prev.unidades_escola_ids || []);
      if (atual.has(idNumber)) {
        atual.delete(idNumber);
      } else {
        atual.add(idNumber);
      }
      return {
        ...prev,
        unidades_escola_ids: Array.from(atual)
      };
    });
  };


  const filiaisOptions = (filiais || [])
    .map((filial) => {
      const label = filial.filial || filial.razao_social || `Filial ${filial.id}`;
      const description = filial.cidade
        ? `${filial.cidade}${filial.estado ? ` - ${filial.estado}` : ''}`
        : undefined;

      return {
        value: filial.id,
        label,
        description,
        searchableText: `${label} ${filial.codigo_filial || ''} ${filial.cnpj || ''}`.trim()
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  const diasNaoUteisConfigurados = diasNaoUteis || [];

  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push(i);
    }
    return anos;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center">
          <Link
            to="/foods/calendario"
            className="mr-3 p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <FaArrowLeft className="h-5 w-5" />
          </Link>
          <FaCog className="h-6 w-6 text-green-600 mr-3" />
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Configuração do Calendário</h1>
            <p className="text-sm text-gray-600">Configure dias úteis, abastecimento, consumo e feriados</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
            <select
              value={ano}
              onChange={(e) => handleAnoChange(parseInt(e.target.value))}
              className="block w-24 px-2 py-1 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
            >
              {gerarAnos().map(anoOption => (
                <option key={anoOption} value={anoOption}>{anoOption}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Dias Úteis */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaCalendarCheck className="h-5 w-5 text-green-600 mr-2" />
                Dias Úteis
              </h3>
              <Button
                onClick={handleSalvarDiasUteis}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                <FaSave className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
            
            <div className="space-y-2">
              {opcoesDiasSemana.map((dia) => (
                <label key={dia.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diasUteis.includes(dia.value)}
                    onChange={() => handleDiaToggle('util', dia.value)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dias de Abastecimento */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaTruck className="h-5 w-5 text-yellow-600 mr-2" />
                Dias de Abastecimento
              </h3>
              <Button
                onClick={handleSalvarDiasAbastecimento}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                <FaSave className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
            
            <div className="space-y-2">
              {opcoesDiasSemana.map((dia) => (
                <label key={dia.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diasAbastecimento.includes(dia.value)}
                    onChange={() => handleDiaToggle('abastecimento', dia.value)}
                    className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dias de Consumo */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaShoppingCart className="h-5 w-5 text-purple-600 mr-2" />
                Dias de Consumo
              </h3>
              <Button
                onClick={handleSalvarDiasConsumo}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                <FaSave className="h-4 w-4 mr-2" />
                Salvar
              </Button>
            </div>
            
            <div className="space-y-2">
              {opcoesDiasSemana.map((dia) => (
                <label key={dia.value} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={diasConsumo.includes(dia.value)}
                    onChange={() => handleDiaToggle('consumo', dia.value)}
                    className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                  />
                  <span className="ml-2 text-sm text-gray-700">{dia.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Feriados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaExclamationTriangle className="h-5 w-5 text-red-600 mr-2" />
                Feriados
              </h3>
              <Button
                onClick={handleAdicionarFeriado}
                variant="primary"
                size="sm"
                disabled={loading}
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>
            
            <div className="space-y-2">
              {configuracao?.feriados?.length > 0 ? (
                configuracao.feriados.map((feriado) => (
                  <div key={feriado.data} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-900">{feriado.nome_feriado}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(feriado.data).toLocaleDateString('pt-BR')}
                      </div>
                      {feriado.observacoes && (
                        <div className="text-xs text-gray-600 mt-1">{feriado.observacoes}</div>
                      )}
                    </div>
                    <Button
                      onClick={() => handleRemoverFeriado(feriado.data)}
                      variant="outline"
                      size="sm"
                      disabled={loading}
                    >
                      <FaTrash className="h-4 w-4" />
                    </Button>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum feriado configurado para {ano}
                </div>
              )}
            </div>
          </div>

          {/* Dias não úteis personalizados */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <FaCalendarTimes className="h-5 w-5 text-amber-600 mr-2" />
                Dias Não Úteis Personalizados
              </h3>
              <Button
                onClick={handleAdicionarDiaNaoUtil}
                variant="primary"
                size="sm"
                disabled={loadingListas || loading}
              >
                <FaPlus className="h-4 w-4 mr-2" />
                Adicionar
              </Button>
            </div>

            <div className="space-y-2">
              {diasNaoUteisConfigurados.length > 0 ? (
                diasNaoUteisConfigurados.map((dia) => {
                  const dataFormatada = dia.data
                    ? new Date(`${dia.data}T00:00:00`).toLocaleDateString('pt-BR')
                    : '';
                  let destinoDescricao = 'Global';
                  if (dia.tipo_destino === 'filial') {
                    destinoDescricao = `Filial: ${dia.filial_nome || dia.filial_id}`;
                    if (dia.filial_cidade) {
                      destinoDescricao += ` (${dia.filial_cidade})`;
                    }
                  } else if (dia.tipo_destino === 'unidade') {
                    destinoDescricao = `Unidade: ${dia.unidade_nome || dia.unidade_escolar_id}`;
                    if (dia.unidade_cidade) {
                      destinoDescricao += ` (${dia.unidade_cidade})`;
                    }
                  }

                  return (
                    <div key={dia.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div>
                        <div className="font-medium text-gray-900">{dia.descricao}</div>
                        <div className="text-sm text-gray-500">{dataFormatada}</div>
                        <div className="text-xs text-amber-700 mt-1">{destinoDescricao}</div>
                        {dia.observacoes && (
                          <div className="text-xs text-gray-600 mt-1">{dia.observacoes}</div>
                        )}
                      </div>
                      <Button
                        onClick={() => handleRemoverDiaNaoUtil(dia)}
                        variant="outline"
                        size="sm"
                        disabled={loading}
                      >
                        <FaTrash className="h-4 w-4" />
                      </Button>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-gray-500">
                  Nenhum dia não útil personalizado configurado para {ano}
                </div>
              )}
            </div>
          </div>
        </div>

      {/* Modal de Feriado */}
      <Modal
        isOpen={modalFeriado}
        onClose={() => setModalFeriado(false)}
        title="Adicionar Feriado"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Data"
            type="date"
            value={formFeriado.data}
            onChange={(e) => setFormFeriado(prev => ({ ...prev, data: e.target.value }))}
            required
          />
          
          <Input
            label="Nome do Feriado"
            value={formFeriado.nome_feriado}
            onChange={(e) => setFormFeriado(prev => ({ ...prev, nome_feriado: e.target.value }))}
            placeholder="Ex: Natal, Ano Novo..."
            required
          />
          
          <Input
            label="Observações"
            value={formFeriado.observacoes}
            onChange={(e) => setFormFeriado(prev => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais..."
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setModalFeriado(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarFeriado}
              variant="primary"
              disabled={loading}
            >
              <FaSave className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Dia Não Útil */}
      <Modal
        isOpen={modalDiaNaoUtil}
        onClose={() => setModalDiaNaoUtil(false)}
        title="Adicionar Dia Não Útil Personalizado"
        size="xl"
      >
        <div className="space-y-4">
          <Input
            label="Data"
            type="date"
            value={formDiaNaoUtil.data}
            onChange={(e) => setFormDiaNaoUtil((prev) => ({ ...prev, data: e.target.value }))}
            required
          />

          <Input
            label="Descrição"
            value={formDiaNaoUtil.descricao}
            onChange={(e) => setFormDiaNaoUtil((prev) => ({ ...prev, descricao: e.target.value }))}
            placeholder="Ex: Recesso municipal, Atividade interna..."
            required
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Aplicar para</label>
            <select
              value={formDiaNaoUtil.tipo_destino}
              onChange={(e) => handleTipoDestinoChange(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="global">Todos (Global)</option>
              <option value="filial">Filial / Cidade</option>
              <option value="unidade">Unidade Escolar</option>
            </select>
          </div>

          {formDiaNaoUtil.tipo_destino === 'filial' && (
            <SearchableSelect
              label="Filial"
              value={formDiaNaoUtil.filial_id}
              onChange={handleFilialChangeDiaNaoUtil}
              options={filiaisOptions}
              placeholder="Selecione uma filial..."
              loading={loadingListas}
            />
          )}

          {formDiaNaoUtil.tipo_destino === 'unidade' && (
            <div className="space-y-4">
              <SearchableSelect
                label="Filtrar por Filial"
                value={formDiaNaoUtil.filial_id}
                onChange={handleFilialChangeDiaNaoUtil}
                options={filiaisOptions}
                placeholder="Selecione a filial responsável..."
                loading={loadingListas}
              />

              <div className="border border-gray-200 rounded-lg p-4 max-h-64 overflow-y-auto bg-gray-50">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">
                  Unidades Escolares {formDiaNaoUtil.filial_id ? 'da filial selecionada' : '(selecione uma filial)'}
                </h4>

                {formDiaNaoUtil.filial_id ? (
                  (() => {
                    const unidadesFiltradas = unidadesEscolares.filter(
                      (unidade) => String(unidade.filial_id) === String(formDiaNaoUtil.filial_id)
                    );

                    if (unidadesFiltradas.length === 0) {
                      return (
                        <div className="text-sm text-gray-500">
                          Nenhuma unidade escolar encontrada para esta filial.
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {unidadesFiltradas.map((unidade) => (
                          <label
                            key={unidade.id}
                            className="flex items-start space-x-2 bg-white rounded-lg border border-gray-200 px-3 py-2 hover:border-green-400 transition-colors"
                          >
                            <input
                              type="checkbox"
                              className="mt-1 h-4 w-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                              checked={formDiaNaoUtil.unidades_escola_ids?.includes(unidade.id) || false}
                              onChange={() => handleToggleUnidadeSelecionada(unidade.id)}
                            />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{unidade.nome_escola}</div>
                              {unidade.cidade && (
                                <div className="text-xs text-gray-500">
                                  {unidade.cidade}
                                  {unidade.estado ? ` - ${unidade.estado}` : ''}
                                </div>
                              )}
                            </div>
                          </label>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  <div className="text-sm text-gray-500">
                    Selecione uma filial para listar as unidades disponíveis.
                  </div>
                )}
              </div>
            </div>
          )}

          <Input
            label="Observações"
            value={formDiaNaoUtil.observacoes}
            onChange={(e) => setFormDiaNaoUtil((prev) => ({ ...prev, observacoes: e.target.value }))}
            placeholder="Observações adicionais..."
          />

          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => setModalDiaNaoUtil(false)}
              variant="outline"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleSalvarDiaNaoUtil}
              variant="primary"
              disabled={loading}
            >
              <FaSave className="h-4 w-4 mr-2" />
              Salvar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CalendarioConfiguracao;
