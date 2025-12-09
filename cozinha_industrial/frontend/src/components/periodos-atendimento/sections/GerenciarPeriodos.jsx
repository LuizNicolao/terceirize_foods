import React, { useState } from 'react';
import { Button, Input } from '../../ui';
import { FaPlus, FaTimes, FaTrash, FaCheck, FaEdit, FaSave } from 'react-icons/fa';

/**
 * Seção de Gerenciamento de Períodos de Atendimento
 */
const GerenciarPeriodos = ({
  periodos,
  novoPeriodoNome,
  mostrarFormNovoPeriodo,
  isViewMode,
  onNovoPeriodoNomeChange,
  onMostrarFormNovoPeriodoChange,
  onAdicionarPeriodo,
  onRemoverPeriodo,
  onEditarPeriodo
}) => {
  const [periodoEditando, setPeriodoEditando] = useState(null);
  const [nomeEditado, setNomeEditado] = useState('');
  return (
    <>
      {/* Adicionar Novo Período */}
      {!isViewMode && (
        <div className="border border-gray-200 rounded-lg p-3 bg-white">
          {!mostrarFormNovoPeriodo ? (
            <Button
              type="button"
              onClick={() => onMostrarFormNovoPeriodoChange(true)}
              variant="outline"
              size="sm"
            >
              <FaPlus className="mr-2" />
              Adicionar Novo Período
            </Button>
          ) : (
            <div className="flex gap-2 items-end">
              <div className="flex-1">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome do Período (será convertido para MAIÚSCULAS)
                </label>
                <Input
                  type="text"
                  value={novoPeriodoNome}
                  onChange={(e) => onNovoPeriodoNomeChange(e.target.value.toUpperCase())}
                  placeholder="Ex: MATUTINO, VESPERTINO"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      onAdicionarPeriodo();
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={onAdicionarPeriodo}
                size="sm"
              >
                <FaCheck className="mr-2" />
                Adicionar
              </Button>
              <Button
                type="button"
                onClick={() => {
                  onMostrarFormNovoPeriodoChange(false);
                  onNovoPeriodoNomeChange('');
                }}
                variant="ghost"
                size="sm"
              >
                <FaTimes />
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Lista de Períodos Adicionados */}
      {periodos.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-600 mb-2">Períodos adicionados:</h4>
          <div className="flex flex-wrap gap-2">
            {periodos.map((periodo, index) => {
              const isEditando = periodoEditando === (periodo.id || `novo_${index}`);
              const periodoKey = periodo.id || `novo_${index}`;
              
              return (
                <div
                  key={periodoKey}
                  className="flex items-center gap-1"
                >
                  {isEditando ? (
                    <>
                      <Input
                        type="text"
                        value={nomeEditado}
                        onChange={(e) => setNomeEditado(e.target.value.toUpperCase())}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            if (nomeEditado.trim()) {
                              onEditarPeriodo(periodo, nomeEditado.trim());
                              setPeriodoEditando(null);
                              setNomeEditado('');
                            }
                          } else if (e.key === 'Escape') {
                            setPeriodoEditando(null);
                            setNomeEditado('');
                          }
                        }}
                        className="w-40"
                        autoFocus
                      />
                      <Button
                        type="button"
                        onClick={() => {
                          if (nomeEditado.trim()) {
                            onEditarPeriodo(periodo, nomeEditado.trim());
                            setPeriodoEditando(null);
                            setNomeEditado('');
                          }
                        }}
                        size="sm"
                        variant="outline"
                      >
                        <FaSave className="text-xs" />
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setPeriodoEditando(null);
                          setNomeEditado('');
                        }}
                        size="sm"
                        variant="ghost"
                      >
                        <FaTimes className="text-xs" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="px-3 py-1.5 border border-gray-300 rounded-md bg-white text-sm whitespace-nowrap">
                        <span className="font-medium text-gray-900">{periodo.nome}</span>
                        {periodo.id === null && (
                          <span className="ml-2 text-xs text-gray-500">(novo)</span>
                        )}
                      </div>
                      {!isViewMode && periodo.id === null && (
                        <>
                          <Button
                            type="button"
                            onClick={() => {
                              setPeriodoEditando(periodoKey);
                              setNomeEditado(periodo.nome);
                            }}
                            size="sm"
                            variant="ghost"
                            className="text-blue-600 hover:text-blue-800 px-2"
                          >
                            <FaEdit className="text-xs" />
                          </Button>
                          <Button
                            type="button"
                            onClick={() => onRemoverPeriodo(periodo)}
                            size="sm"
                            variant="ghost"
                            className="text-red-600 hover:text-red-800 px-2"
                          >
                            <FaTrash className="text-xs" />
                          </Button>
                        </>
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

export default GerenciarPeriodos;

