import React from 'react';
import { FaExclamationTriangle } from 'react-icons/fa';
import { Button, Modal } from '../ui';

/**
 * Modal de Aviso para Duplicação de Receita
 * Exibido quando não existe receita com os produtos selecionados para o Centro de Custo
 */
const ReceitaDuplicacaoModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  onCancel,
  receitasParaDuplicar = []
}) => {
  const handleConfirm = () => {
    onConfirm();
    onClose();
  };

  const handleCancel = () => {
    if (onCancel) {
      onCancel();
    }
    onClose();
  };

  const totalReceitas = receitasParaDuplicar.length;
  const receitasParaAtualizar = receitasParaDuplicar.filter(r => r.tipo === 'atualizar');
  const receitasParaDuplicarReal = receitasParaDuplicar.filter(r => r.tipo !== 'atualizar');
  const temAtualizacoes = receitasParaAtualizar.length > 0;
  const temDuplicacoes = receitasParaDuplicarReal.length > 0;

  return (
    <Modal isOpen={isOpen} onClose={handleCancel} size="lg" title="">
      <div className="text-center">
        {/* Ícone */}
        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-amber-100 mb-4">
          <FaExclamationTriangle className="h-6 w-6 text-amber-500" />
        </div>

        {/* Título */}
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          {totalReceitas === 1 
            ? 'Receita não encontrada para este Centro de Custo'
            : 'Receitas não encontradas para os Centros de Custo'
          }
        </h3>

        {/* Mensagem */}
        <div className="text-sm text-gray-500 mb-6 space-y-3">
          <p>
            {totalReceitas === 1 
              ? `Não existe uma receita cadastrada com os produtos selecionados para o Centro de Custo selecionado.`
              : `Não existem receitas cadastradas com os produtos selecionados para ${totalReceitas} Centro(s) de Custo.`
            }
          </p>

          {/* Lista de receitas que precisam ser atualizadas (adicionar centro de custo) */}
          {temAtualizacoes && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mt-4 text-left">
              <p className="font-medium text-green-700 mb-3">
                {receitasParaAtualizar.length === 1 
                  ? 'Receita que terá centro de custo adicionado:'
                  : `${receitasParaAtualizar.length} receitas que terão centro de custo adicionado:`
                }
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {receitasParaAtualizar.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border border-green-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {item.receita_referencia.nome || 'Receita sem nome'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Centro de Custo: <span className="font-medium">{item.centro_custo.centro_custo_nome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Lista de receitas que precisam ser duplicadas */}
          {temDuplicacoes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4 text-left">
              <p className="font-medium text-gray-700 mb-3">
                {receitasParaDuplicarReal.length === 1 
                  ? 'Receita que será duplicada:'
                  : `${receitasParaDuplicarReal.length} receitas que serão duplicadas:`
                }
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {receitasParaDuplicarReal.map((item, index) => (
                  <div key={index} className="flex items-start space-x-2 p-2 bg-white rounded border border-gray-200">
                    <div className="flex-1">
                      <div className="font-medium text-gray-800">
                        {item.receita_referencia.nome || 'Receita sem nome'}
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Centro de Custo: <span className="font-medium">{item.centro_custo.centro_custo_nome}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="mt-4">
            {temAtualizacoes && temDuplicacoes ? (
              <>
                Deseja {receitasParaAtualizar.length === 1 ? 'adicionar o centro de custo à receita' : `adicionar os centros de custo às ${receitasParaAtualizar.length} receitas`} e {receitasParaDuplicarReal.length === 1 ? 'duplicar a receita' : `duplicar as ${receitasParaDuplicarReal.length} receitas`}?
              </>
            ) : temAtualizacoes ? (
              <>
                Deseja adicionar {totalReceitas === 1 ? 'o centro de custo à receita' : `os centros de custo às ${totalReceitas} receitas`}?
              </>
            ) : (
              <>
                Deseja duplicar {totalReceitas === 1 ? 'esta receita' : `todas as ${totalReceitas} receitas`} para {totalReceitas === 1 ? 'este Centro de Custo' : 'os Centros de Custo correspondentes'}?
              </>
            )}
          </p>
        </div>

        {/* Botões */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={handleCancel}
            variant="outline"
            size="md"
          >
            Não
          </Button>
          <Button
            onClick={handleConfirm}
            variant="primary"
            size="md"
            className="bg-green-500 hover:bg-green-600 text-white"
          >
            Sim
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ReceitaDuplicacaoModal;

