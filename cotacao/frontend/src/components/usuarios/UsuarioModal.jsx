import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { FaTimes, FaSave } from 'react-icons/fa';
import { Button, Input, Modal } from '../ui';

const UsuarioModal = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  usuario, 
  isViewMode = false
}) => {
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm();

  // Resetar ou preencher formulário quando modal abrir
  useEffect(() => {
    if (usuario && isOpen) {
      // Preencher formulário com dados do usuário
      Object.keys(usuario).forEach(key => {
        if (usuario[key] !== null && usuario[key] !== undefined) {
          setValue(key, usuario[key]);
        }
      });
    } else if (!usuario && isOpen) {
      // Resetar formulário para novo usuário
      reset();
      setValue('status', 'ativo');
      setValue('role', 'comprador');
    }
  }, [usuario, isOpen, setValue, reset]);

  const handleFormSubmit = (data) => {
    onSubmit(data);
  };

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isViewMode ? 'Visualizar Usuário' : usuario ? 'Editar Usuário' : 'Adicionar Usuário'}
      size="4xl"
    >
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
        {/* Grid de Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Card 1: Informações Pessoais */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
              Informações Pessoais
            </h3>
            <div className="space-y-3">
              <Input
                label="Nome Completo *"
                {...register('name', { required: 'Nome é obrigatório' })}
                disabled={isViewMode}
                error={errors.name?.message}
              />
              <Input
                label="Email *"
                type="email"
                {...register('email', { 
                  required: 'Email é obrigatório',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Email inválido'
                  }
                })}
                disabled={isViewMode}
                error={errors.email?.message}
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
                label="Função (Role) *"
                type="select"
                {...register('role', { required: 'Função é obrigatória' })}
                disabled={isViewMode}
                error={errors.role?.message}
              >
                <option value="">Selecione a função</option>
                <option value="administrador">Administrador</option>
                <option value="gestor">Gestor</option>
                <option value="comprador">Comprador</option>
                <option value="supervisor">Supervisor</option>
              </Input>
              <Input
                label="Status *"
                type="select"
                {...register('status', { required: 'Status é obrigatório' })}
                disabled={isViewMode}
                error={errors.status?.message}
              >
                <option value="">Selecione o status</option>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </Input>
            </div>
          </div>
        </div>

        {/* Card 3: Senha */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Senha
          </h3>
          <div className="space-y-3">
            <Input
              label={usuario ? "Nova Senha (deixe em branco para manter a atual)" : "Senha *"}
              type="password"
              {...register('password', { 
                required: !usuario ? 'Senha é obrigatória para novos usuários' : false,
                minLength: {
                  value: 6,
                  message: 'Senha deve ter no mínimo 6 caracteres'
                }
              })}
              disabled={isViewMode}
              error={errors.password?.message}
            />
            {!usuario && (
              <p className="text-xs text-gray-500">
                A senha deve ter no mínimo 6 caracteres
              </p>
            )}
          </div>
        </div>

        {/* Botões de Ação */}
        {!isViewMode && (
          <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              <FaTimes className="mr-2" />
              Cancelar
            </Button>
            <Button type="submit" size="sm">
              <FaSave className="mr-2" />
              {usuario ? 'Atualizar' : 'Criar'}
            </Button>
          </div>
        )}

        {/* Modo Visualização */}
        {isViewMode && (
          <div className="flex justify-end pt-3 border-t">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              <FaTimes className="mr-2" />
              Fechar
            </Button>
          </div>
        )}
      </form>
    </Modal>
  );
};

export default UsuarioModal;

