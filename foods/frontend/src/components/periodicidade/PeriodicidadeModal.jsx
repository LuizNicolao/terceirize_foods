import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FaEdit, FaBuilding, FaBoxes } from 'react-icons/fa';
import { Modal, Input, Button } from '../ui';
import CalendarSelector from './CalendarSelector';
import UnidadesEscolaresTab from './UnidadesEscolaresTab';
import GruposProdutosTab from './GruposProdutosTab';
import PeriodicidadeService from '../../services/periodicidade';

const PeriodicidadeModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  isEdit,
  isViewMode
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  
  // Estados principais
  const [tiposPeriodicidade, setTiposPeriodicidade] = useState([]);
  const [regrasCalendario, setRegrasCalendario] = useState({});
  const [activeTab, setActiveTab] = useState('info');
  
  // Estados para as abas
  const [unidadesSelecionadas, setUnidadesSelecionadas] = useState([]);
  const [gruposSelecionados, setGruposSelecionados] = useState([]);
  const [produtosIndividuais, setProdutosIndividuais] = useState([]);
  
  const tipoSelecionado = watch('tipo_id');

  // Carregar tipos de periodicidade
  useEffect(() => {
    const carregarTipos = async () => {
      try {
        const result = await PeriodicidadeService.listarTipos();
        if (result.success) {
          setTiposPeriodicidade(result.data || []);
        } else {
          console.error('Erro ao carregar tipos de periodicidade:', result.error);
        }
      } catch (error) {
        console.error('Erro ao carregar tipos de periodicidade:', error);
      }
    };
    
    if (isOpen) {
      carregarTipos();
    }
  }, [isOpen]);


    // Resetar formulário quando modal abrir/fechar
    useEffect(() => {
      if (isOpen) {
        if (formData) {
          // Carregar regras do calendário IMEDIATAMENTE (fora do setTimeout)
          if (formData.regras_calendario) {
            try {
              const regras = typeof formData.regras_calendario === 'string' 
                ? JSON.parse(formData.regras_calendario) 
                : formData.regras_calendario;
              setRegrasCalendario(regras);
            } catch (error) {
              console.error('Erro ao parsear regras do calendário:', error);
              setRegrasCalendario({});
            }
          }

          // Usar setTimeout para garantir que o setValue seja executado após a renderização
          setTimeout(() => {
            // Preencher formulário com dados do agrupamento (como outras telas fazem)
            Object.keys(formData).forEach(key => {
              if (formData[key] !== null && formData[key] !== undefined) {
                if (key === 'ativo') {
                  // Converter boolean/integer para string para o select
                  const valor = formData[key] ? 'true' : 'false';
                  setValue(key, valor);
                } else {
                  setValue(key, formData[key]);
                }
              }
            });
          }, 100);
        
        // Carregar unidades e grupos já vinculados ao agrupamento
        if (formData.unidades_escolares && Array.isArray(formData.unidades_escolares)) {
          const unidadesIds = formData.unidades_escolares.map(ue => ue.id);
          setUnidadesSelecionadas(unidadesIds);
        } else {
          setUnidadesSelecionadas([]);
        }
        
        // Carregar grupos de produtos e produtos individuais vinculados
        if (formData.produtos_vinculados && Array.isArray(formData.produtos_vinculados)) {
          // Por enquanto, vamos tratar todos os produtos vinculados como individuais
          // Isso é mais seguro e permite que o usuário veja o que foi salvo
          const produtosIndividuais = formData.produtos_vinculados.map(produto => produto.id);
          
          setGruposSelecionados([]);
          setProdutosIndividuais(produtosIndividuais);
        } else {
          setGruposSelecionados([]);
          setProdutosIndividuais([]);
        }
      } else {
        // Limpar formulário para novo agrupamento
        reset();
        setValue('ativo', 'true');
        setRegrasCalendario({});
        setUnidadesSelecionadas([]);
        setGruposSelecionados([]);
        setProdutosIndividuais([]);
      }
    } else {
      // Limpar estados quando modal fechar
      setActiveTab('info');
      setUnidadesSelecionadas([]);
      setGruposSelecionados([]);
      setProdutosIndividuais([]);
    }
  }, [isOpen, formData, setValue, reset]);


  const handleFormSubmit = (data) => {
    const dadosCompletos = {
      ...data,
      regras_calendario: regrasCalendario,
      unidades_escolares: unidadesSelecionadas,
      grupos_produtos: gruposSelecionados,
      produtos_individuais: produtosIndividuais
    };
    onSubmit(dadosCompletos);
  };

  const handleClose = () => {
    reset();
    setActiveTab('info');
    setUnidadesSelecionadas([]);
    setGruposSelecionados([]);
    setProdutosIndividuais([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={isViewMode ? 'Visualizar Agrupamento' : formData ? 'Editar Agrupamento' : 'Novo Agrupamento'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Abas */}
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'info'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaEdit className="inline mr-2" />
              Informações
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('unidades')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'unidades'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBuilding className="inline mr-2" />
              Unidades Escolares ({unidadesSelecionadas.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('produtos')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'produtos'
                  ? 'border-green-500 text-green-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FaBoxes className="inline mr-2" />
              Grupos de Produtos ({produtosIndividuais.length})
            </button>
          </nav>
        </div>

        {/* Conteúdo das Abas */}
        {activeTab === 'info' && (
          <>
            {/* Card Principal */}
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
                Informações do Agrupamento
              </h3>
              <div className="space-y-4">
                <Input
                  label="Nome *"
            type="text"
            placeholder="Ex: Segundas-feiras, Quinzenal A, Mensal 15"
                  {...register('nome', { 
                    required: 'Nome é obrigatório',
                    minLength: {
                      value: 2,
                      message: 'Nome deve ter pelo menos 2 caracteres'
                    },
                    maxLength: {
                      value: 100,
                      message: 'Nome deve ter no máximo 100 caracteres'
                    }
                  })}
                  error={errors.nome?.message}
            disabled={isViewMode}
          />
                
                <Input
                  label="Descrição"
                  type="textarea"
            placeholder="Descrição opcional do agrupamento"
            rows={3}
                  {...register('descricao')}
            disabled={isViewMode}
          />
                
                <Input
                  label="Tipo de Periodicidade *"
                  type="select"
                  {...register('tipo_id', { required: 'Tipo de periodicidade é obrigatório' })}
                  disabled={isViewMode}
                  error={errors.tipo_id?.message}
          >
            <option value="">Selecione um tipo</option>
                  {tiposPeriodicidade.map(tipo => (
              <option key={tipo.id} value={tipo.id}>
                {tipo.nome} - {tipo.descricao}
              </option>
            ))}
                </Input>
                
                <Input
                  label="Status"
                  type="select"
                  {...register('ativo')}
            disabled={isViewMode}
                >
                  <option value={true}>Ativo</option>
                  <option value={false}>Inativo</option>
                </Input>
              </div>
        </div>

            {/* Configuração do Calendário */}
            {tipoSelecionado && (
              <CalendarSelector
                tipoPeriodicidade={tiposPeriodicidade.find(t => t.id == tipoSelecionado)?.nome}
                regrasCalendario={regrasCalendario}
                onRegrasChange={setRegrasCalendario}
                disabled={isViewMode}
              />
            )}
          </>
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

        {/* Botões */}
        {!isViewMode && (
          <div className="flex justify-end gap-3 pt-4 border-t">
          <Button
            type="button"
            variant="secondary"
              onClick={handleClose}
          >
            Cancelar
          </Button>
            <Button
              type="submit"
              variant="primary"
            >
              {isEdit ? 'Atualizar' : 'Criar'} Agrupamento
            </Button>
          </div>
          )}
      </form>
    </Modal>
  );
};

export default PeriodicidadeModal;
