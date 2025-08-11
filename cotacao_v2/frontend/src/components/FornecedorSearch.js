import React, { useState, useEffect } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';

const FornecedorSearch = ({ onSelect, placeholder = "Buscar fornecedor..." }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [fornecedores, setFornecedores] = useState([]);
  const [filteredFornecedores, setFilteredFornecedores] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchFornecedores();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredFornecedores([]);
      return;
    }

    const filtered = fornecedores.filter(fornecedor =>
      fornecedor.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      fornecedor.cnpj.includes(searchTerm)
    );
    setFilteredFornecedores(filtered);
  }, [searchTerm, fornecedores]);

  const fetchFornecedores = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/fornecedores');
      const data = await response.json();
      setFornecedores(data);
    } catch (error) {
      console.error('Erro ao buscar fornecedores:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (fornecedor) => {
    onSelect(fornecedor);
    setSearchTerm(fornecedor.nome);
    setIsOpen(false);
  };

  const handleClear = () => {
    setSearchTerm('');
    onSelect(null);
    setIsOpen(false);
  };

  const handleInputChange = (e) => {
    setSearchTerm(e.target.value);
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (searchTerm && filteredFornecedores.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="h-4 w-4 text-gray-400" />
        </div>
        <input
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-green-500 focus:border-green-500 sm:text-sm"
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
          >
            <FaTimes className="h-4 w-4 text-gray-400 hover:text-gray-600" />
          </button>
        )}
      </div>

      {isOpen && (searchTerm || loading) && (
        <div className="absolute z-10 w-full mt-1 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {loading ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Carregando fornecedores...
            </div>
          ) : filteredFornecedores.length > 0 ? (
            filteredFornecedores.map((fornecedor) => (
              <div
                key={fornecedor.id}
                onClick={() => handleSelect(fornecedor)}
                className="cursor-pointer select-none relative py-2 pl-3 pr-9 hover:bg-green-50"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900 truncate">
                    {fornecedor.nome}
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  CNPJ: {fornecedor.cnpj}
                </div>
              </div>
            ))
          ) : searchTerm ? (
            <div className="px-4 py-2 text-sm text-gray-500">
              Nenhum fornecedor encontrado
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default FornecedorSearch; 