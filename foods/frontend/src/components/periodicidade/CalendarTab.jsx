import React, { useState } from 'react';
import CalendarView from './CalendarView';
import DeliverySchedule from './DeliverySchedule';
import DeliveryEditModal from './components/DeliveryEditModal';
import { CalendarHeader, CalendarStats, CalendarNavigation, CalendarActions } from './components';
import { useCalendar, useDeliverySchedule, useDeliveryEdit } from '../../hooks/periodicidade';

const CalendarTab = ({
  agrupamentoData,
  isViewMode = false
}) => {
  // Estados para controle da interface
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'list'
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const [selectedFilial, setSelectedFilial] = useState('all');
  
  // Hooks customizados
  const {
    deliveries,
    setDeliveries,
    loading,
    feriados,
    statistics,
    loadFeriadosAndGenerateSchedule,
    carregarEntregas
  } = useCalendar(agrupamentoData, selectedMonth);
  
  const {
    exporting,
    generatingReport,
    handleExportCalendar,
    handleGenerateReport
  } = useDeliverySchedule();

  // Hook para edição de entregas
  const {
    editingDelivery,
    editModalOpen,
    draggedDelivery,
    openEditModal,
    closeEditModal,
    saveDelivery,
    deleteDelivery,
    handleDragStart,
    handleDragEnd,
    handleDrop
  } = useDeliveryEdit(deliveries, setDeliveries, agrupamentoData?.id, carregarEntregas);

  // Handlers para ações
  const handleMonthChange = (direction) => {
    const newMonth = new Date(selectedMonth);
    if (direction === 'prev') {
      newMonth.setMonth(newMonth.getMonth() - 1);
    } else {
      newMonth.setMonth(newMonth.getMonth() + 1);
    }
    setSelectedMonth(newMonth);
  };

  const handleExportCalendarWrapper = () => {
    handleExportCalendar(deliveries, agrupamentoData, selectedMonth);
  };

  const handleGenerateReportWrapper = () => {
    handleGenerateReport(deliveries, agrupamentoData, selectedMonth, statistics);
  };


  return (
    <div className="space-y-4">
      {/* Header com Configurações */}
      <CalendarHeader
        viewMode={viewMode}
        setViewMode={setViewMode}
        selectedFilial={selectedFilial}
        setSelectedFilial={setSelectedFilial}
        loading={loading}
        onRefresh={loadFeriadosAndGenerateSchedule}
        isViewMode={isViewMode}
      />

      {/* Estatísticas */}
      <CalendarStats statistics={statistics} />

      {/* Navegação do Mês */}
      <CalendarNavigation
        selectedMonth={selectedMonth}
        onMonthChange={handleMonthChange}
        isViewMode={isViewMode}
      />

      {/* Conteúdo Principal */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Gerando cronograma de entregas...</p>
          </div>
        </div>
      ) : (
        <>
          {viewMode === 'month' && (
            <CalendarView
              month={selectedMonth}
              deliveries={deliveries}
              feriados={feriados}
              isViewMode={isViewMode}
              onEditDelivery={openEditModal}
              onAddDelivery={(date) => openEditModal(null, date)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDrop={handleDrop}
              draggedDelivery={draggedDelivery}
            />
          )}
          
          {viewMode === 'list' && (
            <DeliverySchedule
              deliveries={deliveries}
              isViewMode={isViewMode}
            />
          )}
        </>
      )}

      {/* Ações */}
      <CalendarActions
        isViewMode={isViewMode}
        exporting={exporting}
        generatingReport={generatingReport}
        loading={loading}
        onExportCalendar={handleExportCalendarWrapper}
        onGenerateReport={handleGenerateReportWrapper}
      />

      {/* Modal de Edição de Entrega */}
      <DeliveryEditModal
        isOpen={editModalOpen}
        onClose={closeEditModal}
        delivery={editingDelivery}
        onSave={saveDelivery}
        onDelete={deleteDelivery}
        agrupamentoData={agrupamentoData}
      />
    </div>
  );
};

export default CalendarTab;
