import React from 'react';
import { FaBox } from 'react-icons/fa';
import { Input } from '../../ui';
import SearchableSelect from '../../ui/SearchableSelect';
import FormSection from './FormSection';

const InformacoesProduto = ({
  register,
  watch,
  setValue,
  errors,
  fornecedores,
  viewMode
}) => {
  return (
    <FormSection
      icon={FaBox}
      title="Informações do Produto"
      description="Dados do produto a ser homologado"
    >
      <div className="space-y-2">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {/* Coluna 1 */}
          <div className="space-y-2">
            <div>
              <Input
                label="Marca *"
                type="text"
                {...register('marca', { required: 'Marca é obrigatória' })}
                error={errors.marca?.message}
                disabled={viewMode}
                placeholder="Digite a marca"
                style={{ textTransform: 'uppercase' }}
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  setValue('marca', e.target.value, { shouldValidate: true });
                }}
              />
            </div>

            <div>
              <Input
                label="Fabricante *"
                type="text"
                {...register('fabricante', { required: 'Fabricante é obrigatório' })}
                error={errors.fabricante?.message}
                disabled={viewMode}
                placeholder="Digite o fabricante"
                style={{ textTransform: 'uppercase' }}
                onInput={(e) => {
                  e.target.value = e.target.value.toUpperCase();
                  setValue('fabricante', e.target.value, { shouldValidate: true });
                }}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Fornecedor <span className="text-red-500">*</span>
              </label>
              <SearchableSelect
                value={watch('fornecedor_id') || ''}
                onChange={(value) => setValue('fornecedor_id', value, { shouldValidate: true })}
                options={fornecedores?.map(f => ({ value: f.id, label: f.razao_social || f.nome_fantasia })) || []}
                disabled={viewMode}
                placeholder="Selecione o fornecedor"
                error={errors.fornecedor_id?.message}
              />
              {errors.fornecedor_id && <p className="text-red-500 text-xs mt-1">{errors.fornecedor_id.message}</p>}
            </div>

            <div>
              <Input
                label="Unidade de Medida"
                type="text"
                {...register('unidade_medida_nome')}
                disabled={true}
                readOnly={true}
                className="bg-gray-100"
                placeholder="Preenchido automaticamente do produto genérico"
              />
              <input type="hidden" {...register('unidade_medida_id')} />
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

        {/* Linha com Lote e Datas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
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

          <div>
            <Input
              label="Data de Fabricação *"
              type="date"
              max={new Date().toISOString().split('T')[0]}
              {...register('fabricacao', { 
                required: 'Data de fabricação é obrigatória',
                validate: (value) => {
                  if (!value) return true;
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const dataFabricacao = new Date(value);
                  dataFabricacao.setHours(0, 0, 0, 0);
                  if (dataFabricacao > hoje) {
                    return 'Data de fabricação não pode ser superior à data atual';
                  }
                  return true;
                }
              })}
              error={errors.fabricacao?.message}
              disabled={viewMode}
            />
          </div>

          <div>
            <Input
              label="Data de Validade *"
              type="date"
              min={new Date().toISOString().split('T')[0]}
              {...register('validade', { 
                required: 'Data de validade é obrigatória',
                validate: (value) => {
                  if (!value) return true;
                  const hoje = new Date();
                  hoje.setHours(0, 0, 0, 0);
                  const dataValidade = new Date(value);
                  dataValidade.setHours(0, 0, 0, 0);
                  if (dataValidade < hoje) {
                    return 'Data de validade não pode ser anterior à data atual';
                  }
                  return true;
                }
              })}
              error={errors.validade?.message}
              disabled={viewMode}
            />
          </div>
        </div>
      </div>
    </FormSection>
  );
};

export default InformacoesProduto;

