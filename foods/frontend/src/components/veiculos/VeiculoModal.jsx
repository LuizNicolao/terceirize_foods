import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

// Função para converter data do formato YYYY-MM-DD para o formato do input date
const formatDateForInput = (dateString) => {
  if (!dateString) return '';
  // Se já estiver no formato YYYY-MM-DD, retorna como está
  if (typeof dateString === 'string' && dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }
  // Se for uma data válida, converte para YYYY-MM-DD
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  return date.toISOString().split('T')[0];
};

// Função para converter data do input para o formato esperado pelo backend
const formatDateForBackend = (dateString) => {
  if (!dateString) return null;
  return dateString; // O backend espera YYYY-MM-DD
};

const VeiculoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  veiculo, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (veiculo && isOpen) {
      // Preencher formulário com dados do veículo
      Object.keys(veiculo).forEach(key => {
        if (veiculo[key] !== null && veiculo[key] !== undefined) {
          // Tratamento especial para campos de data
          if (key.includes('data_') || key.includes('vencimento_')) {
            setValue(key, formatDateForInput(veiculo[key]));
          } else {
            setValue(key, veiculo[key]);
          }
        }
      });
    } else if (!veiculo && isOpen) {
      // Resetar formulário para novo veículo
      reset();
      setValue('status', 'ativo');
      setValue('tipo_veiculo', 'caminhao');
      setValue('categoria', 'carga');
    }
  }, [veiculo, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    // Converter datas para o formato esperado pelo backend
    const processedData = { ...data };
    
    // Lista de campos de data
    const dateFields = [
      'data_emplacamento',
      'vencimento_licenciamento',
      'vencimento_ipva',
      'vencimento_dpvat',
      'data_ultima_revisao',
      'data_ultima_troca_oleo',
      'vencimento_alinhamento_balanceamento',
      'proxima_inspecao_veicular',
      'data_aquisicao'
    ];
    
    // Processar cada campo de data
    dateFields.forEach(field => {
      if (processedData[field]) {
        processedData[field] = formatDateForBackend(processedData[field]);
      }
    });
    
    onSubmit(processedData);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Veículo' : veiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Básicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Básicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Placa *"
                type="text"
                placeholder="ABC-1234"
                {...register('placa', { 
                  required: 'Placa é obrigatória',
                  minLength: { value: 6, message: 'Placa deve ter pelo menos 6 caracteres' },
                  maxLength: { value: 10, message: 'Placa deve ter no máximo 10 caracteres' }
                })}
                error={errors.placa?.message}
                disabled={isViewMode}
              />
              <Input
                label="Marca"
                type="text"
                placeholder="Marca do veículo"
                {...register('marca', {
                  maxLength: { value: 50, message: 'Marca deve ter no máximo 50 caracteres' }
                })}
                error={errors.marca?.message}
                disabled={isViewMode}
              />
              <Input
                label="Modelo"
                type="text"
                placeholder="Modelo do veículo"
                {...register('modelo', {
                  maxLength: { value: 100, message: 'Modelo deve ter no máximo 100 caracteres' }
                })}
                error={errors.modelo?.message}
                disabled={isViewMode}
              />
              <Input
                label="Fabricante"
                type="text"
                placeholder="Fabricante do veículo"
                {...register('fabricante', {
                  maxLength: { value: 100, message: 'Fabricante deve ter no máximo 100 caracteres' }
                })}
                error={errors.fabricante?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Identificação */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Identificação
            </h3>
            <div className="space-y-3">
              <Input
                label="Chassi"
                type="text"
                placeholder="Número do chassi"
                {...register('chassi', {
                  minLength: { value: 17, message: 'Chassi deve ter 17 caracteres' },
                  maxLength: { value: 17, message: 'Chassi deve ter 17 caracteres' }
                })}
                error={errors.chassi?.message}
                disabled={isViewMode}
              />
              <Input
                label="Renavam"
                type="text"
                placeholder="Número do Renavam"
                {...register('renavam', {
                  minLength: { value: 9, message: 'Renavam deve ter pelo menos 9 caracteres' },
                  maxLength: { value: 20, message: 'Renavam deve ter no máximo 20 caracteres' }
                })}
                error={errors.renavam?.message}
                disabled={isViewMode}
              />
              <Input
                label="Ano de Fabricação"
                type="number"
                placeholder="2020"
                {...register('ano_fabricacao', {
                  min: { value: 1900, message: 'Ano deve ser maior que 1900' },
                  max: { value: new Date().getFullYear() + 1, message: 'Ano não pode ser futuro' }
                })}
                error={errors.ano_fabricacao?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Configurações */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Configurações
            </h3>
            <div className="space-y-3">
              <Input
                label="Tipo de Veículo"
                type="select"
                {...register('tipo_veiculo')}
                error={errors.tipo_veiculo?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o tipo</option>
                <option value="caminhao">Caminhão</option>
                <option value="van">Van</option>
                <option value="carro">Carro</option>
                <option value="moto">Moto</option>
                <option value="onibus">Ônibus</option>
              </Input>
              <Input
                label="Carroceria"
                type="select"
                {...register('carroceria')}
                error={errors.carroceria?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione a carroceria</option>
                <option value="Bau">Baú</option>
                <option value="Refrigerado">Refrigerado</option>
                <option value="Bipartido">Bipartido</option>
                <option value="Grade Baixa">Grade Baixa</option>
                <option value="Sider">Sider</option>
                <option value="Graneleiro">Graneleiro</option>
                <option value="Tanque">Tanque</option>
                <option value="Cacamba">Caçamba</option>
              </Input>
              <Input
                label="Combustível"
                type="select"
                {...register('combustivel')}
                error={errors.combustivel?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o combustível</option>
                <option value="gasolina">Gasolina</option>
                <option value="diesel">Diesel</option>
                <option value="etanol">Etanol</option>
                <option value="flex">Flex</option>
                <option value="GNV">GNV</option>
                <option value="eletrico">Elétrico</option>
              </Input>
              <Input
                label="Categoria"
                type="select"
                {...register('categoria')}
                error={errors.categoria?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione a categoria</option>
                <option value="carga">Carga</option>
                <option value="passageiros">Passageiros</option>
                <option value="utilitario">Utilitário</option>
                <option value="especial">Especial</option>
              </Input>
            </div>
          </div>

          {/* Card 4: Capacidades */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Capacidades
            </h3>
            <div className="space-y-3">
              <Input
                label="Capacidade de Carga (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('capacidade_carga', {
                  min: { value: 0, message: 'Capacidade deve ser positiva' }
                })}
                error={errors.capacidade_carga?.message}
                disabled={isViewMode}
              />
              <Input
                label="Capacidade de Volume (m³)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('capacidade_volume', {
                  min: { value: 0, message: 'Volume deve ser positivo' }
                })}
                error={errors.capacidade_volume?.message}
                disabled={isViewMode}
              />
              <Input
                label="Número de Eixos"
                type="number"
                placeholder="2"
                {...register('numero_eixos', {
                  min: { value: 1, message: 'Número de eixos deve ser pelo menos 1' }
                })}
                error={errors.numero_eixos?.message}
                disabled={isViewMode}
              />
              <Input
                label="Tara (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('tara', {
                  min: { value: 0, message: 'Tara deve ser positiva' }
                })}
                error={errors.tara?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Terceira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 5: Especificações Técnicas */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Especificações Técnicas
            </h3>
            <div className="space-y-3">
              <Input
                label="Peso Bruto Total (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('peso_bruto_total', {
                  min: { value: 0, message: 'Peso deve ser positivo' }
                })}
                error={errors.peso_bruto_total?.message}
                disabled={isViewMode}
              />
              <Input
                label="Potência do Motor (cv)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('potencia_motor', {
                  min: { value: 0, message: 'Potência deve ser positiva' }
                })}
                error={errors.potencia_motor?.message}
                disabled={isViewMode}
              />
              <Input
                label="Tipo de Tração"
                type="select"
                {...register('tipo_tracao')}
                error={errors.tipo_tracao?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione a tração</option>
                <option value="4x2">4x2</option>
                <option value="4x4">4x4</option>
                <option value="dianteira">Dianteira</option>
                <option value="traseira">Traseira</option>
              </Input>
              <Input
                label="Quilometragem Atual (km)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('quilometragem_atual', {
                  min: { value: 0, message: 'Quilometragem deve ser positiva' }
                })}
                error={errors.quilometragem_atual?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 6: Documentação */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Documentação
            </h3>
            <div className="space-y-3">
              <Input
                label="Data de Emplacamento"
                type="date"
                {...register('data_emplacamento')}
                error={errors.data_emplacamento?.message}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento Licenciamento"
                type="date"
                {...register('vencimento_licenciamento')}
                error={errors.vencimento_licenciamento?.message}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento IPVA"
                type="date"
                {...register('vencimento_ipva')}
                error={errors.vencimento_ipva?.message}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento DPVAT"
                type="date"
                {...register('vencimento_dpvat')}
                error={errors.vencimento_dpvat?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Quarta Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 7: Seguro e Manutenção */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Seguro e Manutenção
            </h3>
            <div className="space-y-3">
              <Input
                label="Número da Apólice"
                type="text"
                placeholder="Número da apólice de seguro"
                {...register('numero_apolice_seguro', {
                  maxLength: { value: 50, message: 'Número da apólice deve ter no máximo 50 caracteres' }
                })}
                error={errors.numero_apolice_seguro?.message}
                disabled={isViewMode}
              />
              <Input
                label="Situação Documental"
                type="select"
                {...register('situacao_documental')}
                error={errors.situacao_documental?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione a situação</option>
                <option value="regular">Regular</option>
                <option value="alienado">Alienado</option>
                <option value="bloqueado">Bloqueado</option>
              </Input>
              <Input
                label="Data Última Revisão"
                type="date"
                {...register('data_ultima_revisao')}
                error={errors.data_ultima_revisao?.message}
                disabled={isViewMode}
              />
              <Input
                label="Quilometragem Próxima Revisão"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('quilometragem_proxima_revisao', {
                  min: { value: 0, message: 'Quilometragem deve ser positiva' }
                })}
                error={errors.quilometragem_proxima_revisao?.message}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 8: Status e Financeiro */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Status e Financeiro
            </h3>
            <div className="space-y-3">
              <Input
                label="Status"
                type="select"
                {...register('status')}
                error={errors.status?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="manutencao">Em Manutenção</option>
              </Input>
              <Input
                label="Status Detalhado"
                type="select"
                {...register('status_detalhado')}
                error={errors.status_detalhado?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione o status detalhado</option>
                <option value="Ativo">Ativo</option>
                <option value="Em manutencao">Em Manutenção</option>
                <option value="Alugado">Alugado</option>
                <option value="Vendido">Vendido</option>
              </Input>
              <Input
                label="Data de Aquisição"
                type="date"
                {...register('data_aquisicao')}
                error={errors.data_aquisicao?.message}
                disabled={isViewMode}
              />
              <Input
                label="Valor de Compra (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('valor_compra', {
                  min: { value: 0, message: 'Valor deve ser positivo' }
                })}
                error={errors.valor_compra?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Quinta Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card 9: Informações Adicionais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Adicionais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <Input
                label="Fornecedor"
                type="text"
                placeholder="Nome do fornecedor"
                {...register('fornecedor', {
                  maxLength: { value: 200, message: 'Fornecedor deve ter no máximo 200 caracteres' }
                })}
                error={errors.fornecedor?.message}
                disabled={isViewMode}
              />
              <Input
                label="Número da Frota"
                type="text"
                placeholder="Número da frota"
                {...register('numero_frota', {
                  maxLength: { value: 20, message: 'Número da frota deve ter no máximo 20 caracteres' }
                })}
                error={errors.numero_frota?.message}
                disabled={isViewMode}
              />
              <Input
                label="Situação Financeira"
                type="select"
                {...register('situacao_financeira')}
                error={errors.situacao_financeira?.message}
                disabled={isViewMode}
              >
                <option value="">Selecione a situação</option>
                <option value="Proprio">Próprio</option>
                <option value="Financiado">Financiado</option>
                <option value="leasing">Leasing</option>
              </Input>
              <Input
                label="Data Última Troca de Óleo"
                type="date"
                {...register('data_ultima_troca_oleo')}
                error={errors.data_ultima_troca_oleo?.message}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento Alinhamento/Balanceamento"
                type="date"
                {...register('vencimento_alinhamento_balanceamento')}
                error={errors.vencimento_alinhamento_balanceamento?.message}
                disabled={isViewMode}
              />
              <Input
                label="Próxima Inspeção Veicular"
                type="date"
                {...register('proxima_inspecao_veicular')}
                error={errors.proxima_inspecao_veicular?.message}
                disabled={isViewMode}
              />
            </div>
            <div className="mt-3">
              <Input
                label="Observações"
                type="textarea"
                placeholder="Observações sobre o veículo"
                {...register('observacoes', {
                  maxLength: { value: 500, message: 'Observações devem ter no máximo 500 caracteres' }
                })}
                error={errors.observacoes?.message}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Botões de Ação */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
            >
              Cancelar
            </Button>
            <Button type="submit">
              {veiculo ? 'Atualizar' : 'Criar'} Veículo
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default VeiculoModal;
