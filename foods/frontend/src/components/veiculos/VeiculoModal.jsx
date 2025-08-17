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
  const { register, handleSubmit, reset, setValue } = useForm();

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
                {...register('placa')}
                disabled={isViewMode}
              />
              <Input
                label="Marca"
                type="text"
                placeholder="Marca do veículo"
                {...register('marca')}
                disabled={isViewMode}
              />
              <Input
                label="Modelo"
                type="text"
                placeholder="Modelo do veículo"
                {...register('modelo')}
                disabled={isViewMode}
              />
              <Input
                label="Fabricante"
                type="text"
                placeholder="Fabricante do veículo"
                {...register('fabricante')}
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
                {...register('chassi')}
                disabled={isViewMode}
              />
              <Input
                label="Renavam"
                type="text"
                placeholder="Número do Renavam"
                {...register('renavam')}
                disabled={isViewMode}
              />
              <Input
                label="Ano de Fabricação"
                type="number"
                placeholder="2020"
                {...register('ano_fabricacao')}
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
                {...register('capacidade_carga')}
                disabled={isViewMode}
              />
              <Input
                label="Capacidade de Volume (m³)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('capacidade_volume')}
                disabled={isViewMode}
              />
              <Input
                label="Número de Eixos"
                type="number"
                placeholder="2"
                {...register('numero_eixos')}
                disabled={isViewMode}
              />
              <Input
                label="Tara (kg)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('tara')}
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
                {...register('peso_bruto_total')}
                disabled={isViewMode}
              />
              <Input
                label="Potência do Motor (cv)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('potencia_motor')}
                disabled={isViewMode}
              />
              <Input
                label="Tipo de Tração"
                type="select"
                {...register('tipo_tracao')}
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
                {...register('quilometragem_atual')}
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
                disabled={isViewMode}
              />
              <Input
                label="Vencimento Licenciamento"
                type="date"
                {...register('vencimento_licenciamento')}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento IPVA"
                type="date"
                {...register('vencimento_ipva')}
                disabled={isViewMode}
              />
              <Input
                label="Vencimento DPVAT"
                type="date"
                {...register('vencimento_dpvat')}
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
                {...register('numero_apolice_seguro')}
                disabled={isViewMode}
              />
              <Input
                label="Situação Documental"
                type="select"
                {...register('situacao_documental')}
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
                disabled={isViewMode}
              />
              <Input
                label="Quilometragem Próxima Revisão"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('quilometragem_proxima_revisao')}
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
                disabled={isViewMode}
              />
              <Input
                label="Valor de Compra (R$)"
                type="number"
                step="0.01"
                placeholder="0.00"
                {...register('valor_compra')}
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
                {...register('fornecedor')}
                disabled={isViewMode}
              />
              <Input
                label="Número da Frota"
                type="text"
                placeholder="Número da frota"
                {...register('numero_frota')}
                disabled={isViewMode}
              />
              <Input
                label="Situação Financeira"
                type="select"
                {...register('situacao_financeira')}
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
                disabled={isViewMode}
              />
              <Input
                label="Vencimento Alinhamento/Balanceamento"
                type="date"
                {...register('vencimento_alinhamento_balanceamento')}
                disabled={isViewMode}
              />
              <Input
                label="Próxima Inspeção Veicular"
                type="date"
                {...register('proxima_inspecao_veicular')}
                disabled={isViewMode}
              />
            </div>
            <div className="mt-3">
              <Input
                label="Observações"
                type="textarea"
                placeholder="Observações sobre o veículo"
                {...register('observacoes')}
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
