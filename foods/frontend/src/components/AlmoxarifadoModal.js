import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaEdit, FaTrash, FaEye } from 'react-icons/fa';
import { Button, Input, Table } from './ui';
import LoadingSpinner from './LoadingSpinner';
import filiaisService from '../services/filiais';
import api from '../services/api';
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
  const [showItensModal, setShowItensModal] = useState(false);
  const [selectedAlmoxarifado, setSelectedAlmoxarifado] = useState(null);
  const [itensAlmoxarifado, setItensAlmoxarifado] = useState([]);
  const [loadingItens, setLoadingItens] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [selectedProduto, setSelectedProduto] = useState(null);
  const [quantidadeProduto, setQuantidadeProduto] = useState('');

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

  // Carregar produtos
  const loadProdutos = async () => {
    try {
      const response = await api.get('/produtos');
      setProdutos(response.data.data || []);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    }
  };

  // Carregar itens do almoxarifado
  const loadItensAlmoxarifado = async (almoxarifadoId) => {
    setLoadingItens(true);
    try {
      const response = await filiaisService.listarItensAlmoxarifado(almoxarifadoId);
      if (response.success) {
        setItensAlmoxarifado(response.data || []);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao carregar itens');
    } finally {
      setLoadingItens(false);
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
  const handleDelete = async (almoxarifado) => {
    if (!window.confirm('Deseja excluir este almoxarifado?')) return;

    try {
      const response = await filiaisService.excluirAlmoxarifado(almoxarifado.id);
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

  // Abrir modal de itens
  const handleOpenItensModal = (almoxarifado) => {
    setSelectedAlmoxarifado(almoxarifado);
    setShowItensModal(true);
    loadItensAlmoxarifado(almoxarifado.id);
    loadProdutos();
  };

  // Adicionar produto ao almoxarifado
  const handleAddProduto = async () => {
    if (!selectedProduto || !quantidadeProduto) {
      toast.error('Selecione um produto e informe a quantidade');
      return;
    }

    try {
      const response = await filiaisService.adicionarItemAlmoxarifado(
        selectedAlmoxarifado.id, 
        {
          produto_id: selectedProduto.id,
          quantidade: parseFloat(quantidadeProduto)
        }
      );
      
      if (response.success) {
        toast.success('Produto adicionado ao almoxarifado!');
        setSelectedProduto(null);
        setQuantidadeProduto('');
        loadItensAlmoxarifado(selectedAlmoxarifado.id);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao adicionar produto');
    }
  };

  // Remover produto do almoxarifado
  const handleRemoveProduto = async (itemId) => {
    if (!window.confirm('Deseja remover este produto do almoxarifado?')) return;

    try {
      const response = await filiaisService.removerItemAlmoxarifado(selectedAlmoxarifado.id, itemId);
      if (response.success) {
        toast.success('Produto removido do almoxarifado!');
        loadItensAlmoxarifado(selectedAlmoxarifado.id);
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error('Erro ao remover produto');
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
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleOpenItensModal(almox)}
                              title="Ver Itens"
                            >
                              <FaEye />
                            </Button>
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
      </div>

      {/* Modal de Itens */}
      {showItensModal && selectedAlmoxarifado && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                Itens do Almoxarifado: {selectedAlmoxarifado.nome}
              </h3>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setShowItensModal(false)}
              >
                Fechar
              </Button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {/* Adicionar Produto */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="text-md font-medium mb-3">Adicionar Produto</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Produto
                    </label>
                    <select
                      value={selectedProduto?.id || ''}
                      onChange={(e) => {
                        const produto = produtos.find(p => p.id === parseInt(e.target.value));
                        setSelectedProduto(produto);
                      }}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="">Selecione um produto...</option>
                      {produtos.map(produto => (
                        <option key={produto.id} value={produto.id}>
                          {produto.nome}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Quantidade
                    </label>
                    <Input
                      type="number"
                      step="0.001"
                      placeholder="0.000"
                      value={quantidadeProduto}
                      onChange={(e) => setQuantidadeProduto(e.target.value)}
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={handleAddProduto}
                      disabled={!selectedProduto || !quantidadeProduto}
                    >
                      Adicionar
                    </Button>
                  </div>
                </div>
              </div>

              {/* Lista de Itens */}
              <div>
                <h4 className="text-md font-medium mb-3">Produtos no Almoxarifado</h4>
                {loadingItens ? (
                  <LoadingSpinner inline={true} text="Carregando itens..." />
                ) : itensAlmoxarifado.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum produto cadastrado neste almoxarifado
                  </div>
                ) : (
                  <Table>
                    <Table.Header>
                      <Table.HeaderCell>Produto</Table.HeaderCell>
                      <Table.HeaderCell>Quantidade</Table.HeaderCell>
                      <Table.HeaderCell>Ações</Table.HeaderCell>
                    </Table.Header>
                    <Table.Body>
                      {itensAlmoxarifado.map(item => (
                        <Table.Row key={item.id}>
                          <Table.Cell>{item.produto_nome}</Table.Cell>
                          <Table.Cell>{item.quantidade}</Table.Cell>
                          <Table.Cell>
                            <Button
                              variant="ghost"
                              size="xs"
                              onClick={() => handleRemoveProduto(item.id)}
                              title="Remover"
                            >
                              <FaTrash />
                            </Button>
                          </Table.Cell>
                        </Table.Row>
                      ))}
                    </Table.Body>
                  </Table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AlmoxarifadoModal; 