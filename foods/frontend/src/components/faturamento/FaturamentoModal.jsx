import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, SearchableSelect } from '../ui';
import { FaSave, FaTimes, FaSchool, FaCalendarAlt } from 'react-icons/fa';
import FaturamentoService from '../../services/faturamento';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import toast from 'react-hot-toast';

const FaturamentoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  faturamento,
  isViewMode = false
}) => {
  const [formData, setFormData] = useState({
    unidade_escolar_id: '',
    mes: new Date().getMonth() + 1,
    ano: new Date().getFullYear(),
    observacoes: '',
    dados_faturamento: []
  });

  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  // Carregar unidades escolares
  useEffect(() => {
    if (isOpen) {
      loadUnidadesEscolares();
    }
  }, [isOpen]);

  // Carregar dados do faturamento para edição
  useEffect(() => {
    if (isOpen && faturamento) {
      setFormData({
        unidade_escolar_id: faturamento.unidade_escolar_id || '',
        mes: faturamento.mes || new Date().getMonth() + 1,
        ano: faturamento.ano || new Date().getFullYear(),
        observacoes: faturamento.observacoes || '',
        dados_faturamento: faturamento.dados_faturamento || []
      });
    } else if (isOpen && !faturamento) {
      // Resetar formulário para novo faturamento
      setFormData({
        unidade_escolar_id: '',
        mes: new Date().getMonth() + 1,
        ano: new Date().getFullYear(),
        observacoes: '',
        dados_faturamento: []
      });
    }
  }, [isOpen, faturamento]);

  // Gerar dados de faturamento quando mês/ano mudarem
  useEffect(() => {
    if (formData.mes && formData.ano) {
      generateDadosFaturamento();
    }
  }, [formData.mes, formData.ano]);

  // Gerar dados iniciais quando modal abrir (para novos faturamentos)
  useEffect(() => {
    if (isOpen && !faturamento && formData.mes && formData.ano) {
      generateDadosFaturamento();
    }
  }, [isOpen, faturamento]);

  // Gerar dados quando modal abrir para edição (mesmo sem unidade escolar)
  useEffect(() => {
    if (isOpen && faturamento && formData.mes && formData.ano && formData.dados_faturamento.length === 0) {
      generateDadosFaturamento();
    }
  }, [isOpen, faturamento, formData.mes, formData.ano]);

  const loadUnidadesEscolares = async () => {
    setLoading(true);
    try {
      // O backend já filtra automaticamente as unidades escolares baseado no usuário logado
      // Para nutricionistas, só retorna as escolas das rotas nutricionistas
      const result = await UnidadesEscolaresService.listar();
      if (result.success) {
        setUnidadesEscolares(result.data || []);
      } else {
        toast.error(result.error || 'Erro ao carregar unidades escolares');
      }
    } catch (error) {
      console.error('Erro ao carregar unidades escolares:', error);
      toast.error('Erro ao carregar unidades escolares');
    } finally {
      setLoading(false);
    }
  };

  const generateDadosFaturamento = () => {
    const daysInMonth = new Date(formData.ano, formData.mes, 0).getDate();
    const dados = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      // Se estamos editando, tentar preservar dados existentes
      const existingDay = formData.dados_faturamento?.find(d => d.dia === day);
      
      dados.push({
        dia: day,
        desjejum: existingDay?.desjejum || 0,
        lanche_matutino: existingDay?.lanche_matutino || 0,
        almoco: existingDay?.almoco || 0,
        lanche_vespertino: existingDay?.lanche_vespertino || 0,
        noturno: existingDay?.noturno || 0
      });
    }
    
    setFormData(prev => ({
      ...prev,
      dados_faturamento: dados
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Limpar erro do campo
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleDadosChange = (dia, periodo, value) => {
    setFormData(prev => ({
      ...prev,
      dados_faturamento: prev.dados_faturamento.map(d => 
        d.dia === dia ? { ...d, [periodo]: parseInt(value) || 0 } : d
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Erro ao salvar faturamento:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setFieldErrors({});
    onClose();
  };

  const getFieldError = (field) => {
    return fieldErrors[field];
  };

  const getMonthName = (month) => {
    const months = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    return months[month - 1] || '';
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? "Visualizar Faturamento" : faturamento ? "Editar Faturamento" : "Novo Faturamento"}
      size="full"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Cabeçalho com informações básicas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaSchool className="text-green-600" />
                Unidade Escolar *
              </label>
              <SearchableSelect
                value={formData.unidade_escolar_id}
                onChange={(value) => handleInputChange('unidade_escolar_id', value)}
                options={unidadesEscolares.map(unidade => ({
                  value: unidade.id,
                  label: `${unidade.nome_escola} - ${unidade.codigo_teknisa}`
                }))}
                placeholder="Selecione uma unidade escolar"
                disabled={isViewMode || loading || !!faturamento}
                error={getFieldError('unidade_escolar_id')}
              />
              {unidadesEscolares.length > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Mostrando apenas as escolas das suas rotas nutricionistas
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Mês *
              </label>
              <SearchableSelect
                value={formData.mes}
                onChange={(value) => handleInputChange('mes', parseInt(value))}
                options={Array.from({ length: 12 }, (_, i) => ({
                  value: i + 1,
                  label: getMonthName(i + 1)
                }))}
                placeholder="Selecione o mês"
                disabled={isViewMode}
                error={getFieldError('mes')}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                <FaCalendarAlt className="text-green-600" />
                Ano *
              </label>
              <Input
                type="number"
                value={formData.ano}
                onChange={(e) => handleInputChange('ano', parseInt(e.target.value))}
                disabled={isViewMode}
                min="2020"
                max="2030"
                error={getFieldError('ano')}
              />
            </div>
          </div>
        </div>

        {/* Tabela de Faturamento - Interface Enxuta */}
        {formData.mes && formData.ano && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-900">
                Refeições Servidas - {getMonthName(formData.mes)}/{formData.ano}
              </h3>
              <div className="text-sm text-gray-500">
                Preencha a quantidade de refeições servidas por dia
              </div>
            </div>
            
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead className="bg-green-50">
                    <tr>
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Dia
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Desjejum
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Lanche Matutino
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Almoço
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r border-gray-200">
                        Lanche Vespertino
                      </th>
                      <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Noturno
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.dados_faturamento.length > 0 ? (
                      formData.dados_faturamento.map((dia) => (
                        <tr key={dia.dia} className="hover:bg-gray-50">
                          <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900 border-r border-gray-200 bg-gray-50">
                            {dia.dia}
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                            <Input
                              type="number"
                              value={dia.desjejum}
                              onChange={(e) => handleDadosChange(dia.dia, 'desjejum', e.target.value)}
                              disabled={isViewMode}
                              min="0"
                              className="w-16 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                            <Input
                              type="number"
                              value={dia.lanche_matutino}
                              onChange={(e) => handleDadosChange(dia.dia, 'lanche_matutino', e.target.value)}
                              disabled={isViewMode}
                              min="0"
                              className="w-16 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                            <Input
                              type="number"
                              value={dia.almoco}
                              onChange={(e) => handleDadosChange(dia.dia, 'almoco', e.target.value)}
                              disabled={isViewMode}
                              min="0"
                              className="w-16 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap border-r border-gray-200">
                            <Input
                              type="number"
                              value={dia.lanche_vespertino}
                              onChange={(e) => handleDadosChange(dia.dia, 'lanche_vespertino', e.target.value)}
                              disabled={isViewMode}
                              min="0"
                              className="w-16 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                          <td className="px-2 py-2 whitespace-nowrap">
                            <Input
                              type="number"
                              value={dia.noturno}
                              onChange={(e) => handleDadosChange(dia.dia, 'noturno', e.target.value)}
                              disabled={isViewMode}
                              min="0"
                              className="w-16 text-center text-sm"
                              placeholder="0"
                            />
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="6" className="px-4 py-8 text-center text-gray-500">
                          <div className="flex flex-col items-center gap-2">
                            <div className="text-sm">Selecione uma unidade escolar para gerar a tabela de refeições</div>
                            <div className="text-xs text-gray-400">A tabela será preenchida automaticamente com os dias do mês selecionado</div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Observações (opcional) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações (opcional)
          </label>
          <Input
            type="textarea"
            value={formData.observacoes}
            onChange={(e) => handleInputChange('observacoes', e.target.value)}
            disabled={isViewMode}
            rows={2}
            placeholder="Observações sobre o faturamento..."
            className="text-sm"
          />
        </div>

        {/* Botões */}
        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
            disabled={saving}
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          {!isViewMode && (
            <Button
              type="submit"
              disabled={saving || loading}
              className="flex items-center gap-2"
            >
              <FaSave className="text-sm" />
              {saving ? 'Salvando...' : (faturamento ? 'Atualizar' : 'Salvar')}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default FaturamentoModal;