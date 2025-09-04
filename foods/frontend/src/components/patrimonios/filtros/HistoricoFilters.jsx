import React from 'react';
import { Button, Input } from '../../ui';

const HistoricoFilters = ({ filtros, onFiltrosChange, onLimparFiltros }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg mb-6">
      <h4 className="text-sm font-medium text-gray-700 mb-3">Filtros de Busca</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Data Início */}
        <Input
          label="Data Início"
          type="date"
          value={filtros.dataInicio}
          onChange={(e) => onFiltrosChange({ ...filtros, dataInicio: e.target.value })}
          size="sm"
        />
        
        {/* Data Fim */}
        <Input
          label="Data Fim"
          type="date"
          value={filtros.dataFim}
          onChange={(e) => onFiltrosChange({ ...filtros, dataFim: e.target.value })}
          size="sm"
        />
        
        {/* Motivo */}
        <Input
          label="Motivo"
          type="select"
          value={filtros.motivo}
          onChange={(e) => onFiltrosChange({ ...filtros, motivo: e.target.value })}
          size="sm"
        >
          <option value="todos">Todos os motivos</option>
          <option value="transferencia">Transferência</option>
          <option value="manutencao">Manutenção</option>
          <option value="devolucao">Devolução</option>
          <option value="outro">Outro</option>
        </Input>
        
        {/* Responsável */}
        <Input
          label="Responsável"
          type="text"
          value={filtros.responsavel}
          onChange={(e) => onFiltrosChange({ ...filtros, responsavel: e.target.value })}
          placeholder="Digite o nome do responsável"
          size="sm"
        />
        
        {/* Local */}
        <Input
          label="Local"
          type="text"
          value={filtros.local}
          onChange={(e) => onFiltrosChange({ ...filtros, local: e.target.value })}
          placeholder="Digite o nome do local"
          size="sm"
        />
        
        {/* Botão Limpar Filtros */}
        <div className="flex items-end">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onLimparFiltros}
            className="w-full"
          >
            Limpar Filtros
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HistoricoFilters;
