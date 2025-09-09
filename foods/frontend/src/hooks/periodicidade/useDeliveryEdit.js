import { useState, useCallback } from 'react';
import FeriadosService from '../../services/feriadosService';
import EntregasService from '../../services/entregas';

export const useDeliveryEdit = (deliveries, setDeliveries, agrupamentoId, carregarEntregas) => {
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [draggedDelivery, setDraggedDelivery] = useState(null);

  // Função auxiliar para formatar data localmente (evita problemas de timezone)
  const formatDateLocal = (date) => {
    console.log('🔍 [DEBUG] formatDateLocal - Data recebida:', date);
    console.log('🔍 [DEBUG] formatDateLocal - Tipo:', typeof date);
    console.log('🔍 [DEBUG] formatDateLocal - Date object:', date instanceof Date);
    
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const formatted = `${year}-${month}-${day}`;
    
    console.log('🔍 [DEBUG] formatDateLocal - Resultado:', formatted);
    console.log('🔍 [DEBUG] formatDateLocal - Year:', year, 'Month:', month, 'Day:', day);
    
    return formatted;
  };

  // Abrir modal de edição
  const openEditModal = useCallback((delivery, date = null) => {
    if (date) {
      // Criar nova entrega para a data especificada
      const newDelivery = {
        id: `delivery_${Date.now()}`,
        date: date,
        type: 'manual',
        schools: 0,
        products: 0,
        status: 'pending',
        conflicts: [],
        isNew: true
      };
      setEditingDelivery(newDelivery);
    } else {
      // Editar entrega existente
      setEditingDelivery(delivery);
    }
    setEditModalOpen(true);
  }, []);

  // Fechar modal de edição
  const closeEditModal = useCallback(() => {
    setEditModalOpen(false);
    setEditingDelivery(null);
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

  // Detectar conflitos entre entregas
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
      const existingConflicts = delivery.conflicts || [];
      
      return {
        ...delivery,
        status: hasConflict ? 'conflict' : delivery.status,
        conflicts: hasConflict 
          ? [...existingConflicts, ...conflicts.filter(c => c.date.getTime() === delivery.date.getTime())]
          : existingConflicts
      };
    });
  }, []);

  // Salvar edição de entrega
  const saveDelivery = useCallback(async (deliveryData) => {
    console.log('🔍 [DEBUG] saveDelivery - deliveryData recebido:', deliveryData);
    console.log('🔍 [DEBUG] saveDelivery - deliveryData.date:', deliveryData.date);
    console.log('🔍 [DEBUG] saveDelivery - deliveryData.date tipo:', typeof deliveryData.date);
    
    try {
      if (deliveryData.isNew) {
        // Criar nova entrega no banco
        const dataFormatada = formatDateLocal(deliveryData.date);
        console.log('🔍 [DEBUG] Criando nova entrega - data formatada:', dataFormatada);
        
        const dadosEntrega = {
          data_entrega: dataFormatada, // YYYY-MM-DD
          tipo_entrega: deliveryData.type || 'manual',
          observacoes: deliveryData.notes || ''
        };
        
        console.log('🔍 [DEBUG] dadosEntrega para criar:', dadosEntrega);

        const response = await EntregasService.criarEntrega(agrupamentoId, dadosEntrega);
        
        if (response.success) {
          // Adicionar à lista local
          const newDelivery = {
            id: response.data.id,
            date: new Date(response.data.data_entrega),
            type: response.data.tipo_entrega,
            schools: deliveryData.schools || 0,
            products: deliveryData.products || 0,
            status: 'scheduled',
            conflicts: [],
            observacoes: response.data.observacoes
          };

          // Verificar se é feriado
          const feriado = await FeriadosService.isFeriado(newDelivery.date);
          if (feriado) {
            newDelivery.status = 'conflict';
            newDelivery.feriado = feriado;
            newDelivery.dataAlternativa = getDataAlternativa(newDelivery.date);
            newDelivery.conflicts = [{
              date: newDelivery.date,
              deliveries: [newDelivery],
              type: 'holiday',
              message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
              feriado: feriado,
              dataAlternativa: newDelivery.dataAlternativa
            }];
          }

          // Recarregar entregas do banco
          if (carregarEntregas) {
            await carregarEntregas();
          } else {
            const updatedDeliveries = [...deliveries, newDelivery];
            const deliveriesWithConflicts = detectConflicts(updatedDeliveries);
            setDeliveries(deliveriesWithConflicts);
          }
        }
      } else {
        // Verificar se é uma entrega do banco (ID numérico) ou temporária (ID string)
        const isDatabaseDelivery = typeof deliveryData.id === 'number' || !deliveryData.id.toString().startsWith('delivery_');
        
        if (isDatabaseDelivery) {
          // Atualizar entrega existente no banco
          const dataFormatada = formatDateLocal(deliveryData.date);
          console.log('🔍 [DEBUG] Atualizando entrega - data formatada:', dataFormatada);
          
          const dadosEntrega = {
            data_entrega: dataFormatada, // YYYY-MM-DD
            tipo_entrega: deliveryData.type || 'manual',
            observacoes: deliveryData.notes || ''
          };
          
          console.log('🔍 [DEBUG] dadosEntrega para atualizar:', dadosEntrega);

          const response = await EntregasService.atualizarEntrega(deliveryData.id, dadosEntrega);
        
        if (response.success) {
          // Atualizar na lista local
          const updatedDeliveries = deliveries.map(delivery => {
            if (delivery.id === deliveryData.id) {
              const updatedDelivery = { 
                ...delivery,
                date: new Date(response.data.data_entrega),
                type: response.data.tipo_entrega,
                observacoes: response.data.observacoes
              };
              
              // Verificar se é feriado
              return FeriadosService.isFeriado(updatedDelivery.date).then(feriado => {
                if (feriado) {
                  updatedDelivery.status = 'conflict';
                  updatedDelivery.feriado = feriado;
                  updatedDelivery.dataAlternativa = getDataAlternativa(updatedDelivery.date);
                  updatedDelivery.conflicts = [{
                    date: updatedDelivery.date,
                    deliveries: [updatedDelivery],
                    type: 'holiday',
                    message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
                    feriado: feriado,
                    dataAlternativa: updatedDelivery.dataAlternativa
                  }];
                } else {
                  // Remover informações de feriado se não for mais feriado
                  delete updatedDelivery.feriado;
                  delete updatedDelivery.dataAlternativa;
                  updatedDelivery.conflicts = (updatedDelivery.conflicts || []).filter(c => c.type !== 'holiday');
                  
                  if (updatedDelivery.conflicts.length === 0) {
                    updatedDelivery.status = 'scheduled';
                  }
                }
                
                return updatedDelivery;
              });
            }
            return delivery;
          });

          // Recarregar entregas do banco
          if (carregarEntregas) {
            await carregarEntregas();
          } else {
            // Aguardar todas as verificações de feriado
            const resolvedDeliveries = await Promise.all(updatedDeliveries);
            const deliveriesWithConflicts = detectConflicts(resolvedDeliveries);
            setDeliveries(deliveriesWithConflicts);
          }
        }
        } else {
          // Verificar se já existe uma entrega para esta data no banco
          const dataEntrega = formatDateLocal(deliveryData.date);
          console.log('🔍 [DEBUG] Entrega temporária - data formatada:', dataEntrega);
          
          const entregaExistente = deliveries.find(d => 
            typeof d.id === 'number' && 
            formatDateLocal(d.date) === dataEntrega
          );
          
          console.log('🔍 [DEBUG] Entrega existente encontrada:', entregaExistente);
          
          if (entregaExistente) {
            // Atualizar entrega existente no banco
            const dadosEntrega = {
              data_entrega: dataEntrega,
              tipo_entrega: deliveryData.type || 'manual',
              observacoes: deliveryData.notes || ''
            };

            const response = await EntregasService.atualizarEntrega(entregaExistente.id, dadosEntrega);
            
            if (response.success) {
              // Recarregar entregas do banco
              if (carregarEntregas) {
                await carregarEntregas();
              }
            }
          } else {
            // Entrega temporária - criar no banco com os novos dados
            console.log('🔍 [DEBUG] Criando nova entrega temporária - dataEntrega:', dataEntrega);
            
            const dadosEntrega = {
              data_entrega: dataEntrega,
              tipo_entrega: deliveryData.type || 'manual',
              observacoes: deliveryData.notes || ''
            };
            
            console.log('🔍 [DEBUG] dadosEntrega para criar temporária:', dadosEntrega);

            const response = await EntregasService.criarEntrega(agrupamentoId, dadosEntrega);
          
            if (response.success) {
              // Recarregar entregas do banco
              if (carregarEntregas) {
                await carregarEntregas();
              } else {
                // Fallback: atualizar apenas no estado local
          const updatedDeliveries = deliveries.map(delivery => {
            if (delivery.id === deliveryData.id) {
              const updatedDelivery = { 
                ...delivery,
                date: deliveryData.date
              };
              
              // Verificar se é feriado
              return FeriadosService.isFeriado(updatedDelivery.date).then(feriado => {
                if (feriado) {
                  updatedDelivery.status = 'conflict';
                  updatedDelivery.feriado = feriado;
                  updatedDelivery.dataAlternativa = getDataAlternativa(updatedDelivery.date);
                  updatedDelivery.conflicts = [{
                    date: updatedDelivery.date,
                    deliveries: [updatedDelivery],
                    type: 'holiday',
                    message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
                    feriado: feriado,
                    dataAlternativa: updatedDelivery.dataAlternativa
                  }];
                } else {
                  // Remover informações de feriado se não for mais feriado
                  delete updatedDelivery.feriado;
                  delete updatedDelivery.dataAlternativa;
                  updatedDelivery.conflicts = (updatedDelivery.conflicts || []).filter(c => c.type !== 'holiday');
                  
                  if (updatedDelivery.conflicts.length === 0) {
                    updatedDelivery.status = 'scheduled';
                  }
                }
                
                return updatedDelivery;
              });
            }
            return delivery;
          });

                // Aguardar todas as verificações de feriado
                const resolvedDeliveries = await Promise.all(updatedDeliveries);
                const deliveriesWithConflicts = detectConflicts(resolvedDeliveries);
                setDeliveries(deliveriesWithConflicts);
              }
            }
          }
        }
      }
      
      closeEditModal();
      return true;
    } catch (error) {
      console.error('Erro ao salvar entrega:', error);
      return false;
    }
  }, [deliveries, setDeliveries, closeEditModal, getDataAlternativa, detectConflicts, agrupamentoId, carregarEntregas]);

  // Excluir entrega
  const deleteDelivery = useCallback(async (deliveryId) => {
    
    try {
      // Verificar se é uma entrega do banco (ID numérico) ou temporária (ID string)
      const isDatabaseDelivery = typeof deliveryId === 'number' || !deliveryId.toString().startsWith('delivery_');
      if (isDatabaseDelivery) {
        const response = await EntregasService.excluirEntrega(deliveryId);
        
        if (response.success) {
          // Recarregar entregas do banco
          if (carregarEntregas) {
            await carregarEntregas();
          } else {
            const updatedDeliveries = deliveries.filter(d => d.id !== deliveryId);
            setDeliveries(updatedDeliveries);
          }
        }
      } else {
        // Entrega automática - salvar exclusão no banco
        console.log('🔍 [DEBUG] Excluindo entrega automática - salvando exclusão no banco');
        
        // Extrair data da entrega para salvar a exclusão
        const entregaParaExcluir = deliveries.find(d => d.id === deliveryId);
        if (entregaParaExcluir) {
          const dataFormatada = formatDateLocal(entregaParaExcluir.date);
          
          // Criar registro de exclusão no banco
          const dadosExclusao = {
            data_entrega: dataFormatada,
            tipo_entrega: 'excluida',
            observacoes: 'Entrega automática excluída pelo usuário'
          };
          
          try {
            const response = await EntregasService.criarEntrega(agrupamentoId, dadosExclusao);
            if (response.success) {
              console.log('✅ Exclusão salva no banco');
              // Recarregar entregas do banco
              if (carregarEntregas) {
                await carregarEntregas();
              }
            }
          } catch (error) {
            console.error('Erro ao salvar exclusão no banco:', error);
            // Fallback: remover apenas do estado local
            const updatedDeliveries = deliveries.filter(d => d.id !== deliveryId);
            setDeliveries(updatedDeliveries);
          }
        }
      }
      
      // Modal permanece aberto após exclusão
    } catch (error) {
      console.error('Erro ao excluir entrega:', error);
    }
  }, [deliveries, setDeliveries, carregarEntregas]);

  // Mover entrega (drag & drop)
  const moveDelivery = useCallback(async (deliveryId, newDate) => {
    const updatedDeliveries = deliveries.map(delivery => {
      if (delivery.id === deliveryId) {
        const updatedDelivery = {
          ...delivery,
          date: newDate
        };
        
        // Verificar se nova data é feriado
        return FeriadosService.isFeriado(newDate).then(feriado => {
          if (feriado) {
            updatedDelivery.status = 'conflict';
            updatedDelivery.feriado = feriado;
            updatedDelivery.dataAlternativa = getDataAlternativa(newDate);
            updatedDelivery.conflicts = [{
              date: newDate,
              deliveries: [updatedDelivery],
              type: 'holiday',
              message: `⚠️ Feriado: ${feriado.name} - Verificar se entrega será realizada`,
              feriado: feriado,
              dataAlternativa: updatedDelivery.dataAlternativa
            }];
          } else {
            // Remover informações de feriado
            delete updatedDelivery.feriado;
            delete updatedDelivery.dataAlternativa;
            updatedDelivery.conflicts = updatedDelivery.conflicts.filter(c => c.type !== 'holiday');
            
            if (updatedDelivery.conflicts.length === 0) {
              updatedDelivery.status = 'scheduled';
            }
          }
          
          return updatedDelivery;
        });
      }
      return delivery;
    });
    
    // Aguardar todas as verificações de feriado
    const resolvedDeliveries = await Promise.all(updatedDeliveries);
    const deliveriesWithConflicts = detectConflicts(resolvedDeliveries);
    setDeliveries(deliveriesWithConflicts);
  }, [deliveries, setDeliveries]);

  // Handlers para drag & drop
  const handleDragStart = useCallback((delivery) => {
    setDraggedDelivery(delivery);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedDelivery(null);
  }, []);

  const handleDrop = useCallback((date) => {
    if (draggedDelivery) {
      moveDelivery(draggedDelivery.id, date);
    }
  }, [draggedDelivery, moveDelivery]);

  return {
    // Estados
    editingDelivery,
    editModalOpen,
    draggedDelivery,
    
    // Ações
    openEditModal,
    closeEditModal,
    saveDelivery,
    deleteDelivery,
    moveDelivery,
    
    // Drag & Drop
    handleDragStart,
    handleDragEnd,
    handleDrop
  };
};
