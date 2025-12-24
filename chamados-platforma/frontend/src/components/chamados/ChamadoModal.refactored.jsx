import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave } from 'react-icons/fa';
import { Button, Modal } from '../ui';
import InformacoesBasicasForm from './forms/InformacoesBasicasForm';
import StatusPrioridadeForm from './forms/StatusPrioridadeForm';
import DescricaoForm from './forms/DescricaoForm';
import AnexosSection from './sections/AnexosSection';
import ComentariosSection from './sections/ComentariosSection';

const ChamadoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  chamado, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [arquivosParaUpload, setArquivosParaUpload] = useState([]);

  useEffect(() => {
    if (chamado && isOpen) {
      // Preencher formulário com dados do chamado
      Object.keys(chamado).forEach(key => {
        if (chamado[key] !== null && chamado[key] !== undefined && key !== 'comentarios') {
          // Converter sistema e tela para maiúsculas
          if (key === 'sistema' || key === 'tela') {
            setValue(key, String(chamado[key]).toUpperCase());
          } else {
            setValue(key, chamado[key]);
          }
        }
      });
    } else if (!chamado && isOpen) {
      // Resetar formulário para novo chamado
      reset();
      setValue('tipo', 'bug');
      setValue('prioridade', 'media');
      setValue('status', 'aberto');
    }
    if (!isOpen) {
      setArquivosParaUpload([]);
    }
  }, [chamado, isOpen, setValue, reset]);

  const handleSistemaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setValue('sistema', value);
  };

  const handleTelaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setValue('tela', value);
  };

  const handleFormSubmit = async (data) => {
    // Garantir que sistema e tela estejam em maiúsculas
    if (data.sistema) {
      data.sistema = data.sistema.toUpperCase();
    }
    if (data.tela) {
      data.tela = data.tela.toUpperCase();
    }
    
    await onSubmit(data, arquivosParaUpload);
  };

  const handleAnexosChange = (arquivos) => {
    setArquivosParaUpload(arquivos || []);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Chamado' : chamado ? 'Editar Chamado' : 'Novo Chamado'}
      size="6xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[85vh] overflow-y-auto">
        {/* Primeira Linha - Informações Básicas */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <InformacoesBasicasForm
            register={register}
            setValue={setValue}
            watch={watch}
            isViewMode={isViewMode}
            handleSistemaChange={handleSistemaChange}
            handleTelaChange={handleTelaChange}
          />

          <StatusPrioridadeForm
            register={register}
            chamado={chamado}
            isViewMode={isViewMode}
            setValue={setValue}
            watch={watch}
          />
        </div>

        {/* Segunda Linha - Descrição */}
        <DescricaoForm
          register={register}
          isViewMode={isViewMode}
        />

        {/* Anexos */}
        <AnexosSection
          chamado={chamado}
          isViewMode={isViewMode}
          onAnexosChange={handleAnexosChange}
        />

        {/* Comentários - Apenas quando visualizando ou editando chamado existente */}
        {chamado?.id && (
          <ComentariosSection
            chamado={chamado}
            isViewMode={isViewMode}
          />
        )}

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              <FaSave className="mr-2" />
              {chamado ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default ChamadoModal;

