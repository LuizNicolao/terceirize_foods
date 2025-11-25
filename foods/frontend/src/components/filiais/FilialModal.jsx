import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaSearch, FaSpinner, FaWarehouse } from 'react-icons/fa';
import { Modal, Input, Button, MaskedFormInput, Table } from '../ui';
import FiliaisService from '../../services/filiais';
import almoxarifadoService from '../../services/almoxarifadoService';
import toast from 'react-hot-toast';

const FilialModal = ({ isOpen, onClose, onSubmit, filial, isViewMode }) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  const [isLoadingCNPJ, setIsLoadingCNPJ] = useState(false);
  const [isLoadingCEP, setIsLoadingCEP] = useState(false);
  const [almoxarifados, setAlmoxarifados] = useState([]);
  const [carregandoAlmoxarifados, setCarregandoAlmoxarifados] = useState(false);

  const cnpj = watch('cnpj');
  const cep = watch('cep');

  // Resetar formulário quando modal abrir/fechar
  useEffect(() => {
    if (isOpen) {
      if (filial) {
        // Preencher formulário com dados da filial
        Object.keys(filial).forEach(key => {
          setValue(key, filial[key]);
        });
        // Carregar almoxarifados se estiver em modo visualização
        if (isViewMode && filial.id) {
          carregarAlmoxarifados(filial.id);
        }
      } else {
        // Limpar formulário para nova filial
        reset();
      }
    } else {
      setAlmoxarifados([]);
    }
  }, [isOpen, filial, setValue, reset, isViewMode]);

  // Carregar almoxarifados vinculados à filial
  const carregarAlmoxarifados = async (filialId) => {
    setCarregandoAlmoxarifados(true);
    try {
      // Se a filial tem almoxarifados_ids, usar essa lista
      if (filialData?.almoxarifados_ids) {
        const idsArray = filialData.almoxarifados_ids.split(',').map(id => id.trim()).filter(id => id);
        
        if (idsArray.length > 0) {
          // Buscar cada almoxarifado por ID
          const promises = idsArray.map(id => 
            almoxarifadoService.buscarPorId(id).catch(() => null)
          );
          
          const results = await Promise.all(promises);
          const almoxarifadosEncontrados = results
            .filter(result => result && result.success && result.data)
            .map(result => result.data)
            .filter(almox => almox.status === 1); // Apenas ativos
          
          setAlmoxarifados(almoxarifadosEncontrados);
        } else {
          setAlmoxarifados([]);
        }
      } else {
        // Fallback: buscar todos os almoxarifados da filial e filtrar apenas do tipo "filial"
        const response = await almoxarifadoService.listar({ filial_id: filialData.id, status: 1 });
        if (response.success) {
          const dados = response.data?.data || response.data || [];
          const todosAlmoxarifados = Array.isArray(dados) ? dados : [];
          
          // Filtrar apenas os do tipo "filial" (não incluir os de unidades escolares)
          const almoxarifadosFiliais = todosAlmoxarifados.filter(
            almox => almox.tipo_vinculo === 'filial' || !almox.tipo_vinculo
          );
          
          setAlmoxarifados(almoxarifadosFiliais);
        } else {
          setAlmoxarifados([]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar almoxarifados:', error);
      setAlmoxarifados([]);
    } finally {
      setCarregandoAlmoxarifados(false);
    }
  };

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // Função para buscar CNPJ
  const handleBuscarCNPJ = async () => {
    const cnpjValue = cnpj || '';
    
    if (!cnpjValue || cnpjValue.replace(/\D/g, '').length < 14) {
      toast.error('Digite um CNPJ válido para consultar');
      return;
    }

    if (isLoadingCNPJ) {
      return; // Evitar múltiplas chamadas
    }

    setIsLoadingCNPJ(true);
    const loadingToast = toast.loading('Buscando dados do CNPJ...');

    try {
      const response = await FiliaisService.consultarCNPJ(cnpjValue);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('razao_social', dados.razao_social || '');
        setValue('nome_fantasia', dados.nome_fantasia || '');
        setValue('logradouro', dados.logradouro || '');
        setValue('numero', dados.numero || '');
        setValue('bairro', dados.bairro || '');
        setValue('cidade', dados.municipio || '');
        setValue('estado', dados.uf || '');
        setValue('cep', dados.cep || '');
        setValue('telefone', dados.telefone || '');
        setValue('email', dados.email || '');
        
        toast.success('Dados do CNPJ carregados com sucesso!');
      } else {
        toast.error(response.error || 'Erro ao buscar dados do CNPJ');
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      console.error('Erro ao buscar CNPJ:', error);
      toast.error('Erro ao buscar dados do CNPJ. Tente novamente.');
    } finally {
      setIsLoadingCNPJ(false);
    }
  };

  // Função para buscar CEP
  const handleBuscarCEP = async () => {
    const cepValue = cep || '';
    
    if (!cepValue || cepValue.replace(/\D/g, '').length < 8) {
      toast.error('Digite um CEP válido para consultar');
      return;
    }

    if (isLoadingCEP) {
      return; // Evitar múltiplas chamadas
    }

    setIsLoadingCEP(true);
    const loadingToast = toast.loading('Buscando dados do CEP...');

    try {
      const response = await FiliaisService.consultarCEP(cepValue);
      
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      
      if (response.success) {
        const dados = response.data;
        // Preencher os campos com os dados retornados
        setValue('logradouro', dados.logradouro || '');
        setValue('bairro', dados.bairro || '');
        setValue('cidade', dados.localidade || '');
        setValue('estado', dados.uf || '');
        
        toast.success('Dados do CEP carregados com sucesso!');
      } else {
        toast.error(response.error || 'Erro ao buscar dados do CEP');
      }
    } catch (error) {
      // Dismiss loading toast
      toast.dismiss(loadingToast);
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar dados do CEP. Tente novamente.');
    } finally {
      setIsLoadingCEP(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Filial' : filial ? 'Editar Filial' : 'Nova Filial'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Principais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Principais
            </h3>
            <div className="space-y-3">
              <Input
                label="Código da Filial"
                {...register('codigo_filial')}
                error={errors.codigo_filial?.message}
                disabled={isViewMode}
                placeholder="Código da filial"
              />
              
              {/* CNPJ com botão de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('cnpj')}
                    type="text"
                    placeholder="00.000.000/0000-00"
                    disabled={isViewMode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => {
                      // Aplicar máscara CNPJ
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 14) {
                        value = value.replace(/^(\d{2})(\d)/, '$1.$2');
                        value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
                        value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
                        value = value.replace(/(\d{4})(\d)/, '$1-$2');
                        e.target.value = value;
                      }
                      // Notificar o react-hook-form
                      register('cnpj').onChange(e);
                    }}
                  />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={handleBuscarCNPJ}
                      disabled={isLoadingCNPJ}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingCNPJ ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaSearch className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
              
              <Input
                label="Nome da Filial *"
                {...register('filial')}
                error={errors.filial?.message}
                disabled={isViewMode}
              />
              <Input
                label="Razão Social *"
                {...register('razao_social')}
                error={errors.razao_social?.message}
                disabled={isViewMode}
              />
              <Input
                label="Status *"
                type="select"
                {...register('status')}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="1">Ativo</option>
                <option value="0">Inativo</option>
              </Input>
            </div>
          </div>

          {/* Card 2: Contato */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Contato
            </h3>
            <div className="space-y-3">
              <Input
                label="Email"
                type="email"
                {...register('email')}
                disabled={isViewMode}
              />
              <MaskedFormInput
                label="Telefone"
                maskType="telefone"
                register={register}
                fieldName="telefone"
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 3: Endereço */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Endereço
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Logradouro"
                {...register('logradouro')}
                disabled={isViewMode}
              />
              <Input
                label="Número"
                {...register('numero')}
                disabled={isViewMode}
              />
              <Input
                label="Bairro"
                {...register('bairro')}
                disabled={isViewMode}
              />
              <Input
                label="Cidade"
                {...register('cidade')}
                disabled={isViewMode}
              />
              <Input
                label="Estado"
                {...register('estado')}
                disabled={isViewMode}
              />
              {/* CEP com botão de busca */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <div className="flex gap-2">
                  <input
                    {...register('cep')}
                    type="text"
                    placeholder="00000-000"
                    disabled={isViewMode}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    onChange={(e) => {
                      // Aplicar máscara CEP
                      let value = e.target.value.replace(/\D/g, '');
                      if (value.length <= 8) {
                        value = value.replace(/^(\d{5})(\d)/, '$1-$2');
                        e.target.value = value;
                      }
                      // Notificar o react-hook-form
                      register('cep').onChange(e);
                    }}
                  />
                  {!isViewMode && (
                    <button
                      type="button"
                      onClick={handleBuscarCEP}
                      disabled={isLoadingCEP}
                      className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingCEP ? (
                        <FaSpinner className="h-4 w-4 animate-spin" />
                      ) : (
                        <FaSearch className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Terceira Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 4: Informações Adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Supervisão"
                {...register('supervisao')}
                disabled={isViewMode}
              />
              <Input
                label="Coordenação"
                {...register('coordenacao')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Seção de Almoxarifados - apenas em modo visualização */}
        {isViewMode && filial && (
          <div className="grid grid-cols-1 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b-2 border-green-500">
                <FaWarehouse className="text-green-600" />
                <h3 className="text-sm font-semibold text-gray-700">
                  Almoxarifados Vinculados ({almoxarifados.length})
                </h3>
              </div>
              {carregandoAlmoxarifados ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-600 mx-auto"></div>
                  <p className="text-sm text-gray-600 mt-2">Carregando almoxarifados...</p>
                </div>
              ) : almoxarifados.length > 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                  <Table>
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Código</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Centro de Custo</th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {almoxarifados.map((almoxarifado) => (
                        <tr key={almoxarifado.id} className="hover:bg-gray-50">
                          <td className="px-4 py-2 text-sm text-gray-900 font-medium">{almoxarifado.codigo}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">{almoxarifado.nome}</td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            {almoxarifado.centro_custo_nome ? (
                              <span>{almoxarifado.centro_custo_codigo} - {almoxarifado.centro_custo_nome}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="px-4 py-2 text-sm text-gray-900">
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                              almoxarifado.status === 1 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {almoxarifado.status === 1 ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  Nenhum almoxarifado vinculado a esta filial
                </div>
              )}
            </div>
          </div>
        )}

        {/* Botões */}
        <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
          <Button
            type="button"
            variant="secondary"
            onClick={handleClose}
          >
            Cancelar
          </Button>
          {!isViewMode && (
            <Button type="submit">
              {filial ? 'Atualizar' : 'Criar'} Filial
            </Button>
          )}
        </div>
      </form>
    </Modal>
  );
};

export default FilialModal;