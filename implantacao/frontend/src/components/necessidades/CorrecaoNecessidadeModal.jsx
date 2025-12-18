/**
 * Modal para correção de necessidades
 * Permite corrigir semana de consumo, semana de abastecimento e outras informações
 */

import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import MultiSelectCheckbox from 'foods-frontend/src/components/ui/MultiSelectCheckbox';
import { FaEdit, FaTimes, FaSave } from 'react-icons/fa';
import { useSemanasConsumo } from '../../hooks/useSemanasConsumo';
import { calcularSemanaAbastecimento } from '../../utils/semanasAbastecimentoUtils';
import necessidadesService from '../../services/necessidadesService';
import toast from 'react-hot-toast';

const CorrecaoNecessidadeModal = ({
  isOpen,
  onClose,
  necessidadeId,
  onSave
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingNecessidade, setLoadingNecessidade] = useState(false);
  const [necessidade, setNecessidade] = useState(null);
  const [formData, setFormData] = useState({
    semana_consumo: '',
    semana_abastecimento: '',
    grupos_selecionados: [] // Array de grupos selecionados para correção
  });
  const [corrigirTodosGrupos, setCorrigirTodosGrupos] = useState(true);
  const [anoFiltro, setAnoFiltro] = useState('');
  const [mesFiltro, setMesFiltro] = useState('');

  // Hook para semanas de consumo
  const anoParaHook = anoFiltro && anoFiltro !== '' ? Number(anoFiltro) : new Date().getFullYear();
  const mesParaHook = mesFiltro && mesFiltro !== '' ? Number(mesFiltro) : null;
  const { opcoes: opcoesSemanasConsumo } = useSemanasConsumo(anoParaHook, true, {}, mesParaHook);

  // Gerar anos
  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push({ value: i, label: i.toString() });
    }
    return anos;
  };

  // Gerar meses
  const gerarMeses = () => {
    return [
      { value: 1, label: 'Janeiro' },
      { value: 2, label: 'Fevereiro' },
      { value: 3, label: 'Março' },
      { value: 4, label: 'Abril' },
      { value: 5, label: 'Maio' },
      { value: 6, label: 'Junho' },
      { value: 7, label: 'Julho' },
      { value: 8, label: 'Agosto' },
      { value: 9, label: 'Setembro' },
      { value: 10, label: 'Outubro' },
      { value: 11, label: 'Novembro' },
      { value: 12, label: 'Dezembro' }
    ];
  };

  // Carregar necessidade quando modal abrir
  useEffect(() => {
    if (isOpen && necessidadeId) {
      carregarNecessidade();
    }
  }, [isOpen, necessidadeId]);

  // Limpar dados quando modal fechar
  useEffect(() => {
    if (!isOpen) {
      setNecessidade(null);
      setFormData({
        semana_consumo: '',
        semana_abastecimento: '',
        grupos_selecionados: []
      });
      setCorrigirTodosGrupos(true);
      setAnoFiltro('');
      setMesFiltro('');
    }
  }, [isOpen]);

  // Atualizar semana de abastecimento quando semana de consumo mudar
  useEffect(() => {
    if (formData.semana_consumo) {
      const semanaAbastecimento = calcularSemanaAbastecimento(formData.semana_consumo);
      setFormData(prev => ({
        ...prev,
        semana_abastecimento: semanaAbastecimento
      }));
    }
  }, [formData.semana_consumo]);

  const carregarNecessidade = async () => {
    setLoadingNecessidade(true);
    try {
      const response = await necessidadesService.buscarParaCorrecao(necessidadeId);
      if (response.success) {
        setNecessidade(response.data);
        const grupos = response.data.grupos || [];
        setFormData({
          semana_consumo: response.data.semana_consumo || '',
          semana_abastecimento: response.data.semana_abastecimento || '',
          grupos_selecionados: grupos.map(g => g.grupo)
        });
        // Inicialmente, todos os grupos estão selecionados (ou true se houver apenas 1 grupo)
        setCorrigirTodosGrupos(true);

        // Extrair ano da semana de consumo se possível
        if (response.data.semana_consumo) {
          const anoMatch = response.data.semana_consumo.match(/\d{2}\/(\d{2})/);
          if (anoMatch) {
            const anoAtual = new Date().getFullYear();
            const anoStr = anoAtual.toString().slice(0, 2) + anoMatch[1];
            const ano = parseInt(anoStr);
            if (!isNaN(ano)) {
              setAnoFiltro(ano);
            }
          }
        }
      } else {
        toast.error('Erro ao carregar necessidade');
      }
    } catch (error) {
      console.error('Erro ao carregar necessidade:', error);
      toast.error('Erro ao carregar necessidade');
    } finally {
      setLoadingNecessidade(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.semana_consumo) {
      toast.error('Semana de consumo é obrigatória');
      return;
    }

    // Validar seleção de grupos
    if (!corrigirTodosGrupos && (!formData.grupos_selecionados || formData.grupos_selecionados.length === 0)) {
      toast.error('Selecione ao menos um grupo para corrigir');
      return;
    }

    setLoading(true);
    try {
      const response = await necessidadesService.corrigir(necessidadeId, {
        semana_consumo: formData.semana_consumo,
        semana_abastecimento: formData.semana_abastecimento,
        grupos_selecionados: corrigirTodosGrupos ? null : formData.grupos_selecionados
      });

      if (response.success) {
        toast.success('Necessidade corrigida com sucesso!');
        if (onSave) {
          onSave();
        }
        onClose();
      } else {
        toast.error(response.message || 'Erro ao corrigir necessidade');
      }
    } catch (error) {
      console.error('Erro ao corrigir necessidade:', error);
      toast.error('Erro ao corrigir necessidade');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Corrigir Necessidade" size="lg">
      {loadingNecessidade ? (
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
          <span className="text-gray-600">Carregando necessidade...</span>
        </div>
      ) : necessidade ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Informações atuais (somente leitura) */}
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Informações Atuais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-700">ID da Necessidade:</span>
                <p className="text-gray-900 mt-1">{necessidade.necessidade_id}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Escola:</span>
                <p className="text-gray-900 mt-1">{necessidade.escola}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Grupos:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {necessidade.grupos && necessidade.grupos.length > 0 ? (
                    necessidade.grupos.map((grupo, idx) => (
                      <span key={idx} className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                        {grupo.grupo}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">-</span>
                  )}
                </div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Total de Produtos:</span>
                <p className="text-gray-900 mt-1">{necessidade.total_produtos || (necessidade.produtos?.length || 0)}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Semana de Consumo (Atual):</span>
                <p className="text-gray-900 mt-1">{necessidade.semana_consumo || '-'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-700">Semana de Abastecimento (Atual):</span>
                <p className="text-gray-900 mt-1">{necessidade.semana_abastecimento || '-'}</p>
              </div>
            </div>
          </div>

          {/* Campos para correção */}
          <div className="bg-blue-50 rounded-lg p-4 space-y-4 border border-blue-200">
            <h3 className="text-lg font-semibold text-blue-900 mb-3">Dados para Correção</h3>

            {/* Filtros de Ano e Mês */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <SearchableSelect
                  label="Ano"
                  value={anoFiltro}
                  onChange={(value) => {
                    setAnoFiltro(value);
                    setFormData(prev => ({ ...prev, semana_consumo: '' }));
                  }}
                  options={gerarAnos()}
                  placeholder="Selecione o ano..."
                  disabled={loading}
                  usePortal={false}
                />
              </div>
              
              <div>
                <SearchableSelect
                  label="Mês (Opcional)"
                  value={mesFiltro}
                  onChange={(value) => {
                    setMesFiltro(value || '');
                    setFormData(prev => ({ ...prev, semana_consumo: '' }));
                  }}
                  options={[
                    { value: '', label: 'Todos os meses' },
                    ...gerarMeses()
                  ]}
                  placeholder="Selecione o mês..."
                  disabled={loading}
                  usePortal={false}
                />
              </div>
            </div>

            {/* Semana de Consumo */}
            <div>
              <SearchableSelect
                label="Nova Semana de Consumo"
                value={formData.semana_consumo}
                onChange={(value) => setFormData(prev => ({ ...prev, semana_consumo: value }))}
                options={opcoesSemanasConsumo || []}
                placeholder="Selecione a nova semana de consumo..."
                disabled={loading || !anoFiltro}
                required
                usePortal={false}
              />
            </div>

            {/* Semana de Abastecimento (calculada automaticamente) */}
            <div>
              <Input
                label="Nova Semana de Abastecimento"
                type="text"
                value={formData.semana_abastecimento}
                disabled
                className="bg-gray-100"
                readOnly
              />
              <p className="mt-1 text-xs text-gray-500">
                Calculada automaticamente baseada na semana de consumo selecionada
              </p>
            </div>

            {/* Seleção de Grupos - só mostrar se houver mais de um grupo */}
            {necessidade.grupos && necessidade.grupos.length > 1 && (
              <div>
                <div className="mb-3">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={corrigirTodosGrupos}
                      onChange={(e) => {
                        setCorrigirTodosGrupos(e.target.checked);
                        if (e.target.checked) {
                          // Selecionar todos os grupos
                          setFormData(prev => ({
                            ...prev,
                            grupos_selecionados: necessidade.grupos.map(g => g.grupo)
                          }));
                        }
                      }}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      disabled={loading}
                    />
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      Corrigir todos os grupos
                    </span>
                  </label>
                </div>

                {!corrigirTodosGrupos && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Selecione os grupos para corrigir <span className="text-red-500">*</span>
                    </label>
                    <MultiSelectCheckbox
                      options={necessidade.grupos.map(g => ({
                        value: g.grupo,
                        label: g.grupo
                      }))}
                      value={formData.grupos_selecionados || []}
                      onChange={(selected) => {
                        setFormData(prev => ({
                          ...prev,
                          grupos_selecionados: selected
                        }));
                      }}
                      placeholder="Selecione os grupos..."
                    />
                    <p className="mt-1 text-xs text-gray-500">
                      Selecione quais grupos devem ser corrigidos.
                    </p>
                  </div>
                )}

                {corrigirTodosGrupos && necessidade.grupos.length > 0 && (
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-800">
                      Todos os {necessidade.grupos.length} grupos serão corrigidos: {necessidade.grupos.map(g => g.grupo).join(', ')}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Se houver apenas um grupo, mostrar informação */}
            {necessidade.grupos && necessidade.grupos.length === 1 && (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-md">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">Grupo:</span> {necessidade.grupos[0].grupo}
                </p>
              </div>
            )}

          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              disabled={loading}
            >
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading || !formData.semana_consumo}
              loading={loading}
            >
              <FaSave className="mr-2" />
              Salvar Correção
            </Button>
          </div>
        </form>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <p>Nenhuma necessidade selecionada</p>
        </div>
      )}
    </Modal>
  );
};

export default CorrecaoNecessidadeModal;
