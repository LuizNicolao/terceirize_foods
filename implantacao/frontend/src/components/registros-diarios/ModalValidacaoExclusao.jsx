import React, { useState, useEffect } from 'react';
import { Modal, Button } from '../ui';
import { FaCalendarAlt, FaTrash, FaTimes, FaCheck } from 'react-icons/fa';
import RegistrosDiariosService from '../../services/registrosDiarios';
import toast from 'react-hot-toast';

const ModalValidacaoExclusao = ({ 
  isOpen, 
  onClose, 
  escolaId, 
  escolaNome, 
  onConfirmExclusao 
}) => {
  const [diasComRegistros, setDiasComRegistros] = useState([]);
  const [diasSelecionados, setDiasSelecionados] = useState(new Set());
  const [loading, setLoading] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  // Carregar dias com registros quando o modal abrir
  useEffect(() => {
    if (isOpen && escolaId) {
      carregarDiasComRegistros();
    }
  }, [isOpen, escolaId]);

  const carregarDiasComRegistros = async () => {
    try {
      setLoading(true);
      const response = await RegistrosDiariosService.listarHistorico(escolaId);
      
      if (response.success && response.data) {
        console.log('📊 Dados recebidos do backend:', response.data);
        
        // Criar um mapa para agrupar por data única
        const diasMap = new Map();
        
        response.data.forEach(registro => {
          const data = registro.data; // Formato YYYY-MM-DD
          console.log('📅 Processando registro:', { data, registro });
          
          // Se já existe, mantém os valores; se não, cria novo
          if (!diasMap.has(data)) {
            diasMap.set(data, {
              data: data,
              dataFormatada: new Date(data + 'T00:00:00').toLocaleDateString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
              }),
              lanche_manha: Number(registro.lanche_manha) || 0,
              almoco: Number(registro.almoco) || 0,
              lanche_tarde: Number(registro.lanche_tarde) || 0,
              parcial: Number(registro.parcial) || 0,
              eja: Number(registro.eja) || 0
            });
          }
        });
        
        // Converter map para array e ordenar por data (mais recente primeiro)
        const diasUnicos = Array.from(diasMap.values()).sort((a, b) => {
          return new Date(b.data) - new Date(a.data);
        });
        
        console.log('✅ Dias únicos processados:', diasUnicos);
        setDiasComRegistros(diasUnicos);
      } else {
        toast.error('Erro ao carregar registros');
      }
    } catch (error) {
      console.error('Erro ao carregar dias com registros:', error);
      console.error('Detalhes do erro:', error.response?.data);
      toast.error('Erro ao carregar registros');
    } finally {
      setLoading(false);
    }
  };

  const handleSelecionarDia = (data) => {
    setDiasSelecionados(prev => {
      const novoSet = new Set(prev);
      if (novoSet.has(data)) {
        novoSet.delete(data);
      } else {
        novoSet.add(data);
      }
      return novoSet;
    });
  };

  const handleSelecionarTodos = () => {
    if (diasSelecionados.size === diasComRegistros.length) {
      setDiasSelecionados(new Set());
    } else {
      setDiasSelecionados(new Set(diasComRegistros.map(dia => dia.data)));
    }
  };

  const handleConfirmarExclusao = async () => {
    if (diasSelecionados.size === 0) {
      toast.error('Selecione pelo menos um dia para excluir');
      return;
    }

    try {
      setExcluindo(true);
      
      // Excluir cada dia selecionado
      const promises = Array.from(diasSelecionados).map(data => 
        RegistrosDiariosService.excluir(escolaId, data)
      );
      
      const results = await Promise.all(promises);
      
      // Verificar se todas as exclusões foram bem-sucedidas
      const sucessos = results.filter(result => result.success).length;
      const falhas = results.length - sucessos;
      
      if (sucessos > 0) {
        toast.success(`${sucessos} dia(s) excluído(s) com sucesso!`);
        onConfirmExclusao();
        handleClose();
      }
      
      if (falhas > 0) {
        toast.error(`${falhas} dia(s) não puderam ser excluídos`);
      }
      
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      toast.error('Erro ao excluir registros');
    } finally {
      setExcluindo(false);
    }
  };

  const handleClose = () => {
    setDiasSelecionados(new Set());
    onClose();
  };

  const calcularTotalRefeicoes = (dia) => {
    // Garantir que os valores sejam números
    const lanche_manha = Number(dia.lanche_manha) || 0;
    const almoco = Number(dia.almoco) || 0;
    const lanche_tarde = Number(dia.lanche_tarde) || 0;
    const parcial = Number(dia.parcial) || 0;
    const eja = Number(dia.eja) || 0;
    
    return lanche_manha + almoco + lanche_tarde + parcial + eja;
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Selecionar Dias para Exclusão"
      size="4xl"
    >
      <div className="space-y-6">
        {/* Informações da Escola */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <FaCalendarAlt className="text-blue-600 mr-2" />
            <div>
              <h3 className="font-semibold text-blue-900">{escolaNome}</h3>
              <p className="text-sm text-blue-700">
                {diasComRegistros.length} dia(s) com registros encontrado(s)
              </p>
            </div>
          </div>
        </div>

        {/* Ações de Seleção */}
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              onClick={handleSelecionarTodos}
              variant="outline"
              size="sm"
            >
              {diasSelecionados.size === diasComRegistros.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
            </Button>
            <span className="text-sm text-gray-600">
              {diasSelecionados.size} de {diasComRegistros.length} selecionado(s)
            </span>
          </div>
        </div>

        {/* Lista de Dias */}
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Carregando registros...</span>
          </div>
        ) : diasComRegistros.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <FaCalendarAlt className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum registro encontrado para esta escola</p>
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-lg">
            <div className="divide-y divide-gray-200">
              {diasComRegistros.map((dia) => {
                const isSelecionado = diasSelecionados.has(dia.data);
                const totalRefeicoes = calcularTotalRefeicoes(dia);
                
                return (
                  <div
                    key={dia.data}
                    className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                      isSelecionado ? 'bg-red-50 border-l-4 border-red-500' : ''
                    }`}
                    onClick={() => handleSelecionarDia(dia.data)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <input
                          type="checkbox"
                          checked={isSelecionado}
                          onChange={() => handleSelecionarDia(dia.data)}
                          className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {dia.dataFormatada}
                          </div>
                          <div className="text-sm text-gray-600">
                            Total: {totalRefeicoes} refeições
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {/* Detalhes das refeições */}
                        <div className="flex space-x-1 text-xs">
                          {dia.lanche_manha > 0 && (
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded">
                              LM: {dia.lanche_manha}
                            </span>
                          )}
                          {dia.almoco > 0 && (
                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                              AL: {dia.almoco}
                            </span>
                          )}
                          {dia.lanche_tarde > 0 && (
                            <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded">
                              LT: {dia.lanche_tarde}
                            </span>
                          )}
                          {dia.parcial > 0 && (
                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              PC: {dia.parcial}
                            </span>
                          )}
                          {dia.eja > 0 && (
                            <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded">
                              EJA: {dia.eja}
                            </span>
                          )}
                        </div>
                        
                        {isSelecionado && (
                          <FaCheck className="text-red-600" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            onClick={handleClose}
            variant="outline"
            disabled={excluindo}
          >
            <FaTimes className="mr-2" />
            Cancelar
          </Button>
          
          <Button
            onClick={handleConfirmarExclusao}
            variant="danger"
            disabled={diasSelecionados.size === 0 || excluindo}
            loading={excluindo}
          >
            <FaTrash className="mr-2" />
            Excluir {diasSelecionados.size} Dia(s)
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ModalValidacaoExclusao;
