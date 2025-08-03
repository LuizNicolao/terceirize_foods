import 'package:flutter/material.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/models/manutencao.dart';
import 'package:conect_foods_app/providers/auth_provider.dart';
import 'package:provider/provider.dart';

class ConsultaManutencaoScreen extends StatefulWidget {
  const ConsultaManutencaoScreen({super.key});

  @override
  State<ConsultaManutencaoScreen> createState() => _ConsultaManutencaoScreenState();
}

class _ConsultaManutencaoScreenState extends State<ConsultaManutencaoScreen> {
  bool _filtrosExpandidos = false;
  String? _filtroEscola;
  String? _filtroData;
  
  List<Manutencao> _manutencoes = [];
  List<Manutencao> _manutencoesFiltradas = [];
  String? _usuarioLogado;
  
  // Dados mockados para demonstração
  static const List<String> _escolas = [
    'ESCOLA MUNICIPAL A',
    'ESCOLA MUNICIPAL B',
    'ESCOLA ESTADUAL A',
    'ESCOLA ESTADUAL B',
    'ESCOLA PARTICULAR A',
    'ESCOLA PARTICULAR B'
  ];

  @override
  void initState() {
    super.initState();
    _carregarUsuarioLogado();
    _carregarManutencoes();
  }

  void _carregarUsuarioLogado() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _usuarioLogado = authProvider.userName ?? 'Usuário';
  }

  void _carregarManutencoes() {
    // Dados mockados para demonstração - apenas do usuário logado
    final todasManutencoes = [
      Manutencao(
        id: 1,
        carimboDataHora: '2024-01-15T10:30:00Z',
        nutricionista: 'ADRIANA',
        data: '15/01/2024',
        escola: 'ESCOLA MUNICIPAL A',
        descricao: 'Geladeira não está resfriando adequadamente. Temperatura interna está em 15°C quando deveria estar em 4°C.',
        sincronizado: true,
      ),
      Manutencao(
        id: 2,
        carimboDataHora: '2024-01-14T14:20:00Z',
        nutricionista: 'ALINE',
        data: '14/01/2024',
        escola: 'ESCOLA ESTADUAL A',
        descricao: 'Fogão com vazamento de gás. Necessita verificação urgente da válvula de segurança.',
        sincronizado: true,
      ),
      Manutencao(
        id: 3,
        carimboDataHora: '2024-01-13T09:15:00Z',
        nutricionista: 'ANGELA',
        data: '13/01/2024',
        escola: 'ESCOLA PARTICULAR A',
        descricao: 'Liquidificador com barulho anormal durante o funcionamento. Possível problema no motor.',
        sincronizado: false,
      ),
      Manutencao(
        id: 4,
        carimboDataHora: '2024-01-12T16:45:00Z',
        nutricionista: 'BEATRIZ',
        data: '12/01/2024',
        escola: 'ESCOLA MUNICIPAL B',
        descricao: 'Freezer com acúmulo excessivo de gelo. Necessita descongelamento e verificação do sistema.',
        sincronizado: true,
      ),
      Manutencao(
        id: 5,
        carimboDataHora: '2024-01-11T11:30:00Z',
        nutricionista: 'BIANCA',
        data: '11/01/2024',
        escola: 'ESCOLA ESTADUAL B',
        descricao: 'Microondas não está aquecendo os alimentos. Display funciona mas não gera calor.',
        sincronizado: false,
      ),
    ];
    
    // Filtrar apenas as manutenções do usuário logado
    _manutencoes = todasManutencoes.where((manutencao) {
      return manutencao.nutricionista == _usuarioLogado;
    }).toList();
    
    _aplicarFiltros();
  }

  void _aplicarFiltros() {
    setState(() {
      _manutencoesFiltradas = _manutencoes.where((manutencao) {
        bool passaFiltro = true;
        
        if (_filtroEscola != null && _filtroEscola!.isNotEmpty) {
          passaFiltro = passaFiltro && manutencao.escola == _filtroEscola;
        }
        
        if (_filtroData != null && _filtroData!.isNotEmpty) {
          passaFiltro = passaFiltro && manutencao.data == _filtroData;
        }
        
        return passaFiltro;
      }).toList();
    });
  }

  void _limparFiltros() {
    setState(() {
      _filtroEscola = null;
      _filtroData = null;
      _filtrosExpandidos = false;
    });
    _aplicarFiltros();
  }

  bool _temFiltrosAtivos() {
    return (_filtroEscola != null && _filtroEscola!.isNotEmpty) ||
           (_filtroData != null && _filtroData!.isNotEmpty);
  }

  String _getFiltrosAtivosText() {
    List<String> filtros = [];
    if (_filtroEscola != null && _filtroEscola!.isNotEmpty) filtros.add('Escola: $_filtroEscola');
    if (_filtroData != null && _filtroData!.isNotEmpty) filtros.add('Data: $_filtroData');
    return filtros.join(', ');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Minhas Manutenções'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back),
          onPressed: () => Navigator.of(context).pop(),
        ),
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
                // Informação do usuário
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: AppColors.primaryGreen.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: AppColors.primaryGreen.withOpacity(0.3),
                    ),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(8),
                        decoration: BoxDecoration(
                          color: AppColors.primaryGreen,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Icon(
                          Icons.person,
                          color: AppColors.white,
                          size: 20,
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text(
                              'Suas Solicitações',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.darkGray,
                              ),
                            ),
                            Text(
                              'Nutricionista: $_usuarioLogado',
                              style: const TextStyle(
                                fontSize: 14,
                                color: AppColors.gray,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                // Filtros
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [AppColors.cardShadow],
                  ),
                  child: Column(
                    children: [
                      // Botão expandir/recolher filtros
                      GestureDetector(
                        onTap: () {
                          setState(() {
                            _filtrosExpandidos = !_filtrosExpandidos;
                          });
                        },
                        child: Container(
                          padding: const EdgeInsets.all(16),
                          child: Row(
                            children: [
                              Icon(
                                _filtrosExpandidos ? Icons.expand_less : Icons.expand_more,
                                color: AppColors.primaryGreen,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                _filtrosExpandidos ? 'Recolher filtros' : 'Expandir filtros',
                                style: const TextStyle(
                                  color: AppColors.primaryGreen,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Spacer(),
                              if (_temFiltrosAtivos())
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGreen.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: Text(
                                    '${_manutencoesFiltradas.length} resultado${_manutencoesFiltradas.length != 1 ? 's' : ''}',
                                    style: const TextStyle(
                                      color: AppColors.primaryGreen,
                                      fontSize: 12,
                                      fontWeight: FontWeight.bold,
                                    ),
                                  ),
                                ),
                            ],
                          ),
                        ),
                      ),
                      
                      // Filtros ativos
                      if (_temFiltrosAtivos())
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                          child: Row(
                            children: [
                              Expanded(
                                child: Text(
                                  _getFiltrosAtivosText(),
                                  style: const TextStyle(
                                    color: AppColors.gray,
                                    fontSize: 12,
                                  ),
                                ),
                              ),
                              TextButton(
                                onPressed: _limparFiltros,
                                child: const Text(
                                  'Limpar',
                                  style: TextStyle(color: AppColors.primaryGreen),
                                ),
                              ),
                            ],
                          ),
                        ),
                      
                      // Filtros expandidos
                      if (_filtrosExpandidos)
                        Container(
                          padding: const EdgeInsets.all(16),
                          child: Column(
                            children: [
                              // Filtro Escola
                              DropdownButtonFormField<String>(
                                value: _filtroEscola,
                                decoration: const InputDecoration(
                                  labelText: 'Escola',
                                  border: OutlineInputBorder(),
                                ),
                                items: [
                                  const DropdownMenuItem<String>(
                                    value: null,
                                    child: Text('Todas as escolas'),
                                  ),
                                  ..._escolas.map((escola) => DropdownMenuItem<String>(
                                    value: escola,
                                    child: Text(escola),
                                  )),
                                ],
                                onChanged: (value) {
                                  setState(() {
                                    _filtroEscola = value;
                                  });
                                  _aplicarFiltros();
                                },
                              ),
                              const SizedBox(height: 16),
                              
                              // Filtro Data
                              TextFormField(
                                decoration: const InputDecoration(
                                  labelText: 'Data',
                                  hintText: 'DD/MM/AAAA',
                                  border: OutlineInputBorder(),
                                ),
                                onChanged: (value) {
                                  setState(() {
                                    _filtroData = value;
                                  });
                                  _aplicarFiltros();
                                },
                              ),
                            ],
                          ),
                        ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                
                // Lista de manutenções
                Expanded(
                  child: _manutencoesFiltradas.isEmpty
                      ? Center(
                          child: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(
                                Icons.build_outlined,
                                size: 64,
                                color: AppColors.gray.withOpacity(0.5),
                              ),
                              const SizedBox(height: 16),
                              Text(
                                _manutencoes.isEmpty 
                                    ? 'Você ainda não tem solicitações de manutenção'
                                    : 'Nenhuma solicitação encontrada com os filtros aplicados',
                                style: const TextStyle(
                                  color: AppColors.gray,
                                  fontSize: 16,
                                ),
                                textAlign: TextAlign.center,
                              ),
                              if (_manutencoes.isEmpty) ...[
                                const SizedBox(height: 8),
                                Text(
                                  'Crie sua primeira solicitação!',
                                  style: TextStyle(
                                    color: AppColors.gray.withOpacity(0.7),
                                    fontSize: 14,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ],
                          ),
                        )
                      : ListView.builder(
                          itemCount: _manutencoesFiltradas.length,
                          itemBuilder: (context, index) {
                            final manutencao = _manutencoesFiltradas[index];
                            return _buildManutencaoCard(manutencao);
                          },
                        ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildManutencaoCard(Manutencao manutencao) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: InkWell(
        onTap: () => _mostrarDetalhesManutencao(manutencao),
        borderRadius: BorderRadius.circular(12),
        child: Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            borderRadius: BorderRadius.circular(12),
            gradient: LinearGradient(
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
              colors: [
                AppColors.white,
                AppColors.lightGray.withOpacity(0.3),
              ],
            ),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primaryGreen.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Icon(
                      Icons.build,
                      color: AppColors.primaryGreen,
                      size: 20,
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          manutencao.escola,
                          style: const TextStyle(
                            fontWeight: FontWeight.bold,
                            fontSize: 16,
                            color: AppColors.darkGray,
                          ),
                        ),
                        Text(
                          'Data: ${manutencao.data}',
                          style: const TextStyle(
                            color: AppColors.gray,
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: manutencao.sincronizado 
                          ? AppColors.successGreen.withOpacity(0.1)
                          : AppColors.warningOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      manutencao.sincronizado ? 'Sincronizado' : 'Pendente',
                      style: TextStyle(
                        color: manutencao.sincronizado 
                            ? AppColors.successGreen
                            : AppColors.warningOrange,
                        fontSize: 12,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Text(
                manutencao.descricao,
                style: const TextStyle(
                  color: AppColors.darkGray,
                  fontSize: 14,
                ),
                maxLines: 2,
                overflow: TextOverflow.ellipsis,
              ),
              
              // Botões de ação para registros pendentes
              if (!manutencao.sincronizado) ...[
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _editarManutencao(manutencao),
                        icon: const Icon(Icons.edit, size: 16),
                        label: const Text('Editar'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.primaryGreen,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        onPressed: () => _excluirManutencao(manutencao),
                        icon: const Icon(Icons.delete, size: 16),
                        label: const Text('Excluir'),
                        style: ElevatedButton.styleFrom(
                          backgroundColor: AppColors.errorRed,
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 8),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                      ),
                    ),
                  ],
                ),
              ],
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(
                    Icons.calendar_today,
                    size: 16,
                    color: AppColors.gray,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    manutencao.data,
                    style: const TextStyle(
                      color: AppColors.gray,
                      fontSize: 12,
                    ),
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      Icon(
                        Icons.visibility,
                        size: 16,
                        color: AppColors.primaryGreen,
                      ),
                      const SizedBox(width: 4),
                      Text(
                        'Toque para ver detalhes',
                        style: TextStyle(
                          color: AppColors.primaryGreen,
                          fontSize: 12,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  void _mostrarDetalhesManutencao(Manutencao manutencao) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.7,
        decoration: const BoxDecoration(
          color: AppColors.white,
          borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
        ),
        child: Column(
          children: [
            // Header do modal
            Container(
              padding: const EdgeInsets.all(20),
              decoration: const BoxDecoration(
                color: AppColors.primaryGreen,
                borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.build,
                    color: AppColors.white,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Detalhes da Solicitação',
                      style: TextStyle(
                        color: AppColors.white,
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ),
                  IconButton(
                    onPressed: () => Navigator.of(context).pop(),
                    icon: const Icon(
                      Icons.close,
                      color: AppColors.white,
                    ),
                  ),
                ],
              ),
            ),
            
            // Conteúdo do modal
            Expanded(
              child: SingleChildScrollView(
                padding: const EdgeInsets.all(20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    _buildDetailItem('Escola', manutencao.escola),
                    _buildDetailItem('Data', manutencao.data),
                    _buildDetailItem('Status', manutencao.sincronizado ? 'Sincronizado' : 'Pendente'),
                    const SizedBox(height: 16),
                    const Text(
                      'Descrição do Problema:',
                      style: TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 16,
                        color: AppColors.darkGray,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Container(
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: AppColors.lightGray.withOpacity(0.3),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Text(
                        manutencao.descricao,
                        style: const TextStyle(
                          color: AppColors.darkGray,
                          fontSize: 14,
                        ),
                      ),
                    ),
                    
                    // Seção de fotos (se houver)
                    if (manutencao.foto1 != null || manutencao.foto2 != null || manutencao.foto3 != null) ...[
                      const SizedBox(height: 20),
                      const Text(
                        'Fotos:',
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                          color: AppColors.darkGray,
                        ),
                      ),
                      const SizedBox(height: 12),
                      _buildFotosSection(manutencao),
                    ],
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildFotosSection(Manutencao manutencao) {
    final fotos = [manutencao.foto1, manutencao.foto2, manutencao.foto3]
        .where((foto) => foto != null && foto!.isNotEmpty)
        .toList();

    if (fotos.isEmpty) return const SizedBox.shrink();

    return Column(
      children: fotos.asMap().entries.map((entry) {
        final index = entry.key;
        final foto = entry.value;
        
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                'Foto ${index + 1}:',
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                  fontSize: 14,
                  color: AppColors.gray,
                ),
              ),
              const SizedBox(height: 8),
              Container(
                width: double.infinity,
                height: 200,
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: AppColors.gray.withOpacity(0.3)),
                ),
                child: ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: Image.asset(
                    'assets/placeholder_image.png', // Placeholder - em produção seria a foto real
                    fit: BoxFit.cover,
                    errorBuilder: (context, error, stackTrace) {
                      return Container(
                        color: AppColors.lightGray,
                        child: const Center(
                          child: Icon(
                            Icons.image_not_supported,
                            size: 48,
                            color: AppColors.gray,
                          ),
                        ),
                      );
                    },
                  ),
                ),
              ),
            ],
          ),
        );
      }).toList(),
    );
  }

  Widget _buildDetailItem(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontWeight: FontWeight.bold,
              fontSize: 14,
              color: AppColors.gray,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            value,
            style: const TextStyle(
              fontSize: 16,
              color: AppColors.darkGray,
            ),
          ),
        ],
      ),
    );
  }

  // Método para editar manutenção
  void _editarManutencao(Manutencao manutencao) {
    // TODO: Implementar navegação para tela de edição
    // Por enquanto, mostra um snackbar informativo
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Editando manutenção: ${manutencao.escola}'),
        backgroundColor: AppColors.primaryGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        action: SnackBarAction(
          label: 'OK',
          textColor: Colors.white,
          onPressed: () {
            ScaffoldMessenger.of(context).hideCurrentSnackBar();
          },
        ),
      ),
    );
  }

  // Método para excluir manutenção
  void _excluirManutencao(Manutencao manutencao) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmar Exclusão'),
          content: Text(
            'Tem certeza que deseja excluir a solicitação de manutenção da escola "${manutencao.escola}"?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _confirmarExclusaoManutencao(manutencao);
              },
              style: TextButton.styleFrom(
                foregroundColor: AppColors.errorRed,
              ),
              child: const Text('Excluir'),
            ),
          ],
        );
      },
    );
  }

  // Método para confirmar exclusão
  void _confirmarExclusaoManutencao(Manutencao manutencao) {
    setState(() {
      _manutencoes.removeWhere((m) => m.id == manutencao.id);
      _aplicarFiltros();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Manutenção excluída com sucesso!'),
        backgroundColor: AppColors.successGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
} 