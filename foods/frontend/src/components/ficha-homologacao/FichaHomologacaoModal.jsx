/**
 * Modal para Ficha Homologação
 * Componente para criação e edição de fichas de homologação
 */

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaPrint } from 'react-icons/fa';
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
  viewMode = false,
  onPrint
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
      // Avaliador já é preenchido pelo loop acima
      // Preencher unidade de medida se vier do backend (apenas sigla)
      if (fichaHomologacao.unidade_medida_sigla) {
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
      }
    }
    
    // Registrar campos para validação
    register('produto_generico_id', { required: 'Nome genérico é obrigatório' });
    register('marca', { required: 'Marca é obrigatória' });
    register('fabricante', { required: 'Fabricante é obrigatório' });
    register('fornecedor_id', { required: 'Fornecedor é obrigatório' });
    register('avaliador_id', { required: 'Avaliador é obrigatório' });
  }, [fichaHomologacao, isOpen, setValue, reset, user, register]);

  // Observar mudanças no tipo para mostrar/ocultar campo de PDF
  const tipoSelecionado = watch('tipo');

  // Observar mudanças no produto genérico para preencher unidade de medida e peso líquido automaticamente
  const produtoGenericoId = watch('produto_generico_id');
  useEffect(() => {
    if (produtoGenericoId && nomeGenericos && nomeGenericos.length > 0) {
      const produtoGenerico = nomeGenericos.find(pg => pg.id === parseInt(produtoGenericoId));
      if (produtoGenerico) {
        // Preencher unidade de medida
        if (produtoGenerico.unidade_medida_id) {
          setValue('unidade_medida_id', produtoGenerico.unidade_medida_id);
        }
        // Preencher nome da unidade de medida para exibição (apenas sigla)
        if (produtoGenerico.unidade_medida_sigla) {
          setValue('unidade_medida_nome', produtoGenerico.unidade_medida_sigla);
        } else if (produtoGenerico.unidade_medida_nome) {
          setValue('unidade_medida_nome', produtoGenerico.unidade_medida_nome);
        }
        
        // Preencher peso líquido na avaliação de qualidade (primeira linha "Peso")
        if (produtoGenerico.peso_liquido) {
          setValue('peso_valor', produtoGenerico.peso_liquido);
        }
      }
    }
  }, [produtoGenericoId, nomeGenericos, setValue]);

  // Calcular Fator de Cocção automaticamente (Peso Cozido / Peso Cru)
  const pesoCozidoValor = watch('peso_cozido_valor');
  const pesoCruValor = watch('peso_cru_valor');
  useEffect(() => {
    if (pesoCozidoValor && pesoCruValor && parseFloat(pesoCruValor) > 0) {
      const fatorCoccao = parseFloat(pesoCozidoValor) / parseFloat(pesoCruValor);
      // Arredondar para 3 casas decimais
      const fatorCoccaoArredondado = Math.round(fatorCoccao * 1000) / 1000;
      setValue('fator_coccao_valor', fatorCoccaoArredondado);
    } else if (!pesoCozidoValor || !pesoCruValor || parseFloat(pesoCruValor) === 0) {
      // Limpar o campo se algum dos valores for removido ou se peso cru for zero
      setValue('fator_coccao_valor', '');
    }
  }, [pesoCozidoValor, pesoCruValor, setValue]);

  // Processar envio do formulário
  const handleFormSubmit = (data) => {
    // Converter valores vazios para null e garantir tipos corretos
    const convertValue = (value, converter) => {
      if (value === '' || value === undefined || value === null) return null;
      return converter ? converter(value) : value;
    };

    // Função auxiliar para extrair File de FileList ou File
    const getFile = (value) => {
      if (!value) return null;
      // Se for FileList, pegar o primeiro arquivo
      if (value instanceof FileList && value.length > 0) {
        return value[0];
      }
      // Se já for File, retornar diretamente
      if (value instanceof File) {
        return value;
      }
      return null;
    };

    // Extrair arquivos do FileList
    const fotoEmbalagemFile = getFile(data.foto_embalagem);
    const fotoProdutoCruFile = getFile(data.foto_produto_cru);
    const fotoProdutoCozidoFile = getFile(data.foto_produto_cozido);
    const pdfAvaliacaoAntigaFile = getFile(data.pdf_avaliacao_antiga);

    // Verificar se há arquivos para upload
    const temArquivos = fotoEmbalagemFile || fotoProdutoCruFile || fotoProdutoCozidoFile || pdfAvaliacaoAntigaFile;

    // Se houver arquivos, usar FormData
    if (temArquivos) {
      const formDataToSend = new FormData();
      
      // Adicionar arquivos se existirem
      if (fotoEmbalagemFile) {
        formDataToSend.append('foto_embalagem', fotoEmbalagemFile);
      } else if (fichaHomologacao && data.foto_embalagem && typeof data.foto_embalagem === 'string' && !data.foto_embalagem.startsWith('data:') && !data.foto_embalagem.startsWith('http')) {
        // Manter caminho existente se não for um novo arquivo
        formDataToSend.append('foto_embalagem', data.foto_embalagem);
      }

      if (fotoProdutoCruFile) {
        formDataToSend.append('foto_produto_cru', fotoProdutoCruFile);
      } else if (fichaHomologacao && data.foto_produto_cru && typeof data.foto_produto_cru === 'string' && !data.foto_produto_cru.startsWith('data:') && !data.foto_produto_cru.startsWith('http')) {
        formDataToSend.append('foto_produto_cru', data.foto_produto_cru);
      }

      if (fotoProdutoCozidoFile) {
        formDataToSend.append('foto_produto_cozido', fotoProdutoCozidoFile);
      } else if (fichaHomologacao && data.foto_produto_cozido && typeof data.foto_produto_cozido === 'string' && !data.foto_produto_cozido.startsWith('data:') && !data.foto_produto_cozido.startsWith('http')) {
        formDataToSend.append('foto_produto_cozido', data.foto_produto_cozido);
      }

      if (pdfAvaliacaoAntigaFile) {
        formDataToSend.append('pdf_avaliacao_antiga', pdfAvaliacaoAntigaFile);
      } else if (fichaHomologacao && data.pdf_avaliacao_antiga && typeof data.pdf_avaliacao_antiga === 'string' && !data.pdf_avaliacao_antiga.startsWith('data:') && !data.pdf_avaliacao_antiga.startsWith('http')) {
        formDataToSend.append('pdf_avaliacao_antiga', data.pdf_avaliacao_antiga);
      }

      // Adicionar todos os outros campos como JSON string (para o parseFormData processar)
      const dadosJson = {
        // IDs obrigatórios
        produto_generico_id: convertValue(data.produto_generico_id, (v) => parseInt(v)),
        fornecedor_id: convertValue(data.fornecedor_id, (v) => parseInt(v)),
        avaliador_id: convertValue(data.avaliador_id, (v) => parseInt(v)),
        unidade_medida_id: convertValue(data.unidade_medida_id, (v) => parseInt(v)),
        
        // Campos obrigatórios de texto
        tipo: data.tipo || null,
        data_analise: data.data_analise || null,
        marca: data.marca ? data.marca.toUpperCase().trim() : '',
        fabricante: data.fabricante ? data.fabricante.toUpperCase().trim() : '',
        composicao: data.composicao ? data.composicao.trim() : '',
        lote: data.lote ? data.lote.trim() : '',
        conclusao: data.conclusao ? data.conclusao.trim() : '',
        resultado_final: data.resultado_final || null,
        
        // Campos de avaliação obrigatórios
        peso: data.peso || null,
        peso_cru: data.peso_cru || null,
        peso_cozido: data.peso_cozido || null,
        fator_coccao: data.fator_coccao || null,
        cor: data.cor || null,
        odor: data.odor || null,
        sabor: data.sabor || null,
        aparencia: data.aparencia || null,
        
        // Campos decimais opcionais
        peso_valor: convertValue(data.peso_valor, (v) => parseFloat(v)),
        peso_cru_valor: convertValue(data.peso_cru_valor, (v) => parseFloat(v)),
        peso_cozido_valor: convertValue(data.peso_cozido_valor, (v) => parseFloat(v)),
        fator_coccao_valor: convertValue(data.fator_coccao_valor, (v) => parseFloat(v)),
        
        // Campos de observação opcionais
        cor_observacao: convertValue(data.cor_observacao, (v) => v.trim()),
        odor_observacao: convertValue(data.odor_observacao, (v) => v.trim()),
        sabor_observacao: convertValue(data.sabor_observacao, (v) => v.trim()),
        aparencia_observacao: convertValue(data.aparencia_observacao, (v) => v.trim()),
        
        // Datas opcionais
        fabricacao: data.fabricacao || null,
        validade: data.validade || null,
        
        // Status
        status: data.status || 'ativo'
      };

      // Adicionar dados JSON ao FormData
      // FormData converte tudo para string, então precisamos garantir que os valores estejam no formato correto
      Object.keys(dadosJson).forEach(key => {
        const value = dadosJson[key];
        // Não adicionar valores null, undefined ou strings vazias (exceto para campos obrigatórios que podem ser strings vazias)
        if (value !== null && value !== undefined) {
          // Para strings vazias, não adicionar (será tratado como null no backend)
          if (typeof value === 'string' && value.trim() === '') {
            return;
          }
          // Converter para string (FormData faz isso automaticamente, mas garantimos o tipo correto)
          let valorParaEnviar;
          if (typeof value === 'number') {
            valorParaEnviar = value.toString();
          } else if (typeof value === 'boolean') {
            valorParaEnviar = value.toString();
          } else if (typeof value === 'string') {
            valorParaEnviar = value;
          } else {
            // Para outros tipos, converter para string
            valorParaEnviar = String(value);
          }
          formDataToSend.append(key, valorParaEnviar);
        }
      });

      onSubmit(formDataToSend);
    } else {
      // Se não houver arquivos, enviar como JSON normal
    const formData = {
      // IDs obrigatórios
      produto_generico_id: convertValue(data.produto_generico_id, (v) => parseInt(v)),
      fornecedor_id: convertValue(data.fornecedor_id, (v) => parseInt(v)),
      avaliador_id: convertValue(data.avaliador_id, (v) => parseInt(v)),
      unidade_medida_id: convertValue(data.unidade_medida_id, (v) => parseInt(v)),
      
      // Campos obrigatórios de texto
      tipo: data.tipo || null,
      data_analise: data.data_analise || null,
      marca: data.marca ? data.marca.toUpperCase().trim() : '',
      fabricante: data.fabricante ? data.fabricante.toUpperCase().trim() : '',
      composicao: data.composicao ? data.composicao.trim() : '',
      lote: data.lote ? data.lote.trim() : '',
      conclusao: data.conclusao ? data.conclusao.trim() : '',
      resultado_final: data.resultado_final || null,
      
        // Campos de avaliação obrigatórios
      peso: data.peso || null,
      peso_cru: data.peso_cru || null,
      peso_cozido: data.peso_cozido || null,
      fator_coccao: data.fator_coccao || null,
      cor: data.cor || null,
      odor: data.odor || null,
      sabor: data.sabor || null,
      aparencia: data.aparencia || null,
      
      // Campos decimais opcionais
      peso_valor: convertValue(data.peso_valor, (v) => parseFloat(v)),
      peso_cru_valor: convertValue(data.peso_cru_valor, (v) => parseFloat(v)),
      peso_cozido_valor: convertValue(data.peso_cozido_valor, (v) => parseFloat(v)),
      fator_coccao_valor: convertValue(data.fator_coccao_valor, (v) => parseFloat(v)),
      
      // Campos de observação opcionais
      cor_observacao: convertValue(data.cor_observacao, (v) => v.trim()),
      odor_observacao: convertValue(data.odor_observacao, (v) => v.trim()),
      sabor_observacao: convertValue(data.sabor_observacao, (v) => v.trim()),
      aparencia_observacao: convertValue(data.aparencia_observacao, (v) => v.trim()),
      
      // Datas opcionais
      fabricacao: data.fabricacao || null,
      validade: data.validade || null,
      
      // Status
      status: data.status || 'ativo'
    };
    
    // Remover campos que não devem ser enviados
    delete formData.unidade_medida_nome;
    
      // Para edição, manter caminhos de arquivos existentes se não houver novos
    if (fichaHomologacao) {
        if (data.foto_embalagem && typeof data.foto_embalagem === 'string' && !data.foto_embalagem.startsWith('data:') && !data.foto_embalagem.startsWith('http')) {
          formData.foto_embalagem = data.foto_embalagem;
      }
        if (data.foto_produto_cru && typeof data.foto_produto_cru === 'string' && !data.foto_produto_cru.startsWith('data:') && !data.foto_produto_cru.startsWith('http')) {
          formData.foto_produto_cru = data.foto_produto_cru;
      }
        if (data.foto_produto_cozido && typeof data.foto_produto_cozido === 'string' && !data.foto_produto_cozido.startsWith('data:') && !data.foto_produto_cozido.startsWith('http')) {
          formData.foto_produto_cozido = data.foto_produto_cozido;
      }
        if (data.pdf_avaliacao_antiga && typeof data.pdf_avaliacao_antiga === 'string' && !data.pdf_avaliacao_antiga.startsWith('data:') && !data.pdf_avaliacao_antiga.startsWith('http')) {
          formData.pdf_avaliacao_antiga = data.pdf_avaliacao_antiga;
      }
    }

    onSubmit(formData);
    }
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
          <div className="flex items-center gap-2">
            {viewMode && fichaHomologacao && onPrint && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPrint(fichaHomologacao.id)}
                className="flex items-center gap-2"
              >
                <FaPrint className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimir</span>
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
          <div className="space-y-6">
            
            {/* SEÇÃO 1: Informações Básicas */}
            <InformacoesBasicas
              register={register}
              watch={watch}
              setValue={setValue}
              errors={errors}
              nomeGenericos={nomeGenericos}
              usuarios={usuarios}
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
              watch={watch}
              setValue={setValue}
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
