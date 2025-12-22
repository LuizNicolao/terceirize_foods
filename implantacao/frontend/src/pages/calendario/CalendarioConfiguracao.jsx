import React, { useState, useEffect, useCallback } from 'react';
import { FaCog, FaArrowLeft, FaSave, FaPlus, FaTrash, FaCalendarCheck, FaTruck, FaShoppingCart, FaExclamationTriangle } from 'react-icons/fa';
import { useCalendario } from '../../hooks/useCalendario';
import { usePermissions } from '../../contexts/PermissionsContext';
import { Button, Input, Modal, ConfirmModal } from '../../components/ui';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import useUnsavedChangesPrompt from '../../hooks/useUnsavedChangesPrompt';

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
    recalcularSemanasConsumo
  } = useCalendario();

  const [ano, setAno] = useState(new Date().getFullYear());
  const [diasUteis, setDiasUteis] = useState([]);
  const [diasAbastecimento, setDiasAbastecimento] = useState([]);
  const [diasConsumo, setDiasConsumo] = useState([]);
  const [modalFeriado, setModalFeriado] = useState(false);
  const [showConfirmRecalcular, setShowConfirmRecalcular] = useState(false);
  const [formFeriado, setFormFeriado] = useState({
    data: '',
    nome_feriado: '',
    observacoes: ''
  });
const {
  markDirty,
  resetDirty,
  requestClose,
  showConfirm,
  confirmClose,
  cancelClose,
  confirmTitle,
  confirmMessage
} = useUnsavedChangesPrompt({
  confirmMessage: 'Ao sair, o feriado em edição será descartado. Deseja continuar?'
});

useEffect(() => {
  if (!modalFeriado) {
    resetDirty();
  }
}, [modalFeriado, resetDirty]);

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

  const handleRecalcularSemanasConsumo = () => {
    setShowConfirmRecalcular(true);
  };

  const confirmRecalcularSemanasConsumo = async () => {
    setShowConfirmRecalcular(false);
    const sucesso = await recalcularSemanasConsumo(ano);
    if (sucesso) {
      // Sucesso já é mostrado no hook
    }
  };

const handleChangeFeriado = (field, value) => {
  setFormFeriado(prev => ({ ...prev, [field]: value }));
  markDirty();
};

const handleAdicionarFeriado = () => {
    setFormFeriado({
      data: '',
      nome_feriado: '',
      observacoes: ''
    });
    setModalFeriado(true);
  resetDirty();
  };

const closeModalFeriado = useCallback(() => {
  setModalFeriado(false);
  setFormFeriado({
    data: '',
    nome_feriado: '',
    observacoes: ''
  });
  resetDirty();
}, [resetDirty]);

  const handleSalvarFeriado = async () => {
    if (!formFeriado.data || !formFeriado.nome_feriado) {
      toast.error('Data e nome do feriado são obrigatórios');
      return;
    }

    const sucesso = await adicionarFeriado(formFeriado);
    if (sucesso) {
    closeModalFeriado();
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
    <div className="p-3 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 sm:mb-6 gap-3 sm:gap-4">
        <div className="flex items-center">
          <Link
            to="/calendario"
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
              <div className="flex gap-2">
                <Button
                  onClick={handleSalvarDiasConsumo}
                  variant="primary"
                  size="sm"
                  disabled={loading}
                >
                  <FaSave className="h-4 w-4 mr-2" />
                  Salvar
                </Button>
                <Button
                  onClick={handleRecalcularSemanasConsumo}
                  variant="secondary"
                  size="sm"
                  disabled={loading}
                  title="Recalcular semanas de consumo baseado nos dias ativos"
                >
                  <FaCalendarCheck className="h-4 w-4 mr-2" />
                  Recalcular Semanas
                </Button>
              </div>
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

      {/* Modal de Feriado */}
      <Modal
        isOpen={modalFeriado}
        onClose={() => requestClose(closeModalFeriado)}
        title="Adicionar Feriado"
        size="md"
      >
        <div className="space-y-4">
          <Input
            label="Data"
            type="date"
            value={formFeriado.data}
            onChange={(e) => handleChangeFeriado('data', e.target.value)}
            required
          />
          
          <Input
            label="Nome do Feriado"
            value={formFeriado.nome_feriado}
            onChange={(e) => handleChangeFeriado('nome_feriado', e.target.value)}
            placeholder="Ex: Natal, Ano Novo..."
            required
          />
          
          <Input
            label="Observações"
            value={formFeriado.observacoes}
            onChange={(e) => handleChangeFeriado('observacoes', e.target.value)}
            placeholder="Observações adicionais..."
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              onClick={() => requestClose(closeModalFeriado)}
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
      <ConfirmModal
        isOpen={showConfirm}
        onClose={cancelClose}
        onConfirm={confirmClose}
        title={confirmTitle}
        message={confirmMessage}
        confirmText="Descartar"
        cancelText="Continuar editando"
        variant="danger"
      />

      {/* Modal de Confirmação para Recalcular Semanas de Consumo */}
      <ConfirmModal
        isOpen={showConfirmRecalcular}
        onClose={() => setShowConfirmRecalcular(false)}
        onConfirm={confirmRecalcularSemanasConsumo}
        title="Recalcular Semanas de Consumo"
        message={`Tem certeza que deseja recalcular as semanas de consumo para o ano ${ano}? Esta ação irá atualizar todas as semanas baseado nos dias de consumo ativos.`}
        confirmText="Recalcular"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

export default CalendarioConfiguracao;
