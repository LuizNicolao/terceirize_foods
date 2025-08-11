/**
 * DESIGN SYSTEM - SISTEMA DE COTAÇÃO
 * 
 * Este arquivo contém todos os padrões de design utilizados no projeto
 * baseado no guia de estilo do Sistema Foods.
 */

// Importar CSS global
import './global.css';

// ============================================================================
// PALETA DE CORES
// ============================================================================

export const colors = {
  // Cores Principais - Tons mais suaves
  primary: {
    green: '#66BB6A',        // Verde mais suave
    darkGreen: '#43A047',    // Verde escuro mais suave
    lightGreen: '#A5D6A7'    // Verde claro mais suave
  },
  
  // Cores Neutras
  neutral: {
    white: '#FFFFFF',
    lightGray: '#f5f5f5',
    gray: '#757575',
    darkGray: '#424242'
  },
  
  // Cores Secundárias - Tons mais suaves
  secondary: {
    blue: '#42A5F5',         // Azul mais suave
    orange: '#FFB74D'        // Laranja mais suave
  },
  
  // Cores de Status - Tons mais suaves
  status: {
    error: '#EF5350',        // Vermelho mais suave
    success: '#66BB6A',      // Verde mais suave
    warning: '#FFB74D'       // Laranja mais suave
  },
  
  // Cores de Hover - Tons mais suaves
  hover: {
    primary: '#43A047',      // Verde hover mais suave
    secondary: '#1E88E5',    // Azul hover mais suave
    danger: '#E53935'        // Vermelho hover mais suave
  }
};

// ============================================================================
// TIPOGRAFIA
// ============================================================================

export const typography = {
  // Família de fontes
  fontFamily: {
    primary: `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
      'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif`
  },
  
  // Tamanhos de fonte
  fontSize: {
    xs: '10px',
    sm: '12px',
    base: '14px',
    lg: '16px',
    xl: '18px',
    '2xl': '24px',
    '3xl': '28px',
    '4xl': '32px'
  },
  
  // Pesos de fonte
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Altura da linha
  lineHeight: {
    tight: 1.2,
    normal: 1.4,
    relaxed: 1.6
  }
};

// ============================================================================
// ESPAÇAMENTOS
// ============================================================================

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  '4xl': '40px'
};

// ============================================================================
// BORDAS E RAIO
// ============================================================================

export const borders = {
  radius: {
    sm: '4px',
    md: '6px',
    lg: '8px',
    xl: '12px',
    full: '50%'
  },
  
  width: {
    thin: '1px',
    normal: '2px',
    thick: '3px'
  }
};

// ============================================================================
// SOMBRAS
// ============================================================================

export const shadows = {
  sm: '0 2px 4px rgba(0, 0, 0, 0.1)',
  md: '0 2px 8px rgba(0, 0, 0, 0.1)',
  lg: '0 4px 16px rgba(0, 0, 0, 0.15)',
  xl: '0 8px 24px rgba(0, 0, 0, 0.15)',
  login: '0 8px 32px rgba(0, 114, 62, 0.2)',
  sidebar: '2px 0 8px rgba(0, 0, 0, 0.1)'
};

// ============================================================================
// ANIMAÇÕES E TRANSITIONS
// ============================================================================

export const animations = {
  duration: {
    fast: '0.2s',
    normal: '0.3s',
    slow: '0.6s'
  },
  
  easing: 'ease',
  
  keyframes: {
    fadeInUp: `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(30px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `
  }
};

// ============================================================================
// LAYOUT E GRID
// ============================================================================

export const layout = {
  // Sidebar
  sidebar: {
    width: {
      expanded: '250px',
      collapsed: '60px'
    },
    mobile: {
      width: '250px',
      transform: 'translateX(-100%)'
    }
  },
  
  // Header
  header: {
    height: 'auto',
    padding: '16px 24px'
  },
  
  // Main content
  mainContent: {
    padding: '20px',
    marginLeft: {
      expanded: '250px',
      collapsed: '60px'
    }
  },
  
  // Breakpoints
  breakpoints: {
    mobile: '768px',
    tablet: '1024px',
    desktop: '1920px'
  }
};

