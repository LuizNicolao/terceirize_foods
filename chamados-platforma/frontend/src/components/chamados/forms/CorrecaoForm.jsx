import React from 'react';
import { Input } from '../../ui';
import UsuariosService from '../../../services/usuarios';
import { SearchableSelect } from '../../ui';
import { useAuth } from '../../../contexts/AuthContext';

const CorrecaoForm = ({ 
  register, 
  chamado, 
  isViewMode, 
  setValue,
  watch,
  errors
}) => {
  const { user } = useAuth();
  const [usuarios, setUsuarios] = React.useState([]);
  const [loadingUsuarios, setLoadingUsuarios] = React.useState(false);

  React.useEffect(() => {
    if (!isViewMode) {
      carregarUsuarios();
    }
  }, [isViewMode]);

  const carregarUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const result = await UsuariosService.buscarAtivos();
      if (result.success) {
        setUsuarios(result.data || []);
      }
    } catch (error) {
      console.error('Erro ao carregar usuários:', error);
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const usuarioResponsavel = watch('usuario_responsavel_id');
  const usuarioResponsavelData = usuarios.find(u => u.id === parseInt(usuarioResponsavel));

  return (
    <div className="space-y-4">
      {/* Descrição da Correção */}
      <div>
        <Input
          label="Descrição da Correção"
          type="textarea"
          {...register('descricao_correcao', {
            maxLength: {
              value: 5000,
              message: 'Descrição da correção deve ter no máximo 5000 caracteres'
            }
          })}
          disabled={isViewMode}
          rows={6}
          placeholder="Descreva como o problema foi corrigido, as alterações realizadas e qualquer informação relevante sobre a solução implementada..."
          error={errors.descricao_correcao?.message}
        />
        {!errors.descricao_correcao && (
          <p className="mt-1 text-xs text-gray-500">
            Descreva em detalhes como o problema foi resolvido e as alterações realizadas.
          </p>
        )}
      </div>

      {/* Atribuir Responsável / Assumir Chamado */}
      {chamado?.id && (
        <div>
          <SearchableSelect
            label="Responsável pelo Chamado"
            options={usuarios.map(u => ({
              value: u.id,
              label: u.nome
            }))}
            value={usuarioResponsavel || ''}
            onChange={(value) => setValue('usuario_responsavel_id', value ? parseInt(value) : null)}
            disabled={isViewMode || loadingUsuarios}
            placeholder="Selecione o responsável ou deixe em branco para assumir você mesmo"
            searchPlaceholder="Buscar usuário..."
            error={errors.usuario_responsavel_id?.message}
          />
          {usuarioResponsavelData && (
            <p className="mt-1 text-xs text-gray-500">
              Email: {usuarioResponsavelData.email}
            </p>
          )}
          {!usuarioResponsavel && !isViewMode && (
            <p className="mt-1 text-xs text-gray-500">
              Deixe em branco para assumir o chamado você mesmo ({user?.nome})
            </p>
          )}
        </div>
        )}
    </div>
  );
};

export default CorrecaoForm;

