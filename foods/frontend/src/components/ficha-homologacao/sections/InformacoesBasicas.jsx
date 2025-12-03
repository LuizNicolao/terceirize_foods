import React from 'react';
import { FaInfoCircle } from 'react-icons/fa';
import { Input } from '../../ui';
import SearchableSelect from '../../ui/SearchableSelect';
import FormSection from './FormSection';

const InformacoesBasicas = ({
  register,
  watch,
  setValue,
  errors,
  nomeGenericos,
  usuarios,
  user,
  viewMode,
  tipoSelecionado,
  fichaHomologacao,
  onFileChange
}) => {
  return (
    <FormSection
      icon={FaInfoCircle}
      title="Informações Básicas"
      description="Dados principais da ficha de homologação"
    >
      <div className="space-y-2">
        {/* Linha 1: Produto Genérico | Unidade de Medida */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome Genérico do Produto <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={watch('produto_generico_id') || ''}
              onChange={(value) => setValue('produto_generico_id', value, { shouldValidate: true })}
              options={nomeGenericos?.map(ng => ({ value: ng.id, label: `${ng.codigo} - ${ng.nome}` })) || []}
              disabled={viewMode}
              placeholder="Selecione o nome genérico"
              error={errors.produto_generico_id?.message}
            />
            {errors.produto_generico_id && <p className="text-red-500 text-xs mt-1">{errors.produto_generico_id.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Unidade de Medida
            </label>
            <input
              type="text"
              {...register('unidade_medida_nome')}
              disabled={true}
              readOnly={true}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              placeholder="Preenchido automaticamente do produto genérico"
            />
            <input type="hidden" {...register('unidade_medida_id')} />
          </div>
        </div>

        {/* Linha 2: Data da Análise | Avaliador */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data da Análise <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              {...register('data_analise', { required: 'Data de análise é obrigatória' })}
              disabled={viewMode}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {errors.data_analise && <p className="text-red-500 text-xs mt-1">{errors.data_analise.message}</p>}
          </div>

          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Avaliador <span className="text-red-500">*</span>
            </label>
            <SearchableSelect
              value={watch('avaliador_id') || ''}
              onChange={(value) => setValue('avaliador_id', value, { shouldValidate: true })}
              options={usuarios?.map(u => ({ value: u.id, label: u.nome || u.email })) || []}
              disabled={viewMode}
              placeholder="Selecione o avaliador"
              error={errors.avaliador_id?.message}
            />
            {errors.avaliador_id && <p className="text-red-500 text-xs mt-1">{errors.avaliador_id.message}</p>}
          </div>
        </div>

        {/* Linha 3: Tipo | PDF (se Reavaliação) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <div className="flex flex-col">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('tipo', { required: 'Tipo é obrigatório' })}
              disabled={viewMode}
              className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="NOVO_PRODUTO">Novo Produto</option>
              <option value="REAVALIACAO">Reavaliação</option>
            </select>
            {errors.tipo && <p className="text-red-500 text-xs mt-1">{errors.tipo.message}</p>}
          </div>

          {/* Campo de PDF da Avaliação Antiga - apenas para Reavaliação */}
          {tipoSelecionado === 'REAVALIACAO' && (
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                PDF da Avaliação Antiga <span className="text-red-500">*</span>
              </label>
              <input
                type="file"
                accept=".pdf,application/pdf"
                {...register('pdf_avaliacao_antiga', { 
                  required: tipoSelecionado === 'REAVALIACAO' ? 'PDF da avaliação antiga é obrigatório para reavaliação' : false
                })}
                disabled={viewMode}
                className="w-full px-4 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
              />
              {errors.pdf_avaliacao_antiga && <p className="text-red-500 text-xs mt-1">{errors.pdf_avaliacao_antiga.message}</p>}
              {fichaHomologacao?.pdf_avaliacao_antiga && (
                <p className="text-xs text-gray-500 mt-1">Arquivo atual: {fichaHomologacao.pdf_avaliacao_antiga}</p>
              )}
            </div>
          )}
        </div>
      </div>
    </FormSection>
  );
};

export default InformacoesBasicas;

