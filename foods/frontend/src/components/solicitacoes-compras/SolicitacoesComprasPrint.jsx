import React from 'react';

/**
 * Componente para impressão de Solicitação de Compras
 * Replica o layout do modal de visualização, formatado para impressão em A4
 */
const SolicitacoesComprasPrint = ({ solicitacao }) => {
  if (!solicitacao) return null;

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

  // Processar itens
  const itens = solicitacao.itens || [];
  
  // Verificar se algum item tem observação
  const temObservacao = itens.some(item => item.observacao);

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
          body > *:not(#print-container-solicitacao) {
            display: none !important;
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .print-container-solicitacao {
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
          .print-container-solicitacao * {
            font-size: 8pt !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-container-solicitacao {
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
        .print-container-solicitacao .header {
          text-align: center;
          margin-bottom: 20px;
          padding-bottom: 15px;
          border-bottom: 2px solid #000;
        }
        .print-container-solicitacao .header h1 {
          margin: 0;
          font-size: 8pt;
          font-weight: bold;
        }
        .print-container-solicitacao .section {
          margin-bottom: 20px;
          page-break-inside: avoid;
        }
        .print-container-solicitacao .section-title {
          background-color: #f0f0f0;
          padding: 8px 12px;
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 12px;
          border-left: 4px solid #16a34a;
        }
        .print-container-solicitacao .section-content {
          padding: 0;
        }
        .print-container-solicitacao table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 15px;
          font-size: 8pt;
        }
        .print-container-solicitacao table th,
        .print-container-solicitacao table td {
          border: 1px solid #ddd;
          padding: 6px 8px;
          text-align: left;
        }
        .print-container-solicitacao table th {
          background-color: #f5f5f5;
          font-weight: bold;
          font-size: 8pt;
        }
        .print-container-solicitacao .info-label {
          font-weight: bold;
          font-size: 8pt;
          margin-bottom: 2px;
        }
        .print-container-solicitacao .text-area {
          white-space: pre-wrap;
          padding: 8px;
          border: 1px solid #ddd;
          min-height: 60px;
          font-size: 8pt;
        }
      `}</style>
      <div className="print-container-solicitacao">
        {/* Cabeçalho */}
        <div className="header">
          <h1>SOLICITAÇÃO DE COMPRAS</h1>
        </div>

        {/* SEÇÃO A: Dados da Solicitação */}
        <div className="section">
          <div className="section-title">A) Dados da Solicitação</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Nº Solicitação</th>
                  <td style={{ width: '25%' }}>{solicitacao.numero_solicitacao || '-'}</td>
                  <th style={{ width: '25%' }}>Status</th>
                  <td style={{ width: '25%' }}>{solicitacao.status || '-'}</td>
                </tr>
                <tr>
                  <th>Filial</th>
                  <td colSpan="3">{solicitacao.filial_nome || solicitacao.unidade || '-'}</td>
                </tr>
                <tr>
                  <th>Data do Documento</th>
                  <td>{formatDate(solicitacao.data_documento)}</td>
                  <th>Data de Entrega CD</th>
                  <td>{formatDate(solicitacao.data_entrega_cd)}</td>
                </tr>
                <tr>
                  <th>Semana de Abastecimento</th>
                  <td>{solicitacao.semana_abastecimento || '-'}</td>
                  <th>Justificativa</th>
                  <td>{solicitacao.justificativa || solicitacao.motivo || '-'}</td>
                </tr>
                {(solicitacao.descricao || solicitacao.observacoes) && (
                  <tr>
                    <th>Observações</th>
                    <td colSpan="3">{solicitacao.observacoes || solicitacao.descricao || '-'}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO B: Produtos da Solicitação */}
        {itens && itens.length > 0 && (
          <div className="section">
            <div className="section-title">B) Produtos da Solicitação</div>
            <div className="section-content">
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Produto</th>
                    <th>Unidade</th>
                    <th>Quantidade</th>
                    {temObservacao && <th>Observação</th>}
                  </tr>
                </thead>
                <tbody>
                  {itens.map((item, index) => (
                    <tr key={index}>
                      <td>{item.codigo_produto || item.codigo || '-'}</td>
                      <td>{item.nome_produto || item.produto_nome || '-'}</td>
                      <td>{item.unidade_medida || item.unidade_simbolo || item.unidade_texto || '-'}</td>
                      <td>{normalizeNumber(item.quantidade)}</td>
                      {temObservacao && (
                        <td>{item.observacao || '-'}</td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SEÇÃO C: Informações Adicionais */}
        <div className="section">
          <div className="section-title">C) Informações Adicionais</div>
          <div className="section-content">
            <table>
              <tbody>
                {solicitacao.solicitante_nome && (
                  <tr>
                    <th style={{ width: '25%' }}>Solicitante</th>
                    <td colSpan="3">{solicitacao.solicitante_nome}</td>
                  </tr>
                )}
                {solicitacao.pedidos_vinculados && solicitacao.pedidos_vinculados.length > 0 && (
                  <tr>
                    <th>Pedidos Vinculados</th>
                    <td colSpan="3">{solicitacao.pedidos_vinculados.join(', ')}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default SolicitacoesComprasPrint;

