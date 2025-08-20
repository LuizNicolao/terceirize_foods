import React from 'react';
import { FaEye, FaEdit, FaTrash } from 'react-icons/fa';
import PermissionGuard from '../../../components/PermissionGuard';

const UsuariosTable = ({ 
  usuarios, 
  onView, 
  onEdit, 
  onDelete, 
  getRoleLabel, 
  getStatusLabel,
  deletingUserId,
  searchTerm,
  statusFilter
}) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Nome</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Email</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Tipo</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '16px', textAlign: 'left', fontWeight: '600', color: '#374151', fontSize: '14px', borderBottom: '1px solid #e5e7eb' }}>Ações</th>
            </tr>
          </thead>
          <tbody>
            {usuarios.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ padding: '32px 16px' }}>
                  <div style={{ textAlign: 'center', color: '#6b7280', fontSize: '16px' }}>
                    {searchTerm || statusFilter !== 'todos' 
                      ? 'Nenhum usuário encontrado com os filtros aplicados'
                      : 'Nenhum usuário cadastrado'
                    }
                  </div>
                </td>
              </tr>
            ) : (
              usuarios.map((user) => (
                <tr key={user.id} style={{ transition: 'background-color 0.3s' }}
                    onMouseEnter={(e) => e.target.parentElement.style.backgroundColor = '#f9fafb'}
                    onMouseLeave={(e) => e.target.parentElement.style.backgroundColor = 'transparent'}>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', borderBottom: '1px solid #f3f4f6' }}>{user.name}</td>
                  <td style={{ padding: '16px', fontSize: '14px', color: '#1f2937', borderBottom: '1px solid #f3f4f6' }}>{user.email}</td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      backgroundColor: '#2563eb', 
                      color: 'white', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      borderRadius: '20px' 
                    }}>
                      {getRoleLabel(user.role)}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <span style={{ 
                      padding: '4px 12px', 
                      fontSize: '12px', 
                      fontWeight: '600', 
                      borderRadius: '20px',
                      backgroundColor: user.status === 'ativo' ? '#dcfce7' : '#fee2e2',
                      color: user.status === 'ativo' ? '#166534' : '#991b1b'
                    }}>
                      {getStatusLabel(user.status)}
                    </span>
                  </td>
                  <td style={{ padding: '16px', borderBottom: '1px solid #f3f4f6' }}>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        style={{
                          padding: '8px',
                          color: '#10b981',
                          backgroundColor: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                          transition: 'background-color 0.3s'
                        }}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#ecfdf5'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                        title="Visualizar"
                        onClick={() => onView(user)}
                      >
                        <FaEye />
                      </button>
                      <PermissionGuard screen="usuarios" action="can_edit">
                        <button
                          style={{
                            padding: '8px',
                            color: '#2563eb',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#eff6ff'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Editar"
                          onClick={() => onEdit(user)}
                        >
                          <FaEdit />
                        </button>
                      </PermissionGuard>
                      <PermissionGuard screen="usuarios" action="can_delete">
                        <button
                          style={{
                            padding: '8px',
                            color: deletingUserId === user.id ? '#9ca3af' : '#dc2626',
                            backgroundColor: 'transparent',
                            border: 'none',
                            cursor: deletingUserId === user.id ? 'not-allowed' : 'pointer',
                            borderRadius: '4px',
                            transition: 'background-color 0.3s',
                            opacity: deletingUserId === user.id ? 0.5 : 1
                          }}
                          onMouseEnter={(e) => {
                            if (deletingUserId !== user.id) {
                              e.target.style.backgroundColor = '#fef2f2';
                            }
                          }}
                          onMouseLeave={(e) => e.target.style.backgroundColor = 'transparent'}
                          title="Excluir"
                          onClick={() => onDelete(user.id)}
                          disabled={deletingUserId === user.id}
                        >
                          <FaTrash />
                        </button>
                      </PermissionGuard>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsuariosTable;
