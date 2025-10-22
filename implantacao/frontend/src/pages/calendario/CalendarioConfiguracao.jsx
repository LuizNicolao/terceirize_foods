import React, { useState, useEffect } from 'react';
import { FaCog, FaArrowLeft, FaSave, FaPlus, FaTrash, FaCalendarCheck, FaTruck, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, Input, Modal } from '../../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

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
    removerFeriado
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link
                to="/calendario"
                className="mr-4 p-2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <FaArrowLeft className="h-5 w-5" />
              </Link>
              <FaCog className="h-8 w-8 text-green-600 mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Configuração do Calendário</h1>
                <p className="text-sm text-gray-500">Configure dias úteis, abastecimento, consumo e feriados</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
                <select
                  value={ano}
                  onChange={(e) => handleAnoChange(parseInt(e.target.value))}
                  className="block w-32 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
                >
                  {gerarAnos().map(anoOption => (
                    <option key={anoOption} value={anoOption}>{anoOption}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
    </div>
  );
};

export default CalendarioConfiguracao;
