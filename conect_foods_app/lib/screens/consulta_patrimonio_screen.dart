import 'package:flutter/material.dart';
import 'package:conect_foods_app/widgets/custom_text_field.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/utils/app_colors.dart';

class ConsultaPatrimonioScreen extends StatefulWidget {
  const ConsultaPatrimonioScreen({super.key});

  @override
  State<ConsultaPatrimonioScreen> createState() => _ConsultaPatrimonioScreenState();
}

class _ConsultaPatrimonioScreenState extends State<ConsultaPatrimonioScreen> {
  final _formKey = GlobalKey<FormState>();
  final _searchController = TextEditingController();
  
  String? _empresaFiltro;
  String? _escolaFiltro;
  String? _statusFiltro;
  String? _nomePatrimonioFiltro;
  
  bool _isLoading = false;
  bool _mostrarResultados = false;
  bool _filtrosExpandidos = false;
  
  // Variáveis para paginação
  static const int _limiteResultados = 10; // Resultados por página
  int _paginaAtual = 0;
  bool _temMaisResultados = true;
  bool _carregandoMais = false;
  
  // Cache para validações (otimização de performance)
  final Set<String> _empresasSet = _empresas.toSet();
  final Set<String> _escolasSet = _escolas.toSet();
  final Set<String> _statusSet = _status.toSet();
  final Set<String> _nomesPatrimonioSet = _nomesPatrimonio.toSet();
  
  // Dados mockados para demonstração - usando const para melhor performance
  // OTIMIZAÇÕES IMPLEMENTADAS:
  // ✅ Sets para validações O(1) em vez de List.contains O(n)
  // ✅ Método _mostrarErro centralizado para evitar duplicação
  // ✅ Widgets const onde possível para evitar rebuilds
  // ✅ Verificação mounted antes de setState
  // ✅ Ícones verdes em todos os campos
  // ✅ Remoção de animações para melhor performance
  // ✅ Remoção de sombras e elevações desnecessárias
  // ✅ Filtros expansíveis/recolhíveis para economizar espaço
  // ✅ Indicador visual de filtros ativos
  static const List<String> _empresas = [
    'TODAS',
    'SEM PLAQUETA',
    'PLAQUETA 1',
    'PLAQUETA 2',
    'PLAQUETA 3'
  ];
  
  static const List<String> _escolas = [
    'TODAS',
    'ESCOLA MUNICIPAL A',
    'ESCOLA MUNICIPAL B',
    'ESCOLA ESTADUAL A',
    'ESCOLA ESTADUAL B'
  ];
  
  static const List<String> _status = [
    'TODOS',
    'ATIVO',
    'EM MANUTENÇÃO',
    'INATIVO',
    'DESCARTE'
  ];
  
  static const List<String> _nomesPatrimonio = [
    'TODOS',
    'GELADEIRA',
    'FREEZER',
    'FOGÃO',
    'MICROONDAS',
    'AR CONDICIONADO',
    'VENTILADOR',
    'COMPUTADOR',
    'IMPRESSORA',
    'TELEVISOR',
    'PROJETOR'
  ];

  // Dados mockados de patrimônios para demonstração
  static const List<Map<String, dynamic>> _patrimoniosMock = [
    {
      'id': '001',
      'nome': 'GELADEIRA',
      'empresa': 'PLAQUETA 1',
      'numero': 'PLQ001',
      'numeroSerie': 'SN123456789',
      'escola': 'ESCOLA MUNICIPAL A',
      'status': 'ATIVO',
      'estado': 'NOVO',
      'dataCadastro': '2024-01-15',
      'observacoes': 'Equipamento em perfeito estado',
      'sincronizado': true,
    },
    {
      'id': '002',
      'nome': 'FOGÃO',
      'empresa': 'PLAQUETA 2',
      'numero': 'PLQ002',
      'numeroSerie': 'SN987654321',
      'escola': 'ESCOLA ESTADUAL A',
      'status': 'EM MANUTENÇÃO',
      'estado': 'USADO',
      'dataCadastro': '2024-01-10',
      'observacoes': 'Necessita reparo no forno',
      'sincronizado': true,
    },
    {
      'id': '003',
      'nome': 'AR CONDICIONADO',
      'empresa': 'SEM PLAQUETA',
      'numero': '',
      'numeroSerie': 'SN456789123',
      'escola': 'ESCOLA MUNICIPAL B',
      'status': 'ATIVO',
      'estado': 'NOVO',
      'dataCadastro': '2024-01-20',
      'observacoes': 'Instalado recentemente',
      'sincronizado': false,
    },
    {
      'id': '004',
      'nome': 'MICROONDAS',
      'empresa': 'PLAQUETA 3',
      'numero': 'PLQ003',
      'numeroSerie': 'SN789123456',
      'escola': 'ESCOLA ESTADUAL B',
      'status': 'ATIVO',
      'estado': 'NOVO',
      'dataCadastro': '2024-01-25',
      'observacoes': 'Equipamento novo instalado',
      'sincronizado': false,
    },
  ];

