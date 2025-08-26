import React, { useState } from 'react';
import { FaSearch, FaFilter, FaCalendar, FaUser, FaTag, FaTimes } from 'react-icons/fa';

const SavingFilters = ({ filters, onFilterChange, onClearFilters }) => {
    const [showFilters, setShowFilters] = useState(false);

    const handleInputChange = (field, value) => {
        onFilterChange({
            ...filters,
            [field]: value
        });
    };

    const handleClearFilters = () => {
        onClearFilters();
        setShowFilters(false);
    };

    const hasActiveFilters = Object.values(filters).some(value => value && value !== '');

    return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            {/* Header dos filtros */}
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-3">
                    <FaFilter className="text-gray-600" />
                    <h3 className="text-base font-semibold text-gray-900">Filtros</h3>
                    {hasActiveFilters && (
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2 py-1 rounded">
                            Ativos
                        </span>
                    )}
                </div>
                
                <div className="flex gap-2">
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200 text-sm font-medium"
                        >
                            <FaTimes size={14} />
                            Limpar
                        </button>
                    )}
                    
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                    >
                        <FaFilter size={14} />
                        {showFilters ? 'Ocultar' : 'Mostrar'} Filtros
                    </button>
                </div>
            </div>

            {/* Filtros expandidos */}
            {showFilters && (
                <div className="space-y-6">
                    {/* Filtros principais - Layout similar ao sawing.php */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Comprador */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaUser className="text-gray-400" />
                                Comprador
                            </label>
                            <select
                                value={filters.comprador || ''}
                                onChange={(e) => handleInputChange('comprador', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                            >
                                <option value="">Todos</option>
                                <option value="1">João Silva</option>
                                <option value="2">Maria Santos</option>
                                <option value="3">Pedro Costa</option>
                            </select>
                        </div>

                        {/* Tipo */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaTag className="text-gray-400" />
                                Tipo
                            </label>
                            <select
                                value={filters.tipo || ''}
                                onChange={(e) => handleInputChange('tipo', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                            >
                                <option value="">Todos</option>
                                <option value="programada">Programada</option>
                                <option value="emergencial">Emergencial</option>
                            </select>
                        </div>

                        {/* Data Início */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendar className="text-gray-400" />
                                Data Início
                            </label>
                            <input
                                type="date"
                                value={filters.data_inicio || ''}
                                onChange={(e) => handleInputChange('data_inicio', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                            />
                        </div>

                        {/* Data Fim */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                                <FaCalendar className="text-gray-400" />
                                Data Fim
                            </label>
                            <input
                                type="date"
                                value={filters.data_fim || ''}
                                onChange={(e) => handleInputChange('data_fim', e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors duration-200"
                            />
                        </div>
                    </div>

                    {/* Botões de ação */}
                    <div className="flex gap-3 pt-4 border-t border-gray-200">
                        <button
                            onClick={() => setShowFilters(false)}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
                        >
                            <FaFilter size={14} />
                            Aplicar
                        </button>
                        
                        <button
                            onClick={handleClearFilters}
                            className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 text-sm font-medium"
                        >
                            <FaTimes size={14} />
                            Limpar
                        </button>
                    </div>

                    {/* Filtros ativos */}
                    {hasActiveFilters && (
                        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                            <h4 className="text-sm font-medium text-gray-800 mb-2">Filtros Ativos:</h4>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(filters).map(([key, value]) => {
                                    if (!value || value === '') return null;
                                    
                                    let label = '';
                                    switch (key) {
                                        case 'comprador':
                                            label = `Comprador: ${value}`;
                                            break;
                                        case 'tipo':
                                            label = `Tipo: ${value}`;
                                            break;
                                        case 'data_inicio':
                                            label = `Data início: ${value}`;
                                            break;
                                        case 'data_fim':
                                            label = `Data fim: ${value}`;
                                            break;
                                        default:
                                            label = `${key}: ${value}`;
                                    }
                                    
                                    return (
                                        <span
                                            key={key}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded"
                                        >
                                            {label}
                                            <button
                                                onClick={() => handleInputChange(key, '')}
                                                className="text-gray-600 hover:text-gray-800"
                                            >
                                                <FaTimes size={10} />
                                            </button>
                                        </span>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default SavingFilters;
