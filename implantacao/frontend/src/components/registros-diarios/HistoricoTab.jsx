import React, { useMemo, useState } from 'react';
import { FaCalendarAlt, FaSchool, FaUser, FaClock, FaEdit, FaTrash, FaPlus } from 'react-icons/fa';
import { EmptyState, Button } from '../ui';
import { formatarDataParaExibicao } from '../../utils/recebimentos/recebimentosUtils';

const HistoricoTab = ({ historico, loading }) => {
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-3 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }
  
  const formatarDataHora = (valor) => {
    if (!valor) return '';

    const date = new Date(valor);
    if (Number.isNaN(date.getTime())) return '';

    const dia = String(date.getDate()).padStart(2, '0');
    const mes = String(date.getMonth() + 1).padStart(2, '0');
    const ano = date.getFullYear();
    const hora = String(date.getHours()).padStart(2, '0');
    const min = String(date.getMinutes()).padStart(2, '0');
    return `${dia}/${mes}/${ano}, ${hora}:${min}`;
  };

  const normalizarDataLimite = (valor, ehFinal = false) => {
    if (!valor) return null;
    const sufixo = ehFinal ? 'T23:59:59' : 'T00:00:00';
    const data = new Date(`${valor}${sufixo}`);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const normalizarDataItem = (valor) => {
    if (!valor) return null;
    const data = new Date(valor);
    return Number.isNaN(data.getTime()) ? null : data;
  };

  const historicoFiltrado = useMemo(() => {
    if (!historico || historico.length === 0) {
      return [];
    }

    const inicio = normalizarDataLimite(dataInicial, false);
    const fim = normalizarDataLimite(dataFinal, true);

    if (!inicio && !fim) {
      return historico;
    }

    return historico.filter((item) => {
      const dataRegistro = normalizarDataItem(item.data);
      const dataAcao = normalizarDataItem(item.data_acao);
      const datas = [dataRegistro, dataAcao].filter(Boolean);

      if (datas.length === 0) {
        return false;
      }

      return datas.some((data) => {
        if (inicio && data < inicio) {
          return false;
        }
        if (fim && data > fim) {
          return false;
        }
        return true;
      });
    });
  }, [historico, dataInicial, dataFinal]);

  if (!historico || historico.length === 0) {
    return (
      <EmptyState
        title="Nenhum histórico encontrado"
        description="O histórico de alterações aparecerá aqui quando houver registros"
        icon="history"
      />
    );
  }

  const renderFiltros = () => (
    <div className="mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data inicial</label>
          <input
            type="date"
            value={dataInicial}
            onChange={(e) => setDataInicial(e.target.value)}
            max={dataFinal || undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Data final</label>
          <input
            type="date"
            value={dataFinal}
            onChange={(e) => setDataFinal(e.target.value)}
            min={dataInicial || undefined}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50"
          />
        </div>
        <div className="flex items-end">
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setDataInicial('');
              setDataFinal('');
            }}
            disabled={!dataInicial && !dataFinal}
            className="w-full md:w-auto"
          >
            Limpar filtro
          </Button>
        </div>
      </div>
    </div>
  );

  if (historicoFiltrado.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {renderFiltros()}
        <EmptyState
          title="Nenhum resultado encontrado"
          description="Ajuste o intervalo de datas para visualizar registros do histórico"
          icon="history"
        />
      </div>
    );
  }
  
  const getAcaoIcon = (acao) => {
    switch (acao) {
      case 'criacao':
        return <FaPlus className="text-green-600" />;
      case 'edicao':
        return <FaEdit className="text-blue-600" />;
      case 'exclusao':
        return <FaTrash className="text-red-600" />;
      default:
        return <FaClock className="text-gray-600" />;
    }
  };
  
  const getAcaoText = (acao) => {
    switch (acao) {
      case 'criacao':
        return 'Registro criado';
      case 'edicao':
        return 'Registro atualizado';
      case 'exclusao':
        return 'Registro excluído';
      default:
        return 'Ação realizada';
    }
  };
  
  const getAcaoColor = (acao) => {
    switch (acao) {
      case 'criacao':
        return 'bg-green-100 border-green-200';
      case 'edicao':
        return 'bg-blue-100 border-blue-200';
      case 'exclusao':
        return 'bg-red-100 border-red-200';
      default:
        return 'bg-gray-100 border-gray-200';
    }
  };

  const tiposRefeicao = [
    { key: 'lanche_manha', label: 'Lanche Manhã', badge: 'bg-blue-50 text-blue-700' },
    { key: 'parcial_manha', label: 'Parcial Manhã', badge: 'bg-indigo-50 text-indigo-700' },
    { key: 'almoco', label: 'Almoço', badge: 'bg-green-50 text-green-700' },
    { key: 'lanche_tarde', label: 'Lanche Tarde', badge: 'bg-purple-50 text-purple-700' },
    { key: 'parcial_tarde', label: 'Parcial Tarde', badge: 'bg-orange-50 text-orange-700' },
    { key: 'eja', label: 'EJA', badge: 'bg-yellow-50 text-yellow-700' },
    { key: 'parcial', label: 'Parcial', badge: 'bg-orange-100 text-orange-800' }
  ];
  
  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {renderFiltros()}

      <div className="relative">
        {/* Linha vertical da timeline */}
        <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
        
        {/* Itens do histórico */}
        <div className="space-y-6">
          {historicoFiltrado.map((item, index) => (
            <div key={index} className="relative flex gap-4">
              {/* Ícone da ação */}
              <div className={`
                relative z-10 flex items-center justify-center w-16 h-16 
                rounded-full border-4 border-white shadow-sm
                ${getAcaoColor(item.acao)}
              `}>
                {getAcaoIcon(item.acao)}
              </div>
              
              {/* Conteúdo */}
              <div className="flex-1 pb-6">
                <div className="bg-white border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                  {/* Header */}
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {getAcaoText(item.acao)}
                    </h4>
                    <span className="text-xs text-gray-500 flex items-center">
                      <FaClock className="mr-1" />
                      {formatarDataHora(item.data_acao)}
                    </span>
                  </div>
                  
                  {/* Detalhes */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center text-gray-600">
                      <FaSchool className="mr-2 text-green-600" />
                      <span className="font-medium">Escola:</span>
                      <span className="ml-2">{item.escola_nome || `ID ${item.escola_id}`}</span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaCalendarAlt className="mr-2 text-blue-600" />
                      <span className="font-medium">Data Registro:</span>
                      <span className="ml-2">
                        {formatarDataParaExibicao(item.data)}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-gray-600">
                      <FaUser className="mr-2 text-purple-600" />
                      <span className="font-medium">Responsável:</span>
                      <span className="ml-2">{item.usuario_nome || `ID ${item.nutricionista_id}`}</span>
                    </div>
                    
                    {item.valores && (
                      <div className="md:col-span-2">
                        <div className="flex flex-wrap gap-2 mt-2">
                          {tiposRefeicao.map((tipo) => {
                            const valor = item.valores[tipo.key];
                            if (valor === undefined || valor === null) {
                              return null;
                            }

                            const numero = Number(valor);
                            if (Number.isNaN(numero) || numero <= 0) {
                              return null;
                            }

                            return (
                              <span key={tipo.key} className={`px-2 py-1 rounded text-xs ${tipo.badge}`}>
                                {tipo.label}: {numero}
                              </span>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HistoricoTab;

