import React from 'react';
import { FaClipboardCheck } from 'react-icons/fa';
import { Input } from '../../ui';
import FormSection from './FormSection';

const avaliacaoOptions = ['BOM', 'REGULAR', 'RUIM'];

const AvaliacoesQualidade = ({
  register,
  errors,
  viewMode,
  watch,
  setValue
}) => {
  return (
    <FormSection
      icon={FaClipboardCheck}
      title="Avaliações de Qualidade"
      description="Avaliação sensorial e física do produto"
    >
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="text-left py-2 px-3 text-xs font-semibold text-gray-700 border-r border-gray-300">
                Critério
              </th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700 border-r border-gray-300 min-w-[60px]">
                Bom
              </th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700 border-r border-gray-300 min-w-[60px]">
                Regular
              </th>
              <th className="text-center py-2 px-2 text-xs font-semibold text-gray-700 border-r border-gray-300 min-w-[60px]">
                Ruim
              </th>
              <th className="text-center py-2 px-3 text-xs font-semibold text-gray-700 min-w-[120px]">
                Valor (kg) / Observação
              </th>
            </tr>
          </thead>
          <tbody>
            {/* Peso */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Peso <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option, idx) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('peso', { required: 'Peso é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="text"
                  value={watch('peso_valor') ? (() => {
                    const valor = parseFloat(watch('peso_valor'));
                    // Se for número inteiro, mostrar sem decimais; caso contrário, mostrar até 3 casas decimais sem zeros à direita
                    return valor % 1 === 0 ? valor.toString() : valor.toFixed(3).replace(/\.?0+$/, '');
                  })() : ''}
                  disabled={true}
                  readOnly={true}
                  placeholder="Preenchido automaticamente"
                  className="w-full text-sm py-1 px-2 bg-gray-100"
                />
                <input type="hidden" {...register('peso_valor')} />
              </td>
            </tr>
            {errors.peso && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.peso.message}</p>
                </td>
              </tr>
            )}

            {/* Peso Cru */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Peso Cru <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('peso_cru', { required: 'Peso cru é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="number"
                  step="0.001"
                  {...register('peso_cru_valor', { 
                    min: { value: 0, message: 'Peso cru deve ser positivo' }
                  })}
                  error={errors.peso_cru_valor?.message}
                  disabled={viewMode}
                  placeholder="0.000"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.peso_cru && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.peso_cru.message}</p>
                </td>
              </tr>
            )}

            {/* Peso Cozido */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Peso Cozido <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('peso_cozido', { required: 'Peso cozido é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="number"
                  step="0.001"
                  {...register('peso_cozido_valor', { 
                    min: { value: 0, message: 'Peso cozido deve ser positivo' }
                  })}
                  error={errors.peso_cozido_valor?.message}
                  disabled={viewMode}
                  placeholder="0.000"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.peso_cozido && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.peso_cozido.message}</p>
                </td>
              </tr>
            )}

            {/* Fator de Cocção */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Fator de Cocção <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('fator_coccao', { required: 'Fator de cocção é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="number"
                  step="0.01"
                  {...register('fator_coccao_valor', { 
                    min: { value: 0, message: 'Fator de cocção deve ser positivo' }
                  })}
                  error={errors.fator_coccao_valor?.message}
                  disabled={true}
                  readOnly={true}
                  placeholder="Calculado automaticamente"
                  className="w-full text-sm py-1 px-2 bg-gray-100"
                />
              </td>
            </tr>
            {errors.fator_coccao && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.fator_coccao.message}</p>
                </td>
              </tr>
            )}

            {/* Cor */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Cor <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('cor', { required: 'Cor é obrigatória' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="text"
                  {...register('cor_observacao', { 
                    maxLength: { value: 100, message: 'Observação deve ter no máximo 100 caracteres' }
                  })}
                  error={errors.cor_observacao?.message}
                  disabled={viewMode}
                  placeholder="Observação breve"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.cor && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.cor.message}</p>
                </td>
              </tr>
            )}

            {/* Odor */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Odor <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('odor', { required: 'Odor é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="text"
                  {...register('odor_observacao', { 
                    maxLength: { value: 100, message: 'Observação deve ter no máximo 100 caracteres' }
                  })}
                  error={errors.odor_observacao?.message}
                  disabled={viewMode}
                  placeholder="Observação breve"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.odor && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.odor.message}</p>
                </td>
              </tr>
            )}

            {/* Sabor */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Sabor <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('sabor', { required: 'Sabor é obrigatório' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="text"
                  {...register('sabor_observacao', { 
                    maxLength: { value: 100, message: 'Observação deve ter no máximo 100 caracteres' }
                  })}
                  error={errors.sabor_observacao?.message}
                  disabled={viewMode}
                  placeholder="Observação breve"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.sabor && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.sabor.message}</p>
                </td>
              </tr>
            )}

            {/* Aparência */}
            <tr className="border-b border-gray-200 hover:bg-gray-50">
              <td className="py-2 px-3 text-sm font-medium text-gray-700 border-r border-gray-200">
                Aparência <span className="text-red-500">*</span>
              </td>
              {avaliacaoOptions.map((option) => (
                <td key={option} className="text-center py-2 px-2 border-r border-gray-200">
                  <input
                    type="radio"
                    value={option}
                    {...register('aparencia', { required: 'Aparência é obrigatória' })}
                    disabled={viewMode}
                    className="w-4 h-4 text-green-600 focus:ring-green-500 cursor-pointer"
                  />
                </td>
              ))}
              <td className="py-2 px-3">
                <Input
                  type="text"
                  {...register('aparencia_observacao', { 
                    maxLength: { value: 100, message: 'Observação deve ter no máximo 100 caracteres' }
                  })}
                  error={errors.aparencia_observacao?.message}
                  disabled={viewMode}
                  placeholder="Observação breve"
                  className="w-full text-sm py-1 px-2"
                />
              </td>
            </tr>
            {errors.aparencia && (
              <tr>
                <td colSpan="5" className="px-3 py-1">
                  <p className="text-red-500 text-xs">{errors.aparencia.message}</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </FormSection>
  );
};

export default AvaliacoesQualidade;

