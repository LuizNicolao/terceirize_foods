import React from 'react';
import { FaFileAlt, FaCamera } from 'react-icons/fa';
import FormSection from './FormSection';

const ConclusaoDocumentacao = ({
  register,
  errors,
  viewMode,
  fichaHomologacao
}) => {
  return (
    <FormSection
      icon={FaFileAlt}
      title="Conclusão e Documentação"
      description="Resultado final e documentação fotográfica"
    >
      <div className="space-y-2">
        {/* Fotos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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
              Foto do Produto Cru <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('foto_produto_cru', { required: 'Foto do produto cru é obrigatória' })}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.foto_produto_cru && <p className="text-red-500 text-xs mt-1">{errors.foto_produto_cru.message}</p>}
            {fichaHomologacao?.foto_produto_cru && (
              <p className="text-xs text-gray-500 mt-1">Arquivo atual: {fichaHomologacao.foto_produto_cru}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Foto do Produto Cozido <span className="text-red-500">*</span>
            </label>
            <input
              type="file"
              accept="image/*"
              {...register('foto_produto_cozido', { required: 'Foto do produto cozido é obrigatória' })}
              disabled={viewMode}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500"
            />
            {errors.foto_produto_cozido && <p className="text-red-500 text-xs mt-1">{errors.foto_produto_cozido.message}</p>}
            {fichaHomologacao?.foto_produto_cozido && (
              <p className="text-xs text-gray-500 mt-1">Arquivo atual: {fichaHomologacao.foto_produto_cozido}</p>
            )}
          </div>
        </div>

        {/* Conclusão */}
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

        {/* Resultado Final */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Resultado Final <span className="text-red-500">*</span>
          </label>
          <div className="flex flex-wrap gap-4">
            {[
              { value: 'APROVADO', label: 'Aprovado' },
              { value: 'APROVADO_COM_RESSALVAS', label: 'Aprovado com Ressalvas' },
              { value: 'REPROVADO', label: 'Reprovado' }
            ].map(option => (
              <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  value={option.value}
                  {...register('resultado_final', { required: 'Resultado final é obrigatório' })}
                  disabled={viewMode}
                  className="w-4 h-4 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
          {errors.resultado_final && <p className="text-red-500 text-xs mt-1">{errors.resultado_final.message}</p>}
        </div>
      </div>
    </FormSection>
  );
};

export default ConclusaoDocumentacao;

