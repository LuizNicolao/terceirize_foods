import React, { useState, useEffect } from 'react';
import { Modal, Input, Button } from '../ui';

const ProdutoOrigemModal = ({
  isOpen,
  onClose,
  onSubmit,
  produtoOrigem,
  viewMode,
  grupos,
  subgrupos,
  classes,
  unidadesMedida,
  produtosGenericosPadrao,
  loading
}) => {
  const [selectedGrupo, setSelectedGrupo] = useState('');
  const [selectedSubgrupo, setSelectedSubgrupo] = useState('');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = selectedGrupo 
    ? subgrupos.filter(sg => sg.grupo_id === parseInt(selectedGrupo))
    : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = selectedSubgrupo 
    ? classes.filter(c => c.subgrupo_id === parseInt(selectedSubgrupo))
    : [];

  useEffect(() => {
    if (produtoOrigem) {
      setSelectedGrupo(produtoOrigem.grupo_id || '');
      setSelectedSubgrupo(produtoOrigem.subgrupo_id || '');
    } else {
      setSelectedGrupo('');
      setSelectedSubgrupo('');
    }
  }, [produtoOrigem]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    const data = {
      codigo: formData.get('codigo'),
      nome: formData.get('nome'),
      unidade_medida_id: formData.get('unidade_medida_id') ? parseInt(formData.get('unidade_medida_id')) : null,
      fator_conversao: formData.get('fator_conversao') ? parseFloat(formData.get('fator_conversao')) : 1.000,
      grupo_id: formData.get('grupo_id') ? parseInt(formData.get('grupo_id')) : null,
      subgrupo_id: formData.get('subgrupo_id') ? parseInt(formData.get('subgrupo_id')) : null,
      classe_id: formData.get('classe_id') ? parseInt(formData.get('classe_id')) : null,
      peso_liquido: formData.get('peso_liquido') ? parseFloat(formData.get('peso_liquido')) : null,
      referencia_mercado: formData.get('referencia_mercado'),
      produto_generico_padrao_id: formData.get('produto_generico_padrao_id') ? parseInt(formData.get('produto_generico_padrao_id')) : null,
      status: formData.get('status') ? 1 : 0
    };

    onSubmit(data);
  };

  const handleGrupoChange = (e) => {
    const grupoId = e.target.value;
    setSelectedGrupo(grupoId);
    setSelectedSubgrupo('');
  };

  const handleSubgrupoChange = (e) => {
    const subgrupoId = e.target.value;
    setSelectedSubgrupo(subgrupoId);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={viewMode ? 'Visualizar Produto Origem' : produtoOrigem ? 'Editar Produto Origem' : 'Novo Produto Origem'}
      size="xl"
    >
      <form onSubmit={handleFormSubmit} className="space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label="Código *"
            name="codigo"
            defaultValue={produtoOrigem?.codigo}
            disabled={viewMode}
            required
            pattern="[a-zA-Z0-9\-_]+"
            title="Apenas letras, números, hífens e underscores"
          />
          
          <Input
            label="Nome *"
            name="nome"
            defaultValue={produtoOrigem?.nome}
            disabled={viewMode}
            required
            minLength={3}
          />
          
          <Input
            label="Unidade de Medida *"
            name="unidade_medida_id"
            type="select"
            defaultValue={produtoOrigem?.unidade_medida_id}
            disabled={viewMode}
            required
          >
            <option value="">Selecione uma unidade</option>
            {unidadesMedida.map(unidade => (
              <option key={unidade.id} value={unidade.id}>
                {unidade.nome}
              </option>
            ))}
          </Input>
          
          <Input
            label="Fator de Conversão"
            name="fator_conversao"
            type="number"
            step="0.001"
            min="0.001"
            defaultValue={produtoOrigem?.fator_conversao || '1.000'}
            disabled={viewMode}
          />
          
          <Input
            label="Grupo"
            name="grupo_id"
            type="select"
            defaultValue={produtoOrigem?.grupo_id}
            onChange={handleGrupoChange}
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
            name="subgrupo_id"
            type="select"
            defaultValue={produtoOrigem?.subgrupo_id}
            onChange={handleSubgrupoChange}
            disabled={viewMode || !selectedGrupo}
          >
            <option value="">Selecione um subgrupo</option>
            {subgruposFiltrados.map(subgrupo => (
              <option key={subgrupo.id} value={subgrupo.id}>
                {subgrupo.nome}
              </option>
            ))}
          </Input>
          
          <Input
            label="Classe"
            name="classe_id"
            type="select"
            defaultValue={produtoOrigem?.classe_id}
            disabled={viewMode || !selectedSubgrupo}
          >
            <option value="">Selecione uma classe</option>
            {classesFiltradas.map(classe => (
              <option key={classe.id} value={classe.id}>
                {classe.nome}
              </option>
            ))}
          </Input>
          
          <Input
            label="Peso Líquido (kg)"
            name="peso_liquido"
            type="number"
            step="0.001"
            min="0.001"
            defaultValue={produtoOrigem?.peso_liquido}
            disabled={viewMode}
          />
          
          <Input
            label="Produto Genérico Padrão"
            name="produto_generico_padrao_id"
            type="select"
            defaultValue={produtoOrigem?.produto_generico_padrao_id}
            disabled={viewMode}
          >
            <option value="">Selecione um produto genérico</option>
            {produtosGenericosPadrao.map(produto => (
              <option key={produto.id} value={produto.id}>
                {produto.nome}
              </option>
            ))}
          </Input>
        </div>

        <Input
          label="Referência de Mercado"
          name="referencia_mercado"
          defaultValue={produtoOrigem?.referencia_mercado}
          disabled={viewMode}
        />

        <Input
          label="Produto ativo"
          name="status"
          type="checkbox"
          defaultChecked={produtoOrigem?.status !== 0}
          disabled={viewMode}
        />

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
          {!viewMode && (
            <Button type="submit" variant="primary" size="lg" disabled={loading}>
              {loading ? 'Salvando...' : produtoOrigem ? 'Atualizar' : 'Criar'}
            </Button>
          )}
          <Button type="button" variant="outline" size="lg" onClick={onClose}>
            {viewMode ? 'Fechar' : 'Cancelar'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default ProdutoOrigemModal;