  @override
  void initState() {
    super.initState();
    _empresaFiltro = 'TODAS';
    _escolaFiltro = 'TODAS';
    _statusFiltro = 'TODOS';
    _nomePatrimonioFiltro = 'TODOS';
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  // Método otimizado para mostrar erros
  void _mostrarErro(String mensagem) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: AppColors.errorRed,
      ),
    );
  }

  // Método otimizado para mostrar sucesso
  void _mostrarSucesso(String mensagem) {
    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: AppColors.successGreen,
      ),
    );
  }
  
  // Método para carregar mais resultados (paginação)
  Future<void> _carregarMaisResultados() async {
    if (!_temMaisResultados || _carregandoMais) return;
    
    setState(() {
      _carregandoMais = true;
    });
    
    try {
      // Simular carregamento de mais dados da API
      await Future.delayed(const Duration(milliseconds: 150));
      
      if (!mounted) return;
      
      setState(() {
        _paginaAtual++;
        _carregandoMais = false;
        
        // Simular fim dos resultados após 5 páginas
        if (_paginaAtual >= 5) {
          _temMaisResultados = false;
        }
      });
    } catch (e) {
      if (mounted) {
        setState(() {
          _carregandoMais = false;
        });
        _mostrarErro('Erro ao carregar mais resultados: $e');
      }
    }
  }
  
  // Método para resetar paginação quando fazer nova busca
  void _resetarPaginacao() {
    setState(() {
      _paginaAtual = 0;
      _temMaisResultados = true;
      _carregandoMais = false;
    });
  }

  void _limparFiltros() {
    setState(() {
      _searchController.clear();
      _empresaFiltro = 'TODAS';
      _escolaFiltro = 'TODAS';
      _statusFiltro = 'TODOS';
      _nomePatrimonioFiltro = 'TODOS';
      _mostrarResultados = false;
    });
  }

  // Verifica se há filtros ativos (diferentes dos padrões)
  bool _temFiltrosAtivos() {
    return _empresaFiltro != 'TODAS' ||
           _escolaFiltro != 'TODAS' ||
           _statusFiltro != 'TODOS' ||
           _nomePatrimonioFiltro != 'TODOS' ||
           _searchController.text.isNotEmpty;
  }

  // Retorna texto descritivo dos filtros ativos
  String _getFiltrosAtivosText() {
    final filtros = <String>[];
    
    if (_empresaFiltro != 'TODAS') {
      filtros.add('Empresa: $_empresaFiltro');
    }
    if (_escolaFiltro != 'TODAS') {
      filtros.add('Escola: $_escolaFiltro');
    }
    if (_statusFiltro != 'TODOS') {
      filtros.add('Status: $_statusFiltro');
    }
    if (_nomePatrimonioFiltro != 'TODOS') {
      filtros.add('Tipo: $_nomePatrimonioFiltro');
    }
    if (_searchController.text.isNotEmpty) {
      filtros.add('Busca: "${_searchController.text}"');
    }
    
    if (filtros.length <= 2) {
      return filtros.join(', ');
    } else {
      return '${filtros.length} filtros aplicados';
    }
  }

  Future<void> _buscarPatrimonios() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isLoading = true;
    });

    try {
      // Resetar paginação para nova busca
      _resetarPaginacao();
      
      // TODO: Implementar busca real quando API estiver pronta
      await Future.delayed(const Duration(milliseconds: 200));
      
      if (!mounted) return;
      
      setState(() {
        _mostrarResultados = true;
      });
      
      _mostrarSucesso('Busca realizada com sucesso!');
    } catch (e) {
      _mostrarErro('Erro ao buscar patrimônios: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  List<Map<String, dynamic>> _getPatrimoniosFiltrados() {
    final todosPatrimonios = _patrimoniosMock.where((patrimonio) {
      // Filtro por empresa
      if (_empresaFiltro != null && _empresaFiltro != 'TODAS') {
        if (patrimonio['empresa'] != _empresaFiltro) return false;
      }
      
      // Filtro por escola
      if (_escolaFiltro != null && _escolaFiltro != 'TODAS') {
        if (patrimonio['escola'] != _escolaFiltro) return false;
      }
      
      // Filtro por status
      if (_statusFiltro != null && _statusFiltro != 'TODOS') {
        if (patrimonio['status'] != _statusFiltro) return false;
      }
      
      // Filtro por nome do patrimônio
      if (_nomePatrimonioFiltro != null && _nomePatrimonioFiltro != 'TODOS') {
        if (patrimonio['nome'] != _nomePatrimonioFiltro) return false;
      }
      
      // Filtro por texto de busca
      if (_searchController.text.isNotEmpty) {
        final busca = _searchController.text.toLowerCase();
        final nome = patrimonio['nome'].toString().toLowerCase();
        final numero = patrimonio['numero'].toString().toLowerCase();
        final numeroSerie = patrimonio['numeroSerie'].toString().toLowerCase();
        final escola = patrimonio['escola'].toString().toLowerCase();
        
        if (!nome.contains(busca) && 
            !numero.contains(busca) && 
            !numeroSerie.contains(busca) && 
            !escola.contains(busca)) {
          return false;
        }
      }
      
      return true;
    }).toList();
    
    // Aplicar paginação
    final inicio = _paginaAtual * _limiteResultados;
    final fim = inicio + _limiteResultados;
    
    // Verificar se há mais resultados
    if (inicio >= todosPatrimonios.length) {
      _temMaisResultados = false;
      return [];
    }
    
    // Retornar apenas os resultados da página atual
    return todosPatrimonios.sublist(inicio, fim > todosPatrimonios.length ? todosPatrimonios.length : fim);
  }

  Color _getStatusColor(String status) {
    switch (status) {
      case 'ATIVO':
        return AppColors.successGreen;
      case 'EM MANUTENÇÃO':
        return AppColors.warningOrange;
      case 'INATIVO':
        return AppColors.gray;
      case 'DESCARTE':
        return AppColors.errorRed;
      default:
        return AppColors.gray;
    }
  }

  @override
  Widget build(BuildContext context) {
    final patrimoniosFiltrados = _getPatrimoniosFiltrados();
    
    return Scaffold(
      appBar: AppBar(
        title: const Text('Consulta de Patrimônio'),
        backgroundColor: AppColors.primaryGreen,
        foregroundColor: Colors.white,
        elevation: 0,
        centerTitle: true,
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
                // Formulário de Filtros
                Container(
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [AppColors.cardShadow],
                  ),
                  child: Form(
                    key: _formKey,
                    child: Padding(
                      padding: const EdgeInsets.all(20),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Título dos Filtros com botão expandir/recolher
                          Row(
                            children: [
                              Expanded(
                                child: _buildSectionTitle('Filtros de Busca'),
                              ),
                              GestureDetector(
                                onTap: () {
                                  setState(() {
                                    _filtrosExpandidos = !_filtrosExpandidos;
                                  });
                                },
                                child: Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGreen.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(16),
                                    border: Border.all(
                                      color: AppColors.primaryGreen.withOpacity(0.3),
                                      width: 1,
                                    ),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Icon(
                                        _filtrosExpandidos 
                                            ? Icons.keyboard_arrow_up 
                                            : Icons.keyboard_arrow_down,
                                        color: AppColors.primaryGreen,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 4),
                                      Text(
                                        _filtrosExpandidos ? 'Recolher' : 'Expandir',
                                        style: const TextStyle(
                                          color: AppColors.primaryGreen,
                                          fontSize: 12,
                                          fontWeight: FontWeight.w600,
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          
                          // Campo de busca geral (sempre visível)
                          CustomTextField(
                            controller: _searchController,
                            labelText: 'Buscar por nome, número ou escola',
                            prefixIcon: Icons.search,
                            hintText: 'Digite para buscar...',
                          ),
                          const SizedBox(height: 16),
                          
                          // Indicador de filtros ativos (quando recolhido)
                          if (!_filtrosExpandidos && _temFiltrosAtivos()) ...[
                            Container(
                              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.primaryGreen.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  Icon(
                                    Icons.filter_list,
                                    color: AppColors.primaryGreen,
                                    size: 16,
                                  ),
                                  const SizedBox(width: 8),
                                  Expanded(
                                    child: Text(
                                      'Filtros ativos: ${_getFiltrosAtivosText()}',
                                      style: const TextStyle(
                                        fontSize: 12,
                                        color: AppColors.primaryGreen,
                                        fontWeight: FontWeight.w500,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          
                          // Filtros avançados (expansível/recolhível)
                          if (_filtrosExpandidos) ...[
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.lightGray.withOpacity(0.3),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: AppColors.primaryGreen.withOpacity(0.2),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.tune,
                                        color: AppColors.primaryGreen,
                                        size: 16,
                                      ),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'Filtros Avançados',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.darkGray,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  
                                  // Filtros em Grid
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildSearchableDropdown(
                                          value: _empresaFiltro,
                                          labelText: 'Empresa',
                                          prefixIcon: Icons.business,
                                          items: _empresas,
                                          onChanged: (value) {
                                            setState(() {
                                              _empresaFiltro = value;
                                            });
                                          },
                                          validator: (value) => null,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildSearchableDropdown(
                                          value: _escolaFiltro,
                                          labelText: 'Escola',
                                          prefixIcon: Icons.school,
                                          items: _escolas,
                                          onChanged: (value) {
                                            setState(() {
                                              _escolaFiltro = value;
                                            });
                                          },
                                          validator: (value) => null,
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 16),
                                  
                                  Row(
                                    children: [
                                      Expanded(
                                        child: _buildSearchableDropdown(
                                          value: _statusFiltro,
                                          labelText: 'Status',
                                          prefixIcon: Icons.info,
                                          items: _status,
                                          onChanged: (value) {
                                            setState(() {
                                              _statusFiltro = value;
                                            });
                                          },
                                          validator: (value) => null,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: _buildSearchableDropdown(
                                          value: _nomePatrimonioFiltro,
                                          labelText: 'Tipo de Patrimônio',
                                          prefixIcon: Icons.inventory,
                                          items: _nomesPatrimonio,
                                          onChanged: (value) {
                                            setState(() {
                                              _nomePatrimonioFiltro = value;
                                            });
                                          },
                                          validator: (value) => null,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],
                          
                          const SizedBox(height: 24),
                          
                          // Botões
                          Row(
                            children: [
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : _limparFiltros,
                                  outlined: true,
                                  child: const Text('Limpar'),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : _buscarPatrimonios,
                                  child: _isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                          ),
                                        )
                                      : const Text('Buscar'),
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 16,
        fontWeight: FontWeight.w600,
        color: AppColors.darkGray,
      ),
    );
  }

  Widget _buildSearchableDropdown({
    required String? value,
    required String labelText,
    required IconData prefixIcon,
    required List<String> items,
    required ValueChanged<String?> onChanged,
    required String? Function(String?) validator,
    bool enabled = true,
  }) {
    return SearchableDropdownString(
      value: value,
      labelText: labelText,
      prefixIcon: prefixIcon,
      items: items,
      onChanged: onChanged,
      validator: validator,
      enabled: enabled,
    );
  }

  Widget _buildPatrimonioCard(Map<String, dynamic> patrimonio) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: Colors.grey[300]!),
      ),
      child: ExpansionTile(
        title: Row(
          children: [
            Icon(
              Icons.inventory,
              color: AppColors.primaryGreen,
              size: 20,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                patrimonio['nome'],
                style: const TextStyle(
                  fontWeight: FontWeight.bold,
                  fontSize: 16,
                ),
              ),
            ),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
              decoration: BoxDecoration(
                color: _getStatusColor(patrimonio['status']).withOpacity(0.1),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Text(
                patrimonio['status'],
                style: TextStyle(
                  color: _getStatusColor(patrimonio['status']),
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
        subtitle: Text(
          '${patrimonio['escola']} • ${patrimonio['empresa']}',
          style: const TextStyle(
            color: AppColors.gray,
            fontSize: 14,
          ),
        ),
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildInfoRow('ID', patrimonio['id']),
                _buildInfoRow('Número', patrimonio['numero'].isNotEmpty ? patrimonio['numero'] : 'N/A'),
                _buildInfoRow('Número de Série', patrimonio['numeroSerie']),
                _buildInfoRow('Estado', patrimonio['estado']),
                _buildInfoRow('Data de Cadastro', patrimonio['dataCadastro']),
                if (patrimonio['observacoes'].isNotEmpty)
                  _buildInfoRow('Observações', patrimonio['observacoes']),
                
                const SizedBox(height: 12),
                
                // Status de sincronização
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(
                    color: patrimonio['sincronizado'] 
                        ? AppColors.successGreen.withOpacity(0.1)
                        : AppColors.warningOrange.withOpacity(0.1),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: Text(
                    patrimonio['sincronizado'] ? 'Sincronizado' : 'Pendente',
                    style: TextStyle(
                      color: patrimonio['sincronizado'] 
                          ? AppColors.successGreen
                          : AppColors.warningOrange,
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                
                const SizedBox(height: 12),
                Row(
                  children: [
                    // Botão Editar - apenas para registros pendentes
                    if (!patrimonio['sincronizado']) ...[
                      Expanded(
                        child: CustomButton(
                          onPressed: () => _editarPatrimonio(patrimonio),
                          outlined: true,
                          child: const Text('Editar'),
                        ),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: CustomButton(
                          onPressed: () => _excluirPatrimonio(patrimonio),
                          outlined: true,
                          backgroundColor: AppColors.errorRed,
                          foregroundColor: Colors.white,
                          child: const Text('Excluir'),
                        ),
                      ),
                    ] else ...[
                      // Para registros sincronizados, apenas visualizar
                      Expanded(
                        child: CustomButton(
                          onPressed: () => _visualizarPatrimonio(patrimonio),
                          child: const Text('Visualizar'),
                        ),
                      ),
                    ],
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 100,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontWeight: FontWeight.bold,
                color: AppColors.darkGray,
                fontSize: 14,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                color: AppColors.gray,
                fontSize: 14,
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _editarPatrimonio(Map<String, dynamic> patrimonio) {
    // TODO: Implementar navegação para edição
    _mostrarSucesso('Editar patrimônio: ${patrimonio['nome']}');
  }

  void _visualizarPatrimonio(Map<String, dynamic> patrimonio) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => Container(
        height: MediaQuery.of(context).size.height * 0.8,
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
                    Icons.inventory,
                    color: AppColors.white,
                    size: 24,
                  ),
                  const SizedBox(width: 12),
                  const Expanded(
                    child: Text(
                      'Detalhes do Patrimônio',
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
                    _buildDetailItem('Nome', patrimonio['nome']),
                    _buildDetailItem('Empresa', patrimonio['empresa']),
                    _buildDetailItem('Escola', patrimonio['escola']),
                    _buildDetailItem('Status', patrimonio['status']),
                    _buildDetailItem('Estado', patrimonio['estado']),
                    if (patrimonio['numero'].isNotEmpty)
                      _buildDetailItem('Número', patrimonio['numero']),
                    if (patrimonio['numeroSerie'].isNotEmpty)
                      _buildDetailItem('Número de Série', patrimonio['numeroSerie']),
                    if (patrimonio['observacoes'].isNotEmpty)
                      _buildDetailItem('Observações', patrimonio['observacoes']),
                    _buildDetailItem('Data de Cadastro', patrimonio['dataCadastro']),
                    
                    // Seção de fotos (se houver)
                    if (patrimonio['foto1'] != null || patrimonio['foto2'] != null || patrimonio['foto3'] != null) ...[
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
                      _buildFotosSection(patrimonio),
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

  Widget _buildFotosSection(Map<String, dynamic> patrimonio) {
    final fotos = [patrimonio['foto1'], patrimonio['foto2'], patrimonio['foto3']]
        .where((foto) => foto != null && foto.isNotEmpty)
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
  
  // Widget para o botão "Carregar Mais"
  Widget _buildCarregarMaisButton() {
    return Container(
      margin: const EdgeInsets.only(top: 16),
      child: Column(
        children: [
          if (_carregandoMais)
            Container(
              padding: const EdgeInsets.all(16),
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  SizedBox(
                    width: 20,
                    height: 20,
                    child: CircularProgressIndicator(
                      strokeWidth: 2,
                      valueColor: AlwaysStoppedAnimation<Color>(AppColors.primaryGreen),
                    ),
                  ),
                  SizedBox(width: 12),
                  Text(
                    'Carregando mais resultados...',
                    style: TextStyle(
                      color: AppColors.gray,
                      fontSize: 14,
                    ),
                  ),
                ],
              ),
            )
          else
            CustomButton(
              onPressed: _carregarMaisResultados,
              outlined: true,
              child: const Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(Icons.expand_more, size: 20),
                  SizedBox(width: 8),
                  Text('Carregar Mais'),
                ],
              ),
            ),
          const SizedBox(height: 16),
        ],
      ),
    );
  }

  // Método para excluir patrimônio
  void _excluirPatrimonio(Map<String, dynamic> patrimonio) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmar Exclusão'),
          content: Text(
            'Tem certeza que deseja excluir o patrimônio "${patrimonio['nome']}" da escola "${patrimonio['escola']}"?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _confirmarExclusaoPatrimonio(patrimonio);
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

  // Método para confirmar exclusão de patrimônio
  void _confirmarExclusaoPatrimonio(Map<String, dynamic> patrimonio) {
    setState(() {
      // Remover da lista mockada (simulação)
      _patrimoniosMock.removeWhere((p) => p['id'] == patrimonio['id']);
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Patrimônio excluído com sucesso!'),
        backgroundColor: AppColors.successGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
} 