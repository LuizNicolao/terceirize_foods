import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Input, Table, ConfirmModal } from '../ui';
import { LoadingSpinner } from '../ui';
import FoodsApiService from '../../services/FoodsApiService';
import toast from 'react-hot-toast';

const AlmoxarifadoContent = ({ 
  filialId, 
  viewMode = false 
}) => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState(null);
  const [showConfirmDeleteModal, setShowConfirmDeleteModal] = useState(false);
  const [almoxarifadoToDelete, setAlmoxarifadoToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Carregar almoxarifados
  const loadAlmoxarifados = async () => {
    if (!filialId) return;
    
    setLoading(true);
    try {
      const response = await FoodsApiService.getAlmoxarifadosPorFilial(filialId);
      if (response.success) {
        const almoxarifadosData = response.data || [];
        setAlmoxarifados(Array.isArray(almoxarifadosData) ? almoxarifadosData : []);
      } else {
        toast.error(response.error);
        setAlmoxarifados([]);
      }
    } catch (error) {
      toast.error('Erro ao carregar almoxarifados');
      setAlmoxarifados([]);
    } finally {
      setLoading(false);
    }
  };

  // Salvar almoxarifado
  const onSubmit = async (data) => {
    try {
      const payload = {
        ...data,
        status: parseInt(data.status)
      };

      if (editingAlmoxarifado) {
        const response = await FoodsApiService.atualizarAlmoxarifado(editingAlmoxarifado.id, payload);
        if (response.success) {
          toast.success('Almoxarifado atualizado!');
        } else {
          toast.error(response.error);
        }
      } else {
        const response = await FoodsApiService.criarAlmoxarifado(filialId, payload);
        if (response.success) {
          toast.success('Almoxarifado criado!');
        } else {
          toast.error(response.error);
        }
      }
      
      setShowForm(false);
      setEditingAlmoxarifado(null);
      reset();
      loadAlmoxarifados();
    } catch (error) {
      toast.error('Erro ao salvar almoxarifado');
    }
  };

  // Excluir almoxarifado
  const handleDelete = async (almoxarifado) => {
    setAlmoxarifadoToDelete(almoxarifado);
    setShowConfirmDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!almoxarifadoToDelete) return;

    try {
      const response = await FoodsApiService.excluirAlmoxarifado(almoxarifadoToDelete.id);
      if (response.success) {
        toast.success('Almoxarifado excluído!');
        loadAlmoxarifados();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir almoxarifado');
    }
  };

  // Editar almoxarifado
  const handleEdit = (almoxarifado) => {
    setEditingAlmoxarifado(almoxarifado);
    reset(almoxarifado);
    setShowForm(true);
  };

  // Novo almoxarifado
  const handleNew = () => {
    setEditingAlmoxarifado(null);
    reset();
    setShowForm(true);
  };

  useEffect(() => {
    if (filialId) {
      loadAlmoxarifados();
    }
  }, [filialId]);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">Almoxarifados da Filial</h3>
        {!viewMode && (
          <Button
            variant="primary"
            size="sm"
            onClick={handleNew}
          >
            <FaPlus className="mr-1" />
            Novo Almoxarifado
          </Button>
        )}
      </div>

      {/* Content */}
      <div>
        {showForm ? (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="text-md font-medium mb-4">
              {editingAlmoxarifado ? 'Editar Almoxarifado' : 'Novo Almoxarifado'}
            </h4>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome *
                  </label>
                  <Input
                    type="text"
                    placeholder="Nome do almoxarifado"
                    {...register('nome', { required: 'Nome é obrigatório' })}
                    error={errors.nome?.message}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    {...register('status', { required: 'Status é obrigatório' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  >
                    <option value="1">Ativo</option>
                    <option value="0">Inativo</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => {
                    setShowForm(false);
                    setEditingAlmoxarifado(null);
                    reset();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary">
                  {editingAlmoxarifado ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            {loading ? (
              <LoadingSpinner inline={true} text="Carregando almoxarifados..." />
            ) : almoxarifados.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum almoxarifado cadastrado para esta filial
              </div>
            ) : (
              <Table>
                <Table.Header>
                  <Table.HeaderCell>Nome</Table.HeaderCell>
                  <Table.HeaderCell>Status</Table.HeaderCell>
                  <Table.HeaderCell>Ações</Table.HeaderCell>
                </Table.Header>
                <Table.Body>
                  {almoxarifados.map(almox => (
                    <Table.Row key={almox.id}>
                      <Table.Cell>{almox.nome}</Table.Cell>
                      <Table.Cell>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          almox.status === 1 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {almox.status === 1 ? 'Ativo' : 'Inativo'}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex gap-2">
                          {!viewMode && (
                            <>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleEdit(almox)}
                                title="Editar"
                              >
                                <FaEdit />
                              </Button>
                              <Button
                                variant="ghost"
                                size="xs"
                                onClick={() => handleDelete(almox)}
                                title="Excluir"
                              >
                                <FaTrash />
                              </Button>
                            </>
                          )}
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )}
          </div>
        )}
      </div>

      {/* Modal de Confirmação para Excluir Almoxarifado */}
      <ConfirmModal
        isOpen={showConfirmDeleteModal}
        onClose={() => setShowConfirmDeleteModal(false)}
        onConfirm={handleConfirmDelete}
        title="Excluir Almoxarifado"
        message="Deseja excluir este almoxarifado?"
        confirmText="Excluir"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default AlmoxarifadoContent;
