import React from 'react';
import { FaBox, FaBuilding } from 'react-icons/fa';
import { Button, Input } from '../../ui';

const DadosTab = ({
  formData,
  onFormDataChange,
  searchTerm,
  setSearchTerm,
  produtosEquipamentos,
  produtosLoading,
  filteredProdutos,
  filiais,
  filiaisLoading,
  isViewMode,
  isEdit,
  saving,
  onSubmit,
  onClose
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4 max-h-[75vh] overflow-y-auto">
      {/* Primeira Linha - 2 Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Card 1: Informações do Produto */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Informações do Produto
          </h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaBox className="inline mr-2 text-gray-500" />
                Produto *
              </label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Digite para buscar produto..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mb-2"
                  disabled={isViewMode}
                />
                
                {/* Lista de produtos (só aparece quando há busca E não há produto selecionado) */}
                {searchTerm.trim() && !formData.produto_id && !isViewMode && (
                  produtosLoading ? (
                    <div className="text-center py-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="text-xs text-gray-500 mt-1">Carregando...</p>
                    </div>
                  ) : (
                    <div className="max-h-32 overflow-y-auto border border-gray-300 rounded-md bg-white shadow-lg absolute z-10 w-full">
                      {filteredProdutos.length > 0 ? (
                        filteredProdutos.map((produto) => (
                          <div
                            key={produto.id}
                            className={`p-2 cursor-pointer hover:bg-gray-50 border-b border-gray-200 last:border-b-0 text-sm ${
                              formData.produto_id === produto.id ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => {
                              onFormDataChange('produto_id', produto.id);
                              setSearchTerm(produto.nome || '');
                            }}
                          >
                            <div className="font-medium text-gray-900">{produto.nome || 'Nome não informado'}</div>
                            <div className="text-xs text-gray-500">
                              {produto.codigo_produto || 'Código não informado'} • {produto.grupo || 'Grupo não informado'}
                            </div>
                            {(produto.marca || produto.fabricante) && (
                              <div className="text-xs text-gray-400 mt-1">
                                {produto.marca && `Marca: ${produto.marca}`}
                                {produto.marca && produto.fabricante && ' • '}
                                {produto.fabricante && `Fabricante: ${produto.fabricante}`}
                              </div>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-center text-gray-500 text-xs">
                          Nenhum produto encontrado
                        </div>
                      )}
                    </div>
                  )
                )}
              </div>
            </div>

            <Input
              label="Número do Patrimônio *"
              value={formData.numero_patrimonio || ''}
              onChange={(e) => onFormDataChange('numero_patrimonio', e.target.value)}
              placeholder="Ex: 001/2024"
              disabled={isViewMode}
            />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              <Input
                label="Marca"
                value={formData.marca || ''}
                onChange={(e) => onFormDataChange('marca', e.target.value)}
                placeholder="Marca do produto"
                readOnly={isViewMode}
              />

              <Input
                label="Fabricante"
                value={formData.fabricante || ''}
                onChange={(e) => onFormDataChange('fabricante', e.target.value)}
                placeholder="Fabricante do produto"
                readOnly={isViewMode}
              />
            </div>
          </div>
        </div>

        {/* Card 2: Informações da Filial */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Localização do Patrimônio
          </h3>
          <div className="space-y-3">
            {/* Filial Atual */}
            <Input
              label="Local Atual *"
              type="select"
              value={formData.local_atual_id || ''}
              onChange={(e) => onFormDataChange('local_atual_id', e.target.value)}
              disabled={filiaisLoading || isViewMode}
            >
              <option value="">
                {filiaisLoading ? 'Carregando filiais...' : 'Selecione a filial atual'}
              </option>
              {filiais.map((filial) => (
                <option key={filial.id} value={filial.id}>
                  {filial.filial} - {filial.logradouro}, {filial.numero} - {filial.bairro}, {filial.cidade}/{filial.estado}
                </option>
              ))}
            </Input>
          </div>
        </div>
      </div>

      {/* Segunda Linha - 1 Card */}
      <div className="grid grid-cols-1 gap-4">
        {/* Card 3: Informações Adicionais */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
          <h3 className="text-sm font-semibold text-gray-700 mb-3 pb-2 border-b-2 border-green-500">
            Informações Adicionais
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label="Status *"
              type="select"
              value={formData.status || ''}
              onChange={(e) => onFormDataChange('status', e.target.value)}
              disabled={isViewMode}
            >
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="manutencao">Manutenção</option>
              <option value="obsoleto">Obsoleto</option>
              <option value="inativo">Inativo</option>
            </Input>

            <Input
              label="Data de Aquisição *"
              type="date"
              value={formData.data_aquisicao ? formData.data_aquisicao.split('T')[0] : ''}
              onChange={(e) => onFormDataChange('data_aquisicao', e.target.value)}
              disabled={isViewMode}
            />
          </div>

          <div className="mt-4">
            <Input
              label="Observações"
              type="textarea"
              value={formData.observacoes || ''}
              onChange={(e) => onFormDataChange('observacoes', e.target.value)}
              placeholder="Observações sobre o patrimônio..."
              rows={3}
              disabled={isViewMode}
            />
          </div>
        </div>
      </div>

      {/* Botões de Ação */}
      {!isViewMode ? (
        <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" size="sm" disabled={saving}>
            {saving ? 'Salvando...' : (isEdit ? 'Atualizar' : 'Criar')}
          </Button>
        </div>
      ) : (
        <div className="flex justify-end gap-2 sm:gap-3 pt-3 border-t">
          <Button type="button" variant="secondary" size="sm" onClick={onClose}>
            Fechar
          </Button>
        </div>
      )}
    </form>
  );
};

export default DadosTab;
