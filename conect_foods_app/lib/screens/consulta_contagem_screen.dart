import 'package:flutter/material.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/models/contagem.dart';

class ConsultaContagemScreen extends StatefulWidget {
  const ConsultaContagemScreen({super.key});

  @override
  State<ConsultaContagemScreen> createState() => _ConsultaContagemScreenState();
}

class _ConsultaContagemScreenState extends State<ConsultaContagemScreen> {
  String? _escolaFiltro;
  String? _nutricionistaFiltro;
  String? _dataFiltro;
  bool _isLoading = false;
  bool _filtrosExpandidos = false;
  
  List<ContagemEstoque> _contagensList = [];
  List<ContagemEstoque> _contagensFiltradas = [];
  
  // Cache para validações
  final Set<String> _escolasSet = _escolas.toSet();
  final Set<String> _nutricionistasSet = _nutricionistas.toSet();
  
  // Dados mockados para demonstração
  static const List<String> _escolas = [
    'ESCOLA MUNICIPAL A',
    'ESCOLA MUNICIPAL B',
    'ESCOLA ESTADUAL A',
    'ESCOLA ESTADUAL B',
    'ESCOLA PARTICULAR A',
    'ESCOLA PARTICULAR B'
  ];
  
  static const List<String> _nutricionistas = [
    'ADRIANA',
    'ALINE',
    'ANGELA',
    'BEATRIZ',
    'BERENIZE',
    'BIANCA',
    'DAIANA',
    'DANIELA',
    'DJENIFER',
    'EDINEIA',
    'FRANCIELI',
    'GREICE',
    'ISADORA',
    'JORDANA',
    'LETICIA',
    'LOUISE',
    'LUCAS',
    'LUCIANA',
    'MARIA EDUARDA',
    'MARA',
    'PATRICIA',
    'POUSO REDONDO',
    'RAFAELA',
    'REGINA',
    'ROSANA',
    'ROSANGELA',
    'SUZANE',
    'TAIS ZOREK',
    'TATIELE',
    'THAIS'
  ];

  @override
  void initState() {
    super.initState();
    _carregarContagens();
  }

