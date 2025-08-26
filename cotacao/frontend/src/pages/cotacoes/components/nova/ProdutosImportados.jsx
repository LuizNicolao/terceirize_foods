import React, { useState } from 'react';
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';

const ProdutosImportados = ({ produtos, planilhaCarregada }) => {
  const [expanded, setExpanded] = useState(false);

  if (!planilhaCarregada || produtos.length === 0) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          📦 Produtos Importados ({produtos.length})
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center hover:bg-green-600 transition-colors"
        >
          {expanded ? <FaChevronUp /> : <FaChevronDown />}
        </button>
      </div>

      {expanded && (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-green-500 text-white">
                <th className="px-3 py-2 text-left font-semibold text-sm">Código</th>
                <th className="px-3 py-2 text-left font-semibold text-sm">Produto</th>
                <th className="px-3 py-2 text-left font-semibold text-sm">Quantidade</th>
                <th className="px-3 py-2 text-left font-semibold text-sm">Unidade</th>
                <th className="px-3 py-2 text-left font-semibold text-sm">Data Entrega</th>
              </tr>
            </thead>
            <tbody>
              {produtos.map((produto, index) => (
                <tr key={`${produto.id || produto.codigo}-${index}`} className="border-b border-gray-200 hover:bg-gray-50">
                  <td className="px-3 py-2 font-mono text-sm">{produto.codigo}</td>
                  <td className="px-3 py-2 text-sm">{produto.nome}</td>
                  <td className="px-3 py-2 text-center text-sm">{produto.qtde}</td>
                  <td className="px-3 py-2 text-center text-sm">{produto.un}</td>
                  <td className="px-3 py-2 text-center text-sm">{produto.entrega || '-'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ProdutosImportados;
