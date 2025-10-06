import React, { useState, useEffect } from 'react';
import { FaHistory, FaClock, FaUser, FaEdit, FaChevronDown, FaChevronRight } from 'react-icons/fa';
import registrosDiariosService from '../../services/registrosDiariosService';
import { formatarDataParaExibicao } from '../../utils/recebimentosUtils';

const RegistroHistorico = ({ escolaId, data, isOpen }) => {
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [expandedEntries, setExpandedEntries] = useState(new Set());

  useEffect(() => {
    if (isOpen && escolaId && data) {
      carregarHistorico();
    }
  }, [isOpen, escolaId, data]);

  const carregarHistorico = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Buscar histórico de registros para a escola (todos os registros da escola)
      const response = await registrosDiariosService.listar({
        escola_id: escolaId,
        limit: 1000 // Buscar todos os registros (limite alto para garantir que pegue todos)
      });
      
      if (response.success) {
        // Agrupar registros por data de consumo
        let registrosInvalidos = 0;
        const registrosAgrupados = response.data.reduce((acc, registro) => {
          // Usar a data de consumo (campo 'data') para agrupar
          const dataConsumo = registro.data;
          if (!dataConsumo || isNaN(new Date(dataConsumo).getTime())) {
            registrosInvalidos++;
            return acc;
          }
          
          const dataRegistro = new Date(dataConsumo).toISOString().split('T')[0];
          
          if (!acc[dataRegistro]) {
            acc[dataRegistro] = {
              data: dataRegistro,
              registros: [],
              nutricionista: registro.nutricionista_nome
            };
          }
          
          // Verificar se foi atualizado comparando data_cadastro com data_atualizacao
          const dataCriacao = registro.data_cadastro;
          const dataAtualizacao = registro.data_atualizacao;
          const foiAtualizado = dataAtualizacao && 
                               dataCriacao && 
                               dataAtualizacao !== dataCriacao &&
                               !isNaN(new Date(dataAtualizacao).getTime());
          
          acc[dataRegistro].registros.push({
            tipo: registro.tipo_media,
            valor: registro.valor,
            dataCriacao: dataCriacao,
            dataAtualizacao: dataAtualizacao,
            foiAtualizado: foiAtualizado
          });
          
          return acc;
        }, {});
        
        // Converter para array e ordenar por data (mais recente primeiro)
        const historicoArray = Object.values(registrosAgrupados)
          .sort((a, b) => new Date(b.data) - new Date(a.data));

        // Ordenar registros dentro de cada entrada pela ordem correta
        historicoArray.forEach(entrada => {
          const ordemTipos = ['lanche_manha', 'almoco', 'lanche_tarde', 'parcial', 'eja'];
          entrada.registros.sort((a, b) => {
            const indexA = ordemTipos.indexOf(a.tipo);
            const indexB = ordemTipos.indexOf(b.tipo);
            return indexA - indexB;
          });
        });
        
        // Log único sobre registros inválidos (apenas se houver)
        if (registrosInvalidos > 0) {
          console.warn(`${registrosInvalidos} registros ignorados por terem datas de criação inválidas`);
        }
        
        setHistorico(historicoArray);
      }
    } catch (err) {
      console.error('Erro ao carregar histórico:', err);
      setError('Erro ao carregar histórico de registros');
    } finally {
      setLoading(false);
    }
  };

  // Mapear apenas para os tipos antigos (formato correto)
  const formatarTipoMedia = (tipo) => {
    const tipos = {
      'lanche_manha': 'LANCHE DA MANHA',
      'almoco': 'ALMOÇO',
      'lanche_tarde': 'LANCHE DA TARDE',
      'parcial': 'PARCIAL',
      'eja': 'EJA'
    };
    return tipos[tipo] || 'TIPO INVÁLIDO';
  };

  const toggleExpanded = (index) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEntries(newExpanded);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
        <span className="ml-2 text-gray-600">Carregando histórico...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center">
          <FaHistory className="h-5 w-5 text-red-400 mr-2" />
          <span className="text-red-800">{error}</span>
        </div>
      </div>
    );
  }

  if (historico.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
        <FaHistory className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Nenhum histórico encontrado
        </h3>
        <p className="text-gray-600">
          Não há registros de alterações para esta escola e data.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <FaHistory className="h-5 w-5 text-green-600 mr-2" />
        <h3 className="text-lg font-semibold text-gray-900">
          Histórico de Alterações
        </h3>
      </div>

      <div className="space-y-3">
        {historico.map((entrada, index) => {
          const isExpanded = expandedEntries.has(index);
          
          return (
            <div key={index} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              {/* Cabeçalho clicável */}
              <div 
                className="p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                onClick={() => toggleExpanded(index)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <FaClock className="h-4 w-4 mr-2" />
                      <span className="font-medium">{formatarDataParaExibicao(entrada.data)}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <FaUser className="h-4 w-4 mr-2" />
                      <span>{entrada.nutricionista}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-500">
                      <FaEdit className="h-4 w-4 mr-2" />
                      <span>{entrada.registros.length} registro(s)</span>
                    </div>
                  </div>
                  <div className="flex items-center text-gray-400">
                    {isExpanded ? (
                      <FaChevronDown className="h-4 w-4" />
                    ) : (
                      <FaChevronRight className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {/* Conteúdo expansível */}
              {isExpanded && (
                <div className="border-t border-gray-200">
                  <div className="overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Lançado no Dia
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {entrada.registros.map((registro, regIndex) => (
                          <tr 
                            key={regIndex} 
                            className={regIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div className="flex items-center">
                                <span>{formatarTipoMedia(registro.tipo)}</span>
                                {registro.foiAtualizado && (
                                  <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                    <FaEdit className="h-3 w-3 mr-1" />
                                    Editado
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <span className="font-medium">{Number(registro.valor).toFixed(2)}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  
                  {/* Informação adicional */}
                  <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                    <p className="text-xs text-gray-600">
                      <strong>Nota:</strong> Histórico de registros para esta escola. 
                      Valores editados são marcados com o indicador "Editado".
                    </p>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default RegistroHistorico;
