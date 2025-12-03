import React, { useState, useEffect } from 'react';
import fichaHomologacaoService from '../../services/fichaHomologacao';
import api from '../../services/api';

// Componente para carregar e exibir fotos na impressão
const FotosImpressao = ({ ficha }) => {
  const [imageUrls, setImageUrls] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadImages = async () => {
      const urls = {};
      
      if (ficha?.id) {
        const tipos = ['foto_embalagem', 'foto_produto_cru', 'foto_produto_cozido'];
        
        const promises = tipos.map(async (tipo) => {
          if (ficha[tipo]) {
            try {
              const url = fichaHomologacaoService.getArquivoUrl(ficha.id, tipo);
              const response = await api.get(url, { responseType: 'blob' });
              const blob = new Blob([response.data]);
              const blobUrl = URL.createObjectURL(blob);
              urls[tipo] = blobUrl;
            } catch (error) {
              console.error(`Erro ao carregar ${tipo}:`, error);
            }
          }
        });
        
        await Promise.all(promises);
        setImageUrls(urls);
        setLoading(false);
      } else {
        setLoading(false);
      }
    };

    loadImages();

    // Limpar blob URLs quando componente desmontar
    return () => {
      Object.values(imageUrls).forEach(url => {
        if (url) URL.revokeObjectURL(url);
      });
    };
  }, [ficha?.id, ficha?.foto_embalagem, ficha?.foto_produto_cru, ficha?.foto_produto_cozido]);

  const hasAnyPhoto = ficha?.foto_embalagem || ficha?.foto_produto_cru || ficha?.foto_produto_cozido;

  if (!hasAnyPhoto) {
    return <div style={{ marginTop: '5px', fontSize: '7pt' }}>Nenhuma foto disponível</div>;
  }

  if (loading) {
    return <div style={{ marginTop: '5px', fontSize: '7pt' }}>Carregando fotos...</div>;
  }

  return (
    <div className="fotos-container">
      {ficha.foto_embalagem && (
        <div className="foto-item">
          <div style={{ marginBottom: '3px', fontSize: '6pt', fontWeight: 'bold' }}>Foto da Embalagem</div>
          {imageUrls.foto_embalagem ? (
            <img src={imageUrls.foto_embalagem} alt="Foto da Embalagem" onLoad={() => {}} />
          ) : (
            <div className="foto-placeholder">Não disponível</div>
          )}
        </div>
      )}
      {ficha.foto_produto_cru && (
        <div className="foto-item">
          <div style={{ marginBottom: '3px', fontSize: '6pt', fontWeight: 'bold' }}>Foto do Produto Cru</div>
          {imageUrls.foto_produto_cru ? (
            <img src={imageUrls.foto_produto_cru} alt="Foto do Produto Cru" onLoad={() => {}} />
          ) : (
            <div className="foto-placeholder">Não disponível</div>
          )}
        </div>
      )}
      {ficha.foto_produto_cozido && (
        <div className="foto-item">
          <div style={{ marginBottom: '3px', fontSize: '6pt', fontWeight: 'bold' }}>Foto do Produto Cozido</div>
          {imageUrls.foto_produto_cozido ? (
            <img src={imageUrls.foto_produto_cozido} alt="Foto do Produto Cozido" onLoad={() => {}} />
          ) : (
            <div className="foto-placeholder">Não disponível</div>
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Componente para impressão da Ficha de Homologação
 * Replica o layout do modal de visualização, formatado para impressão em A4
 */
const FichaHomologacaoPrint = ({ ficha }) => {
  if (!ficha) return null;

  // Formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Formatar número
  const formatNumber = (num) => {
    if (num === null || num === undefined) return '-';
    const valor = parseFloat(num);
    if (isNaN(valor)) return '-';
    return valor % 1 === 0 ? valor.toString() : valor.toFixed(3).replace(/\.?0+$/, '');
  };

  const tipoText = ficha.tipo === 'NOVO_PRODUTO' ? 'Novo Produto' : 'Reavaliação';
  const nomeGenericoText = ficha.nome_generico_codigo && ficha.nome_generico_nome
    ? `${ficha.nome_generico_codigo} - ${ficha.nome_generico_nome}`
    : (ficha.nome_generico_nome || '-');
  const unidadeMedidaText = ficha.unidade_medida_sigla || ficha.unidade_medida_nome || '-';

  const getAvaliacaoLabel = (avaliacao) => {
    const labels = {
      'BOM': 'Bom',
      'REGULAR': 'Regular',
      'RUIM': 'Ruim'
    };
    return labels[avaliacao] || avaliacao;
  };

  const resultadoLabels = {
    'APROVADO': 'Aprovado',
    'APROVADO_COM_RESSALVAS': 'Aprovado com Ressalvas',
    'REPROVADO': 'Reprovado'
  };

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
          body > *:not(#print-container-ficha-homologacao) {
            display: none !important;
            visibility: hidden !important;
          }
          .no-print {
            display: none !important;
            visibility: hidden !important;
          }
          .print-container-ficha-homologacao {
            width: 210mm !important;
            min-height: 297mm;
            padding: 10mm !important;
            margin: 0 !important;
            background: white;
            font-family: Arial, sans-serif;
            font-size: 7pt !important;
            line-height: 1.2 !important;
            position: absolute;
            top: 0;
            left: 0;
          }
          .print-container-ficha-homologacao * {
            font-size: 8pt !important;
          }
          .page-break {
            page-break-after: always;
          }
        }
        @media screen {
          .print-container-ficha-homologacao {
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
        .print-container-ficha-homologacao .header {
          text-align: center;
          margin-bottom: 8px !important;
          padding-bottom: 5px !important;
          border-bottom: 1px solid #000;
        }
        .print-container-ficha-homologacao .header h1 {
          margin: 0;
          font-size: 9pt !important;
          font-weight: bold;
        }
        .print-container-ficha-homologacao .section {
          margin-bottom: 8px !important;
        }
        .print-container-ficha-homologacao .section-title {
          background-color: #f0f0f0;
          padding: 4px 6px !important;
          font-weight: bold;
          border-left: 3px solid #16a34a;
          margin-bottom: 5px !important;
          font-size: 7pt !important;
        }
        .print-container-ficha-homologacao .section-content {
          padding: 5px !important;
        }
        .print-container-ficha-homologacao table {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 6px !important;
        }
        .print-container-ficha-homologacao table th,
        .print-container-ficha-homologacao table td {
          border: 1px solid #ddd;
          padding: 3px 4px !important;
          text-align: left;
          font-size: 7pt !important;
          line-height: 1.2 !important;
        }
        .print-container-ficha-homologacao table th {
          background-color: #f5f5f5;
          font-weight: bold;
        }
        .print-container-ficha-homologacao .avaliacao-x {
          text-align: center;
          font-weight: bold;
          font-size: 10pt;
        }
        .print-container-ficha-homologacao .avaliacao-bom {
          color: #10B981;
        }
        .print-container-ficha-homologacao .avaliacao-regular {
          color: #F59E0B;
        }
        .print-container-ficha-homologacao .avaliacao-ruim {
          color: #EF4444;
        }
        .print-container-ficha-homologacao .fotos-container {
          display: flex;
          gap: 4px;
          margin-top: 5px;
          width: 100%;
          page-break-inside: avoid;
          flex-wrap: nowrap;
        }
        .print-container-ficha-homologacao .foto-item {
          flex: 1 1 0;
          text-align: center;
          min-width: 0;
          max-width: calc(33.33% - 4px);
        }
        .print-container-ficha-homologacao .foto-item img {
          max-width: 100%;
          max-height: 40mm !important;
          height: auto;
          width: 100%;
          object-fit: contain;
          border: 1px solid #ddd;
          display: block;
          margin: 0 auto;
        }
        .print-container-ficha-homologacao .foto-placeholder {
          padding: 8px;
          border: 1px solid #ddd;
          min-height: 35mm;
          max-height: 40mm;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9f9f9;
          font-size: 6pt;
          color: #666;
        }
      `}</style>
      <div className="print-container-ficha-homologacao" id="print-container-ficha-homologacao">
        <div className="header">
          <h1>FICHA DE HOMOLOGAÇÃO</h1>
        </div>

        {/* SEÇÃO A: Informações Básicas */}
        <div className="section">
          <div className="section-title">A) Informações Básicas</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>ID</th>
                  <td style={{ width: '25%' }}>{ficha.id}</td>
                  <th style={{ width: '25%' }}>Tipo</th>
                  <td style={{ width: '25%' }}>{tipoText}</td>
                </tr>
                <tr>
                  <th>Data da Análise</th>
                  <td>{formatDate(ficha.data_analise)}</td>
                  <th>Avaliador</th>
                  <td>{ficha.avaliador_nome || '-'}</td>
                </tr>
                <tr>
                  <th style={{ width: '20%' }}>Nome Genérico do Produto</th>
                  <td style={{ width: '30%' }}>{nomeGenericoText}</td>
                  <th style={{ width: '20%' }}>Unidade de Medida</th>
                  <td style={{ width: '30%' }}>{unidadeMedidaText}</td>
                </tr>
                {ficha.tipo === 'REAVALIACAO' && ficha.pdf_avaliacao_antiga && (
                  <tr>
                    <th>PDF da Avaliação Antiga</th>
                    <td colSpan="3">{ficha.pdf_avaliacao_antiga}</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO B: Informações do Produto */}
        <div className="section">
          <div className="section-title">B) Informações do Produto</div>
          <div className="section-content">
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Marca</th>
                  <td style={{ width: '25%' }}>{ficha.marca || '-'}</td>
                  <th style={{ width: '25%' }}>Fabricante</th>
                  <td style={{ width: '25%' }}>{ficha.fabricante || '-'}</td>
                </tr>
                <tr>
                  <th>Fornecedor</th>
                  <td colSpan="3">{ficha.fornecedor_nome || ficha.fornecedor_nome_fantasia || '-'}</td>
                </tr>
                <tr>
                  <th>Composição</th>
                  <td colSpan="3">{ficha.composicao || '-'}</td>
                </tr>
                <tr>
                  <th>Lote</th>
                  <td>{ficha.lote || '-'}</td>
                  <th>Data de Fabricação</th>
                  <td>{formatDate(ficha.fabricacao)}</td>
                </tr>
                <tr>
                  <th>Data de Validade</th>
                  <td colSpan="3">{formatDate(ficha.validade)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO C: Avaliações de Qualidade */}
        <div className="section">
          <div className="section-title">C) Avaliações de Qualidade</div>
          <div className="section-content">
            <table>
              <thead>
                <tr>
                  <th style={{ width: '20%' }}>Critério</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Bom</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Regular</th>
                  <th style={{ width: '12%', textAlign: 'center' }}>Ruim</th>
                  <th style={{ width: '44%' }}>Valor (kg) / Observação</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { criterio: 'Peso', valor: ficha.peso, valorNum: ficha.peso_valor, unidade: ficha.unidade_medida_sigla },
                  { criterio: 'Peso Cru', valor: ficha.peso_cru, valorNum: ficha.peso_cru_valor, unidade: ficha.unidade_medida_sigla },
                  { criterio: 'Peso Cozido', valor: ficha.peso_cozido, valorNum: ficha.peso_cozido_valor, unidade: ficha.unidade_medida_sigla },
                  { criterio: 'Fator de Cocção', valor: ficha.fator_coccao, valorNum: ficha.fator_coccao_valor },
                  { criterio: 'Cor', valor: ficha.cor, observacao: ficha.cor_observacao },
                  { criterio: 'Odor', valor: ficha.odor, observacao: ficha.odor_observacao },
                  { criterio: 'Sabor', valor: ficha.sabor, observacao: ficha.sabor_observacao },
                  { criterio: 'Aparência', valor: ficha.aparencia, observacao: ficha.aparencia_observacao }
                ].map((avaliacao, index) => (
                  <tr key={index}>
                    <td>{avaliacao.criterio}</td>
                    <td style={{ textAlign: 'center' }}>
                      {avaliacao.valor === 'BOM' && (
                        <span className="avaliacao-x avaliacao-bom">X</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {avaliacao.valor === 'REGULAR' && (
                        <span className="avaliacao-x avaliacao-regular">X</span>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      {avaliacao.valor === 'RUIM' && (
                        <span className="avaliacao-x avaliacao-ruim">X</span>
                      )}
                    </td>
                    <td>
                      {avaliacao.valorNum !== null && avaliacao.valorNum !== undefined
                        ? `${formatNumber(avaliacao.valorNum)}${avaliacao.unidade ? ' ' + avaliacao.unidade : ''}`
                        : (avaliacao.observacao || '-')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* SEÇÃO D: Conclusão e Documentação */}
        <div className="section">
          <div className="section-title">D) Conclusão e Documentação</div>
          <div className="section-content">
            <div style={{ marginBottom: '8px' }}>
              <strong style={{ fontSize: '7pt' }}>Documentação Fotográfica:</strong>
              <FotosImpressao ficha={ficha} />
            </div>
            <table>
              <tbody>
                <tr>
                  <th style={{ width: '25%' }}>Conclusão</th>
                  <td colSpan="3">{ficha.conclusao || '-'}</td>
                </tr>
                <tr>
                  <th>Resultado Final</th>
                  <td colSpan="3">{ficha.resultado_final ? (resultadoLabels[ficha.resultado_final] || ficha.resultado_final) : '-'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default FichaHomologacaoPrint;

