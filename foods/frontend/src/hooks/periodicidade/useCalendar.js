import { useState, useEffect, useCallback, useRef } from 'react';
import FeriadosService from '../../services/feriadosService';
import { useEntregas } from './useEntregas';

export const useCalendar = (agrupamentoData, selectedMonth) => {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [feriados, setFeriados] = useState([]);
  const [statistics, setStatistics] = useState({
    totalDeliveries: 0,
    totalSchools: 0,
    totalProducts: 0,
    conflicts: 0,
    holidays: 0
  });

  // Ref para acessar o estado atual sem causar loop
  const deliveriesRef = useRef(deliveries);
  deliveriesRef.current = deliveries;

  // Hook para carregar entregas do banco
  const {
    entregas: entregasBanco,
    loading: loadingEntregas,
    carregarEntregas
  } = useEntregas(agrupamentoData?.id, selectedMonth.getMonth() + 1, selectedMonth.getFullYear());

  // Carregar feriados e gerar cronograma
  useEffect(() => {
    if (agrupamentoData) {
      loadFeriadosAndGenerateSchedule();
    }
  }, [agrupamentoData, selectedMonth]);

  // Combinar entregas do banco com as geradas automaticamente
  useEffect(() => {
    
    if (entregasBanco.length > 0) {
      
      // Se há entregas no banco, combinar com as automáticas
      if (deliveriesRef.current.length === 0) {
        // Se não há entregas automáticas, gerar primeiro
        loadFeriadosAndGenerateSchedule();
      } else {
        // Combinar entregas do banco com as automáticas
        const entregasCombinadas = [...deliveriesRef.current];
        
        // Adicionar entregas do banco que não existem nas automáticas
        // Filtrar entregas excluídas
        const entregasExcluidas = entregasBanco.filter(e => e.type === 'excluida');
        const entregasNormais = entregasBanco.filter(e => e.type !== 'excluida');
        
        // Remover entregas automáticas que foram excluídas
        entregasExcluidas.forEach(entregaExcluida => {
          const dataExcluida = entregaExcluida.date.toISOString().split('T')[0];
          const index = entregasCombinadas.findIndex(entrega => 
            entrega.date.toISOString().split('T')[0] === dataExcluida
          );
          if (index !== -1) {
            entregasCombinadas.splice(index, 1);
          }
        });
        
        // Adicionar entregas normais do banco
        entregasNormais.forEach(entregaBanco => {
          const dataEntrega = entregaBanco.date.toISOString().split('T')[0];
          const jaExiste = entregasCombinadas.some(entrega => 
            entrega.date.toISOString().split('T')[0] === dataEntrega
          );
          
          if (!jaExiste) {
            entregasCombinadas.push(entregaBanco);
          } else {
            const index = entregasCombinadas.findIndex(entrega => 
              entrega.date.toISOString().split('T')[0] === dataEntrega
            );
            if (index !== -1) {
              entregasCombinadas[index] = entregaBanco;
            }
          }
        });
        setDeliveries(entregasCombinadas);
      }
    } else if (agrupamentoData && !loadingEntregas) {
      // Se não há entregas no banco, gerar automaticamente
      loadFeriadosAndGenerateSchedule();
    }
  }, [entregasBanco, loadingEntregas, agrupamentoData]);

  // Carregar feriados do mês selecionado
  const loadFeriadosAndGenerateSchedule = useCallback(async () => {
    
    setLoading(true);
    
    try {
      // Carregar feriados do mês
      const feriadosMes = await FeriadosService.getFeriadosMes(
        selectedMonth.getMonth(), 
        selectedMonth.getFullYear()
      );
      setFeriados(feriadosMes);
      
      // Gerar cronograma de entregas
      const mockDeliveries = generateMockDeliveries();
      const deliveriesWithHolidays = await processDeliveriesWithHolidays(mockDeliveries);
      
      setDeliveries(deliveriesWithHolidays);
      setStatistics({
        totalDeliveries: deliveriesWithHolidays.length,
        totalSchools: agrupamentoData?.unidades_escolares?.length || 0,
        totalProducts: agrupamentoData?.produtos_individuais?.length || 0,
        conflicts: deliveriesWithHolidays.filter(d => d.status === 'conflict').length,
        holidays: feriadosMes.length
      });
    } catch (error) {
      console.error('Erro ao carregar feriados:', error);
      // Fallback: gerar sem feriados
      const mockDeliveries = generateMockDeliveries();
      setDeliveries(mockDeliveries);
      setStatistics({
        totalDeliveries: mockDeliveries.length,
        totalSchools: agrupamentoData?.unidades_escolares?.length || 0,
        totalProducts: agrupamentoData?.produtos_individuais?.length || 0,
        conflicts: mockDeliveries.filter(d => d.status === 'conflict').length,
        holidays: 0
      });
    } finally {
      setLoading(false);
    }
  }, [agrupamentoData, selectedMonth]);

  // Processar entregas considerando feriados
  const processDeliveriesWithHolidays = useCallback(async (deliveries) => {
    const processedDeliveries = [];
    
    for (const delivery of deliveries) {
      const feriado = await FeriadosService.isFeriado(delivery.date);
      
      if (feriado) {
        // Se é feriado, marcar como CONFLITO e sugerir data alternativa
        const dataAlternativa = getDataAlternativa(delivery.date);
        processedDeliveries.push({
          ...delivery,
          status: 'conflict',
          feriado: feriado,
          dataAlternativa: dataAlternativa,
          conflicts: [{
            date: delivery.date,
            deliveries: [delivery],
            type: 'holiday',
            message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
            feriado: feriado,
            dataAlternativa: dataAlternativa
          }]
        });
      } else {
        processedDeliveries.push(delivery);
      }
    }
    
    return detectConflicts(processedDeliveries);
  }, []);

  // Obter data alternativa para entrega em feriado
  const getDataAlternativa = useCallback((dataFeriado) => {
    const dataAlternativa = new Date(dataFeriado);
    dataAlternativa.setDate(dataFeriado.getDate() - 1);
    
    // Se for domingo, ir para sexta
    if (dataAlternativa.getDay() === 0) {
      dataAlternativa.setDate(dataFeriado.getDate() - 2);
    }
    
    return dataAlternativa;
  }, []);

  const generateMockDeliveries = useCallback(() => {
    if (!agrupamentoData) return [];

    const deliveries = [];
    const currentMonth = selectedMonth.getMonth();
    const currentYear = selectedMonth.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

    // Gerar entregas baseado no tipo de periodicidade
    const tipo = agrupamentoData.tipo_nome?.toLowerCase();
    const regras = agrupamentoData.regras_calendario || {};

    if (tipo === 'semanal' && regras.dias_semana) {
      // Entregas semanais
      regras.dias_semana.forEach(diaSemana => {
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(currentYear, currentMonth, day);
          if (date.getDay() === diaSemana) {
            deliveries.push({
              id: `delivery_${day}`,
              date: date,
              type: 'semanal',
              schools: agrupamentoData.unidades_escolares?.length || 0,
              products: agrupamentoData.produtos_individuais?.length || 0,
              status: 'scheduled',
              conflicts: []
            });
          }
        }
      });
    } else if (tipo === 'quinzenal' && regras.dias_semana && regras.quinzena) {
      // Entregas quinzenais
      const quinzenaDays = getQuinzenaDays(regras.quinzena, currentMonth, currentYear);
      regras.dias_semana.forEach(diaSemana => {
        quinzenaDays.forEach(day => {
          const date = new Date(currentYear, currentMonth, day);
          if (date.getDay() === diaSemana) {
            deliveries.push({
              id: `delivery_${day}`,
              date: date,
              type: 'quinzenal',
              schools: agrupamentoData.unidades_escolares?.length || 0,
              products: agrupamentoData.produtos_individuais?.length || 0,
              status: 'scheduled',
              conflicts: []
            });
          }
        });
      });
    } else if (tipo === 'mensal' && regras.dias_semana && regras.tipo_mensal) {
      // Entregas mensais
      const mensalDays = getMensalDays(regras.tipo_mensal, currentMonth, currentYear);
      regras.dias_semana.forEach(diaSemana => {
        mensalDays.forEach(day => {
          const date = new Date(currentYear, currentMonth, day);
          if (date.getDay() === diaSemana) {
            deliveries.push({
              id: `delivery_${day}`,
              date: date,
              type: 'mensal',
              schools: agrupamentoData.unidades_escolares?.length || 0,
              products: agrupamentoData.produtos_individuais?.length || 0,
              status: 'scheduled',
              conflicts: []
            });
          }
        });
      });
    }

    // Detectar conflitos
    return detectConflicts(deliveries);
  }, [agrupamentoData, selectedMonth]);

  const getQuinzenaDays = useCallback((quinzena, month, year) => {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    switch (quinzena) {
      case 'primeira_quinzena':
        for (let day = 1; day <= 15; day++) days.push(day);
        break;
      case 'segunda_quinzena':
        for (let day = 16; day <= daysInMonth; day++) days.push(day);
        break;
      case 'semanas_impares':
        for (let week = 1; week <= Math.ceil(daysInMonth / 7); week += 2) {
          for (let day = (week - 1) * 7 + 1; day <= Math.min(week * 7, daysInMonth); day++) {
            days.push(day);
          }
        }
        break;
      case 'semanas_pares':
        for (let week = 2; week <= Math.ceil(daysInMonth / 7); week += 2) {
          for (let day = (week - 1) * 7 + 1; day <= Math.min(week * 7, daysInMonth); day++) {
            days.push(day);
          }
        }
        break;
      case 'ultima_semana':
        const lastWeekStart = daysInMonth - 6;
        for (let day = lastWeekStart; day <= daysInMonth; day++) {
          days.push(day);
        }
        break;
    }
    
    return days;
  }, []);

  const getMensalDays = useCallback((tipoMensal, month, year) => {
    const days = [];
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    switch (tipoMensal) {
      case 'primeira':
        days.push(1);
        break;
      case 'ultima':
        days.push(daysInMonth);
        break;
      case 'primeira_ultima':
        days.push(1, daysInMonth);
        break;
    }
    
    return days;
  }, []);

  const detectConflicts = useCallback((deliveries) => {
    const conflicts = [];
    const deliveryDates = deliveries.map(d => d.date.getTime());
    
    // Detectar entregas no mesmo dia
    const dateCounts = {};
    deliveryDates.forEach(date => {
      dateCounts[date] = (dateCounts[date] || 0) + 1;
    });
    
    Object.keys(dateCounts).forEach(date => {
      if (dateCounts[date] > 1) {
        const conflictDate = new Date(parseInt(date));
        const conflictDeliveries = deliveries.filter(d => d.date.getTime() === parseInt(date));
        conflicts.push({
          date: conflictDate,
          deliveries: conflictDeliveries,
          type: 'same_day'
        });
      }
    });
    
    // Marcar entregas com conflitos
    return deliveries.map(delivery => {
      const hasConflict = conflicts.some(c => c.date.getTime() === delivery.date.getTime());
      return {
        ...delivery,
        status: hasConflict ? 'conflict' : delivery.status,
        conflicts: hasConflict ? conflicts.filter(c => c.date.getTime() === delivery.date.getTime()) : []
      };
    });
  }, []);

  return {
    deliveries,
    setDeliveries,
    loading: loading || loadingEntregas,
    feriados,
    statistics,
    loadFeriadosAndGenerateSchedule,
    carregarEntregas
  };
};
