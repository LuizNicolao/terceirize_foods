import React from 'react';
import styled from 'styled-components';
import { FaUser, FaBell } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';

const HeaderContainer = styled.header`
  background: var(--white);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 16px 24px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const Title = styled.h1`
  color: var(--primary-green);
  font-size: 24px;
  font-weight: 700;
  margin: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  font-size: 18px;
  color: var(--dark-gray);
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
  position: relative;

  &:hover {
    background-color: var(--light-gray);
    color: var(--primary-green);
  }
`;

const NotificationBadge = styled.span`
  position: absolute;
  top: 4px;
  right: 4px;
  background: var(--error-red);
  color: white;
  border-radius: 50%;
  width: 16px;
  height: 16px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const UserInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 6px;
  background-color: var(--light-gray);
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: var(--light-green);
  }
`;

const UserName = styled.span`
  font-weight: 600;
  color: var(--dark-gray);
  font-size: 14px;
`;

const UserRole = styled.span`
  color: var(--gray);
  font-size: 12px;
`;

const Header = ({ onToggleSidebar }) => {
  const { user } = useAuth();

  const getUserDisplayName = () => {
    if (!user) return '';
    return user.nome.split(' ')[0];
  };

  const getUserRole = () => {
    if (!user) return '';
    const roles = {
      'administrador': 'Administrador',
      'coordenador': 'Coordenador',
      'administrativo': 'Administrativo',
      'gerente': 'Gerente',
      'supervisor': 'Supervisor'
    };
    return roles[user.tipo_de_acesso] || user.tipo_de_acesso;
  };

  return (
    <HeaderContainer>
      <LeftSection>
        <Title>CILS - Gestão de Supply Chain</Title>
      </LeftSection>

      <RightSection>
        <IconButton>
          <FaBell />
          <NotificationBadge>3</NotificationBadge>
        </IconButton>
        
        <UserInfo>
          <FaUser />
          <div>
            <UserName>{getUserDisplayName()}</UserName>
            <UserRole>{getUserRole()}</UserRole>
          </div>
        </UserInfo>
      </RightSection>
    </HeaderContainer>
  );
};

export default Header; 