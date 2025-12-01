import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import ProdutoComercialService from '../../services/produtoComercial';

const ProdutoComercialModal = ({
  isOpen,
  onClose,
  onSubmit,
  produtoComercial,
  viewMode,
  grupos,
  subgrupos,
  classes,
  unidadesMedida,
  loading
}) => {
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm();
  const [carregandoCodigo, setCarregandoCodigo] = useState(false);

  // Observar mudanças nos campos para filtros dependentes
  const grupoId = watch('grupo_id');
  const subgrupoId = watch('subgrupo_id');

  // Filtrar subgrupos baseado no grupo selecionado
  const subgruposFiltrados = grupoId && grupoId !== '' 
    ? subgrupos.filter(sg => String(sg.grupo_id) === String(grupoId))
    : produtoComercial && produtoComercial.grupo_id 
      ? subgrupos.filter(sg => String(sg.grupo_id) === String(produtoComercial.grupo_id))
      : [];

  // Filtrar classes baseado no subgrupo selecionado
  const classesFiltradas = subgrupoId && subgrupoId !== '' 
    ? classes.filter(c => String(c.subgrupo_id) === String(subgrupoId))
    : produtoComercial && produtoComercial.subgrupo_id 
      ? classes.filter(c => String(c.subgrupo_id) === String(produtoComercial.subgrupo_id))
      : [];

  useEffect(() => {
    const carregarProximoCodigo = async () => {
      if (produtoComercial && isOpen) {
        // Preencher formulário com dados do produto comercial
        Object.keys(produtoComercial).forEach(key => {
          if (produtoComercial[key] !== null && produtoComercial[key] !== undefined) {
            setValue(key, produtoComercial[key]);
          }
        });
      } else if (!produtoComercial && isOpen) {
        // Resetar formulário para novo produto comercial
        reset();
        setValue('status', 1);
        
        // Buscar próximo código disponível do backend
        setCarregandoCodigo(true);
        try {
          const response = await ProdutoComercialService.obterProximoCodigo();
          if (response.success) {
            setValue('codigo', response.data.proximoCodigo);
          } else {
            setValue('codigo', 'Erro ao gerar código');
          }
        } catch (error) {
          console.error('Erro ao obter próximo código:', error);
          setValue('codigo', 'Erro ao gerar código');
        } finally {
          setCarregandoCodigo(false);
        }
      }
    };

    carregarProximoCodigo();
  }, [produtoComercial, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    // Converter campos numéricos e enviar apenas os campos editáveis
    const formData = {
      codigo: data.codigo,
      nome_comercial: data.nome_comercial,
      unidade_medida_id: data.unidade_medida_id ? parseInt(data.unidade_medida_id) : null,
      grupo_id: data.grupo_id ? parseInt(data.grupo_id) : null,
      subgrupo_id: data.subgrupo_id ? parseInt(data.subgrupo_id) : null,
      classe_id: data.classe_id ? parseInt(data.classe_id) : null,
      status: parseInt(data.status) || 1
    };

    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="full">
      <div className="bg-white rounded-lg shadow-xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : produtoComercial ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Produto Comercial' : produtoComercial ? 'Editar Produto Comercial' : 'Novo Produto Comercial'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações do produto comercial' : produtoComercial ? 'Editando informações do produto comercial' : 'Preencha as informações do novo produto comercial'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <FaTimes className="w-5 h-5" />
          </Button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Código */}
            <Input
              label="Código *"
              placeholder="Código gerado automaticamente"
              {...register('codigo', {
                required: 'Código é obrigatório'
              })}
              error={errors.codigo?.message}
              disabled={true}
            />

            {/* Nome Comercial */}
            <Input
              label="Nome comercial *"
              {...register('nome_comercial', {
                required: 'Nome comercial é obrigatório',
                minLength: { value: 3, message: 'Nome comercial deve ter pelo menos 3 caracteres' },
                maxLength: { value: 200, message: 'Nome comercial deve ter no máximo 200 caracteres' }
              })}
              error={errors.nome_comercial?.message}
              disabled={viewMode}
            />

            {/* Unidade de Medida */}
            <Input
              label="Unidade de Medida *"
              type="select"
              {...register('unidade_medida_id', {
                required: 'Unidade de medida é obrigatória',
                validate: value => value && value !== '' ? true : 'Unidade de medida é obrigatória'
              })}
              error={errors.unidade_medida_id?.message}
              disabled={viewMode}
            >
              <option value="">Selecione uma unidade</option>
              {unidadesMedida.map(unidade => (
                <option key={unidade.id} value={unidade.id}>
                  {unidade.sigla} - {unidade.nome}
                </option>
              ))}
            </Input>

            {/* Grupo */}
            <Input
              label="Grupo"
              type="select"
              {...register('grupo_id')}
              error={errors.grupo_id?.message}
              disabled={viewMode}
            >
              <option value="">Selecione um grupo</option>
              {grupos.map(grupo => (
                <option key={grupo.id} value={grupo.id}>
                  {grupo.nome}
                </option>
              ))}
            </Input>

            {/* Subgrupo */}
            <Input
              label="Subgrupo"
              type="select"
              {...register('subgrupo_id')}
              error={errors.subgrupo_id?.message}
              disabled={viewMode || !grupoId}
            >
              <option value="">Selecione um subgrupo</option>
              {subgruposFiltrados.map(subgrupo => (
                <option key={subgrupo.id} value={subgrupo.id}>
                  {subgrupo.nome}
                </option>
              ))}
            </Input>

            {/* Classe */}
            <Input
              label="Classe"
              type="select"
              {...register('classe_id')}
              error={errors.classe_id?.message}
              disabled={viewMode || !subgrupoId}
            >
              <option value="">Selecione uma classe</option>
              {classesFiltradas.map(classe => (
                <option key={classe.id} value={classe.id}>
                  {classe.nome}
                </option>
              ))}
            </Input>

            {/* Status */}
            <Input
              label="Status"
              type="select"
              {...register('status')}
              error={errors.status?.message}
              disabled={viewMode}
            >
              <option value={1}>Ativo</option>
              <option value={0}>Inativo</option>
            </Input>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
            {!viewMode && (
              <Button type="submit" variant="primary" size="lg" disabled={loading}>
                {loading ? 'Salvando...' : produtoComercial ? 'Atualizar' : 'Criar'}
              </Button>
            )}
            <Button type="button" variant="outline" size="lg" onClick={onClose}>
              {viewMode ? 'Fechar' : 'Cancelar'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default ProdutoComercialModal;

