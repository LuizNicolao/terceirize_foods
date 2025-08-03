import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:conect_foods_app/providers/auth_provider.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/screens/patrimonio_options_screen.dart';
import 'package:conect_foods_app/screens/contagem_options_screen.dart';
import 'package:conect_foods_app/screens/manutencao_options_screen.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Conect Foods'),
        actions: [
          Consumer<AuthProvider>(
            builder: (context, authProvider, child) {
              return PopupMenuButton<String>(
                icon: const Icon(Icons.account_circle),
                onSelected: (value) {
                  if (value == 'logout') {
                    _showLogoutDialog(context);
                  }
                },
                itemBuilder: (context) => [
                  PopupMenuItem(
                    value: 'user',
                    child: Text('Usuário: ${authProvider.userName ?? "N/A"}'),
                    enabled: false,
                  ),
                  const PopupMenuItem(
                    value: 'logout',
                    child: Row(
                      children: [
                        Icon(Icons.logout, color: AppColors.errorRed),
                        SizedBox(width: 8),
                        Text('Sair'),
                      ],
                    ),
                  ),
                ],
              );
            },
          ),
        ],
      ),
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [AppColors.lightGray, AppColors.white],
          ),
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.all(12),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // Header
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [AppColors.cardShadow],
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(12),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen.withOpacity(0.1),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Icon(
                          Icons.dashboard,
                          color: AppColors.primaryGreen,
                          size: 32,
                        ),
                      ),
                      const SizedBox(width: 16),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Módulos Disponíveis',
                              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                                color: AppColors.primaryGreen,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Selecione um módulo para começar',
                              style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                                color: AppColors.gray,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 24),
                
                // Grid de Módulos
                Expanded(
                  child: GridView.count(
                    crossAxisCount: 2,
                    crossAxisSpacing: 12,
                    mainAxisSpacing: 12,
                    childAspectRatio: 1.1,
                    children: [
                      _buildModuleCard(
                        context,
                        icon: Icons.inventory,
                        title: 'Patrimônio',
                        subtitle: 'Gestão de equipamentos',
                        color: AppColors.primaryGreen,
                        onTap: () => _showPatrimonioOptions(context),
                      ),
                      _buildModuleCard(
                        context,
                        icon: Icons.assessment,
                        title: 'Contagem',
                        subtitle: 'Controle de estoque',
                        color: AppColors.primaryGreen,
                        onTap: () => _showContagemOptions(context),
                      ),
                      _buildModuleCard(
                        context,
                        icon: Icons.restaurant,
                        title: 'NAE',
                        subtitle: 'Nutrição Alimentar',
                        color: AppColors.primaryGreen,
                        onTap: () => _showComingSoon(context, 'NAE'),
                      ),
                      _buildModuleCard(
                        context,
                        icon: Icons.build,
                        title: 'Manutenção',
                        subtitle: 'Solicitações',
                        color: AppColors.primaryGreen,
                        onTap: () => _showManutencaoOptions(context),
                      ),
                      _buildModuleCard(
                        context,
                        icon: Icons.receipt,
                        title: 'Faturamento',
                        subtitle: 'Relatórios',
                        color: AppColors.primaryGreen,
                        onTap: () => _showComingSoon(context, 'Faturamento'),
                      ),
                      _buildModuleCard(
                        context,
                        icon: Icons.local_florist,
                        title: 'Ocorrências',
                        subtitle: 'Hortifruti',
                        color: AppColors.primaryGreen,
                        onTap: () => _showComingSoon(context, 'Ocorrências'),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildModuleCard(
    BuildContext context, {
    required IconData icon,
    required String title,
    required String subtitle,
    required Color color,
    required VoidCallback onTap,
  }) {
    return Card(
      elevation: 4,
      shadowColor: color.withOpacity(0.3),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
                  child: Container(
            padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                color.withOpacity(0.1),
                color.withOpacity(0.05),
              ],
            ),
          ),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(
                  icon,
                  size: 28,
                  color: color,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                title,
                style: Theme.of(context).textTheme.titleMedium?.copyWith(
                  fontWeight: FontWeight.bold,
                  color: AppColors.darkGray,
                ),
                textAlign: TextAlign.center,
              ),
              const SizedBox(height: 2),
              Text(
                subtitle,
                style: Theme.of(context).textTheme.bodySmall?.copyWith(
                  color: AppColors.gray,
                ),
                textAlign: TextAlign.center,
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _showComingSoon(BuildContext context, String module) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: Text('$module'),
        content: Text('Este módulo estará disponível em breve!'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('OK'),
          ),
        ],
      ),
    );
  }

  void _showPatrimonioOptions(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const PatrimonioOptionsScreen(),
      ),
    );
  }

  void _showContagemOptions(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ContagemOptionsScreen(),
      ),
    );
  }

  void _showManutencaoOptions(BuildContext context) {
    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => const ManutencaoOptionsScreen(),
      ),
    );
  }

  void _showLogoutDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sair'),
        content: const Text('Tem certeza que deseja sair?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.of(context).pop(),
            child: const Text('Cancelar'),
          ),
          TextButton(
            onPressed: () {
              Navigator.of(context).pop();
              Provider.of<AuthProvider>(context, listen: false).logout();
            },
            child: const Text(
              'Sair',
              style: TextStyle(color: AppColors.errorRed),
            ),
          ),
        ],
      ),
    );
  }
} 