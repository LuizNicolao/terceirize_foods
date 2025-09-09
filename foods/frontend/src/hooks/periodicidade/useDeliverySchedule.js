import { useState, useCallback } from 'react';
import { useExport } from '../common/useExport';

export const useDeliverySchedule = () => {
  const [exporting, setExporting] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);

  const handleExportCalendar = useCallback(async (deliveries, agrupamentoData, selectedMonth) => {
    setExporting(true);
    
    try {
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Preparar dados para exportação
      const calendarData = {
        periodo: formatMonthYear(selectedMonth),
        agrupamento: agrupamentoData?.nome || 'Agrupamento',
        tipo: agrupamentoData?.tipo_nome || 'N/A',
        entregas: deliveries.map(delivery => ({
          data: delivery.date.toLocaleDateString('pt-BR'),
          tipo: delivery.type,
          escolas: delivery.schools,
          produtos: delivery.products,
          status: delivery.status
        }))
      };

      // Criar arquivo CSV para download
      let csvContent = "Data,Tipo,Escolas,Produtos,Status\n";
      calendarData.entregas.forEach(entrega => {
        csvContent += `${entrega.data},${entrega.tipo},${entrega.escolas},${entrega.produtos},${entrega.status}\n`;
      });
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `calendario_${agrupamentoData?.nome || 'agrupamento'}_${formatMonthYear(selectedMonth).replace(' ', '_')}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mostrar feedback para o usuário
      alert('✅ Calendário exportado com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar calendário:', error);
      alert('❌ Erro ao exportar calendário. Tente novamente.');
    } finally {
      setExporting(false);
    }
  }, []);

  const handleGenerateReport = useCallback(async (deliveries, agrupamentoData, selectedMonth, statistics) => {
    setGeneratingReport(true);
    
    try {
      // Simular delay para mostrar loading
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Preparar dados do relatório
      const reportData = {
        titulo: `Relatório de Entregas - ${formatMonthYear(selectedMonth)}`,
        agrupamento: {
          nome: agrupamentoData?.nome || 'Agrupamento',
          tipo: agrupamentoData?.tipo_nome || 'N/A',
          regras: agrupamentoData?.regras_calendario || {}
        },
        resumo: {
          totalEntregas: statistics.totalDeliveries,
          totalEscolas: statistics.totalSchools,
          totalProdutos: statistics.totalProducts,
          conflitos: statistics.conflicts
        },
        entregas: deliveries.map(delivery => ({
          data: delivery.date.toLocaleDateString('pt-BR'),
          diaSemana: delivery.date.toLocaleDateString('pt-BR', { weekday: 'long' }),
          tipo: delivery.type,
          escolas: delivery.schools,
          produtos: delivery.products,
          status: delivery.status,
          conflitos: delivery.conflicts?.length || 0
        })),
        geradoEm: new Date().toLocaleString('pt-BR')
      };

      // Criar relatório em formato texto
      let reportText = `RELATÓRIO DE ENTREGAS - ${formatMonthYear(selectedMonth).toUpperCase()}\n`;
      reportText += `==========================================\n\n`;
      reportText += `Agrupamento: ${reportData.agrupamento.nome}\n`;
      reportText += `Tipo: ${reportData.agrupamento.tipo}\n`;
      reportText += `Período: ${formatMonthYear(selectedMonth)}\n\n`;
      
      reportText += `RESUMO:\n`;
      reportText += `- Total de Entregas: ${reportData.resumo.totalEntregas}\n`;
      reportText += `- Total de Escolas: ${reportData.resumo.totalEscolas}\n`;
      reportText += `- Total de Produtos: ${reportData.resumo.totalProdutos}\n`;
      reportText += `- Conflitos: ${reportData.resumo.conflitos}\n\n`;
      
      // Adicionar informações detalhadas das escolas
      if (agrupamentoData?.unidades_escolares && agrupamentoData.unidades_escolares.length > 0) {
        reportText += `ESCOLAS VINCULADAS:\n`;
        reportText += `==================\n`;
        agrupamentoData.unidades_escolares.forEach((escola, index) => {
          reportText += `${index + 1}. ${escola.nome || 'Escola não informada'}\n`;
          if (escola.endereco) reportText += `   Endereço: ${escola.endereco}\n`;
          if (escola.cidade && escola.estado) reportText += `   Cidade: ${escola.cidade}/${escola.estado}\n`;
          reportText += `\n`;
        });
      }
      
      // Adicionar informações detalhadas dos produtos
      if (agrupamentoData?.produtos_individuais && agrupamentoData.produtos_individuais.length > 0) {
        reportText += `PRODUTOS VINCULADOS:\n`;
        reportText += `===================\n`;
        agrupamentoData.produtos_individuais.forEach((produto, index) => {
          reportText += `${index + 1}. ${produto.nome || 'Produto não informado'}\n`;
          if (produto.codigo_produto) reportText += `   Código: ${produto.codigo_produto}\n`;
          if (produto.informacoes_adicionais) reportText += `   Info: ${produto.informacoes_adicionais}\n`;
          reportText += `\n`;
        });
      }
      
      // Adicionar regras de calendário
      if (agrupamentoData?.regras_calendario) {
        reportText += `REGRAS DE CALENDÁRIO:\n`;
        reportText += `====================\n`;
        const regras = agrupamentoData.regras_calendario;
        
        if (regras.dias_semana && regras.dias_semana.length > 0) {
          const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
          const diasSelecionados = regras.dias_semana.map(dia => diasSemana[dia]).join(', ');
          reportText += `Dias da Semana: ${diasSelecionados}\n`;
        }
        
        if (regras.quinzena) {
          const quinzenas = {
            'primeira_quinzena': 'Primeira quinzena (1-15)',
            'segunda_quinzena': 'Segunda quinzena (16-31)',
            'semanas_impares': 'Semanas ímpares',
            'semanas_pares': 'Semanas pares',
            'ultima_semana': 'Última semana do mês'
          };
          reportText += `Quinzena: ${quinzenas[regras.quinzena] || regras.quinzena}\n`;
        }
        
        if (regras.tipo_mensal) {
          const tiposMensal = {
            'primeira': 'Primeira ocorrência do mês',
            'ultima': 'Última ocorrência do mês',
            'primeira_ultima': 'Primeira e última ocorrência do mês'
          };
          reportText += `Tipo Mensal: ${tiposMensal[regras.tipo_mensal] || regras.tipo_mensal}\n`;
        }
        reportText += `\n`;
      }
      
      reportText += `CRONOGRAMA DE ENTREGAS:\n`;
      reportText += `========================\n`;
      
      reportData.entregas.forEach(entrega => {
        reportText += `${entrega.data} (${entrega.diaSemana})\n`;
        reportText += `  Tipo: ${entrega.tipo}\n`;
        reportText += `  Escolas: ${entrega.escolas}\n`;
        reportText += `  Produtos: ${entrega.produtos}\n`;
        reportText += `  Status: ${entrega.status}\n`;
        if (entrega.conflitos > 0) {
          reportText += `  ⚠️ CONFLITO DETECTADO\n`;
        }
        reportText += `\n`;
      });
      
      reportText += `Relatório gerado em: ${reportData.geradoEm}\n`;

      // Criar arquivo de texto para download
      const dataBlob = new Blob([reportText], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `relatorio_entregas_${agrupamentoData?.nome || 'agrupamento'}_${formatMonthYear(selectedMonth).replace(' ', '_')}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Mostrar feedback para o usuário
      alert('✅ Relatório gerado com sucesso!');
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      alert('❌ Erro ao gerar relatório. Tente novamente.');
    } finally {
      setGeneratingReport(false);
    }
  }, []);

  const formatMonthYear = (date) => {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  return {
    exporting,
    generatingReport,
    handleExportCalendar,
    handleGenerateReport
  };
};
