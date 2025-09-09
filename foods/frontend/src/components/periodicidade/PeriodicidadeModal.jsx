import React, { useState } from 'react';
import { Modal } from '../ui';
import UnidadesEscolaresTab from './UnidadesEscolaresTab';
import GruposProdutosTab from './GruposProdutosTab';
import CalendarTab from './CalendarTab';
import { PeriodicidadeForm, PeriodicidadeTabs, PeriodicidadeActions } from './components';
import { usePeriodicidadeForm } from '../../hooks/periodicidade';

const PeriodicidadeModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  isEdit,
  isViewMode
}) => {
  // Estados para as abas
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState([]);
  const [gruposSelecionados, setGruposSelecionados] = useState([]);
  const [produtosIndividuais, setProdutosIndividuais] = useState([]);
  
  // Hook customizado para formulário
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    errors,
    tiposPeriodicidade,
    regrasCalendario,
    setRegrasCalendario,
    activeTab,
    setActiveTab,
    tipoSelecionado,
    handleFormSubmit,
    handleClose
  } = usePeriodicidadeForm(isOpen, formData, isViewMode);

  // Carregar dados das abas quando modal abrir
  React.useEffect(() => {
    if (isOpen && formData) {
      // Carregar unidades e grupos já vinculados ao agrupamento
      if (formData.unidades_escolares && Array.isArray(formData.unidades_escolares)) {
        const unidadesIds = formData.unidades_escolares.map(ue => ue.id);
        setUnidadesSelecionadas(unidadesIds);
      } else {
        setUnidadesSelecionadas([]);
      }
      
      // Carregar grupos de produtos e produtos individuais vinculados
      if (formData.produtos_vinculados && Array.isArray(formData.produtos_vinculados)) {
        const produtosIndividuais = formData.produtos_vinculados.map(produto => produto.id);
        setGruposSelecionados([]);
        setProdutosIndividuais(produtosIndividuais);
      } else {
        setGruposSelecionados([]);
        setProdutosIndividuais([]);
      }
    } else if (!isOpen) {
      // Limpar estados quando modal fechar
      setUnidadesSelecionadas([]);
      setGruposSelecionados([]);
      setProdutosIndividuais([]);
    }
  }, [isOpen, formData]);

  const handleFormSubmitWrapper = (data) => {
    const dadosCompletos = {
      ...data,
      regras_calendario: regrasCalendario,
      unidades_escolares: unidadesSelecionadas,
      grupos_produtos: gruposSelecionados,
      produtos_individuais: produtosIndividuais
    };
    onSubmit(dadosCompletos);
  };

  const handleCloseWrapper = () => {
    setUnidadesSelecionadas([]);
    setGruposSelecionados([]);
    setProdutosIndividuais([]);
    handleClose(onClose);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleCloseWrapper}
      title={isViewMode ? 'Visualizar Agrupamento' : formData ? 'Editar Agrupamento' : 'Novo Agrupamento'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmitWrapper)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Abas */}
        <PeriodicidadeTabs
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          unidadesSelecionadas={unidadesSelecionadas}
          produtosIndividuais={produtosIndividuais}
        />

        {/* Conteúdo das Abas */}
        {activeTab === 'info' && (
          <PeriodicidadeForm
            register={register}
            errors={errors}
            tiposPeriodicidade={tiposPeriodicidade}
            tipoSelecionado={tipoSelecionado}
            regrasCalendario={regrasCalendario}
            setRegrasCalendario={setRegrasCalendario}
            isViewMode={isViewMode}
          />
        )}

        {activeTab === 'unidades' && (
          <UnidadesEscolaresTab
            unidadesSelecionadas={unidadesSelecionadas}
            onUnidadesChange={setUnidadesSelecionadas}
            isViewMode={isViewMode}
          />
        )}

        {activeTab === 'produtos' && (
          <GruposProdutosTab
            gruposSelecionados={gruposSelecionados}
            onGruposChange={setGruposSelecionados}
            produtosIndividuais={produtosIndividuais}
            onProdutosIndividuaisChange={setProdutosIndividuais}
            isViewMode={isViewMode}
          />
        )}

        {activeTab === 'calendario' && (
          <CalendarTab
            agrupamentoData={{
              id: formData?.id, // ✅ Adicionar o ID do agrupamento
              tipo_nome: tiposPeriodicidade.find(t => t.id == tipoSelecionado)?.nome,
              regras_calendario: regrasCalendario,
              unidades_escolares: unidadesSelecionadas,
              produtos_individuais: produtosIndividuais
            }}
            isViewMode={isViewMode}
          />
        )}

        {/* Botões */}
        <PeriodicidadeActions
          isViewMode={isViewMode}
          isEdit={isEdit}
          onClose={handleCloseWrapper}
          onSubmit={handleFormSubmitWrapper}
        />
      </form>
    </Modal>
  );
};

export default PeriodicidadeModal;
