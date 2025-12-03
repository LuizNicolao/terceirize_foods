/**
 * Modal para Ficha Homologação
 * Componente para criação e edição de fichas de homologação
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import { useAuth } from '../../contexts/AuthContext';
import {
  InformacoesBasicas,
  InformacoesProduto,
  AvaliacoesQualidade,
  ConclusaoDocumentacao
} from './sections';

const FichaHomologacaoModal = ({
  isOpen,
  onClose,
  fichaHomologacao,
  nomeGenericos,
  fornecedores,
  usuarios,
  onSubmit,
  viewMode = false
}) => {
  const { user } = useAuth();
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    watch,
    formState: { errors }
  } = useForm();

  // Carregar dados quando o modal abrir
  useEffect(() => {
    if (fichaHomologacao && isOpen) {
      // Preencher formulário com dados da ficha
      Object.keys(fichaHomologacao).forEach(key => {
        if (fichaHomologacao[key] !== null && fichaHomologacao[key] !== undefined) {
          setValue(key, fichaHomologacao[key]);
        }
      });
      // Se houver avaliador, usar o nome do avaliador
      if (fichaHomologacao.avaliador_nome) {
        setValue('avaliador_nome', fichaHomologacao.avaliador_nome);
      }
      // Preencher unidade de medida se vier do backend
      if (fichaHomologacao.unidade_medida_sigla && fichaHomologacao.unidade_medida_nome) {
        setValue('unidade_medida_nome', `${fichaHomologacao.unidade_medida_sigla} - ${fichaHomologacao.unidade_medida_nome}`);
      } else if (fichaHomologacao.unidade_medida_sigla) {
        setValue('unidade_medida_nome', fichaHomologacao.unidade_medida_sigla);
      } else if (fichaHomologacao.unidade_medida_nome) {
        setValue('unidade_medida_nome', fichaHomologacao.unidade_medida_nome);
      }
    } else if (!fichaHomologacao && isOpen) {
      // Resetar formulário para nova ficha
      reset();
      setValue('status', 'ativo');
      setValue('tipo', 'NOVO_PRODUTO');
      setValue('data_analise', new Date().toISOString().split('T')[0]);
      // Preencher avaliador automaticamente com usuário logado
      if (user) {
        setValue('avaliador_id', user.id);
        setValue('avaliador_nome', user.nome);
      }
    }
    
    // Registrar campos para validação
    register('produto_generico_id', { required: 'Nome genérico é obrigatório' });
    register('marca', { required: 'Marca é obrigatória' });
    register('fabricante', { required: 'Fabricante é obrigatório' });
    register('fornecedor_id', { required: 'Fornecedor é obrigatório' });
  }, [fichaHomologacao, isOpen, setValue, reset, user, register]);

  // Observar mudanças no tipo para mostrar/ocultar campo de PDF
  const tipoSelecionado = watch('tipo');

  // Observar mudanças no produto genérico para preencher unidade de medida automaticamente
  const produtoGenericoId = watch('produto_generico_id');
  useEffect(() => {
    if (produtoGenericoId && nomeGenericos) {
      const produtoGenericoSelecionado = nomeGenericos.find(pg => pg.id === parseInt(produtoGenericoId));
      if (produtoGenericoSelecionado && produtoGenericoSelecionado.unidade_medida_id) {
        setValue('unidade_medida_id', produtoGenericoSelecionado.unidade_medida_id);
        // Preencher nome da unidade de medida para exibição
        if (produtoGenericoSelecionado.unidade_medida_sigla && produtoGenericoSelecionado.unidade_medida_nome) {
          setValue('unidade_medida_nome', `${produtoGenericoSelecionado.unidade_medida_sigla} - ${produtoGenericoSelecionado.unidade_medida_nome}`);
        } else if (produtoGenericoSelecionado.unidade_medida_sigla) {
          setValue('unidade_medida_nome', produtoGenericoSelecionado.unidade_medida_sigla);
        } else if (produtoGenericoSelecionado.unidade_medida_nome) {
          setValue('unidade_medida_nome', produtoGenericoSelecionado.unidade_medida_nome);
        }
      } else {
        setValue('unidade_medida_id', null);
        setValue('unidade_medida_nome', '');
      }
    } else {
      setValue('unidade_medida_id', null);
      setValue('unidade_medida_nome', '');
    }
  }, [produtoGenericoId, nomeGenericos, setValue]);

  // Processar envio do formulário
  const handleFormSubmit = (data) => {
    const formData = {
      ...data,
      produto_generico_id: data.produto_generico_id ? parseInt(data.produto_generico_id) : null,
      fornecedor_id: data.fornecedor_id ? parseInt(data.fornecedor_id) : null,
      avaliador_id: data.avaliador_id ? parseInt(data.avaliador_id) : null,
      marca: data.marca ? data.marca.toUpperCase().trim() : null,
      fabricante: data.fabricante ? data.fabricante.toUpperCase().trim() : null,
      fabricacao: data.fabricacao || null,
      validade: data.validade || null
    };
    // Remover unidade_medida_nome (apenas para exibição)
    delete formData.unidade_medida_nome;

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
              {viewMode ? <FaEye className="w-5 h-5 text-white" /> : fichaHomologacao ? <FaEdit className="w-5 h-5 text-white" /> : <FaSave className="w-5 h-5 text-white" />}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {viewMode ? 'Visualizar Ficha de Homologação' : fichaHomologacao ? 'Editar Ficha de Homologação' : 'Nova Ficha de Homologação'}
              </h2>
              <p className="text-sm text-gray-600">
                {viewMode ? 'Visualizando informações da ficha de homologação' : fichaHomologacao ? 'Editando informações da ficha de homologação' : 'Preencha as informações da nova ficha de homologação'}
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
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6">
          <div className="space-y-6">
            
            {/* SEÇÃO 1: Informações Básicas */}
            <InformacoesBasicas
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              nomeGenericos={nomeGenericos}
              user={user}
              viewMode={viewMode}
              tipoSelecionado={tipoSelecionado}
              fichaHomologacao={fichaHomologacao}
            />

            {/* SEÇÃO 2: Informações do Produto */}
            <InformacoesProduto
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              fornecedores={fornecedores}
              viewMode={viewMode}
            />

            {/* SEÇÃO 3: Avaliações de Qualidade */}
            <AvaliacoesQualidade
              register={register}
              errors={errors}
              viewMode={viewMode}
            />

            {/* SEÇÃO 4: Conclusão e Documentação */}
            <ConclusaoDocumentacao
              register={register}
              errors={errors}
              viewMode={viewMode}
              fichaHomologacao={fichaHomologacao}
            />

            {/* Status (oculto ou em um lugar discreto) */}
            {!viewMode && (
              <div className="hidden">
                <select {...register('status')}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
              </div>
            )}
          </div>

          {/* Footer */}
          {!viewMode && (
            <div className="flex justify-end gap-3 mt-6 pt-6 border-t border-gray-200">
              <Button
                type="button"
                variant="ghost"
                onClick={onClose}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                variant="primary"
              >
                <FaSave className="mr-2" />
                {fichaHomologacao ? 'Atualizar' : 'Salvar'}
              </Button>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default FichaHomologacaoModal;
