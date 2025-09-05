import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Table } from '../ui';
import { FaTrash, FaSave } from 'react-icons/fa';
import EfetivosService from '../../services/efetivos';
import IntoleranciasService from '../../services/intolerancias';
import toast from 'react-hot-toast';

const EfetivosEditModal = ({ 
  isOpen, 
  onClose, 
  onSave,
  unidadeEscolarId,
  periodoRefeicao
}) => {
  const [efetivos, setEfetivos] = useState([]);
  const [intolerancias, setIntolerancias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Carregar efetivos do período quando o modal abrir
  useEffect(() => {
    if (isOpen && unidadeEscolarId && periodoRefeicao?.id) {
      loadEfetivosDoPeriodo();
      loadIntolerancias();
    }
  }, [isOpen, unidadeEscolarId, periodoRefeicao?.id]);

  const loadEfetivosDoPeriodo = async () => {
    setLoading(true);
    try {
      const result = await EfetivosService.listarPorUnidade(unidadeEscolarId);
      if (result.success) {
        // Filtrar apenas efetivos deste período
        const efetivosDoPeriodo = result.data.filter(efetivo => 
          efetivo.periodo_refeicao_id === periodoRefeicao.id
        );
        setEfetivos(efetivosDoPeriodo);
      }
    } catch (error) {
      console.error('Erro ao carregar efetivos do período:', error);
      toast.error('Erro ao carregar efetivos do período');
    } finally {
      setLoading(false);
    }
  };

  const loadIntolerancias = async () => {
    try {
      const result = await IntoleranciasService.buscarAtivas();
      if (result.success) {
        setIntolerancias(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar intolerâncias:', error);
    }
  };

  const handleQuantidadeChange = (index, value) => {
    const newEfetivos = [...efetivos];
    newEfetivos[index].quantidade = parseInt(value) || 0;
    setEfetivos(newEfetivos);
  };

  const handleIntoleranciaChange = (index, intoleranciaId) => {
    const newEfetivos = [...efetivos];
    newEfetivos[index].intolerancia_id = intoleranciaId || null;
    setEfetivos(newEfetivos);
  };

  const handleRemoveEfetivo = (index) => {
    const newEfetivos = efetivos.filter((_, i) => i !== index);
    setEfetivos(newEfetivos);
  };


  const handleSave = async () => {
    setSaving(true);
    try {
      // Salvar/atualizar cada efetivo
      for (const efetivo of efetivos) {
        if (efetivo.id) {
          // Atualizar efetivo existente
          await EfetivosService.atualizar(efetivo.id, {
            quantidade: efetivo.quantidade,
            intolerancia_id: efetivo.intolerancia_id
          });
        } else {
          // Criar novo efetivo
          await EfetivosService.criarPorUnidade(unidadeEscolarId, {
            tipo_efetivo: efetivo.tipo_efetivo,
            quantidade: efetivo.quantidade,
            intolerancia_id: efetivo.intolerancia_id,
            periodo_refeicao_id: efetivo.periodo_refeicao_id
          });
        }
      }

      toast.success('Efetivos salvos com sucesso!');
      onSave();
      onClose();
    } catch (error) {
      console.error('Erro ao salvar efetivos:', error);
      toast.error('Erro ao salvar efetivos');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setEfetivos([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Editar Efetivos - ${periodoRefeicao?.nome}`}
      size="full"
    >
      <div className="space-y-6 max-h-[75vh] overflow-y-auto">
        {/* Informações do Período */}
        {periodoRefeicao && (
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="text-sm font-semibold text-blue-700 mb-2">
              📅 Período de Refeição
            </h3>
            <p className="text-sm text-blue-600">
              <strong>Nome:</strong> {periodoRefeicao.nome}
            </p>
            {periodoRefeicao.descricao && (
              <p className="text-sm text-blue-600">
                <strong>Descrição:</strong> {periodoRefeicao.descricao}
              </p>
            )}
          </div>
        )}

        {/* Tabela de Efetivos */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800">
              Efetivos do Período
            </h3>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
            </div>
          ) : (
            <Table>
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quantidade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Intolerância
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {efetivos.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                      Nenhum efetivo cadastrado para este período
                    </td>
                  </tr>
                ) : (
                  efetivos.map((efetivo, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          efetivo.tipo_efetivo === 'PADRAO' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {efetivo.tipo_efetivo === 'PADRAO' ? 'Padrão' : 'NAE'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Input
                          type="number"
                          value={efetivo.quantidade}
                          onChange={(e) => handleQuantidadeChange(index, e.target.value)}
                          min="0"
                          className="w-20"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {efetivo.tipo_efetivo === 'NAE' ? (
                          <select
                            value={efetivo.intolerancia_id || ''}
                            onChange={(e) => handleIntoleranciaChange(index, e.target.value)}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          >
                            <option value="">Selecione a intolerância</option>
                            {intolerancias.map(intolerancia => (
                              <option key={intolerancia.id} value={intolerancia.id}>
                                {intolerancia.nome}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <span className="text-gray-500">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          onClick={() => handleRemoveEfetivo(index)}
                          variant="ghost"
                          size="xs"
                          className="text-red-600 hover:text-red-800 hover:bg-red-50"
                        >
                          <FaTrash className="text-sm" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          )}
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            <FaSave className="text-sm" />
            {saving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default EfetivosEditModal;
