import React, { useState, useEffect } from 'react';
import { FaSave, FaSpinner, FaCheckCircle, FaExclamationTriangle, FaSync } from 'react-icons/fa';
import { Button, SearchableSelect, ConfirmModal } from '../ui';
import toast from 'react-hot-toast';
import configuracaoMediasService from '../../services/configuracaoMediasService';

const ConfiguracaoMediasTab = () => {
  const [ano, setAno] = useState(new Date().getFullYear());
  const [mesesConfigurados, setMesesConfigurados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [recalculando, setRecalculando] = useState(false);
  const [showConfirmRecalcular, setShowConfirmRecalcular] = useState(false);

  const meses = [
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

  const gerarAnos = () => {
    const anos = [];
    const anoAtual = new Date().getFullYear();
    for (let i = anoAtual - 2; i <= anoAtual + 2; i++) {
      anos.push({ value: i, label: i.toString() });
    }
    return anos;
  };

  const carregarConfiguracao = async () => {
    setLoading(true);
    try {
      const response = await configuracaoMediasService.obterConfiguracao(ano);
      if (response.success) {
        setMesesConfigurados(response.data || []);
      } else {
        toast.error('Erro ao carregar configuração');
      }
    } catch (error) {
      console.error('Erro ao carregar configuração:', error);
      toast.error('Erro ao carregar configuração');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarConfiguracao();
  }, [ano]);

  const toggleMes = (mesNumero) => {
    setMesesConfigurados(prev => {
      const existe = prev.find(m => m.mes === mesNumero);
      if (existe) {
        return prev.map(m => 
          m.mes === mesNumero ? { ...m, ativo: !m.ativo } : m
        );
      } else {
        return [...prev, { ano, mes: mesNumero, ativo: true }];
      }
    });
  };

  const handleSalvar = async () => {
    setSaving(true);
    try {
      const mesesAtivos = mesesConfigurados
        .filter(m => m.ativo)
        .map(m => m.mes);
      
      const response = await configuracaoMediasService.salvarConfiguracao(ano, mesesAtivos);
      
      if (response.success) {
        toast.success('Configuração salva com sucesso!');
        await carregarConfiguracao();
      } else {
        toast.error(response.message || 'Erro ao salvar configuração');
      }
    } catch (error) {
      console.error('Erro ao salvar configuração:', error);
      toast.error('Erro ao salvar configuração');
    } finally {
      setSaving(false);
    }
  };

  const handleRecalcular = () => {
    setShowConfirmRecalcular(true);
  };

  const confirmRecalcular = async () => {
    setShowConfirmRecalcular(false);
    setRecalculando(true);
    try {
      const response = await configuracaoMediasService.recalcularMedias();
      
      if (response.success) {
        const { data } = response;
        toast.success(
          `Recálculo concluído! ${data.sucesso} escola(s) processada(s) com sucesso${data.falhas > 0 ? `, ${data.falhas} falha(s)` : ''}`,
          { duration: 5000 }
        );
      } else {
        toast.error(response.message || 'Erro ao recalcular médias');
      }
    } catch (error) {
      console.error('Erro ao recalcular médias:', error);
      toast.error('Erro ao recalcular médias');
    } finally {
      setRecalculando(false);
    }
  };

  const isMesAtivo = (mesNumero) => {
    const config = mesesConfigurados.find(m => m.mes === mesNumero);
    return config ? config.ativo : false;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando configuração...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          Configuração de Meses para Cálculo de Médias
        </h2>
        <p className="text-sm text-gray-600">
          Selecione quais meses serão considerados no cálculo das médias das escolas.
          Apenas os registros dos meses marcados serão utilizados.
        </p>
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ano
        </label>
        <SearchableSelect
          value={ano}
          onChange={(value) => setAno(value)}
          options={gerarAnos()}
          placeholder="Selecione o ano..."
          usePortal={false}
        />
      </div>

      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-4">
          Meses Válidos para Cálculo
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {meses.map(mes => {
            const ativo = isMesAtivo(mes.value);
            return (
              <button
                key={mes.value}
                onClick={() => toggleMes(mes.value)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  ativo
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`font-medium ${ativo ? 'text-green-700' : 'text-gray-700'}`}>
                    {mes.label}
                  </span>
                  {ativo && (
                    <FaCheckCircle className="text-green-500 ml-2" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <div className="flex items-start">
          <FaExclamationTriangle className="text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
          <div className="text-sm text-blue-800">
            <p className="font-medium mb-1">Importante:</p>
            <p>
              Ao alterar esta configuração, as médias existentes não serão recalculadas automaticamente.
              É necessário recalcular as médias manualmente após salvar as alterações usando o botão abaixo.
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <Button
          onClick={handleRecalcular}
          disabled={recalculando || saving}
          variant="outline"
          className="flex items-center space-x-2"
        >
          {recalculando ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Recalculando...</span>
            </>
          ) : (
            <>
              <FaSync />
              <span>Recalcular Médias</span>
            </>
          )}
        </Button>

        <Button
          onClick={handleSalvar}
          disabled={saving || recalculando}
          className="flex items-center space-x-2"
        >
          {saving ? (
            <>
              <FaSpinner className="animate-spin" />
              <span>Salvando...</span>
            </>
          ) : (
            <>
              <FaSave />
              <span>Salvar Configuração</span>
            </>
          )}
        </Button>
      </div>

      {/* Modal de Confirmação para Recalcular Médias */}
      <ConfirmModal
        isOpen={showConfirmRecalcular}
        onClose={() => setShowConfirmRecalcular(false)}
        onConfirm={confirmRecalcular}
        title="Recalcular Médias"
        message="Deseja recalcular as médias de todas as escolas? Esta operação pode levar alguns minutos."
        confirmText="Recalcular"
        cancelText="Cancelar"
        variant="warning"
      />
    </div>
  );
};

export default ConfiguracaoMediasTab;

