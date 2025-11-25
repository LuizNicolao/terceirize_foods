import React from 'react';

/**
 * Componente para impressão de Pedido de Compras
 * Replica o layout do modal de visualização, formatado para impressão em A4
 */
const PedidosComprasPrint = ({ pedidoCompras }) => {
  if (!pedidoCompras) return null;

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Normalizar número (remover separadores de milhar)
  const normalizeNumber = (value) => {
    if (!value && value !== 0) return '-';
    if (typeof value === 'number') {
      return value % 1 === 0 ? value.toString() : value.toString().replace('.', ',');
    }
    const str = String(value).trim();
    if (!str || str === '-') return '-';
    if (str.includes(',')) {
      return str.replace(/\./g, '');
    }
    if (str.includes('.')) {
      const parts = str.split('.');
      if (parts.length > 2) {
        return parts.join('');
      }
      if (parts.length === 2) {
        if (parts[1].length === 3 && parts[1] === '000' && /^\d{1,3}$/.test(parts[0])) {
          return parts[0];
        }
        if (parts[1].length <= 2 && /^\d+$/.test(parts[1])) {
          return str.replace('.', ',');
        }
        return parts.join('');
      }
    }
    return str;
  };

  // Formatar moeda
  const formatCurrency = (value) => {
    if (!value && value !== 0) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  // Processar itens
  const itens = pedidoCompras.itens || [];

  // Calcular valor total
  const valorTotal = itens.reduce((total, item) => {
    const qtd = parseFloat(item.quantidade_pedido || 0);
    const valorUnit = parseFloat(item.valor_unitario || 0);
    return total + (qtd * valorUnit);
  }, 0);

  return (
    <>
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          html, body {
            margin: 0 !important;
            padding: 0 !important;
            width: 210mm;
            height: 297mm;
            overflow: hidden;
          }
          body > *:not(#print-container-pedido) {
            display: none !important;
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .print-container-pedido {
            width: 210mm !important;
            min-height: 297mm;
            padding: 15mm;
            margin: 0 !important;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.4;
            position: absolute;
            top: 0;
            left: 0;
          }
          .print-container-pedido * {
            font-size: 8pt !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-container-pedido {
            width: 210mm;
            min-height: 297mm;
            padding: 15mm;
            margin: 20px auto;
            background: white;
            box-shadow: 0 0 10px rgba(0,0,0,0.1);
            font-family: Arial, sans-serif;
            font-size: 8pt;
            line-height: 1.4;
          }
        }
        .print-container-pedido .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        .print-container-pedido .header h1 {
          margin: 0;
          font-size: 8pt;
          font-weight: bold;
        }
        .print-container-pedido .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .print-container-pedido .section-title {
          background-color: #f0f0f0;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 12px;
          border-left: 4px solid #16a34a;
        }
        .print-container-pedido .section-content {
          padding: 0;
        }
        .print-container-pedido table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8pt;
        }
        .print-container-pedido table th,
        .print-container-pedido table td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
        }
        .print-container-pedido table th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 8pt;
        }
        .print-container-pedido .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-pedido .info-item {
          display: flex;
          flex-direction: column;
        }
        .print-container-pedido .info-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2px;
        }
        .print-container-pedido .info-value {
          font-size: 8pt;
        }
        .print-container-pedido .text-area {
          white-space: pre-wrap;
          padding: 8px;
          border: 1px solid #ddd;
          min-height: 60px;
          font-size: 8pt;
        }
        .print-container-pedido .text-right {
          text-align: right;
        }
        .print-container-pedido .font-bold {
          font-weight: bold;
        }
        .print-container-pedido .cards-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-pedido .cards-grid-2 {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
          margin-bottom: 10px;
        }
        .print-container-pedido .card {
          border: 1px solid #ddd;
          padding: 8px;
          background-color: #f9f9f9;
        }
        .print-container-pedido .card-title {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 6px;
          padding-bottom: 4px;
          border-bottom: 1px solid #ddd;
        }
        .print-container-pedido .card-content {
          font-size: 8pt;
        }
        .print-container-pedido .card-field {
          margin-bottom: 4px;
        }
        .print-container-pedido .card-field-label {
          font-weight: bold;
          font-size: 8pt;
          display: inline-block;
          min-width: 50px;
        }
        .print-container-pedido .card-field-value {
          font-size: 8pt;
        }
      `}</style>
      <div className="print-container-pedido" id="print-container-pedido">
        {/* Cabeçalho */}
        <div className="header">
          <h1>PEDIDO DE COMPRAS</h1>
        </div>

        {/* SEÇÃO A: Dados do Pedido e Solicitação */}
        <div className="section">
          <div className="section-title">A) Dados do Pedido e Solicitação</div>
          <div className="section-content">
            <div className="cards-grid-2">
              {/* Card: Dados do Pedido */}
              <div className="card">
                <div className="card-title">Dados do Pedido</div>
                <div className="card-content">
                  {pedidoCompras.numero_pedido && (
                    <div className="card-field">
                      <span className="card-field-label">Nº Pedido:</span>
                      <span className="card-field-value">{pedidoCompras.numero_pedido || '-'}</span>
                    </div>
                  )}
                  {pedidoCompras.status && (
                    <div className="card-field">
                      <span className="card-field-label">Status:</span>
                      <span className="card-field-value">{pedidoCompras.status || '-'}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Card: Dados da Solicitação */}
              {(pedidoCompras.numero_solicitacao || pedidoCompras.solicitacao_numero || pedidoCompras.solicitacao_justificativa || pedidoCompras.justificativa || pedidoCompras.data_entrega_cd) && (
                <div className="card">
                  <div className="card-title">Dados da Solicitação</div>
                  <div className="card-content">
                    {(pedidoCompras.numero_solicitacao || pedidoCompras.solicitacao_numero) && (
                      <div className="card-field">
                        <span className="card-field-label">Nº Solicitação:</span>
                        <span className="card-field-value">{pedidoCompras.numero_solicitacao || pedidoCompras.solicitacao_numero || '-'}</span>
                      </div>
                    )}
                    {pedidoCompras.data_entrega_cd && (
                      <div className="card-field">
                        <span className="card-field-label">Data Entrega CD:</span>
                        <span className="card-field-value">{formatDate(pedidoCompras.data_entrega_cd)}</span>
                      </div>
                    )}
                    {(pedidoCompras.solicitacao_justificativa || pedidoCompras.justificativa) && (
                      <div className="card-field">
                        <span className="card-field-label">Justificativa:</span>
                        <span className="card-field-value">{pedidoCompras.solicitacao_justificativa || pedidoCompras.justificativa || '-'}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEÇÃO C: Dados do Fornecedor */}
        {pedidoCompras.fornecedor_nome && (
          <div className="section">
            <div className="section-title">C) Dados do Fornecedor</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Nome</th>
                  <td colSpan="3">{pedidoCompras.fornecedor_nome || '-'}</td>
                </tr>
                {pedidoCompras.fornecedor_cnpj && (
                  <tr>
                    <th>CNPJ</th>
                    <td colSpan="3">{pedidoCompras.fornecedor_cnpj || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        )}

        {/* SEÇÃO D: Dados das Filiais */}
        {(pedidoCompras.filial_faturamento_nome || pedidoCompras.filial_nome || pedidoCompras.filial_cobranca_nome || pedidoCompras.filial_entrega_nome || pedidoCompras.endereco_faturamento || pedidoCompras.endereco_cobranca || pedidoCompras.endereco_entrega) && (
          <div className="section">
            <div className="section-title">D) Dados das Filiais</div>
            <div className="section-content">
              <div className="cards-grid">
                {/* Filial de Faturamento */}
                {(pedidoCompras.filial_faturamento_nome || pedidoCompras.filial_nome || pedidoCompras.endereco_faturamento || pedidoCompras.cnpj_faturamento) && (
                  <div className="card">
                    <div className="card-title">Faturamento</div>
                    <div className="card-content">
                      {(pedidoCompras.filial_faturamento_nome || pedidoCompras.filial_nome) && (
                        <div className="card-field">
                          <span className="card-field-label">Filial:</span>
                          <span className="card-field-value">{pedidoCompras.filial_faturamento_nome || pedidoCompras.filial_nome || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.cnpj_faturamento && (
                        <div className="card-field">
                          <span className="card-field-label">CNPJ:</span>
                          <span className="card-field-value">{pedidoCompras.cnpj_faturamento || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.endereco_faturamento && (
                        <div className="card-field">
                          <span className="card-field-label">End.:</span>
                          <span className="card-field-value">{pedidoCompras.endereco_faturamento || '-'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Filial de Cobrança */}
                {(pedidoCompras.filial_cobranca_nome || pedidoCompras.endereco_cobranca || pedidoCompras.cnpj_cobranca) && (
                  <div className="card">
                    <div className="card-title">Cobrança</div>
                    <div className="card-content">
                      {pedidoCompras.filial_cobranca_nome && (
                        <div className="card-field">
                          <span className="card-field-label">Filial:</span>
                          <span className="card-field-value">{pedidoCompras.filial_cobranca_nome || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.cnpj_cobranca && (
                        <div className="card-field">
                          <span className="card-field-label">CNPJ:</span>
                          <span className="card-field-value">{pedidoCompras.cnpj_cobranca || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.endereco_cobranca && (
                        <div className="card-field">
                          <span className="card-field-label">End.:</span>
                          <span className="card-field-value">{pedidoCompras.endereco_cobranca || '-'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Filial de Entrega */}
                {(pedidoCompras.filial_entrega_nome || pedidoCompras.endereco_entrega || pedidoCompras.cnpj_entrega) && (
                  <div className="card">
                    <div className="card-title">Entrega</div>
                    <div className="card-content">
                      {pedidoCompras.filial_entrega_nome && (
                        <div className="card-field">
                          <span className="card-field-label">Filial:</span>
                          <span className="card-field-value">{pedidoCompras.filial_entrega_nome || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.cnpj_entrega && (
                        <div className="card-field">
                          <span className="card-field-label">CNPJ:</span>
                          <span className="card-field-value">{pedidoCompras.cnpj_entrega || '-'}</span>
                        </div>
                      )}
                      {pedidoCompras.endereco_entrega && (
                        <div className="card-field">
                          <span className="card-field-label">End.:</span>
                          <span className="card-field-value">{pedidoCompras.endereco_entrega || '-'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* SEÇÃO E: Forma e Prazo de Pagamento */}
        {(pedidoCompras.forma_pagamento_nome || pedidoCompras.prazo_pagamento_nome || pedidoCompras.forma_pagamento || pedidoCompras.prazo_pagamento) && (
          <div className="section">
            <div className="section-title">E) Forma e Prazo de Pagamento</div>
            <div className="section-content">
              <table>
                <tbody>
                  <tr>
                    <th style={{ width: '25%' }}>Forma de Pagamento</th>
                    <td>{pedidoCompras.forma_pagamento_nome || pedidoCompras.forma_pagamento || '-'}</td>
                    <th style={{ width: '25%' }}>Prazo de Pagamento</th>
                    <td>{pedidoCompras.prazo_pagamento_nome || pedidoCompras.prazo_pagamento || '-'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO F: Itens do Pedido */}
        {itens && itens.length > 0 && (
          <div className="section">
            <div className="section-title">F) Itens do Pedido</div>
            <div className="section-content">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Unidade</th>
                    <th>Quantidade</th>
                    <th>Valor Unitário</th>
                    <th>Valor Total</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => {
                    const qtd = parseFloat(item.quantidade_pedido || 0);
                    const valorUnit = parseFloat(item.valor_unitario || 0);
                    const valorItemTotal = qtd * valorUnit;
                    
                    return (
                      <tr key={index}>
                        <td>{item.codigo_produto || item.produto_generico_codigo || item.codigo || '-'}</td>
                        <td>{item.nome_produto || item.produto_generico_nome || item.produto_nome || '-'}</td>
                        <td>{item.unidade_sigla || item.unidade_medida || item.unidade_simbolo || '-'}</td>
                        <td>{normalizeNumber(qtd)}</td>
                        <td>{formatCurrency(valorUnit)}</td>
                        <td className="text-right font-bold">{formatCurrency(valorItemTotal)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr>
                    <td colSpan="5" className="text-right font-bold">Valor Total do Pedido:</td>
                    <td className="text-right font-bold">{formatCurrency(valorTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO G: Observações */}
        {pedidoCompras.observacoes && (
          <div className="section">
            <div className="section-title">G) Observações</div>
            <div className="section-content">
              <div className="text-area">
                {pedidoCompras.observacoes}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default PedidosComprasPrint;

