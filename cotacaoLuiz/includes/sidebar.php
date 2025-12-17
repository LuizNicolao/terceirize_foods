<?php
// Verificar se a sessão está ativa antes de qualquer saída
if (!isset($_SESSION['usuario'])) {
    return;
}
?>

<div class="sidebar" id="sidebar">
    <div class="sidebar-header">
        <div class="logo">
            <h2>Sistema de Cotações</h2>
        </div>
        <button id="sidebar-toggle" class="sidebar-toggle">
            <i class="fas fa-chevron-left"></i>
        </button>
    </div>
    <nav>
        <ul>
            <?php
            // Verificar o tipo de usuário
            $usuario_tipo = strtolower($_SESSION['usuario']['tipo'] ?? '');
            ?>
            
            <?php if (userCan('dashboard', 'visualizar')): ?>
            <li>
                <a href="dashboard.php">
                    <i class="fas fa-tachometer-alt"></i> <span class="menu-text">Dashboard</span>
                </a>
            </li>
            <?php endif; ?>
            
            <?php if (userCan('cotacoes', 'visualizar')): ?>
            <li>
                <a href="cotacoes.php">
                    <i class="fas fa-file-invoice-dollar"></i> <span class="menu-text">Cotações</span>
                </a>
            </li>
            <?php endif; ?>
            
            <?php if (userCan('aprovacoes', 'visualizar')): ?>
            <li>
                <a href="aprovacoes.php">
                    <i class="fas fa-check-circle"></i> <span class="menu-text">Aprovações</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if (userCan('aprovacoes_supervisor', 'visualizar')): ?>
            <li>
                <a href="aprovacoes_supervisor.php">
                    <i class="fas fa-check-circle"></i> <span class="menu-text">Aprovações Supervisor</span>
                </a>
            </li>
            <?php endif; ?>

            <?php if ($_SESSION['usuario']['tipo'] === 'admin' || $_SESSION['usuario']['tipo'] === 'gerencia'): ?>
            <li class="nav-item">
                <a href="sawing.php" class="nav-link <?php echo $pagina_atual == 'sawing' ? 'active' : ''; ?>">
                    <i class="fas fa-chart-line"></i>
                    <span class="menu-text">Saving</span>
                </a>
            </li>
            <?php endif; ?>
            
            <?php if (userCan('usuarios', 'visualizar')): ?>
            <li>
                <a href="usuarios.php">
                    <i class="fas fa-users"></i> <span class="menu-text">Usuários</span>
                </a>
            </li>
            <?php endif; ?>
            
            <li>
                <a href="logout.php">
                    <i class="fas fa-sign-out-alt"></i> <span class="menu-text">Sair</span>
                </a>
            </li>
        </ul>
    </nav>
</div>

<script>
// Executar imediatamente para evitar flash
(function() {
    const sidebarState = localStorage.getItem('sidebarState');
    if (sidebarState === 'collapsed') {
        document.documentElement.classList.add('sidebar-collapsed');
    }
})();
</script>

<style>
html.sidebar-collapsed .sidebar {
    width: 60px;
}

html.sidebar-collapsed .main-content {
    margin-left: 60px;
}

.sidebar {
    width: 250px;
    transition: all 0.3s ease;
    background: #2c3e50;
    color: #fff;
    height: 100vh;
    position: fixed;
    left: 0;
    top: 0;
    z-index: 1000;
    overflow: hidden;
}

.sidebar-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem;
    border-bottom: 1px solid rgba(255,255,255,0.1);
    background: #2c3e50;
    position: relative;
}

.sidebar-toggle {
    background: none;
    border: none;
    color: #fff;
    cursor: pointer;
    padding: 0.5rem;
    transition: transform 0.3s ease;
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    z-index: 1001;
}

html.sidebar-collapsed .sidebar-toggle {
    transform: translateY(-50%) rotate(180deg);
}

html.sidebar-collapsed .menu-text {
    display: none;
}

html.sidebar-collapsed .logo h2 {
    display: none;
}

.sidebar nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
}

.sidebar nav ul li a {
    display: flex;
    align-items: center;
    padding: 1rem;
    color: #fff;
    text-decoration: none;
    transition: background 0.3s ease;
}

.sidebar nav ul li a:hover {
    background: rgba(255,255,255,0.1);
}

.sidebar nav ul li a i {
    width: 20px;
    margin-right: 10px;
}

html.sidebar-collapsed nav ul li a i {
    margin-right: 0;
}

.main-content {
    margin-left: 250px;
    transition: margin-left 0.3s ease;
}
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    const sidebarToggle = document.getElementById('sidebar-toggle');
    
    sidebarToggle.addEventListener('click', function() {
        const isCollapsed = document.documentElement.classList.toggle('sidebar-collapsed');
        localStorage.setItem('sidebarState', isCollapsed ? 'collapsed' : 'expanded');
    });
});
</script>
