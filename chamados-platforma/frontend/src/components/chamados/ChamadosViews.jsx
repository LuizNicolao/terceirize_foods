import React from 'react';
import { FaList, FaUser, FaUserCheck, FaInbox, FaEye } from 'react-icons/fa';

const ChamadosViews = ({ currentView, onViewChange, userType, canViewAll }) => {
  const views = [];

  // View "Meus Chamados" - disponível para todos
  views.push({
    id: 'meus',
    label: 'Meus Chamados',
    icon: FaUser,
    description: userType === 'usuario' ? 'Chamados criados por mim' : 'Chamados atribuídos a mim'
  });

  // View "Atribuídos" - para técnicos e supervisores (não para usuário comum)
  if (userType !== 'usuario') {
    views.push({
      id: 'atribuidos',
      label: 'Atribuídos a Mim',
      icon: FaUserCheck,
      description: 'Chamados onde sou responsável'
    });
  }

  // View "Sem Responsável" - para técnicos e supervisores
  if (userType === 'tecnico' || userType === 'supervisor' || userType === 'administrador') {
    views.push({
      id: 'sem_responsavel',
      label: 'Sem Responsável',
      icon: FaInbox,
      description: 'Chamados abertos sem responsável'
    });
  }

  // View "Todos" - apenas para administradores ou com permissão especial
  if (userType === 'administrador' || canViewAll) {
    views.push({
      id: 'todos',
      label: 'Todos os Chamados',
      icon: FaEye,
      description: 'Visualizar todos os chamados'
    });
  }

  return (
    <div className="flex flex-wrap gap-2 mb-4 border-b border-gray-200 pb-2">
      {views.map((view) => {
        const Icon = view.icon;
        const isActive = currentView === view.id;
        
        return (
          <button
            key={view.id}
            onClick={() => onViewChange(view.id)}
            className={`
              flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${isActive
                ? 'bg-green-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
            title={view.description}
          >
            <Icon className="w-4 h-4" />
            <span className="hidden sm:inline">{view.label}</span>
            <span className="sm:hidden">{view.label.split(' ')[0]}</span>
          </button>
        );
      })}
    </div>
  );
};

export default ChamadosViews;

