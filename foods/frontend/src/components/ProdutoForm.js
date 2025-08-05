import React from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal } from './ui';

const ProdutoForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  produto = null, 
  viewMode = false,
  grupos = [],
  subgrupos = [],
  classes = [],
  marcas = [],
  unidades = [],
  fornecedores = []
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();

  // Reset form when produto changes
  React.useEffect(() => {
    if (produto) {
      Object.keys(produto).forEach(key => {
        setValue(key, produto[key]);
      });
    } else {
      reset();
    }
  }, [produto, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={viewMode ? 'Visualizar Produto' : (produto ? 'Editar Produto' : 'Novo Produto')}
      size="xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Informações Básicas */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Básicas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Código do Produto"
              {...register('codigo_produto')}
              disabled={viewMode}
              placeholder="Ex: PROD001"
            />
            
            <Input
              label="Nome do Produto"
              {...register('nome', { required: 'Nome é obrigatório' })}
              disabled={viewMode}
              error={errors.nome?.message}
              placeholder="Ex: PATINHO BOVINO EM CUBOS"
            />

            <Input
              label="Descrição"
              type="textarea"
              {...register('descricao')}
              disabled={viewMode}
              rows={3}
              placeholder="Descrição detalhada do produto"
            />

            <Input
              label="Código de Barras"
              {...register('codigo_barras')}
              disabled={viewMode}
              placeholder="Ex: 1234567891234"
            />
          </div>
        </div>

        {/* Referências */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Referências</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Referência Interna"
              {...register('referencia')}
              disabled={viewMode}
              placeholder="Ex: 123654"
            />

            <Input
              label="Referência Externa"
              {...register('referencia_externa')}
              disabled={viewMode}
              placeholder="Ex: 123654"
            />

            <Input
              label="Referência do Mercado"
              {...register('referencia_mercado')}
              disabled={viewMode}
              placeholder="Ex: Corte Bovino / Patinho / Cubos"
            />

            <Input
              label="Nome Genérico"
              {...register('nome_generico')}
              disabled={viewMode}
              placeholder="Nome genérico do produto"
            />
          </div>
        </div>

        {/* Classificação */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Classificação</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              disabled={viewMode}
            >
              <option value="">Selecione um grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </Input>

            <Input
              label="Subgrupo"
              type="select"
              {...register('subgrupo_id')}
              disabled={viewMode}
            >
              <option value="">Selecione um subgrupo</option>
              {subgrupos.map(subgrupo => (
                <option key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </option>
              ))}
            </Input>

            <Input
              label="Classe"
              type="select"
              {...register('classe_id')}
              disabled={viewMode}
            >
              <option value="">Selecione uma classe</option>
              {classes.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </Input>

            <Input
              label="Marca"
              type="select"
              {...register('marca_id')}
              disabled={viewMode}
            >
              <option value="">Selecione uma marca</option>
              {marcas.map(marca => (
                <option key={marca.id} value={marca.id}>
                  {marca.nome}
                </option>
              ))}
            </Input>
          </div>
        </div>

        {/* Agrupamentos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Agrupamentos</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Agrupamento N3"
              {...register('agrupamento_n3')}
              disabled={viewMode}
              placeholder="Ex: BOVINO"
            />

            <Input
              label="Agrupamento N4"
              {...register('agrupamento_n4')}
              disabled={viewMode}
              placeholder="Ex: PATINHO BOVINO EM CUBOS 1KG"
            />

            <Input
              label="Marca"
              {...register('marca')}
              disabled={viewMode}
              placeholder="Ex: KING"
            />

            <Input
              label="Fabricante"
              {...register('fabricante')}
              disabled={viewMode}
              placeholder="Ex: KING"
            />
          </div>
        </div>

        {/* Medidas e Pesos */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Medidas e Pesos</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Unidade de Medida"
              type="select"
              {...register('unidade_id')}
              disabled={viewMode}
            >
              <option value="">Selecione uma unidade</option>
              {unidades.map(unidade => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.nome}
                </option>
              ))}
            </Input>

            <Input
              label="Quantidade"
              type="number"
              step="0.001"
              {...register('quantidade')}
              disabled={viewMode}
              placeholder="1.000"
            />

            <Input
              label="Fator de Conversão"
              type="number"
              step="0.001"
              {...register('fator_conversao')}
              disabled={viewMode}
              placeholder="1.000"
            />

            <Input
              label="Peso Líquido (kg)"
              type="number"
              step="0.001"
              {...register('peso_liquido')}
              disabled={viewMode}
              placeholder="1.000"
            />

            <Input
              label="Peso Bruto (kg)"
              type="number"
              step="0.001"
              {...register('peso_bruto')}
              disabled={viewMode}
              placeholder="1.000"
            />

            <Input
              label="Regra Palet (UN)"
              type="number"
              {...register('regra_palet_un')}
              disabled={viewMode}
              placeholder="1200"
            />
          </div>
        </div>

        {/* Dimensões */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Dimensões</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Comprimento (cm)"
              type="number"
              step="0.01"
              {...register('comprimento')}
              disabled={viewMode}
              placeholder="20.00"
            />

            <Input
              label="Largura (cm)"
              type="number"
              step="0.01"
              {...register('largura')}
              disabled={viewMode}
              placeholder="15.00"
            />

            <Input
              label="Altura (cm)"
              type="number"
              step="0.01"
              {...register('altura')}
              disabled={viewMode}
              placeholder="10.00"
            />

            <Input
              label="Volume (cm³)"
              type="number"
              step="0.01"
              {...register('volume')}
              disabled={viewMode}
              placeholder="3000.00"
            />
          </div>
        </div>

        {/* Validade */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Validade</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Prazo de Validade"
              type="number"
              {...register('prazo_validade')}
              disabled={viewMode}
              placeholder="12"
            />

            <Input
              label="Unidade de Validade"
              type="select"
              {...register('unidade_validade')}
              disabled={viewMode}
            >
              <option value="">Selecione</option>
              <option value="DIAS">Dias</option>
              <option value="SEMANAS">Semanas</option>
              <option value="MESES">Meses</option>
              <option value="ANOS">Anos</option>
            </Input>
          </div>
        </div>

        {/* Informações Fiscais */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Fiscais</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="NCM"
              {...register('ncm')}
              disabled={viewMode}
              placeholder="Classificação NCM"
            />

            <Input
              label="CEST"
              {...register('cest')}
              disabled={viewMode}
              placeholder="Código CEST"
            />

            <Input
              label="CFOP"
              {...register('cfop')}
              disabled={viewMode}
              placeholder="Código CFOP"
            />

            <Input
              label="EAN"
              {...register('ean')}
              disabled={viewMode}
              placeholder="Código EAN"
            />

            <Input
              label="CST ICMS"
              {...register('cst_icms')}
              disabled={viewMode}
              placeholder="CST ICMS"
            />

            <Input
              label="CSOSN"
              {...register('csosn')}
              disabled={viewMode}
              placeholder="CSOSN"
            />

            <Input
              label="Alíquota ICMS (%)"
              type="number"
              step="0.01"
              {...register('aliquota_icms')}
              disabled={viewMode}
              placeholder="0.00"
            />

            <Input
              label="Alíquota IPI (%)"
              type="number"
              step="0.01"
              {...register('aliquota_ipi')}
              disabled={viewMode}
              placeholder="0.00"
            />

            <Input
              label="Alíquota PIS (%)"
              type="number"
              step="0.01"
              {...register('aliquota_pis')}
              disabled={viewMode}
              placeholder="0.00"
            />

            <Input
              label="Alíquota COFINS (%)"
              type="number"
              step="0.01"
              {...register('aliquota_cofins')}
              disabled={viewMode}
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Preços e Estoque */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Preços e Estoque</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Preço de Custo"
              type="number"
              step="0.01"
              {...register('preco_custo')}
              disabled={viewMode}
              placeholder="0.00"
            />

            <Input
              label="Preço de Venda"
              type="number"
              step="0.01"
              {...register('preco_venda')}
              disabled={viewMode}
              placeholder="0.00"
            />

            <Input
              label="Estoque Atual"
              type="number"
              {...register('estoque_atual')}
              disabled={viewMode}
              placeholder="0"
            />

            <Input
              label="Estoque Mínimo"
              type="number"
              {...register('estoque_minimo')}
              disabled={viewMode}
              placeholder="0"
            />

            <Input
              label="Fornecedor"
              type="select"
              {...register('fornecedor_id')}
              disabled={viewMode}
            >
              <option value="">Selecione um fornecedor</option>
              {fornecedores.map(fornecedor => (
                <option key={fornecedor.id} value={fornecedor.id}>
                  {fornecedor.razao_social}
                </option>
              ))}
            </Input>

            <Input
              label="Status"
              type="select"
              {...register('status')}
              disabled={viewMode}
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </Input>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Informações Adicionais</h3>
          <div className="grid grid-cols-1 gap-4">
            <Input
              label="Informações Adicionais"
              type="textarea"
              {...register('informacoes_adicionais')}
              disabled={viewMode}
              rows={3}
              placeholder="Ex: PRODUTO COM 5% DE GORDURA"
            />

            <Input
              label="Ficha de Homologação"
              {...register('ficha_homologacao')}
              disabled={viewMode}
              placeholder="Ex: 123456"
            />

            <Input
              label="Registro Específico"
              {...register('registro_especifico')}
              disabled={viewMode}
              placeholder="Ex: 1234456 CA, REGISTRO, MODELO, Nº SERIE"
            />

            <Input
              label="Integração Senior"
              {...register('integracao_senior')}
              disabled={viewMode}
              placeholder="Ex: 123654"
            />
          </div>
        </div>

        {/* Botões */}
        {!viewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {produto ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ProdutoForm; 