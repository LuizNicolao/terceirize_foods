import styled from 'styled-components';

export const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100vh;
  background: var(--white);
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  z-index: 1000;
  width: ${props => props.$collapsed ? '60px' : '250px'};
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: ${props => props.$collapsed ? '0' : '250px'};
    transform: ${props => props.$collapsed ? 'translateX(-100%)' : 'translateX(0)'};
  }
`;

export const SidebarHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  text-align: center;
  position: relative;
  flex-shrink: 0;
`;

export const Logo = styled.h2`
  color: var(--primary-green);
  font-size: ${props => props.$collapsed ? '16px' : '24px'};
  font-weight: 700;
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const ToggleButton = styled.button`
  position: absolute;
  right: -12px;
  top: 50%;
  transform: translateY(-50%);
  background: var(--primary-green);
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 1001;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

  &:hover {
    background: var(--dark-green);
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    right: -15px;
    width: 30px;
    height: 30px;
  }
`;

export const SidebarMenu = styled.nav`
  flex: 1;
  overflow-y: auto;
  padding: 10px 0;
`;

export const SidebarItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 20px;
  color: var(--text-color);
  text-decoration: none;
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;

  &:hover {
    background: var(--hover-bg);
    color: var(--primary-green);
  }

  &.active {
    background: var(--active-bg);
    color: var(--primary-green);
    border-right: 3px solid var(--primary-green);
  }

  .icon {
    width: 20px;
    height: 20px;
    margin-right: ${props => props.$collapsed ? '0' : '12px'};
    flex-shrink: 0;
  }

  .label {
    font-size: 14px;
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    opacity: ${props => props.$collapsed ? '0' : '1'};
    transition: opacity 0.3s ease;
  }

  @media (max-width: 768px) {
    padding: 15px 20px;
    
    .label {
      opacity: 1;
    }
  }
`;

export const SidebarFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  flex-shrink: 0;
`;

export const UserInfo = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  opacity: ${props => props.$collapsed ? '0' : '1'};
  transition: opacity 0.3s ease;

  @media (max-width: 768px) {
    opacity: 1;
  }
`;

export const UserAvatar = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--primary-green);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: bold;
  margin-right: ${props => props.$collapsed ? '0' : '10px'};
  flex-shrink: 0;
`;

export const UserDetails = styled.div`
  flex: 1;
  min-width: 0;
`;

export const UserName = styled.div`
  font-weight: 600;
  font-size: 14px;
  color: var(--text-color);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const UserRole = styled.div`
  font-size: 12px;
  color: var(--text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const LogoutButton = styled.button`
  width: 100%;
  padding: 10px;
  background: var(--danger-color);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover {
    background: var(--danger-hover);
  }

  .icon {
    width: 16px;
    height: 16px;
  }

  .text {
    opacity: ${props => props.$collapsed ? '0' : '1'};
    transition: opacity 0.3s ease;
  }

  @media (max-width: 768px) {
    .text {
      opacity: 1;
    }
  }
`;
