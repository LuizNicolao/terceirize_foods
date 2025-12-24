import React from 'react';
import { Input } from '../../ui';
import { useAuth } from '../../../contexts/AuthContext';

const StatusPrioridadeForm = ({ 
  register, 
  chamado, 
  isViewMode, 
  setValue,
  watch 
}) => {
  const { user } = useAuth();

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('pt-BR');
  };

  return (
    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
        Status e Prioridade
      </h3>
      <div className="space-y-3">
        <Input
          label="Status *"
          type="select"
          {...register('status')}
          disabled={isViewMode || !chamado?.id}
          required
        >
          <option value="aberto">Aberto</option>
          {chamado?.id && (
            <>
              <option value="em_analise">Em Análise</option>
              <option value="em_desenvolvimento">Em Desenvolvimento</option>
              <option value="em_teste">Em Teste</option>
              <option value="concluido">Concluído</option>
              <option value="fechado">Fechado</option>
            </>
          )}
        </Input>
        <Input
          label="Prioridade *"
          type="select"
          {...register('prioridade')}
          disabled={isViewMode}
          required
        >
          <option value="baixa">Baixa</option>
          <option value="media">Média</option>
          <option value="alta">Alta</option>
          <option value="critica">Crítica</option>
        </Input>
        
        {/* Informações de quem abriu o chamado */}
        {/* Mostrar usuário logado quando criando novo chamado */}
        {!chamado?.id && !isViewMode && user && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aberto por
            </label>
            <p className="text-sm text-gray-900">{user.nome}</p>
            {user.email && (
              <p className="text-xs text-gray-500">{user.email}</p>
            )}
            <p className="text-xs text-gray-400 italic mt-1">
              Este chamado será aberto automaticamente em seu nome
            </p>
          </div>
        )}

        {/* Mostrar quem abriu quando visualizando chamado existente */}
        {chamado?.usuario_abertura_nome && isViewMode && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Aberto por
            </label>
            <p className="text-sm text-gray-900">{chamado.usuario_abertura_nome}</p>
            {chamado.usuario_abertura_email && (
              <p className="text-xs text-gray-500">{chamado.usuario_abertura_email}</p>
            )}
          </div>
        )}

        {/* Informações de quem assumiu/responsável pelo chamado (apenas visualização) */}
        {isViewMode && chamado?.usuario_responsavel_nome && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Responsável
            </label>
            <p className="text-sm text-gray-900">{chamado.usuario_responsavel_nome}</p>
            {chamado.usuario_responsavel_email && (
              <p className="text-xs text-gray-500">{chamado.usuario_responsavel_email}</p>
            )}
          </div>
        )}
        
        {chamado?.data_abertura && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Abertura
            </label>
            <p className="text-sm text-gray-900">{formatDate(chamado.data_abertura)}</p>
          </div>
        )}
        
        {chamado?.data_conclusao && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Data de Conclusão
            </label>
            <p className="text-sm text-gray-900">{formatDate(chamado.data_conclusao)}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatusPrioridadeForm;

