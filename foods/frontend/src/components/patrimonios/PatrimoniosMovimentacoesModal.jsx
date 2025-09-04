import React from 'react';
import { FaTimes, FaBuilding, FaUser, FaExchangeAlt, FaCalendar, FaFileAlt } from 'react-icons/fa';
import { Button } from '../ui';

const PatrimoniosMovimentacoesModal = ({
  isOpen,
  onClose,
  patrimonio,
  movimentacoes,
  loading
}) => {
  if (!isOpen || !patrimonio) return null;

  const getMotivoLabel = (motivo) => {
    const motivos = {
      transferencia: 'Transferência',
      manutencao: 'Manutenção',
      devolucao: 'Devolução',
      outro: 'Outro'
    };
    return motivos[motivo] || motivo;
  };

  const getMotivoColor = (motivo) => {
    const cores = {
      transferencia: 'bg-blue-100 text-blue-800',
      manutencao: 'bg-yellow-100 text-yellow-800',
      devolucao: 'bg-green-100 text-green-800',
      outro: 'bg-gray-100 text-gray-800'
    };
    return cores[motivo] || cores.outro;
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg mr-3">
              <FaExchangeAlt className="text-blue-600 text-xl" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900">
                Histórico de Movimentações
              </h3>
              <p className="text-sm text-gray-600">
                Patrimônio: {patrimonio.numero_patrimonio}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes className="h-5 w-5" />
          </Button>
        </div>

        {/* Informações do Patrimônio */}
        <div className="bg-gray-50 p-4 rounded-lg mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Detalhes do Patrimônio</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Número:</span>
              <span className="ml-2 font-medium">{patrimonio.numero_patrimonio}</span>
            </div>
            <div>
              <span className="text-gray-500">Produto:</span>
              <span className="ml-2 font-medium">{patrimonio.nome_produto}</span>
            </div>
            <div>
              <span className="text-gray-500">Escola Atual:</span>
              <span className="ml-2 font-medium">{patrimonio.escola_atual_nome}</span>
            </div>
            <div>
              <span className="text-gray-500">Status:</span>
              <span className="ml-2 font-medium">{patrimonio.status}</span>
            </div>
          </div>
        </div>

        {/* Lista de Movimentações */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-900 mb-3">Movimentações</h4>
          
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Carregando movimentações...</p>
            </div>
          ) : movimentacoes.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-gray-400 text-4xl mb-2">📋</div>
              <p className="text-gray-600">Nenhuma movimentação encontrada</p>
            </div>
          ) : (
            <div className="space-y-4">
              {movimentacoes.map((movimentacao, index) => (
                <div key={movimentacao.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                        <FaExchangeAlt className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium text-gray-900">
                          Movimentação #{movimentacoes.length - index}
                        </div>
                        <div className="text-sm text-gray-500">
                          {new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')} às{' '}
                          {new Date(movimentacao.data_movimentacao).toLocaleTimeString('pt-BR')}
                        </div>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getMotivoColor(movimentacao.motivo)}`}>
                      {getMotivoLabel(movimentacao.motivo)}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center">
                      <FaBuilding className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="text-gray-500">De:</span>
                        <span className="ml-2 font-medium">{movimentacao.escola_origem_nome}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaBuilding className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Para:</span>
                        <span className="ml-2 font-medium">{movimentacao.escola_destino_nome}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaUser className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Responsável:</span>
                        <span className="ml-2 font-medium">{movimentacao.responsavel_nome}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <FaCalendar className="h-4 w-4 text-gray-500 mr-2" />
                      <div>
                        <span className="text-gray-500">Data:</span>
                        <span className="ml-2 font-medium">
                          {new Date(movimentacao.data_movimentacao).toLocaleDateString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {movimentacao.observacoes && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <div className="flex items-start">
                        <FaFileAlt className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
                        <div>
                          <span className="text-gray-500 text-sm">Observações:</span>
                          <p className="text-sm text-gray-700 mt-1">{movimentacao.observacoes}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Botão de Fechar */}
        <div className="flex justify-end pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Fechar
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PatrimoniosMovimentacoesModal;
