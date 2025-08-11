import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaPrint, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const ProdutoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  produto, 
  isViewMode = false,
  grupos = [],
  subgrupos = [],
  classes = [],
  unidades = [],
  marcas = [],
  fornecedores = [],
  onPrint
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');



  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId))
    : subgrupos;

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : classes;

  useEffect(() => {
    if (produto && isOpen) {
      // Preencher formulário com dados do produto
      Object.keys(produto).forEach(key => {
        if (produto[key] !== null && produto[key] !== undefined) {
          setValue(key, produto[key]);
        }
      });
    } else if (!produto && isOpen) {
      // Resetar formulário para novo produto
      reset();
      setValue('status', 1);
      setValue('fator_conversao', 1.000);
      setValue('quantidade', 1.000);
    }
  }, [produto, isOpen, setValue, reset]);



  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {isViewMode ? <FaEye className="w-5 h-5 text-white" /> : produto ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {isViewMode ? 'Visualizar Produto' : produto ? 'Editar Produto' : 'Novo Produto'}
              </h2>
              <p className="text-sm text-gray-600">
                {isViewMode ? 'Visualizando informações do produto' : produto ? 'Editando informações do produto' : 'Preencha as informações do novo produto'}
              </p>
            </div>
          </div>
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
                  placeholder="Código interno"
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
                  label="Descrição"
                  type="textarea"
                  placeholder="Descrição detalhada do produto"
                  disabled={isViewMode}
                  error={errors.descricao?.message}
                  {...register('descricao')}
                />

                <Input
                  label="Status"
                  type="select"
                  disabled={isViewMode}
                  error={errors.status?.message}
                  {...register('status')}
                >
                  <option value={1}>Ativo</option>
                  <option value={0}>Inativo</option>
                </Input>

                <Input
                  label="Código de Barras"
                  type="text"
                  placeholder="Ex: 1234567891234"
                  disabled={isViewMode}
                  error={errors.codigo_barras?.message}
                  {...register('codigo_barras')}
                />

                <Input
                  label="EAN"
                  type="text"
                  placeholder="Código EAN"
                  disabled={isViewMode}
                  error={errors.ean?.message}
                  {...register('ean')}
                />
              </div>
            </div>

            {/* Card 2: Classificação */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Classificação
              </h3>
              <div className="space-y-4">
                <Input
                  label="Grupo"
                  type="select"
                  disabled={isViewMode}
                  error={errors.grupo_id?.message}
                  {...register('grupo_id')}
                >
                  <option value="">Selecione um grupo...</option>
                  {grupos.map(grupo => (
                    <option key={grupo.id} value={grupo.id}>
                      {grupo.nome}
                    </option>
                  ))}
                </Input>

                <Input
                  label="Subgrupo"
                  type="select"
                  disabled={isViewMode || !grupoId}
                  error={errors.subgrupo_id?.message}
                  {...register('subgrupo_id')}
                >
                  <option value="">Selecione um subgrupo...</option>
                  {subgruposFiltrados.map(subgrupo => (
                    <option key={subgrupo.id} value={subgrupo.id}>
                      {subgrupo.nome}
                    </option>
                  ))}
                </Input>
                {/* Debug temporário */}
                <div style={{fontSize: '12px', color: 'gray'}}>
                  Subgrupos disponíveis: {subgruposFiltrados.length}
                </div>

                <Input
                  label="Classe"
                  type="select"
                  disabled={isViewMode || !subgrupoId}
                  error={errors.classe_id?.message}
                  {...register('classe_id')}
                >
                  <option value="">Selecione uma classe...</option>
                  {classesFiltradas.map(classe => (
                    <option key={classe.id} value={classe.id}>
                      {classe.nome}
                    </option>
                  ))}
                </Input>
                {/* Debug temporário */}
                <div style={{fontSize: '12px', color: 'gray'}}>
                  Classes disponíveis: {classesFiltradas.length}
                </div>

                <Input
                  label="Marca"
                  type="select"
                  disabled={isViewMode}
                  error={errors.marca_id?.message}
                  {...register('marca_id')}
                >
                  <option value="">Selecione uma marca...</option>
                  {marcas.map(marca => (
                    <option key={marca.id} value={marca.id}>
                      {marca.marca}
                    </option>
                  ))}
                </Input>

                <Input
                  label="Agrupamento N3"
                  type="text"
                  placeholder="Ex: BOVINO"
                  disabled={isViewMode}
                  error={errors.agrupamento_n3?.message}
                  {...register('agrupamento_n3')}
                />

                <Input
                  label="Agrupamento N4"
                  type="text"
                  placeholder="Ex: PATINHO BOVINO EM CUBOS 1KG"
                  disabled={isViewMode}
                  error={errors.agrupamento_n4?.message}
                  {...register('agrupamento_n4')}
                />
              </div>
            </div>

            {/* Card 3: Unidade e Dimensões */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Unidade e Dimensões
              </h3>
              <div className="space-y-4">
                <Input
                  label="Unidade de Medida"
                  type="select"
                  disabled={isViewMode}
                  error={errors.unidade_id?.message}
                  {...register('unidade_id')}
                >
                  <option value="">Selecione uma unidade...</option>
                  {unidades.map(unidade => (
                    <option key={unidade.id} value={unidade.id}>
                      {unidade.nome} ({unidade.sigla})
                    </option>
                  ))}
                </Input>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantidade"
                    type="number"
                    step="0.001"
                    placeholder="Ex: 1.000"
                    disabled={isViewMode}
                    error={errors.quantidade?.message}
                    {...register('quantidade')}
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
                    label="NCM"
                    type="text"
                    placeholder="Classificação NCM"
                    disabled={isViewMode}
                    error={errors.ncm?.message}
                    {...register('ncm')}
                  />

                  <Input
                    label="CEST"
                    type="text"
                    placeholder="Código CEST"
                    disabled={isViewMode}
                    error={errors.cest?.message}
                    {...register('cest')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="CFOP"
                    type="text"
                    placeholder="Código CFOP"
                    disabled={isViewMode}
                    error={errors.cfop?.message}
                    {...register('cfop')}
                  />

                  <Input
                    label="CST ICMS"
                    type="text"
                    placeholder="CST ICMS"
                    disabled={isViewMode}
                    error={errors.cst_icms?.message}
                    {...register('cst_icms')}
                  />
                </div>

                <Input
                  label="CSOSN"
                  type="text"
                  placeholder="CSOSN"
                  disabled={isViewMode}
                  error={errors.csosn?.message}
                  {...register('csosn')}
                />

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

            {/* Card 5: Comercial e Documentos */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Comercial e Documentos
              </h3>
              <div className="space-y-4">
                <Input
                  label="Fornecedor"
                  type="select"
                  disabled={isViewMode}
                  error={errors.fornecedor_id?.message}
                  {...register('fornecedor_id')}
                >
                  <option value="">Selecione um fornecedor...</option>
                  {fornecedores.map(fornecedor => (
                    <option key={fornecedor.id} value={fornecedor.id}>
                      {fornecedor.razao_social}
                    </option>
                  ))}
                </Input>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Preço de Custo"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 15.50"
                    disabled={isViewMode}
                    error={errors.preco_custo?.message}
                    {...register('preco_custo')}
                  />

                  <Input
                    label="Preço de Venda"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 25.00"
                    disabled={isViewMode}
                    error={errors.preco_venda?.message}
                    {...register('preco_venda')}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Estoque Atual"
                    type="number"
                    placeholder="Ex: 100"
                    disabled={isViewMode}
                    error={errors.estoque_atual?.message}
                    {...register('estoque_atual')}
                  />

                  <Input
                    label="Estoque Mínimo"
                    type="number"
                    placeholder="Ex: 10"
                    disabled={isViewMode}
                    error={errors.estoque_minimo?.message}
                    {...register('estoque_minimo')}
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

                <Input
                  label="Regra Palet (Unidades)"
                  type="number"
                  placeholder="Ex: 1200"
                  disabled={isViewMode}
                  error={errors.regra_palet_un?.message}
                  {...register('regra_palet_un')}
                />
              </div>
            </div>
          </div>

          {/* Terceira Linha - 1 Card */}
          <div className="grid grid-cols-1 gap-6 mb-6">
            {/* Card 6: Referências e Informações */}
            <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 pb-2 border-b-2 border-green-600">
                Referências e Informações
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

                  <Input
                    label="Referência de Mercado"
                    type="text"
                    placeholder="Ex: Corte Bovino / Patinho / Cubos"
                    disabled={isViewMode}
                    error={errors.referencia_mercado?.message}
                    {...register('referencia_mercado')}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Integração Senior"
                    type="text"
                    placeholder="Ex: 123654"
                    disabled={isViewMode}
                    error={errors.integracao_senior?.message}
                    {...register('integracao_senior')}
                  />

                  <Input
                    label="Ficha de Homologação"
                    type="text"
                    placeholder="Ex: 123456"
                    disabled={isViewMode}
                    error={errors.ficha_homologacao?.message}
                    {...register('ficha_homologacao')}
                  />

                  <Input
                    label="Registro Específico"
                    type="text"
                    placeholder="Ex: 1234456 CA, REGISTRO, MODELO, Nº SERIE"
                    disabled={isViewMode}
                    error={errors.registro_especifico?.message}
                    {...register('registro_especifico')}
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
              </div>
            </div>
          </div>

          {/* Botões de Ação */}
          {!isViewMode && (
            <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
                className="flex items-center gap-2"
              >
                {produto ? 'Atualizar Produto' : 'Criar Produto'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoModal; 