  Future<void> _carregarContagens() async {
    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implementar carregamento real quando API estiver pronta
      await Future.delayed(const Duration(milliseconds: 200));
      
      // Dados mockados
      _contagensList = [
        ContagemEstoque(
          id: '1',
          data: '15/12/2024',
          escola: 'ESCOLA MUNICIPAL A',
          nutricionista: 'ADRIANA',
          produtos: [
            ProdutoContagem(
              nome: 'ARROZ INTEGRAL 1 KG - KG',
              quantidade: 10.0,
              validade: '31/12/2024',
              lote: '',
            ),
            ProdutoContagem(
              nome: 'FEIJAO PRETO 1 KG - KG',
              quantidade: 8.0,
              validade: '15/01/2025',
              lote: '',
            ),
            ProdutoContagem(
              nome: 'MANTEIGA C/ SAL 200G - PT',
              quantidade: 15.0,
              validade: '20/12/2024',
              lote: '',
            ),
          ],
          sincronizado: true,
        ),
        ContagemEstoque(
          id: '2',
          data: '14/12/2024',
          escola: 'ESCOLA ESTADUAL A',
          nutricionista: 'BIANCA',
          produtos: [
            ProdutoContagem(
              nome: 'FILE DE TILAPIA 1 KG - KG',
              quantidade: 5.0,
              validade: '25/12/2024',
              lote: '',
            ),
            ProdutoContagem(
              nome: 'IOGURTE NATURAL INTEGRAL 900 ML - LT',
              quantidade: 12.0,
              validade: '18/12/2024',
              lote: '',
            ),
          ],
          sincronizado: true,
        ),
        ContagemEstoque(
          id: '3',
          data: '13/12/2024',
          escola: 'ESCOLA MUNICIPAL B',
          nutricionista: 'DANIELA',
          produtos: [
            ProdutoContagem(
              nome: 'MILHO VERDE CONGELADO 1 KG - KG',
              quantidade: 6.0,
              validade: '30/12/2024',
              lote: '',
            ),
            ProdutoContagem(
              nome: 'QUEIJO MUSSARELA FATIADO 400G - KG',
              quantidade: 8.0,
              validade: '22/12/2024',
              lote: '',
            ),
            ProdutoContagem(
              nome: 'FARINHA DE TRIGO 1 KG - KG',
              quantidade: 20.0,
              validade: '31/01/2025',
              lote: '',
            ),
          ],
          sincronizado: false,
        ),
      ];
      
      _aplicarFiltros();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao carregar contagens: $e'),
          backgroundColor: AppColors.errorRed,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _aplicarFiltros() {
    setState(() {
      _contagensFiltradas = _contagensList.where((contagem) {
        bool passaFiltro = true;
        
        if (_escolaFiltro != null && _escolaFiltro!.isNotEmpty) {
          passaFiltro = passaFiltro && contagem.escola == _escolaFiltro;
        }
        
        if (_nutricionistaFiltro != null && _nutricionistaFiltro!.isNotEmpty) {
          passaFiltro = passaFiltro && contagem.nutricionista == _nutricionistaFiltro;
        }
        
        if (_dataFiltro != null && _dataFiltro!.isNotEmpty) {
          passaFiltro = passaFiltro && contagem.data == _dataFiltro;
        }
        
        return passaFiltro;
      }).toList();
    });
  }

  void _limparFiltros() {
    setState(() {
      _escolaFiltro = null;
      _nutricionistaFiltro = null;
      _dataFiltro = null;
    });
    _aplicarFiltros();
  }

  // Verifica se há filtros ativos
  bool _temFiltrosAtivos() {
    return _escolaFiltro != null ||
           _nutricionistaFiltro != null ||
           _dataFiltro != null;
  }

  // Retorna texto descritivo dos filtros ativos
  String _getFiltrosAtivosText() {
    final filtros = <String>[];
    
    if (_escolaFiltro != null) {
      filtros.add('Escola: $_escolaFiltro');
    }
    if (_nutricionistaFiltro != null) {
      filtros.add('Nutricionista: $_nutricionistaFiltro');
    }
    if (_dataFiltro != null) {
      filtros.add('Data: $_dataFiltro');
    }
    
    if (filtros.length <= 2) {
      return filtros.join(', ');
    } else {
      return '${filtros.length} filtros aplicados';
    }
  }

  void _mostrarDetalhesContagem(ContagemEstoque contagem) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _buildDetalhesModal(contagem),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Consultar Contagens'),
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
                // Filtros
                Container(
                  padding: const EdgeInsets.all(20),
                  decoration: BoxDecoration(
                    color: AppColors.white,
                    borderRadius: BorderRadius.circular(12),
                    boxShadow: [AppColors.cardShadow],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
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
                            children: [
                              // Escola
                              SearchableDropdownString(
                                value: _escolaFiltro,
                                labelText: 'Escola',
                                prefixIcon: Icons.school,
                                items: ['Todas', ..._escolas],
                                onChanged: (value) {
                                  setState(() {
                                    _escolaFiltro = value == 'Todas' ? null : value;
                                  });
                                  _aplicarFiltros();
                                },
                                validator: (value) => null,
                              ),
                              const SizedBox(height: 12),
                              
                              // Nutricionista
                              SearchableDropdownString(
                                value: _nutricionistaFiltro,
                                labelText: 'Nutricionista',
                                prefixIcon: Icons.person,
                                items: ['Todos', ..._nutricionistas],
                                onChanged: (value) {
                                  setState(() {
                                    _nutricionistaFiltro = value == 'Todos' ? null : value;
                                  });
                                  _aplicarFiltros();
                                },
                                validator: (value) => null,
                              ),
                              const SizedBox(height: 12),
                              
                              // Data
                              SearchableDropdownString(
                                value: _dataFiltro,
                                labelText: 'Data',
                                prefixIcon: Icons.calendar_today,
                                items: ['Todas', '15/12/2024', '14/12/2024', '13/12/2024'],
                                onChanged: (value) {
                                  setState(() {
                                    _dataFiltro = value == 'Todas' ? null : value;
                                  });
                                  _aplicarFiltros();
                                },
                                validator: (value) => null,
                              ),
                              const SizedBox(height: 16),
                              
                              // Botão Limpar Filtros
                              CustomButton(
                                onPressed: _limparFiltros,
                                outlined: true,
                                child: const Text('Limpar Filtros'),
                              ),
                            ],
                          ),
                        ),
                      ],
                    ],
                  ),
                ),
                
                // Lista de Contagens
                Expanded(
                  child: Container(
                    decoration: const BoxDecoration(
                      color: AppColors.white,
                      borderRadius: BorderRadius.only(
                        topLeft: Radius.circular(24),
                        topRight: Radius.circular(24),
                      ),
                    ),
                    child: _isLoading
                        ? const Center(
                            child: CircularProgressIndicator(
                              color: AppColors.primaryGreen,
                            ),
                          )
                        : _contagensFiltradas.isEmpty
                            ? _buildEmptyState()
                            : ListView.builder(
                                padding: const EdgeInsets.all(20),
                                itemCount: _contagensFiltradas.length,
                                itemBuilder: (context, index) {
                                  return _buildContagemCard(_contagensFiltradas[index]);
                                },
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

  Widget _buildEmptyState() {
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(
            Icons.assessment_outlined,
            size: 64,
            color: AppColors.gray.withOpacity(0.5),
          ),
          const SizedBox(height: 16),
          Text(
            'Nenhuma contagem encontrada',
            style: Theme.of(context).textTheme.titleMedium?.copyWith(
              color: AppColors.gray,
            ),
          ),
          const SizedBox(height: 8),
          Text(
            'Tente ajustar os filtros ou criar uma nova contagem',
            style: Theme.of(context).textTheme.bodyMedium?.copyWith(
              color: AppColors.gray,
            ),
            textAlign: TextAlign.center,
          ),
        ],
      ),
    );
  }

  Widget _buildContagemCard(ContagemEstoque contagem) {
    return Card(
      margin: const EdgeInsets.only(bottom: 16),
      elevation: 4,
      shadowColor: AppColors.primaryGreen.withOpacity(0.2),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: InkWell(
        onTap: () => _mostrarDetalhesContagem(contagem),
        borderRadius: BorderRadius.circular(16),
        child: Padding(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          contagem.escola,
                          style: const TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: AppColors.darkGray,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          'Nutricionista: ${contagem.nutricionista}',
                          style: const TextStyle(
                            fontSize: 14,
                            color: AppColors.gray,
                          ),
                        ),
                      ],
                    ),
                  ),
                  Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: contagem.sincronizado 
                          ? AppColors.successGreen.withOpacity(0.1)
                          : AppColors.warningOrange.withOpacity(0.1),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      contagem.sincronizado ? 'Sincronizado' : 'Pendente',
                      style: TextStyle(
                        fontSize: 12,
                        fontWeight: FontWeight.w600,
                        color: contagem.sincronizado 
                            ? AppColors.successGreen
                            : AppColors.warningOrange,
                      ),
                    ),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  Expanded(
                    child: _buildInfoItem('Data', contagem.data),
                  ),
                  Expanded(
                    child: _buildInfoItem('Produtos', '${contagem.quantidadeProdutos}'),
                  ),
                ],
              ),
              const SizedBox(height: 12),
              
              // Botões de ação para registros pendentes
              if (!contagem.sincronizado) ...[
                Row(
                  children: [
                    Expanded(
                      child: CustomButton(
                        onPressed: () => _editarContagem(contagem),
                        outlined: true,
                        child: const Text('Editar'),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: CustomButton(
                        onPressed: () => _excluirContagem(contagem),
                        outlined: true,
                        backgroundColor: AppColors.errorRed,
                        foregroundColor: Colors.white,
                        child: const Text('Excluir'),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 12),
              ],
              
              Row(
                children: [
                  Icon(
                    Icons.touch_app,
                    size: 16,
                    color: AppColors.primaryGreen,
                  ),
                  const SizedBox(width: 4),
                  Text(
                    'Toque para ver detalhes',
                    style: TextStyle(
                      fontSize: 12,
                      color: AppColors.primaryGreen,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInfoItem(String label, String value) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: const TextStyle(
            fontSize: 12,
            color: AppColors.gray,
            fontWeight: FontWeight.w500,
          ),
        ),
        Text(
          value,
          style: const TextStyle(
            fontSize: 14,
            color: AppColors.darkGray,
            fontWeight: FontWeight.w600,
          ),
        ),
      ],
    );
  }

  Widget _buildDetalhesModal(ContagemEstoque contagem) {
    return Container(
      height: MediaQuery.of(context).size.height * 0.8,
      decoration: const BoxDecoration(
        color: AppColors.white,
        borderRadius: BorderRadius.only(
          topLeft: Radius.circular(24),
          topRight: Radius.circular(24),
        ),
      ),
      child: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.all(20),
            decoration: const BoxDecoration(
              color: AppColors.primaryGreen,
              borderRadius: BorderRadius.only(
                topLeft: Radius.circular(24),
                topRight: Radius.circular(24),
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.assessment,
                  color: Colors.white,
                  size: 24,
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Detalhes da Contagem',
                        style: Theme.of(context).textTheme.titleLarge?.copyWith(
                          color: Colors.white,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      Text(
                        contagem.escola,
                        style: Theme.of(context).textTheme.bodyMedium?.copyWith(
                          color: Colors.white.withOpacity(0.9),
                        ),
                      ),
                    ],
                  ),
                ),
                IconButton(
                  onPressed: () => Navigator.pop(context),
                  icon: const Icon(
                    Icons.close,
                    color: Colors.white,
                  ),
                ),
              ],
            ),
          ),
          
          // Conteúdo
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Informações Gerais
                  _buildSectionTitle('Informações Gerais'),
                  const SizedBox(height: 16),
                  
                  _buildDetailRow('Data', contagem.data),
                  _buildDetailRow('Escola', contagem.escola),
                  _buildDetailRow('Nutricionista', contagem.nutricionista),
                  _buildDetailRow('Status', contagem.sincronizado ? 'Sincronizado' : 'Pendente'),
                  _buildDetailRow('Total de Produtos', '${contagem.quantidadeProdutos}'),
                  
                  const SizedBox(height: 24),
                  
                  // Lista de Produtos
                  _buildSectionTitle('Produtos (${contagem.quantidadeProdutos})'),
                  const SizedBox(height: 16),
                  
                  ...contagem.produtos.map((produto) => _buildProdutoItem(produto)).toList(),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Text(
      title,
      style: const TextStyle(
        fontSize: 18,
        fontWeight: FontWeight.bold,
        color: AppColors.primaryGreen,
      ),
    );
  }

  Widget _buildDetailRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          SizedBox(
            width: 120,
            child: Text(
              '$label:',
              style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: AppColors.gray,
              ),
            ),
          ),
          Expanded(
            child: Text(
              value,
              style: const TextStyle(
                fontSize: 14,
                color: AppColors.darkGray,
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildProdutoItem(ProdutoContagem produto) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              produto.nome,
              style: const TextStyle(
                fontSize: 16,
                fontWeight: FontWeight.w600,
                color: AppColors.darkGray,
              ),
            ),
            const SizedBox(height: 8),
            Row(
              children: [
                Expanded(
                  child: _buildInfoItem('Quantidade', '${produto.quantidade}'),
                ),
                Expanded(
                  child: _buildInfoItem('Validade', produto.validade),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }

  // Método para editar contagem
  void _editarContagem(ContagemEstoque contagem) {
    // TODO: Implementar navegação para tela de edição
    // Por enquanto, mostra um snackbar informativo
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Editando contagem: ${contagem.escola}'),
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

  // Método para excluir contagem
  void _excluirContagem(ContagemEstoque contagem) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return AlertDialog(
          title: const Text('Confirmar Exclusão'),
          content: Text(
            'Tem certeza que deseja excluir a contagem da escola "${contagem.escola}"?',
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.of(context).pop(),
              child: const Text('Cancelar'),
            ),
            TextButton(
              onPressed: () {
                Navigator.of(context).pop();
                _confirmarExclusaoContagem(contagem);
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

  // Método para confirmar exclusão de contagem
  void _confirmarExclusaoContagem(ContagemEstoque contagem) {
    setState(() {
      _contagensList.removeWhere((c) => c.id == contagem.id);
      _aplicarFiltros();
    });

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('Contagem excluída com sucesso!'),
        backgroundColor: AppColors.successGreen,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }
} 