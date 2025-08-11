import React from 'react';
import { useForm } from 'react-hook-form';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { Button, Input, Modal, Table } from '../ui';

const RotaModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  rota, 
  isViewMode = false,
  filiais = [],
  loadingFiliais = false,
  unidadesEscolares = [],
  loadingUnidades = false,
  showUnidades = false,
  totalUnidades = 0,
  onToggleUnidades
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (rota && isOpen) {
      // Preencher formulário com dados da rota
      Object.keys(rota).forEach(key => {
        if (rota[key] !== null && rota[key] !== undefined) {
          setValue(key, rota[key]);
        }
      });
    } else if (!rota && isOpen) {
      // Resetar formulário para nova rota
      reset();
      setValue('status', 'ativo');
      setValue('tipo_rota', 'semanal');
    }
  }, [rota, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Rota' : rota ? 'Editar Rota' : 'Adicionar Rota'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Primeira linha - Informações básicas */}
          <Input
            label="Filial *"
            type="select"
            {...register('filial_id', { required: 'Filial é obrigatória' })}
            error={errors.filial_id?.message}
            disabled={isViewMode || loadingFiliais}
          >
            <option value="">
              {loadingFiliais ? 'Carregando filiais...' : 'Selecione uma filial'}
            </option>
            {filiais.map(filial => (
              <option key={filial.id} value={filial.id}>
                {filial.filial}
              </option>
            ))}
          </Input>

          <Input
            label="Código *"
            type="text"
            placeholder="Código da rota"
            {...register('codigo', { required: 'Código é obrigatório' })}
            error={errors.codigo?.message}
            disabled={isViewMode}
          />

          <Input
            label="Nome *"
            type="text"
            placeholder="Nome da rota"
            {...register('nome', { required: 'Nome é obrigatório' })}
            error={errors.nome?.message}
            disabled={isViewMode}
          />

          {/* Segunda linha - Configurações */}
          <Input
            label="Distância (km)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('distancia_km')}
            disabled={isViewMode}
          />

          <Input
            label="Tipo de Rota"
            type="select"
            {...register('tipo_rota')}
            disabled={isViewMode}
          >
            <option value="semanal">Semanal</option>
            <option value="quinzenal">Quinzenal</option>
            <option value="mensal">Mensal</option>
            <option value="transferencia">Transferência</option>
          </Input>

          <Input
            label="Custo Diário"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('custo_diario')}
            disabled={isViewMode}
          />

          {/* Terceira linha - Status e Observações */}
          <Input
            label="Status"
            type="select"
            {...register('status')}
            disabled={isViewMode}
          >
            <option value="ativo">Ativo</option>
            <option value="inativo">Inativo</option>
          </Input>

          <Input
            label="Observações"
            type="textarea"
            placeholder="Observações sobre a rota..."
            {...register('observacoes')}
            disabled={isViewMode}
            className="md:col-span-2 lg:col-span-2"
            rows={3}
          />
        </div>
        
        {/* Seção de Unidades Escolares Vinculadas */}
        {isViewMode && (
          <div className="border-t pt-3 sm:pt-4">
            <div 
              className="flex justify-between items-center cursor-pointer p-2 sm:p-3 bg-gray-50 rounded-lg mb-2 sm:mb-3"
              onClick={onToggleUnidades}
            >
              <h3 className="text-base sm:text-lg font-semibold text-gray-800 flex items-center gap-2">
                Unidades Escolares Vinculadas
                {totalUnidades > 0 && (
                  <span className="bg-green-600 text-white px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full text-xs font-medium">
                    {totalUnidades}
                  </span>
                )}
              </h3>
              {showUnidades ? <FaChevronUp /> : <FaChevronDown />}
            </div>
            
            {showUnidades && (
              <div className="max-h-[250px] sm:max-h-[300px] overflow-y-auto">
                {loadingUnidades ? (
                  <div className="text-center py-6 sm:py-8">
                    <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-green-600 mx-auto mb-2"></div>
                    <p className="text-gray-600 text-sm">Carregando unidades escolares...</p>
                  </div>
                ) : unidadesEscolares.length === 0 ? (
                  <div className="text-center py-6 sm:py-8 text-gray-500 italic text-sm">
                    Nenhuma unidade escolar vinculada a esta rota
                  </div>
                ) : (
                  <>
                    {/* Versão Desktop - Tabela completa */}
                    <div className="hidden lg:block bg-white rounded-lg border overflow-hidden">
                      <div className="overflow-x-auto">
                        <table className="w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-16">Ordem</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-24">Código</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome da Escola</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32">Cidade</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Estado</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-40">Centro Distribuição</th>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-20">Status</th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {unidadesEscolares.map((unidade) => (
                              <tr key={unidade.id} className="hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.ordem_entrega || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.codigo_teknisa}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.nome_escola}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.cidade}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.estado}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">{unidade.centro_distribuicao || '-'}</td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                                  <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                                    unidade.status === 'ativo' 
                                      ? 'bg-green-100 text-green-800' 
                                      : 'bg-red-100 text-red-800'
                                  }`}>
                                    {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Versão Mobile - Cards */}
                    <div className="lg:hidden space-y-2">
                      {unidadesEscolares.map((unidade) => (
                        <div key={unidade.id} className="bg-white rounded-lg border p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-gray-900 text-sm">{unidade.nome_escola}</h4>
                              <p className="text-gray-600 text-xs">Código: {unidade.codigo_teknisa}</p>
                            </div>
                            <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full text-xs font-medium ${
                              unidade.status === 'ativo' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {unidade.status === 'ativo' ? 'Ativo' : 'Inativo'}
                            </span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-2 text-xs">
                            <div>
                              <span className="text-gray-500">Ordem:</span>
                              <p className="font-medium">{unidade.ordem_entrega || '-'}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Cidade:</span>
                              <p className="font-medium">{unidade.cidade}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Estado:</span>
                              <p className="font-medium">{unidade.estado}</p>
                            </div>
                            <div>
                              <span className="text-gray-500">Centro:</span>
                              <p className="font-medium">{unidade.centro_distribuicao || '-'}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
                {unidadesEscolares.length > 0 && (
                  <div className="mt-3 p-2 sm:p-3 bg-gray-50 rounded-lg text-center text-xs sm:text-sm text-gray-600">
                    Exibindo {unidadesEscolares.length} de {totalUnidades} unidades escolares
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {rota ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default RotaModal;
