import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaBuilding } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
import FiliaisService from '../../services/filiais';

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  usuario, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  const [filiais, setFiliais] = useState([]);
  const [loadingFiliais, setLoadingFiliais] = useState(false);
  const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);

  // Carregar filiais quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadFiliais();
    }
  }, [isOpen]);

  // Carregar filiais disponíveis
  const loadFiliais = async () => {
    try {
      setLoadingFiliais(true);
      const result = await FiliaisService.buscarAtivas();
      if (result.success) {
        setFiliais(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar filiais:', error);
    } finally {
      setLoadingFiliais(false);
    }
  };

  React.useEffect(() => {
    if (usuario && isOpen) {
      // Preencher formulário com dados do usuário
      Object.keys(usuario).forEach(key => {
        if (usuario[key] !== null && usuario[key] !== undefined) {
          setValue(key, usuario[key]);
        }
      });
      
      // Preencher filiais selecionadas se o usuário já tiver
      if (usuario.filiais && Array.isArray(usuario.filiais)) {
        const filiaisIds = usuario.filiais.map(f => f.id);
        setFiliaisSelecionadas(filiaisIds);
      } else {
        setFiliaisSelecionadas([]);
      }
    } else if (!usuario && isOpen) {
      // Resetar formulário para novo usuário
      reset();
      setValue('status', 'ativo');
      setValue('nivel_de_acesso', 'I');
      setValue('tipo_de_acesso', 'administrativo');
      setFiliaisSelecionadas([]);
    }
  }, [usuario, isOpen, setValue, reset]);

  // Gerenciar seleção de filiais
  const handleFilialChange = (filialId, checked) => {
    if (checked) {
      setFiliaisSelecionadas(prev => [...prev, filialId]);
    } else {
      setFiliaisSelecionadas(prev => prev.filter(id => id !== filialId));
    }
  };

  const handleFormSubmit = (data) => {
    // Adicionar filiais selecionadas aos dados do formulário
    const formDataWithFiliais = {
      ...data,
      filiais: filiaisSelecionadas
    };
    onSubmit(formDataWithFiliais);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Usuário' : usuario ? 'Editar Usuário' : 'Adicionar Usuário'}
      size="full"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4 max-h-[75vh] overflow-y-auto">
        {/* Primeira Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Pessoais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome Completo *"
                {...register('nome')}
                disabled={isViewMode}
              />
              <Input
                label="Email *"
                type="email"
                {...register('email')}
                disabled={isViewMode}
              />
            </div>
          </div>

          {/* Card 2: Informações de Acesso */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações de Acesso
            </h3>
            <div className="space-y-3">
              <Input
                label="Tipo de Acesso *"
                type="select"
                {...register('tipo_de_acesso')}
                disabled={isViewMode}
              >
                <option value="">Selecione o tipo de acesso</option>
                <option value="administrador">Administrador</option>
                <option value="coordenador">Coordenador</option>
                <option value="administrativo">Administrativo</option>
                <option value="gerente">Gerente</option>
                <option value="supervisor">Supervisor</option>
                <option value="nutricionista">Nutricionista</option>
              </Input>
              <Input
                label="Nível de Acesso *"
                type="select"
                {...register('nivel_de_acesso')}
                disabled={isViewMode}
              >
                <option value="">Selecione o nível de acesso</option>
                <option value="I">Nível I</option>
                <option value="II">Nível II</option>
                <option value="III">Nível III</option>
              </Input>
              <Input
                label="Status *"
                type="select"
                {...register('status')}
                disabled={isViewMode}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
                <option value="bloqueado">Bloqueado</option>
              </Input>
            </div>
          </div>
        </div>

        {/* Segunda Linha - 2 Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 3: Filiais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              <FaBuilding className="inline mr-2" />
              Filiais com Acesso
            </h3>
            <div className="space-y-3">
              {loadingFiliais ? (
                <div className="text-sm text-gray-500">Carregando filiais...</div>
              ) : (
                <div className="space-y-2 max-h-48 overflow-y-auto border border-gray-300 rounded-md p-3">
                  {filiais.map((filial) => {
                    const isChecked = filiaisSelecionadas.includes(filial.id);
                    return (
                      <label key={filial.id} className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => handleFilialChange(filial.id, e.target.checked)}
                          disabled={isViewMode}
                          className="mr-3 text-green-600 focus:ring-green-500 rounded"
                        />
                        <span className="text-sm text-gray-700">
                          {filial.filial} - {filial.cidade}/{filial.estado}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
              {filiais.length === 0 && !loadingFiliais && (
                <div className="text-sm text-gray-500">Nenhuma filial disponível</div>
              )}
            </div>
          </div>

          {/* Card 4: Senha */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Senha
            </h3>
            <div className="space-y-3">
              <Input
                label={usuario ? "Nova Senha (deixe em branco para manter a atual)" : "Senha *"}
                type="password"
                {...register('senha')}
                disabled={isViewMode}
              />
            </div>
          </div>
        </div>

        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              {usuario ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UsuarioModal;
