import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { SidebarHeader as StyledHeader, Logo, ToggleButton } from './styles';

const SidebarHeader = ({ collapsed, onToggle }) => {
  return (
    <StyledHeader>
      <Logo $collapsed={collapsed}>Foods</Logo>
      <ToggleButton onClick={onToggle}>
        {collapsed ? <FaChevronRight size={12} /> : <FaChevronLeft size={12} />}
      </ToggleButton>
    </StyledHeader>
  );
};

export default SidebarHeader;
