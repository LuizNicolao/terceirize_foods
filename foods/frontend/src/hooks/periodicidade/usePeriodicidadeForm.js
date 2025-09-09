import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import PeriodicidadeService from '../../services/periodicidade';

export const usePeriodicidadeForm = (isOpen, formData, isViewMode) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();
  
  // Estados do formulário
  const [tiposPeriodicidade, setTiposPeriodicidade] = useState([]);
  const [regrasCalendario, setRegrasCalendario] = useState({});
  const [activeTab, setActiveTab] = useState('info');
  
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
        // Carregar regras do calendário
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

        // Preencher formulário com dados
        setTimeout(() => {
          Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
              if (key === 'ativo') {
                const valor = formData[key] ? 'true' : 'false';
                setValue(key, valor);
              } else {
                setValue(key, formData[key]);
              }
            }
          });
        }, 100);
      } else {
        // Limpar formulário para novo agrupamento
        reset();
        setValue('ativo', 'true');
        setRegrasCalendario({});
      }
    } else {
      // Limpar estados quando modal fechar
      setActiveTab('info');
    }
  }, [isOpen, formData, setValue, reset]);

  const handleFormSubmit = (data, onSubmit) => {
    const dadosCompletos = {
      ...data,
      regras_calendario: regrasCalendario
    };
    onSubmit(dadosCompletos);
  };

  const handleClose = (onClose) => {
    reset();
    setActiveTab('info');
    onClose();
  };

  return {
    // Form methods
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    errors,
    
    // Estados
    tiposPeriodicidade,
    regrasCalendario,
    setRegrasCalendario,
    activeTab,
    setActiveTab,
    tipoSelecionado,
    
    // Ações
    handleFormSubmit,
    handleClose
  };
};