// ============================================================================
// COMPONENTES - BOTÕES
// ============================================================================

export const buttonStyles = {
  base: {
    padding: '12px 20px',
    borderRadius: '6px',
    fontSize: '14px',
    fontWeight: 600,
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px'
  },
  
  variants: {
    primary: {
      background: colors.primary.green,
      color: colors.neutral.white,
      '&:hover': {
        background: colors.hover.primary,
        transform: 'translateY(-1px)'
      }
    },
    
    secondary: {
      background: colors.secondary.blue,
      color: colors.neutral.white,
      '&:hover': {
        background: colors.hover.secondary,
        transform: 'translateY(-1px)'
      }
    },
    
    danger: {
      background: colors.status.error,
      color: colors.neutral.white,
      '&:hover': {
        background: colors.hover.danger,
        transform: 'translateY(-1px)'
      }
    },
    
    outline: {
      background: 'transparent',
      color: colors.primary.green,
      border: `2px solid ${colors.primary.green}`,
      '&:hover': {
        background: colors.primary.green,
        color: colors.neutral.white
      }
    }
  },
  
  sizes: {
    sm: {
      padding: '8px 16px',
      fontSize: '12px'
    },
    md: {
      padding: '12px 20px',
      fontSize: '14px'
    },
    lg: {
      padding: '14px 24px',
      fontSize: '16px'
    }
  }
};

// ============================================================================
// COMPONENTES - INPUTS
// ============================================================================

export const inputStyles = {
  base: {
    padding: '12px 16px',
    border: `2px solid #e0e0e0`,
    borderRadius: '8px',
    fontSize: '16px',
    transition: 'all 0.3s ease',
    background: colors.neutral.white,
    width: '100%',
    '&:focus': {
      borderColor: colors.primary.green,
      boxShadow: '0 0 0 3px rgba(0, 114, 62, 0.1)',
      outline: 'none'
    },
    '&::placeholder': {
      color: colors.neutral.gray
    }
  },
  
  withIcon: {
    paddingLeft: '48px'
  },
  
  error: {
    borderColor: colors.status.error,
    '&:focus': {
      borderColor: colors.status.error,
      boxShadow: '0 0 0 3px rgba(244, 67, 54, 0.1)'
    }
  }
};

// ============================================================================
// COMPONENTES - CARDS
// ============================================================================

export const cardStyles = {
  base: {
    background: colors.neutral.white,
    borderRadius: '8px',
    boxShadow: shadows.md,
    padding: '20px',
    transition: 'all 0.3s ease'
  },
  
  hover: {
    transform: 'translateY(-2px)',
    boxShadow: shadows.lg
  },
  
  dashboard: {
    borderRadius: '12px',
    padding: '24px'
  }
};

// ============================================================================
// COMPONENTES - TABELAS
// ============================================================================

export const tableStyles = {
  container: {
    width: '100%',
    borderCollapse: 'collapse',
    background: colors.neutral.white,
    borderRadius: '8px',
    overflow: 'hidden',
    boxShadow: shadows.md
  },
  
  header: {
    background: colors.neutral.lightGray,
    padding: '15px 12px',
    textAlign: 'left',
    fontWeight: 600,
    color: colors.neutral.darkGray,
    fontSize: '14px',
    borderBottom: '1px solid #e0e0e0'
  },
  
  cell: {
    padding: '12px',
    borderBottom: '1px solid #f0f0f0',
    fontSize: '14px',
    color: colors.neutral.darkGray
  }
};

// ============================================================================
// COMPONENTES - FORMULÁRIOS
// ============================================================================

export const formStyles = {
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '16px'
  },
  
  label: {
    color: colors.neutral.darkGray,
    fontWeight: 600,
    fontSize: '14px'
  },
  
  error: {
    color: colors.status.error,
    fontSize: '14px',
    margin: '0'
  }
};

// ============================================================================
// COMPONENTES - MODAIS
// ============================================================================

