import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaSave, FaInfoCircle, FaBug, FaWrench, FaComments } from 'react-icons/fa';
import { Button, Modal, Tabs } from '../ui';
import InformacoesBasicasForm from './forms/InformacoesBasicasForm';
import StatusPrioridadeForm from './forms/StatusPrioridadeForm';
import DescricaoForm from './forms/DescricaoForm';
import CorrecaoForm from './forms/CorrecaoForm';
import AnexosSection from './sections/AnexosSection';
import ComentariosSection from './sections/ComentariosSection';
import HistoricoSection from './sections/HistoricoSection';

const ChamadoModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  chamado, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors }, clearErrors } = useForm({
    mode: 'onBlur',
    defaultValues: {
      tipo: 'bug',
      prioridade: 'media',
      status: 'aberto'
    }
  });
  const [arquivosParaUpload, setArquivosParaUpload] = useState([]);
  const [arquivosCorrecaoParaUpload, setArquivosCorrecaoParaUpload] = useState([]);
  const [activeTab, setActiveTab] = useState('informacoes');

  // Definir abas disponíveis
  const tabs = [
    {
      id: 'informacoes',
      label: 'Informações Gerais',
      icon: FaInfoCircle
    },
    {
      id: 'problema',
      label: 'Problema',
      icon: FaBug
    },
    ...(chamado?.id ? [{
      id: 'correcao',
      label: 'Correção',
      icon: FaWrench
    }] : []),
    ...(chamado?.id ? [{
      id: 'acompanhamento',
      label: 'Acompanhamento',
      icon: FaComments
    }] : [])
  ];

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
      reset({
        tipo: 'bug',
        prioridade: 'media',
        status: 'aberto'
      });
      clearErrors();
    }
    
    // Sempre começar na primeira aba quando o modal abre
    if (isOpen) {
      setActiveTab('informacoes');
    }
    
    if (!isOpen) {
      setArquivosParaUpload([]);
      setArquivosCorrecaoParaUpload([]);
      clearErrors();
      setActiveTab('informacoes');
    }
  }, [chamado, isOpen, setValue, reset, clearErrors]);

  const handleSistemaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setValue('sistema', value, { shouldValidate: true });
  };

  const handleTelaChange = (e) => {
    const value = e.target.value.toUpperCase();
    setValue('tela', value, { shouldValidate: true });
  };

  const handleFormSubmit = async (data) => {
    // Limpar campos vazios (converter strings vazias para null ou remover)
    Object.keys(data).forEach(key => {
      if (data[key] === '' || data[key] === null || data[key] === undefined) {
        // Para campos opcionais, remover se estiver vazio
        if (key === 'tela' || key === 'prioridade') {
          delete data[key];
        } else {
          data[key] = null;
        }
      }
    });
    
    // Garantir que sistema e tela estejam em maiúsculas
    if (data.sistema) {
      data.sistema = data.sistema.trim().toUpperCase();
    }
    if (data.tela) {
      data.tela = data.tela.trim().toUpperCase();
    }
    
    // Remover status se for um novo chamado (backend sempre cria como "aberto")
    if (!chamado?.id) {
      delete data.status;
      // Remover usuario_responsavel_id na criação (só pode ser definido na atualização)
      delete data.usuario_responsavel_id;
      // Remover usuario_abertura_id na criação (é preenchido automaticamente pelo backend)
      delete data.usuario_abertura_id;
      // Remover descricao_correcao na criação
      delete data.descricao_correcao;
    }
    
    // Sempre remover usuario_abertura_id (nunca deve ser enviado pelo frontend)
    delete data.usuario_abertura_id;
    
    // Remover campos vazios de tela após processamento
    if (data.tela === '' || !data.tela) {
      delete data.tela;
    }
    
    await onSubmit(data, arquivosParaUpload, arquivosCorrecaoParaUpload);
  };

  const handleAnexosChange = (arquivos) => {
    setArquivosParaUpload(arquivos || []);
  };

  const handleAnexosCorrecaoChange = (arquivos) => {
    setArquivosCorrecaoParaUpload(arquivos || []);
  };

  if (!isOpen) return null;

  const renderTabContent = () => {
    switch (activeTab) {
      case 'informacoes':
        return (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <InformacoesBasicasForm
              register={register}
              setValue={setValue}
              watch={watch}
              errors={errors}
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
        );

      case 'problema':
        return (
          <>
            <DescricaoForm
              register={register}
              errors={errors}
              isViewMode={isViewMode}
            />
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Anexos do Problema
              </h3>
              <div className="mt-3">
                <AnexosSection
                  chamado={chamado}
                  isViewMode={isViewMode}
                  onAnexosChange={handleAnexosChange}
                  tipoAnexo="problema"
                />
              </div>
            </div>
          </>
        );

      case 'correcao':
        return (
          <>
            <CorrecaoForm
              register={register}
              chamado={chamado}
              isViewMode={isViewMode}
              setValue={setValue}
              watch={watch}
              errors={errors}
            />
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Anexos da Correção
              </h3>
              <div className="mt-3">
                <AnexosSection
                  chamado={chamado}
                  isViewMode={isViewMode}
                  onAnexosChange={handleAnexosCorrecaoChange}
                  tipoAnexo="correcao"
                />
              </div>
            </div>
          </>
        );

      case 'acompanhamento':
        return (
          <>
            <ComentariosSection
              chamado={chamado}
              isViewMode={isViewMode}
            />
            <HistoricoSection
              chamado={chamado}
            />
          </>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Chamado' : chamado ? 'Editar Chamado' : 'Novo Chamado'}
      size="7xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col max-h-[85vh]">
        <Tabs
          tabs={tabs}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          className="mb-4"
        />
        
        <div className="flex-1 overflow-y-auto py-4">
          {renderTabContent()}
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t mt-4">
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
