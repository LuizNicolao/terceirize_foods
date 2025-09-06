import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { Button, Input, Table, ConfirmModal } from '../ui';
import { LoadingSpinner } from '../ui';
import filiaisService from '../../services/filiais';
import toast from 'react-hot-toast';

const AlmoxarifadoModal = ({ 
  filialId, 
  isOpen, 
  onClose, 
  viewMode = false 
}) => {
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingAlmoxarifado, setEditingAlmoxarifado] = useState(null);
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);
  const [almoxarifadoToDelete, setAlmoxarifadoToDelete] = useState(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  // Carregar almoxarifados
  const loadAlmoxarifados = async () => {
    if (!filialId) return;
    
    setLoading(true);
    try {
      const response = await filiaisService.listarAlmoxarifados(filialId);
      if (response.success) {
        setAlmoxarifados(response.data || []);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar almoxarifados');
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
        const response = await filiaisService.atualizarAlmoxarifado(editingAlmoxarifado.id, payload);
        if (response.success) {
          toast.success('Almoxarifado atualizado!');
        } else {
          toast.error(response.error);
        }
      } else {
        const response = await filiaisService.criarAlmoxarifado(filialId, payload);
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
  const handleDelete = (almoxarifado) => {
    setAlmoxarifadoToDelete(almoxarifado);
    setShowDeleteConfirmModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!almoxarifadoToDelete) return;

    try {
      const response = await filiaisService.excluirAlmoxarifado(almoxarifadoToDelete.id);
      if (response.success) {
        toast.success('Almoxarifado excluído!');
        loadAlmoxarifados();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao excluir almoxarifado');
    } finally {
      setShowDeleteConfirmModal(false);
      setAlmoxarifadoToDelete(null);
    }
  };

  const handleCloseDeleteModal = () => {
    setShowDeleteConfirmModal(false);
    setAlmoxarifadoToDelete(null);
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
    if (isOpen && filialId) {
      loadAlmoxarifados();
    }
  }, [isOpen, filialId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Almoxarifados da Filial</h2>
          <div className="flex gap-2">
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
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
            >
              Fechar
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {showForm ? (
            <div>
              <h3 className="text-lg font-medium mb-4">
                {editingAlmoxarifado ? 'Editar Almoxarifado' : 'Novo Almoxarifado'}
              </h3>
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

        {/* Modal de Confirmação de Exclusão */}
        <ConfirmModal
          isOpen={showDeleteConfirmModal}
          onClose={handleCloseDeleteModal}
          onConfirm={handleConfirmDelete}
          title="Excluir Almoxarifado"
          message={`Tem certeza que deseja excluir o almoxarifado "${almoxarifadoToDelete?.nome}"?`}
          confirmText="Excluir"
          cancelText="Cancelar"
          type="danger"
        />
      </div>
    </div>
  );
};

export default AlmoxarifadoModal; 