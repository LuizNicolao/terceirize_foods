import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave, FaEye, FaEdit, FaBuilding } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';
// Filiais não são usadas no chamados-platforma
// import FiliaisService from '../../services/filiais';

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  usuario, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch } = useForm();
  // Filiais não são usadas no chamados-platforma
  // const [filiais, setFiliais] = useState([]);
  // const [loadingFiliais, setLoadingFiliais] = useState(false);
  // const [filiaisSelecionadas, setFiliaisSelecionadas] = useState([]);

  React.useEffect(() => {
    if (usuario && isOpen) {
      // Preencher formulário com dados do usuário
      Object.keys(usuario).forEach(key => {
        if (usuario[key] !== null && usuario[key] !== undefined) {
          setValue(key, usuario[key]);
        }
      });
      
      // Filiais não são usadas no chamados-platforma
      // if (usuario.filiais && Array.isArray(usuario.filiais)) {
      //   const filiaisIds = usuario.filiais.map(f => f.id);
      //   setFiliaisSelecionadas(filiaisIds);
      // } else {
      //   setFiliaisSelecionadas([]);
      // }
    } else if (!usuario && isOpen) {
      // Resetar formulário para novo usuário
      reset();
      setValue('status', 'ativo');
      setValue('nivel_de_acesso', 'I');
      setValue('tipo_de_acesso', 'usuario');
      // setFiliaisSelecionadas([]);
    }
  }, [usuario, isOpen, setValue, reset]);

  // Filiais não são usadas no chamados-platforma
  // const handleFilialChange = (filialId, checked) => {
  //   if (checked) {
  //     setFiliaisSelecionadas(prev => [...prev, filialId]);
  //   } else {
  //     setFiliaisSelecionadas(prev => prev.filter(id => id !== filialId));
  //   }
  // };

  const handleFormSubmit = (data) => {
    // Filiais não são usadas no chamados-platforma
    onSubmit(data);
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
                <option value="supervisor">Supervisor</option>
                <option value="usuario">Usuário</option>
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

        {/* Segunda Linha - 1 Card */}
        <div className="grid grid-cols-1 gap-4">
          {/* Card: Senha */}
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