export const modalStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 1000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  
  content: {
    background: colors.neutral.white,
    borderRadius: '12px',
    padding: '24px',
    maxWidth: '500px',
    width: '90%',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: shadows.xl
  }
};

// ============================================================================
// COMPONENTES - SIDEBAR
// ============================================================================

export const sidebarStyles = {
  container: {
    position: 'fixed',
    left: 0,
    top: 0,
    height: '100vh',
    background: colors.neutral.white,
    boxShadow: shadows.sidebar,
    transition: 'all 0.3s ease',
    zIndex: 1000
  },
  
  navItem: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 20px',
    color: colors.neutral.darkGray,
    textDecoration: 'none',
    transition: 'all 0.3s ease',
    borderLeft: '3px solid transparent',
    '&:hover': {
      backgroundColor: colors.neutral.lightGray,
      color: colors.primary.green,
      borderLeftColor: colors.primary.green
    },
    '&.active': {
      backgroundColor: colors.primary.lightGreen,
      color: colors.primary.green,
      borderLeftColor: colors.primary.green
    }
  }
};

// ============================================================================
// COMPONENTES - HEADER
// ============================================================================

export const headerStyles = {
  container: {
    background: colors.neutral.white,
    boxShadow: shadows.md,
    padding: '16px 24px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  
  title: {
    color: colors.primary.green,
    fontSize: '24px',
    fontWeight: 700,
    margin: 0
  }
};

// ============================================================================
// COMPONENTES - LOGIN
// ============================================================================

export const loginStyles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    background: `linear-gradient(135deg, ${colors.primary.green} 0%, ${colors.primary.darkGreen} 100%)`
  },
  
  card: {
    background: colors.neutral.white,
    borderRadius: '12px',
    boxShadow: shadows.login,
    padding: '40px',
    width: '100%',
    maxWidth: '400px',
    animation: 'fadeInUp 0.6s ease-out'
  }
};

// ============================================================================
// UTILITÁRIOS CSS
// ============================================================================

export const utilities = {
  // Text alignment
  textCenter: { textAlign: 'center' },
  textRight: { textAlign: 'right' },
  textLeft: { textAlign: 'left' },
  
  // Margins
  mb1: { marginBottom: spacing.sm },
  mb2: { marginBottom: spacing.lg },
  mb3: { marginBottom: spacing['2xl'] },
  mt1: { marginTop: spacing.sm },
  mt2: { marginTop: spacing.lg },
  mt3: { marginTop: spacing['2xl'] },
  
  // Paddings
  p1: { padding: spacing.sm },
  p2: { padding: spacing.lg },
  p3: { padding: spacing['2xl'] },
  
  // Flexbox
  dFlex: { display: 'flex' },
  justifyBetween: { justifyContent: 'space-between' },
  alignCenter: { alignItems: 'center' },
  
  // Gaps
  gap1: { gap: spacing.sm },
  gap2: { gap: spacing.lg },
  gap3: { gap: spacing['2xl'] }
};

// ============================================================================
// CONFIGURAÇÃO DE RESPONSIVIDADE
// ============================================================================

export const responsive = {
  mobile: {
    maxWidth: '768px',
    sidebar: {
      width: '0',
      transform: 'translateX(-100%)'
    },
    mainContent: {
      marginLeft: '0'
    }
  },
  
  tablet: {
    maxWidth: '1024px',
    mainContent: {
      marginLeft: '200px'
    }
  },
  
  desktop: {
    minWidth: '1920px',
    mainContent: {
      marginLeft: '280px'
    }
  }
};

// ============================================================================
// CONFIGURAÇÃO DE TEMA GLOBAL
// ============================================================================

export const theme = {
  colors,
  typography,
  spacing,
  borders,
  shadows,
  animations,
  layout,
  buttonStyles,
  inputStyles,
  cardStyles,
  tableStyles,
  formStyles,
  modalStyles,
  sidebarStyles,
  headerStyles,
  loginStyles,
  utilities,
  responsive
};

export default theme; 