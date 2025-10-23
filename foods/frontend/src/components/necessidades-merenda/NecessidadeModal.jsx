import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaTimes, FaSchool, FaCalendarAlt, FaBox, FaUtensils } from 'react-icons/fa';
import { Button, Input, Modal, SearchableSelect } from '../ui';
import NecessidadesMerendaService from '../../services/necessidadesMerenda';
import UnidadesEscolaresService from '../../services/unidadesEscolares';
import toast from 'react-hot-toast';

const NecessidadeModal = ({ 
  isOpen, 
  onClose, 
  onSubmit,
  necessidade,
  isViewMode = false,
  saving = false
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [unidadesEscolares, setUnidadesEscolares] = useState([]);
  const [produtos, setProdutos] = useState([]);
  const [receitas, setReceitas] = useState([]);
  const [cardapios, setCardapios] = useState([]);
  const [loading, setLoading] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    if (isOpen) {
      loadInitialData();
      if (necessidade) {
        // Preencher formulário com dados da necessidade
        Object.keys(necessidade).forEach(key => {
          setValue(key, necessidade[key]);
        });
      } else {
        reset();
      }
    }
  }, [isOpen, necessidade, setValue, reset]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [unidadesResponse, produtosResponse, receitasResponse, cardapiosResponse] = await Promise.all([
        UnidadesEscolaresService.listar(),
        NecessidadesMerendaService.buscarProdutos(),
        NecessidadesMerendaService.buscarReceitas(),
        NecessidadesMerendaService.buscarCardapios()
      ]);

      if (unidadesResponse.success) {
        setUnidadesEscolares(unidadesResponse.data || []);
      }

      if (produtosResponse.success) {
        setProdutos(produtosResponse.data || []);
      }

      if (receitasResponse.success) {
        setReceitas(receitasResponse.data || []);
      }

      if (cardapiosResponse.success) {
        setCardapios(cardapiosResponse.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar dados iniciais:', error);
      toast.error('Erro ao carregar dados do formulário');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={necessidade ? (isViewMode ? '👁️ Visualizar Necessidade' : '✏️ Editar Necessidade') : '➕ Nova Necessidade'}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Unidade Escolar */}
          <div className="form-group">
            <label className="form-label">
              <FaSchool className="mr-2" />
              Unidade Escolar *
            </label>
            <SearchableSelect
              options={unidadesEscolares.map(ue => ({
                value: ue.id,
                label: ue.nome_escola
              }))}
              value={watch('unidade_escolar_id')}
              onChange={(value) => setValue('unidade_escolar_id', value)}
              placeholder="Selecione uma unidade escolar"
              disabled={isViewMode}
              error={errors.unidade_escolar_id?.message}
            />
          </div>

          {/* Produto */}
          <div className="form-group">
            <label className="form-label">
              <FaBox className="mr-2" />
              Produto *
            </label>
            <SearchableSelect
              options={produtos.map(produto => ({
                value: produto.id,
                label: produto.nome
              }))}
              value={watch('produto_id')}
              onChange={(value) => setValue('produto_id', value)}
              placeholder="Selecione um produto"
              disabled={isViewMode}
              error={errors.produto_id?.message}
            />
          </div>

          {/* Receita */}
          <div className="form-group">
            <label className="form-label">
              <FaUtensils className="mr-2" />
              Receita *
            </label>
            <SearchableSelect
              options={Array.isArray(receitas) ? receitas.map(receita => ({
                value: receita.id,
                label: receita.nome || receita.codigo
              })) : []}
              value={watch('receita_id')}
              onChange={(value) => setValue('receita_id', value)}
              placeholder="Selecione uma receita"
              disabled={isViewMode}
              error={errors.receita_id?.message}
            />
          </div>

          {/* Cardápio */}
          <div className="form-group">
            <label className="form-label">
              <FaCalendarAlt className="mr-2" />
              Cardápio *
            </label>
            <SearchableSelect
              options={cardapios.map(cardapio => ({
                value: cardapio.id,
                label: `${cardapio.nome} - ${new Date(cardapio.data_inicio).toLocaleDateString('pt-BR')}`
              }))}
              value={watch('cardapio_id')}
              onChange={(value) => setValue('cardapio_id', value)}
              placeholder="Selecione um cardápio"
              disabled={isViewMode}
              error={errors.cardapio_id?.message}
            />
          </div>

          {/* Data */}
          <div className="form-group">
            <label className="form-label">
              <FaCalendarAlt className="mr-2" />
              Data *
            </label>
            <Input
              type="date"
              {...register('data', { required: 'Data é obrigatória' })}
              disabled={isViewMode}
              error={errors.data?.message}
            />
          </div>

          {/* Quantidade Total */}
          <div className="form-group">
            <label className="form-label">Quantidade Total *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('quantidade_total', { 
                required: 'Quantidade total é obrigatória',
                min: { value: 0, message: 'Quantidade deve ser positiva' }
              })}
              disabled={isViewMode}
              error={errors.quantidade_total?.message}
            />
          </div>

          {/* Quantidade Per Capita */}
          <div className="form-group">
            <label className="form-label">Quantidade Per Capita *</label>
            <Input
              type="number"
              step="0.01"
              min="0"
              {...register('quantidade_per_capita', { 
                required: 'Quantidade per capita é obrigatória',
                min: { value: 0, message: 'Quantidade deve ser positiva' }
              })}
              disabled={isViewMode}
              error={errors.quantidade_per_capita?.message}
            />
          </div>

          {/* Efetivo Padrão */}
          <div className="form-group">
            <label className="form-label">Efetivo Padrão</label>
            <Input
              type="number"
              min="0"
              {...register('efetivo_padrao', { 
                min: { value: 0, message: 'Efetivo deve ser positivo' }
              })}
              disabled={isViewMode}
              error={errors.efetivo_padrao?.message}
            />
          </div>

          {/* Efetivo NAE */}
          <div className="form-group">
            <label className="form-label">Efetivo NAE</label>
            <Input
              type="number"
              min="0"
              {...register('efetivo_nae', { 
                min: { value: 0, message: 'Efetivo deve ser positivo' }
              })}
              disabled={isViewMode}
              error={errors.efetivo_nae?.message}
            />
          </div>

          {/* Status */}
          <div className="form-group">
            <label className="form-label">Status</label>
            <SearchableSelect
              options={[
                { value: 'pendente', label: 'Pendente' },
                { value: 'aprovado', label: 'Aprovado' },
                { value: 'rejeitado', label: 'Rejeitado' },
                { value: 'ativo', label: 'Ativo' }
              ]}
              value={watch('status')}
              onChange={(value) => setValue('status', value)}
              placeholder="Selecione um status"
              disabled={isViewMode}
              error={errors.status?.message}
            />
          </div>
        </div>

        {/* Observações */}
        <div className="form-group">
          <label className="form-label">Observações</label>
          <textarea
            {...register('observacoes')}
            rows={3}
            className="form-input"
            disabled={isViewMode}
            placeholder="Observações sobre a necessidade..."
          />
        </div>

        {/* Botões de Ação */}
        <div className="flex justify-end space-x-3 pt-6 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={saving}
          >
            <FaTimes className="mr-2" />
            {isViewMode ? 'Fechar' : 'Cancelar'}
          </Button>
          
          {!isViewMode && (
            <Button
              type="submit"
              disabled={saving || loading}
            >
              <FaSave className="mr-2" />
              {saving ? 'Salvando...' : (necessidade ? 'Atualizar' : 'Criar')}
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default NecessidadeModal;
