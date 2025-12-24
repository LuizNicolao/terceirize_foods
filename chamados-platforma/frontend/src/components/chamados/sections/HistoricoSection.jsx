import React, { useState, useEffect, useCallback } from 'react';
import { FaHistory, FaUser, FaArrowRight } from 'react-icons/fa';
import ChamadosService from '../../../services/chamados';

const HistoricoSection = ({ chamado }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadHistorico = useCallback(async () => {
    if (!chamado?.id) {
      setHistorico([]);
      return;
    }

    setLoading(true);
    try {
      const result = await ChamadosService.listarHistorico(chamado.id, { limit: 50 });
      const itens = (result?.success ? result?.data : result?.data) || result || [];
      setHistorico(Array.isArray(itens) ? itens : []);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setHistorico([]);
    } finally {
      setLoading(false);
    }
  }, [chamado?.id]);

  useEffect(() => {
    loadHistorico();
  }, [loadHistorico]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const d = new Date(dateString);
    return Number.isNaN(d.getTime()) ? '-' : d.toLocaleString('pt-BR');
  };

  const getFieldLabel = (campo) => {
    const labels = {
      status: 'Status',
      prioridade: 'Prioridade',
      titulo: 'Título',
      descricao: 'Descrição',
      sistema: 'Sistema',
      tela: 'Tela',
      tipo: 'Tipo',
      usuario_responsavel_id: 'Responsável',
    };
    return labels[campo] || campo;
  };

  const getValueLabel = (campo, valor) => {
    if (valor === null || valor === undefined || valor === '') return 'N/A';

    const maps = {
      status: {
        aberto: 'Aberto',
        em_analise: 'Em Análise',
        em_desenvolvimento: 'Em Desenvolvimento',
        em_teste: 'Em Teste',
        concluido: 'Concluído',
        fechado: 'Fechado',
      },
      prioridade: {
        baixa: 'Baixa',
        media: 'Média',
        alta: 'Alta',
        critica: 'Crítica',
      },
      tipo: {
        bug: 'Bug',
        erro: 'Erro',
        melhoria: 'Melhoria',
        feature: 'Feature',
      },
    };

    return maps[campo]?.[valor] ?? String(valor);
  };

  if (!chamado?.id) return null;

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500 flex items-center gap-2">
        <FaHistory /> Histórico de Mudanças
      </h3>
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-gray-500 text-center py-4">Carregando histórico...</p>
        ) : historico.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-4">Nenhuma alteração registrada</p>
        ) : (
          historico.map((item) => (
            <div key={item.id} className="bg-white p-3 rounded border border-gray-200">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  <FaUser className="text-gray-400 text-xs" />
                  <span className="text-sm font-medium text-gray-900">
                    {item.usuario_nome || 'Sistema'}
                  </span>
                </div>
                <span className="text-xs text-gray-500">
                  {formatDate(item.data_alteracao)}
                </span>
              </div>

              {item.campo_alterado ? (
                <div className="mt-2">
                  <p className="text-xs text-gray-600 mb-1">
                    <span className="font-medium">{getFieldLabel(item.campo_alterado)}</span> alterado:
                  </p>
                  <div className="flex items-center gap-2 text-sm">
                    <span className="px-2 py-1 bg-red-50 text-red-700 rounded text-xs">
                      {getValueLabel(item.campo_alterado, item.valor_anterior)}
                    </span>
                    <FaArrowRight className="text-gray-400 text-xs" />
                    <span className="px-2 py-1 bg-green-50 text-green-700 rounded text-xs">
                      {getValueLabel(item.campo_alterado, item.valor_novo)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-700">Ação realizada no chamado</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default HistoricoSection;
