/**
 * Modal para Ficha Homologação
 * Componente para criação e edição de fichas de homologação
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import SearchableSelect from '../ui/SearchableSelect';
import { useAuth } from '../../contexts/AuthContext';

const FichaHomologacaoModal = ({
  isOpen,
  onClose,
  fichaHomologacao,
  nomeGenericos,
  marcas,
  fornecedores,
  unidadesMedida,
  usuarios,
  onSubmit,
  viewMode = false
}) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (fichaHomologacao && isOpen) {
      // Preencher formulário com dados da ficha
      Object.keys(fichaHomologacao).forEach(key => {
        if (fichaHomologacao[key] !== null && fichaHomologacao[key] !== undefined) {
          setValue(key, fichaHomologacao[key]);
        }
      });
      // Se houver avaliador, usar o nome do avaliador
      if (fichaHomologacao.avaliador_nome) {
        setValue('avaliador_nome', fichaHomologacao.avaliador_nome);
      }
    } else if (!fichaHomologacao && isOpen) {
      // Resetar formulário para nova ficha
      reset();
      setValue('status', 'ativo');
      setValue('tipo', 'NOVO_PRODUTO');
      setValue('data_analise', new Date().toISOString().split('T')[0]);
      // Preencher avaliador automaticamente com usuário logado
      if (user) {
        setValue('avaliador_id', user.id);
        setValue('avaliador_nome', user.nome);
      }
    }
  }, [fichaHomologacao, isOpen, setValue, reset, user]);

  // Observar mudanças na marca para preencher fabricante
  const marcaId = watch('marca_id');
  useEffect(() => {
    if (marcaId && marcas) {
      const marcaSelecionada = marcas.find(m => m.id === parseInt(marcaId));
      if (marcaSelecionada && marcaSelecionada.fabricante) {
        setValue('fabricante', marcaSelecionada.fabricante);
      }
    }
  }, [marcaId, marcas, setValue]);

  // Processar envio do formulário
  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      produto_generico_id: data.produto_generico_id ? parseInt(data.produto_generico_id) : null,
      marca_id: data.marca_id ? parseInt(data.marca_id) : null,
      fornecedor_id: data.fornecedor_id ? parseInt(data.fornecedor_id) : null,
      unidade_medida_id: data.unidade_medida_id ? parseInt(data.unidade_medida_id) : null,
      avaliador_id: data.avaliador_id ? parseInt(data.avaliador_id) : null,
      fabricacao: data.fabricacao || null,
      validade: data.validade || null
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  const avaliacaoOptions = ['BOM', 'REGULAR', 'RUIM'];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : fichaHomologacao ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Ficha de Homologação' : fichaHomologacao ? 'Editar Ficha de Homologação' : 'Nova Ficha de Homologação'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações da ficha de homologação' : fichaHomologacao ? 'Editando informações da ficha de homologação' : 'Preencha as informações da nova ficha de homologação'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-6">
            
            {/* Card 1 - Informações Básicas */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
                Informações Básicas
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {/* Coluna 1 */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nome Genérico do Produto <span className="text-red-500">*</span>
                    </label>
                    <SearchableSelect
                      options={nomeGenericos?.map(ng => ({ value: ng.id, label: `${ng.codigo} - ${ng.nome}` })) || []}
                      {...register('produto_generico_id', { required: 'Nome genérico é obrigatório' })}
                      disabled={viewMode}
                      placeholder="Selecione o nome genérico"
                    />
                    {errors.produto_generico_id && <p className="text-red-500 text-xs mt-1">{errors.produto_generico_id.message}</p>}
                  </div>

                  <div>
                    <Input
                      label="Data da Análise *"
                      type="date"
                      {...register('data_analise', { required: 'Data de análise é obrigatória' })}
                      error={errors.data_analise?.message}
                      disabled={viewMode}
                    />
                  </div>
                </div>

                {/* Coluna 2 */}
                <div className="space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tipo <span className="text-red-500">*</span>
                    </label>
                    <select
                      {...register('tipo', { required: 'Tipo é obrigatório' })}
                      disabled={viewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    >
                      <option value="NOVO_PRODUTO">Novo Produto</option>
                      <option value="REAVALIACAO">Reavaliação</option>
                    </select>
                    {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message}</p>}
                  </div>

                  <div>
                    <Input
                      label="Avaliador"
                      type="text"
                      value={watch('avaliador_nome') || user?.nome || ''}
                      disabled={true}
                      readOnly={true}
                      className="bg-gray-100"
                    />
                    <input type="hidden" {...register('avaliador_id')} />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2 - Informações do Produto */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
                Informações do Produto
              </h3>
              
              <div className="space-y-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {/* Coluna 1 */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Marca <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={marcas?.map(m => ({ value: m.id, label: m.marca })) || []}
                        {...register('marca_id', { required: 'Marca é obrigatória' })}
                        disabled={viewMode}
                        placeholder="Selecione a marca"
                      />
                      {errors.marca_id && <p className="text-red-500 text-xs mt-1">{errors.marca_id.message}</p>}
                    </div>

                    <div>
                      <Input
                        label="Fabricante"
                        type="text"
                        {...register('fabricante')}
                        disabled={true}
                        readOnly={true}
                        className="bg-gray-100"
                        placeholder="Preenchido automaticamente"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Fornecedor <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={fornecedores?.map(f => ({ value: f.id, label: f.razao_social || f.nome_fantasia })) || []}
                        {...register('fornecedor_id', { required: 'Fornecedor é obrigatório' })}
                        disabled={viewMode}
                        placeholder="Selecione o fornecedor"
                      />
                      {errors.fornecedor_id && <p className="text-red-500 text-xs mt-1">{errors.fornecedor_id.message}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unidade de Medida <span className="text-red-500">*</span>
                      </label>
                      <SearchableSelect
                        options={unidadesMedida?.map(um => ({ value: um.id, label: `${um.sigla} - ${um.nome}` })) || []}
                        {...register('unidade_medida_id', { required: 'Unidade de medida é obrigatória' })}
                        disabled={viewMode}
                        placeholder="Selecione a unidade de medida"
                      />
                      {errors.unidade_medida_id && <p className="text-red-500 text-xs mt-1">{errors.unidade_medida_id.message}</p>}
                    </div>
                  </div>

                  {/* Coluna 2 */}
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Composição <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        {...register('composicao', { required: 'Composição é obrigatória' })}
                        disabled={viewMode}
                        rows={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                        placeholder="Digite a composição do produto"
                      />
                      {errors.composicao && <p className="text-red-500 text-xs mt-1">{errors.composicao.message}</p>}
                    </div>
                  </div>
                </div>

                {/* Linha com Lote e Datas na mesma linha */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <Input
                      label="Lote *"
                      type="text"
                      {...register('lote', { required: 'Lote é obrigatório' })}
                      error={errors.lote?.message}
                      disabled={viewMode}
                      placeholder="Digite o lote"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Input
                        label="Data de Fabricação *"
                        type="date"
                        {...register('fabricacao', { required: 'Data de fabricação é obrigatória' })}
                        error={errors.fabricacao?.message}
                        disabled={viewMode}
                      />
                    </div>

                    <div>
                      <Input
                        label="Data de Validade *"
                        type="date"
                        {...register('validade', { required: 'Data de validade é obrigatória' })}
                        error={errors.validade?.message}
                        disabled={viewMode}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3 - Avaliações de Qualidade */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
                Avaliações de Qualidade
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Coluna Esquerda */}
                <div className="space-y-3">
                  {[
                    { field: 'peso', label: 'Peso' },
                    { field: 'peso_cru', label: 'Peso Cru' },
                    { field: 'peso_cozido', label: 'Peso Cozido' },
                    { field: 'fator_coccao', label: 'Fator de Cocção' }
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 min-w-[120px]">{label} <span className="text-red-500">*</span></span>
                      <div className="flex gap-4">
                        {avaliacaoOptions.map(option => (
                          <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              value={option}
                              {...register(field, { required: `${label} é obrigatório` })}
                              disabled={viewMode}
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">
                              {option === 'BOM' ? 'Bom' : option === 'REGULAR' ? 'Regular' : 'Ruim'}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors[field] && <p className="text-red-500 text-xs ml-2">{errors[field].message}</p>}
                    </div>
                  ))}
                </div>

                {/* Coluna Direita */}
                <div className="space-y-3">
                  {[
                    { field: 'cor', label: 'Cor' },
                    { field: 'odor', label: 'Odor' },
                    { field: 'sabor', label: 'Sabor' },
                    { field: 'aparencia', label: 'Aparência' }
                  ].map(({ field, label }) => (
                    <div key={field} className="flex items-center gap-3">
                      <span className="text-sm font-medium text-gray-700 min-w-[120px]">{label} <span className="text-red-500">*</span></span>
                      <div className="flex gap-4">
                        {avaliacaoOptions.map(option => (
                          <label key={option} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="radio"
                              value={option}
                              {...register(field, { required: `${label} é obrigatório` })}
                              disabled={viewMode}
                              className="w-4 h-4 text-green-600 focus:ring-green-500"
                            />
                            <span className="text-sm text-gray-700">
                              {option === 'BOM' ? 'Bom' : option === 'REGULAR' ? 'Regular' : 'Ruim'}
                            </span>
                          </label>
                        ))}
                      </div>
                      {errors[field] && <p className="text-red-500 text-xs ml-2">{errors[field].message}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Card 4 - Conclusão e Documentação */}
            <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
              <h3 className="text-xs font-semibold text-gray-700 mb-2 pb-1 border-b-2 border-green-500">
                Conclusão e Documentação
              </h3>
              
              <div className="space-y-2">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Conclusão <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    {...register('conclusao', { required: 'Conclusão é obrigatória' })}
                    disabled={viewMode}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                    placeholder="Digite a conclusão da análise"
                  />
                  {errors.conclusao && <p className="text-red-500 text-xs mt-1">{errors.conclusao.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto da Embalagem <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      {...register('foto_embalagem', { required: 'Foto da embalagem é obrigatória' })}
                      disabled={viewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.foto_embalagem && <p className="text-red-500 text-xs mt-1">{errors.foto_embalagem.message}</p>}
                    {fichaHomologacao?.foto_embalagem && (
                      <p className="text-xs text-gray-500 mt-1">Arquivo atual: {fichaHomologacao.foto_embalagem}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Foto do Produto <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      {...register('foto_produto', { required: 'Foto do produto é obrigatória' })}
                      disabled={viewMode}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    {errors.foto_produto && <p className="text-red-500 text-xs mt-1">{errors.foto_produto.message}</p>}
                    {fichaHomologacao?.foto_produto && (
                      <p className="text-xs text-gray-500 mt-1">Arquivo atual: {fichaHomologacao.foto_produto}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Status (oculto ou em um lugar discreto) */}
            {!viewMode && (
              <div className="hidden">
                <select {...register('status')}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          {!viewMode && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                <FaSave className="mr-2" />
                {fichaHomologacao ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default FichaHomologacaoModal;
