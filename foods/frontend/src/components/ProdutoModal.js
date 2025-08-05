import React from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaPrint } from 'react-icons/fa';
import { Button, Input, Modal } from './ui';

const ProdutoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  produto, 
  isViewMode = false,
  grupos = [],
  unidades = [],
  onPrint
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue } = useForm();

  React.useEffect(() => {
    if (produto && isOpen) {
      // Preencher formulário com dados do produto
      setValue('nome', produto.nome);
      setValue('codigo_produto', produto.codigo_produto);
      setValue('descricao', produto.descricao);
      setValue('codigo_barras', produto.codigo_barras);
      setValue('fator_conversao', produto.fator_conversao);
      setValue('ean', produto.ean);
      setValue('referencia', produto.referencia);
      setValue('referencia_externa', produto.referencia_externa);
      setValue('referencia_mercado', produto.referencia_mercado);
      setValue('integracao_senior', produto.integracao_senior);
      setValue('ficha_homologacao', produto.ficha_homologacao);
      setValue('grupo_id', produto.grupo_id);
      setValue('subgrupo_id', produto.subgrupo_id);
      setValue('classe_id', produto.classe_id);
      setValue('unidade_id', produto.unidade_id);
      setValue('agrupamento_n3', produto.agrupamento_n3);
      setValue('agrupamento_n4', produto.agrupamento_n4);
      setValue('marca', produto.marca);
      setValue('fabricante', produto.fabricante);
      setValue('peso_liquido', produto.peso_liquido);
      setValue('peso_bruto', produto.peso_bruto);
      setValue('quantidade', produto.quantidade);
      setValue('regra_palet_un', produto.regra_palet_un);
      setValue('comprimento', produto.comprimento);
      setValue('largura', produto.largura);
      setValue('altura', produto.altura);
      setValue('volume', produto.volume);
      setValue('prazo_validade', produto.prazo_validade);
      setValue('unidade_validade', produto.unidade_validade);
      setValue('ncm', produto.ncm);
      setValue('cest', produto.cest);
      setValue('cfop', produto.cfop);
      setValue('origem', produto.origem);
      setValue('cst_icms', produto.cst_icms);
      setValue('csosn', produto.csosn);
      setValue('aliquota_icms', produto.aliquota_icms);
      setValue('aliquota_ipi', produto.aliquota_ipi);
      setValue('aliquota_pis', produto.aliquota_pis);
      setValue('aliquota_cofins', produto.aliquota_cofins);
      setValue('status', produto.status);
      setValue('informacoes_adicionais', produto.informacoes_adicionais);
      setValue('registro_especifico', produto.registro_especifico);
      setValue('foto_produto', produto.foto_produto);
    } else if (!produto && isOpen) {
      // Resetar formulário para novo produto
      reset();
      setValue('status', '1'); // Define status como "Ativo" por padrão
    }
  }, [produto, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {isViewMode ? 'Visualizar Produto' : produto ? 'Editar Produto' : 'Adicionar Produto'}
          </h2>
          <div className="flex items-center gap-2">
            {!isViewMode && produto && (
              <Button
                variant="outline"
                size="sm"
                onClick={onPrint}
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                Imprimir
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="p-2"
            >
              <FaTimes className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          {/* Primeira Linha - 3 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
            {/* Card 1: Informação Básica */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Informação Básica
              </h3>
              <div className="space-y-4">
                <Input
                  label="Código do Produto"
                  type="text"
                  placeholder="Código interno do produto"
                  disabled={isViewMode}
                  error={errors.codigo_produto?.message}
                  {...register('codigo_produto')}
                />

                <Input
                  label="Nome do Produto *"
                  type="text"
                  placeholder="Ex: PATINHO BOVINO EM CUBOS KING"
                  disabled={isViewMode}
                  error={errors.nome?.message}
                  {...register('nome', { required: 'Nome é obrigatório' })}
                />

                <Input
                  label="Grupo"
                  type="select"
                  disabled={isViewMode}
                  error={errors.grupo_id?.message}
                  {...register('grupo_id')}
                >
                  <option value="">Selecione...</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </Input>

                <Input
                  label="Subgrupo"
                  type="select"
                  disabled={isViewMode}
                  error={errors.subgrupo_id?.message}
                  {...register('subgrupo_id')}
                >
                  <option value="">Selecione...</option>
                </Input>

                <Input
                  label="Classe"
                  type="select"
                  disabled={isViewMode}
                  error={errors.classe_id?.message}
                  {...register('classe_id')}
                >
                  <option value="">Selecione...</option>
                </Input>

                <Input
                  label="Nome Genérico do Produto"
                  type="text"
                  placeholder="Nome genérico do produto"
                  disabled={isViewMode}
                  error={errors.nome_generico?.message}
                  {...register('nome_generico')}
                />
              </div>
            </div>

            {/* Card 2: Informações do Produto */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Informações do Produto
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Marca"
                    type="text"
                    placeholder="Ex: KING"
                    disabled={isViewMode}
                    error={errors.marca?.message}
                    {...register('marca')}
                  />

                  <Input
                    label="Fabricante"
                    type="text"
                    placeholder="Ex: KING"
                    disabled={isViewMode}
                    error={errors.fabricante?.message}
                    {...register('fabricante')}
                  />
                </div>

                <Input
                  label="Informações Adicionais"
                  type="textarea"
                  placeholder="Ex: PRODUTO COM 5% DE GORDURA"
                  disabled={isViewMode}
                  error={errors.informacoes_adicionais?.message}
                  {...register('informacoes_adicionais')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Referência Interna"
                    type="text"
                    placeholder="Referência interna"
                    disabled={isViewMode}
                    error={errors.referencia?.message}
                    {...register('referencia')}
                  />

                  <Input
                    label="Referência Externa"
                    type="text"
                    placeholder="Ex: 123654"
                    disabled={isViewMode}
                    error={errors.referencia_externa?.message}
                    {...register('referencia_externa')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Registro Específico"
                    type="text"
                    placeholder="Ex: 1234456 CA, REGISTRO, MODELO, Nº SERIE"
                    disabled={isViewMode}
                    error={errors.registro_especifico?.message}
                    {...register('registro_especifico')}
                  />

                  <Input
                    label="Tipo do Registro"
                    type="text"
                    placeholder="Tipo do registro"
                    disabled={isViewMode}
                    error={errors.tipo_registro?.message}
                    {...register('tipo_registro')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Prazo de Validade"
                    type="number"
                    placeholder="Ex: 12"
                    disabled={isViewMode}
                    error={errors.prazo_validade?.message}
                    {...register('prazo_validade')}
                  />

                  <Input
                    label="Unidade de Validade"
                    type="select"
                    disabled={isViewMode}
                    error={errors.unidade_validade?.message}
                    {...register('unidade_validade')}
                  >
                    <option value="">Selecione...</option>
                    <option value="DIAS">Dias</option>
                    <option value="SEMANAS">Semanas</option>
                    <option value="MESES">Meses</option>
                    <option value="ANOS">Anos</option>
                  </Input>
                </div>
              </div>
            </div>

            {/* Card 3: Unidade e Dimensões */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Unidade e Dimensões
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Unidade de Medida"
                    type="select"
                    disabled={isViewMode}
                    error={errors.unidade_id?.message}
                    {...register('unidade_id')}
                  >
                    <option value="">Selecione...</option>
                    {unidades.map(unidade => (
                      <option key={unidade.id} value={unidade.id}>
                        {unidade.nome}
                      </option>
                    ))}
                  </Input>

                  <Input
                    label="Regra Palet (Unidades)"
                    type="number"
                    placeholder="Ex: 1200"
                    disabled={isViewMode}
                    error={errors.regra_palet_un?.message}
                    {...register('regra_palet_un')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Código de Barras"
                    type="text"
                    placeholder="Ex: 1234567891234"
                    disabled={isViewMode}
                    error={errors.codigo_barras?.message}
                    {...register('codigo_barras')}
                  />

                  <Input
                    label="Fator de Conversão"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 1.000"
                    disabled={isViewMode}
                    error={errors.fator_conversao?.message}
                    {...register('fator_conversao')}
                  />
                </div>

                <Input
                  label="Referência de Mercado"
                  type="text"
                  placeholder="Ex: Corte Bovino / Patinho / Cubos"
                  disabled={isViewMode}
                  error={errors.referencia_mercado?.message}
                  {...register('referencia_mercado')}
                />

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Peso Líquido (kg)"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 1.000"
                    disabled={isViewMode}
                    error={errors.peso_liquido?.message}
                    {...register('peso_liquido')}
                  />

                  <Input
                    label="Peso Bruto (kg)"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 1.000"
                    disabled={isViewMode}
                    error={errors.peso_bruto?.message}
                    {...register('peso_bruto')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Comprimento (cm)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 20.00"
                    disabled={isViewMode}
                    error={errors.comprimento?.message}
                    {...register('comprimento')}
                  />

                  <Input
                    label="Largura (cm)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 15.00"
                    disabled={isViewMode}
                    error={errors.largura?.message}
                    {...register('largura')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Altura (cm)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 10.00"
                    disabled={isViewMode}
                    error={errors.altura?.message}
                    {...register('altura')}
                  />

                  <Input
                    label="Volume (cm³)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 3000.00"
                    disabled={isViewMode}
                    error={errors.volume?.message}
                    {...register('volume')}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Segunda Linha - 2 Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* Card 4: Tributação */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Tributação
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CST ICMS"
                    type="text"
                    placeholder="CST ICMS"
                    disabled={isViewMode}
                    error={errors.cst_icms?.message}
                    {...register('cst_icms')}
                  />

                  <Input
                    label="CSOSN"
                    type="text"
                    placeholder="CSOSN"
                    disabled={isViewMode}
                    error={errors.csosn?.message}
                    {...register('csosn')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Alíquota ICMS (%)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 18.00"
                    disabled={isViewMode}
                    error={errors.aliquota_icms?.message}
                    {...register('aliquota_icms')}
                  />

                  <Input
                    label="Alíquota IPI (%)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 5.00"
                    disabled={isViewMode}
                    error={errors.aliquota_ipi?.message}
                    {...register('aliquota_ipi')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Alíquota PIS (%)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 1.65"
                    disabled={isViewMode}
                    error={errors.aliquota_pis?.message}
                    {...register('aliquota_pis')}
                  />

                  <Input
                    label="Alíquota COFINS (%)"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 7.60"
                    disabled={isViewMode}
                    error={errors.aliquota_cofins?.message}
                    {...register('aliquota_cofins')}
                  />
                </div>
              </div>
            </div>

            {/* Card 5: Documentos e Status */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Documentos e Status
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Ficha de Homologação"
                    type="text"
                    placeholder="Ex: 123456"
                    disabled={isViewMode}
                    error={errors.ficha_homologacao?.message}
                    {...register('ficha_homologacao')}
                  />

                  <Input
                    label="Foto do Produto"
                    type="text"
                    placeholder="Caminho da foto"
                    disabled={isViewMode}
                    error={errors.foto_produto?.message}
                    {...register('foto_produto')}
                  />
                </div>

                <Input
                  label="Integração Senior"
                  type="text"
                  placeholder="Ex: 123654"
                  disabled={isViewMode}
                  error={errors.integracao_senior?.message}
                  {...register('integracao_senior')}
                />

                <Input
                  label="Status do Produto"
                  type="select"
                  disabled={isViewMode}
                  error={errors.status?.message}
                  {...register('status', { required: 'Status é obrigatório' })}
                >
                  <option value="">Selecione...</option>
                  <option value="1">Ativo</option>
                  <option value="0">Inativo</option>
                </Input>
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!isViewMode && (
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="flex items-center gap-2"
              >
                {produto ? 'Atualizar Produto' : 'Cadastrar Produto'}
              </Button>
            )}
            <Button
              type="button"
              variant="danger"
              size="lg"
              onClick={onClose}
            >
              {isViewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoModal; 