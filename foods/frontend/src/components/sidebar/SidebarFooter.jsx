import React from 'react';
import { FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { 
  SidebarFooter as StyledFooter, 
  UserInfo, 
  UserAvatar, 
  UserDetails, 
  UserName, 
  UserRole, 
  LogoutButton 
} from './styles';

const SidebarFooter = ({ collapsed }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <StyledFooter>
      <UserInfo $collapsed={collapsed}>
        <UserAvatar $collapsed={collapsed}>
          {getUserInitials(user?.nome)}
        </UserAvatar>
        <UserDetails>
          <UserName>{user?.nome || 'Usuário'}</UserName>
          <UserRole>{user?.cargo || 'Cargo não definido'}</UserRole>
        </UserDetails>
      </UserInfo>
      
      <LogoutButton 
        onClick={handleLogout}
        $collapsed={collapsed}
      >
        <FaSignOutAlt className="icon" />
        <span className="text">Sair</span>
      </LogoutButton>
    </StyledFooter>
  );
};

export default SidebarFooter;
