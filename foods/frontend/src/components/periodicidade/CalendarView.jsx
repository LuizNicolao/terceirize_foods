import React from 'react';
import { FaTruck, FaExclamationTriangle, FaCheckCircle, FaClock, FaFlag } from 'react-icons/fa';

const CalendarView = ({ 
  month, 
  deliveries, 
  feriados = [], 
  isViewMode = false,
  onEditDelivery = null,
  onAddDelivery = null,
  onDragStart = null,
  onDragEnd = null,
  onDrop = null,
  draggedDelivery = null
}) => {
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(month.getFullYear(), month.getMonth(), 1).getDay();
  const monthName = month.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Função para obter entregas de um dia específico
  const getDeliveriesForDay = (day) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    const dayDeliveries = deliveries.filter(delivery => 
      delivery.date.getDate() === day && 
      delivery.date.getMonth() === month.getMonth() &&
      delivery.date.getFullYear() === month.getFullYear()
    );
    
    
    return dayDeliveries;
  };

  // Função para verificar se um dia é feriado
  const isFeriado = (day) => {
    const date = new Date(month.getFullYear(), month.getMonth(), day);
    return feriados.find(feriado => 
      feriado.date.getDate() === day && 
      feriado.date.getMonth() === month.getMonth() &&
      feriado.date.getFullYear() === month.getFullYear()
    );
  };

  // Função para obter o ícone e cor baseado no status da entrega
  const getDeliveryIcon = (delivery) => {
    switch (delivery.status) {
      case 'conflict':
        // Se é conflito por feriado, usar ícone de bandeira
        if (delivery.feriado) {
          return { icon: FaFlag, color: 'text-orange-600', bg: 'bg-orange-100' };
        }
        return { icon: FaExclamationTriangle, color: 'text-red-600', bg: 'bg-red-100' };
      case 'scheduled':
        return { icon: FaCheckCircle, color: 'text-green-600', bg: 'bg-green-100' };
      case 'pending':
        return { icon: FaClock, color: 'text-yellow-600', bg: 'bg-yellow-100' };
      default:
        return { icon: FaTruck, color: 'text-blue-600', bg: 'bg-blue-100' };
    }
  };

  // Função para obter o tipo de entrega abreviado
  const getDeliveryTypeAbbr = (type) => {
    switch (type) {
      case 'semanal': return 'Sem';
      case 'quinzenal': return 'Quin';
      case 'mensal': return 'Men';
      default: return 'Ent';
    }
  };

  // Renderizar células vazias para o início do mês
  const renderEmptyCells = () => {
    const cells = [];
    for (let i = 0; i < firstDayOfMonth; i++) {
      cells.push(
        <div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>
      );
    }
    return cells;
  };

  // Renderizar um dia do calendário
  const renderDay = (day) => {
    const dayDeliveries = getDeliveriesForDay(day);
    const feriado = isFeriado(day);
    const isToday = new Date().toDateString() === new Date(month.getFullYear(), month.getMonth(), day).toDateString();
    const dayDate = new Date(month.getFullYear(), month.getMonth(), day);
    
    // Handlers para interação
    const handleDayDoubleClick = () => {
      if (!isViewMode && onAddDelivery) {
        onAddDelivery(dayDate);
      }
    };

    const handleDayDrop = (e) => {
      e.preventDefault();
      if (!isViewMode && onDrop) {
        onDrop(dayDate);
      }
    };

    const handleDayDragOver = (e) => {
      e.preventDefault();
    };
    
    return (
      <div 
        key={day} 
        className={`h-24 border border-gray-200 p-1 ${
          isToday ? 'bg-blue-50 border-blue-300' : 
          feriado ? 'bg-orange-50 border-orange-200' : 'bg-white'
        } hover:bg-gray-50 transition-colors ${
          !isViewMode ? 'cursor-pointer' : ''
        }`}
        onDoubleClick={handleDayDoubleClick}
        onDrop={handleDayDrop}
        onDragOver={handleDayDragOver}
      >
        <div className="flex justify-between items-start mb-1">
          <span className={`text-sm font-medium ${
            isToday ? 'text-blue-600' : 
            feriado ? 'text-orange-600' : 'text-gray-900'
          }`}>
            {day}
          </span>
          <div className="flex flex-col gap-1">
            {isToday && (
              <span className="text-xs bg-blue-600 text-white px-1.5 py-0.5 rounded-full">
                Hoje
              </span>
            )}
            {feriado && (
              <span className="text-xs bg-orange-600 text-white px-1.5 py-0.5 rounded-full">
                🏴
              </span>
            )}
          </div>
        </div>
        
        <div className="space-y-1">
          {feriado && (
            <div className="text-xs text-orange-600 font-medium truncate" title={feriado.name}>
              {feriado.name}
            </div>
          )}
          {dayDeliveries.map((delivery, index) => {
            const { icon: Icon, color, bg } = getDeliveryIcon(delivery);
            const isDragging = draggedDelivery?.id === delivery.id;
            
            // Handlers para entrega
            const handleDeliveryDoubleClick = (e) => {
              e.stopPropagation();
              if (!isViewMode && onEditDelivery) {
                onEditDelivery(delivery);
              }
            };

            const handleDeliveryDragStart = (e) => {
              if (!isViewMode && onDragStart) {
                onDragStart(delivery);
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/html', e.target.outerHTML);
              }
            };

            const handleDeliveryDragEnd = (e) => {
              if (!isViewMode && onDragEnd) {
                onDragEnd();
              }
            };
            
            return (
              <div
                key={`${day}-${index}`}
                className={`flex items-center text-xs ${bg} ${color} px-1 py-0.5 rounded ${
                  !isViewMode ? 'cursor-pointer hover:opacity-80' : ''
                } transition-opacity ${
                  isDragging ? 'opacity-50' : ''
                }`}
                title={`${getDeliveryTypeAbbr(delivery.type)} - ${delivery.schools} escolas - ${delivery.products} produtos${!isViewMode ? ' (Duplo clique para editar)' : ''}`}
                onDoubleClick={handleDeliveryDoubleClick}
                draggable={!isViewMode}
                onDragStart={handleDeliveryDragStart}
                onDragEnd={handleDeliveryDragEnd}
              >
                <Icon className="h-2 w-2 mr-1" />
                <span className="truncate">
                  {getDeliveryTypeAbbr(delivery.type)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header do Calendário */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-800 capitalize">
          {monthName}
        </h3>
      </div>

      {/* Dias da Semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map(day => (
          <div key={day} className="px-3 py-2 text-center text-sm font-medium text-gray-500 bg-gray-50 border-r border-gray-200 last:border-r-0">
            {day}
          </div>
        ))}
      </div>

      {/* Grid do Calendário */}
      <div className="grid grid-cols-7">
        {renderEmptyCells()}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => renderDay(day))}
      </div>

      {/* Legenda */}
      <div className="bg-gray-50 px-4 py-3 border-t border-gray-200">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <span className="text-gray-600 font-medium">Legenda:</span>
          
          <div className="flex items-center">
            <FaCheckCircle className="h-3 w-3 text-green-600 mr-1" />
            <span className="text-gray-600">Programada</span>
          </div>
          
          <div className="flex items-center">
            <FaFlag className="h-3 w-3 text-orange-600 mr-1" />
            <span className="text-gray-600">Feriado (Conflito)</span>
          </div>
          
          <div className="flex items-center">
            <FaExclamationTriangle className="h-3 w-3 text-red-600 mr-1" />
            <span className="text-gray-600">Conflito</span>
          </div>
          
          <div className="flex items-center">
            <FaClock className="h-3 w-3 text-yellow-600 mr-1" />
            <span className="text-gray-600">Pendente</span>
          </div>
          
          <div className="flex items-center">
            <FaTruck className="h-3 w-3 text-blue-600 mr-1" />
            <span className="text-gray-600">Entrega</span>
          </div>
        </div>
        
        {/* Dicas de Edição */}
        {!isViewMode && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-xs text-gray-500">
              <span className="font-medium">Dicas:</span> Duplo clique na data para adicionar entrega • Duplo clique na entrega para editar • Arraste para mover
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CalendarView;
