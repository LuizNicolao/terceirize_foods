import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from '../ui';

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
          setValue(key, veiculo[key]);
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
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Veículo' : veiculo ? 'Editar Veículo' : 'Adicionar Veículo'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-3 sm:space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Primeira linha - Informações básicas */}
          <Input
            label="Placa *"
            type="text"
            placeholder="ABC-1234"
            {...register('placa', { required: 'Placa é obrigatória' })}
            error={errors.placa?.message}
            disabled={isViewMode}
          />

          <Input
            label="Marca *"
            type="text"
            placeholder="Marca do veículo"
            {...register('marca', { required: 'Marca é obrigatória' })}
            error={errors.marca?.message}
            disabled={isViewMode}
          />

          <Input
            label="Modelo *"
            type="text"
            placeholder="Modelo do veículo"
            {...register('modelo', { required: 'Modelo é obrigatório' })}
            error={errors.modelo?.message}
            disabled={isViewMode}
          />

          {/* Segunda linha - Identificação */}
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

          {/* Terceira linha - Configurações */}
          <Input
            label="Tipo de Veículo"
            type="select"
            {...register('tipo_veiculo')}
            disabled={isViewMode}
          >
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
            <option value="">Selecione</option>
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
            <option value="">Selecione</option>
            <option value="gasolina">Gasolina</option>
            <option value="diesel">Diesel</option>
            <option value="etanol">Etanol</option>
            <option value="flex">Flex</option>
            <option value="GNV">GNV</option>
            <option value="eletrico">Elétrico</option>
          </Input>

          {/* Quarta linha - Categoria e Status */}
          <Input
            label="Categoria"
            type="select"
            {...register('categoria')}
            disabled={isViewMode}
          >
            <option value="carga">Carga</option>
            <option value="passageiros">Passageiros</option>
            <option value="utilitario">Utilitário</option>
            <option value="especial">Especial</option>
          </Input>

          <Input
            label="Status"
            type="select"
            {...register('status')}
            disabled={isViewMode}
          >
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
            <option value="">Selecione</option>
            <option value="Ativo">Ativo</option>
            <option value="Em manutencao">Em Manutenção</option>
            <option value="Alugado">Alugado</option>
            <option value="Vendido">Vendido</option>
          </Input>

          {/* Quinta linha - Capacidades */}
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
            placeholder="0"
            {...register('numero_eixos')}
            disabled={isViewMode}
          />

          {/* Sexta linha - Pesos */}
          <Input
            label="Tara (kg)"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('tara')}
            disabled={isViewMode}
          />

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

          {/* Sétima linha - Tração e Quilometragem */}
          <Input
            label="Tipo de Tração"
            type="select"
            {...register('tipo_tracao')}
            disabled={isViewMode}
          >
            <option value="">Selecione</option>
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

          <Input
            label="Data de Emplacamento"
            type="date"
            {...register('data_emplacamento')}
            disabled={isViewMode}
          />

          {/* Oitava linha - Vencimentos */}
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

          {/* Nona linha - Documentação */}
          <Input
            label="Número Apólice Seguro"
            type="text"
            placeholder="Número da apólice"
            {...register('numero_apolice_seguro')}
            disabled={isViewMode}
          />

          <Input
            label="Situação Documental"
            type="select"
            {...register('situacao_documental')}
            disabled={isViewMode}
          >
            <option value="">Selecione</option>
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

          {/* Décima linha - Manutenção */}
          <Input
            label="Quilometragem Próxima Revisão"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('quilometragem_proxima_revisao')}
            disabled={isViewMode}
          />

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

          {/* Décima primeira linha - Inspeção e Aquisição */}
          <Input
            label="Próxima Inspeção Veicular"
            type="date"
            {...register('proxima_inspecao_veicular')}
            disabled={isViewMode}
          />

          <Input
            label="Data de Aquisição"
            type="date"
            {...register('data_aquisicao')}
            disabled={isViewMode}
          />

          <Input
            label="Valor de Compra"
            type="number"
            step="0.01"
            placeholder="0.00"
            {...register('valor_compra')}
            disabled={isViewMode}
          />

          {/* Décima segunda linha - Informações adicionais */}
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
            <option value="">Selecione</option>
            <option value="Proprio">Próprio</option>
            <option value="Financiado">Financiado</option>
            <option value="leasing">Leasing</option>
          </Input>

          {/* Décima terceira linha - Observações */}
          <Input
            label="Observações"
            type="textarea"
            placeholder="Observações sobre o veículo..."
            {...register('observacoes')}
            disabled={isViewMode}
            className="md:col-span-2 lg:col-span-3"
            rows={3}
          />
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 sm:pt-4 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {veiculo ? 'Atualizar' : 'Cadastrar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default VeiculoModal;
