import 'package:flutter/material.dart';
import 'package:conect_foods_app/widgets/custom_text_field.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/models/contagem.dart';

class ContagemScreen extends StatefulWidget {
  const ContagemScreen({super.key});

  @override
  State<ContagemScreen> createState() => _ContagemScreenState();
}

class _ContagemScreenState extends State<ContagemScreen> {
  final _formKey = GlobalKey<FormState>();
  final _quantidadeController = TextEditingController();
  final _validadeController = TextEditingController();
  
  String? _escolaSelecionada;
  String? _nutricionistaSelecionado;
  String? _produtoSelecionado;
  
  bool _isLoading = false;
  
  List<ProdutoContagem> _produtosList = [];
  
  // Cache para validações
  final Set<String> _escolasSet = _escolas.toSet();
  final Set<String> _nutricionistasSet = _nutricionistas.toSet();
  final Set<String> _produtosSet = _produtos.toSet();
  
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
  
  static const List<String> _produtos = [
    'AIPIM CONGELADO 1 KG - KG',
    'ERVILHA CONGELADA 1 KG - KG',
    'FILE DE COXA E SOBRECOXA S/OSSO S/PELE 1 KG - KG',
    'FILE DE SASSAMI 1 KG - KG',
    'AGF - FILE DE TILAPIA 1 KG - KG',
    'FILE DE TILAPIA 1 KG - KG',
    'IOGURTE NATURAL INTEGRAL 900 ML - LT',
    'MANTEIGA C/ SAL 200G - PT',
    'MILHO VERDE CONGELADO 1 KG - KG',
    'MORANGO CONGELADO 1 KG - KG',
    'PATINHO BOVINO CUBOS 1 KG - KG',
    'PATINHO BOVINO ISCAS 1 KG - KG',
    'PATINHO BOVINO MOIDO 1 KG - KG',
    'PERNIL SUINO CUBOS 1 KG - KG',
    'AGF - PERNIL EM CUBOS 1 KG - KG',
    'PINHAO CONGELADO 1 KG - KG',
    'QUEIJO MUSSARELA FATIADO 400G - KG',
    'AMIDO DE MILHO 1 KG - KG',
    'ACUCAR CRISTAL 1 KG - KG',
    'ARROZ INTEGRAL 1 KG - KG',
    'AGF - ARROZ INTEGRAL 1 KG - KG',
    'ARROZ PARBOILIZADO 1 KG - KG',
    'AGF - ARROZ PARBOILIZADO 1 KG - KG',
    'AVEIA EM FLOCOS 400G - KG',
    'AVEIA EM FLOCOS 500 G - KG',
    'BISCOITO CASEIRO 1 KG - KG',
    'AGF - BISCOITO CASEIRO 1 KG - PCT',
    'CACAU EM PO 100% 1 KG - KG',
    'CAFE EM PO 500 G - KG',
    'CANELA EM PO 30 G - KG',
    'COLORAU EM PO 500 G - KG',
    'AGF - DOCE DE BANANA 700 G - KG',
    'DOCE DE BANANA ORGANICO 400 G - KG',
    'DOCE DE UVA ORGANICO 400 G - KG',
    'AGF - DOCE DE MORANGO 700 G - KG',
    'FARINHA DE MANDIOCA 1 KG - KG',
    'AGF - FARINHA DE MANDIOCA 1 KG - KG',
    'FARINHA DE TRIGO 1 KG - KG',
    'FARINHA DE TRIGO INTEGRAL 1 KG - KG',
    'FEIJAO PRETO 1 KG - KG',
    'AGF - FEIJAO PRETO 1 KG - PCT',
    'FEIJAO VERMELHO 1 KG - KG',
    'FERMENTO QUIMICO EM PO 200 G - KG',
    'FUBA 1 KG - KG',
    'AGF - FARINHA DE MILHO 1 KG - KG',
    'LEITE LONGA VIDA UHT INTEGRAL 1 LT - LT',
    'LENTILHA 400 G - KG',
    'MACARRAO CONCHINHA C/OVOS 500 G - KG',
    'MACARRAO ESPAGUETE C/OVOS 500 G - KG',
    'AGF - MACARRAO ESPAGUETE 1 KG - KG',
    'MACARRAO PARAFUSO C/OVOS 500 G - KG',
    'MACARRAO PENNE C/OVOS 500 G - KG',
    'MEL DE ABELHAS 1 KG - KG',
    'MILHO CANJICA 500 G - KG',
  ];

  @override
  void dispose() {
    _quantidadeController.dispose();
    _validadeController.dispose();
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

  void _limparCampos() {
    setState(() {
      _produtoSelecionado = null;
      _quantidadeController.clear();
      _validadeController.clear();
    });
  }

  void _adicionarProduto() {
    if (!_formKey.currentState!.validate()) return;

    // Validação adicional
    if (_produtoSelecionado == null || _produtoSelecionado!.isEmpty) {
      _mostrarErro('Selecione um produto');
      return;
    }
    if (!_produtosSet.contains(_produtoSelecionado)) {
      _mostrarErro('Produto inválido');
      return;
    }

    final quantidade = double.tryParse(_quantidadeController.text);
    if (quantidade == null || quantidade <= 0) {
      _mostrarErro('Quantidade deve ser maior que zero');
      return;
    }

    if (_validadeController.text.isEmpty) {
      _mostrarErro('Data de validade é obrigatória');
      return;
    }

    // Validar formato da data (DD/MM/AAAA)
    final dateRegex = RegExp(r'^\d{2}/\d{2}/\d{4}$');
    if (!dateRegex.hasMatch(_validadeController.text)) {
      _mostrarErro('Data deve estar no formato DD/MM/AAAA');
      return;
    }

    // Verificar se produto já existe na lista
    final produtoExistente = _produtosList.where((p) => p.nome == _produtoSelecionado).toList();
    if (produtoExistente.isNotEmpty) {
      _mostrarErro('Este produto já foi adicionado à contagem');
      return;
    }

    final novoProduto = ProdutoContagem(
      nome: _produtoSelecionado!,
      quantidade: quantidade,
      validade: _validadeController.text,
      lote: '', // Campo removido mas mantido para compatibilidade
    );

    setState(() {
      _produtosList.add(novoProduto);
    });

    _limparCampos();

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: const Text('Produto adicionado com sucesso!'),
        backgroundColor: AppColors.successGreen,
      ),
    );
  }

  void _removerProduto(int index) {
    setState(() {
      _produtosList.removeAt(index);
    });
  }

  void _editarProduto(int index) {
    final produto = _produtosList[index];
    
    setState(() {
      _produtoSelecionado = produto.nome;
      _quantidadeController.text = produto.quantidade.toString();
      _validadeController.text = produto.validade;
    });

    _produtosList.removeAt(index);
  }

  Future<void> _salvarContagem() async {
    if (!_formKey.currentState!.validate()) return;

    // Validações
    if (_escolaSelecionada == null || _escolaSelecionada!.isEmpty) {
      _mostrarErro('Selecione uma escola');
      return;
    }
    if (!_escolasSet.contains(_escolaSelecionada)) {
      _mostrarErro('Escola inválida');
      return;
    }

    if (_nutricionistaSelecionado == null || _nutricionistaSelecionado!.isEmpty) {
      _mostrarErro('Selecione um nutricionista');
      return;
    }
    if (!_nutricionistasSet.contains(_nutricionistaSelecionado)) {
      _mostrarErro('Nutricionista inválido');
      return;
    }

    if (_produtosList.isEmpty) {
      _mostrarErro('Adicione pelo menos um produto à contagem');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implementar salvamento real quando API estiver pronta
      await Future.delayed(const Duration(milliseconds: 300));
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Contagem salva com sucesso!'),
          backgroundColor: AppColors.successGreen,
        ),
      );
      
      // Limpar tudo
      setState(() {
        _escolaSelecionada = null;
        _nutricionistaSelecionado = null;
        _produtosList.clear();
      });
      _limparCampos();
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Erro ao salvar: $e'),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova Contagem de Estoque'),
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
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Formulário
                  Expanded(
                    child: SingleChildScrollView(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // Seção: Informações Básicas
                          _buildSectionTitle('Informações Básicas'),
                          const SizedBox(height: 16),
                          
                          // Escola
                          _buildSearchableDropdown(
                            value: _escolaSelecionada,
                            labelText: 'Escola',
                            prefixIcon: Icons.school,
                            items: _escolas,
                            onChanged: (value) {
                              setState(() {
                                _escolaSelecionada = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione a escola';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Nutricionista
                          _buildSearchableDropdown(
                            value: _nutricionistaSelecionado,
                            labelText: 'Nutricionista',
                            prefixIcon: Icons.person,
                            items: _nutricionistas,
                            onChanged: (value) {
                              setState(() {
                                _nutricionistaSelecionado = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione o nutricionista';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          
                          // Seção: Adicionar Produto
                          _buildSectionTitle('Adicionar Produto'),
                          const SizedBox(height: 16),
                          
                          // Produto
                          _buildSearchableDropdown(
                            value: _produtoSelecionado,
                            labelText: 'Produto',
                            prefixIcon: Icons.inventory,
                            items: _produtos,
                            onChanged: (value) {
                              setState(() {
                                _produtoSelecionado = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione o produto';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Quantidade e Data em linha
                          Row(
                            children: [
                              Expanded(
                                child: CustomTextField(
                                  controller: _quantidadeController,
                                  labelText: 'Quantidade',
                                  prefixIcon: Icons.scale,
                                  keyboardType: TextInputType.number,
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Digite a quantidade';
                                    }
                                    final quantidade = double.tryParse(value);
                                    if (quantidade == null || quantidade <= 0) {
                                      return 'Quantidade deve ser maior que zero';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: CustomTextField(
                                  controller: _validadeController,
                                  labelText: 'Data de Validade',
                                  prefixIcon: Icons.calendar_today,
                                  hintText: 'DD/MM/AAAA',
                                  validator: (value) {
                                    if (value == null || value.isEmpty) {
                                      return 'Digite a data';
                                    }
                                    final dateRegex = RegExp(r'^\d{2}/\d{2}/\d{4}$');
                                    if (!dateRegex.hasMatch(value)) {
                                      return 'Formato: DD/MM/AAAA';
                                    }
                                    return null;
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          
                          // Botão Adicionar Produto
                          CustomButton(
                            onPressed: _adicionarProduto,
                            child: const Text('Adicionar Produto'),
                          ),
                          const SizedBox(height: 24),
                          
                          // Seção: Produtos Adicionados
                          if (_produtosList.isNotEmpty) ...[
                            _buildSectionTitle('Produtos Adicionados (${_produtosList.length})'),
                            const SizedBox(height: 16),
                            
                            ..._produtosList.asMap().entries.map((entry) {
                              final index = entry.key;
                              final produto = entry.value;
                              return _buildProdutoCard(index, produto);
                            }).toList(),
                            
                            const SizedBox(height: 24),
                          ],
                          
                          // Botões
                          Row(
                            children: [
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : () {
                                    setState(() {
                                      _escolaSelecionada = null;
                                      _nutricionistaSelecionado = null;
                                      _produtosList.clear();
                                    });
                                    _limparCampos();
                                  },
                                  outlined: true,
                                  child: const Text('Limpar Tudo'),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : _salvarContagem,
                                  child: _isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                          ),
                                        )
                                      : const Text('Salvar Contagem'),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 20),
                        ],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildSectionTitle(String title) {
    return Padding(
      padding: const EdgeInsets.only(top: 20, bottom: 12),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.w600,
          color: AppColors.darkGray,
        ),
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

  Widget _buildProdutoCard(int index, ProdutoContagem produto) {
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
            Row(
              children: [
                Expanded(
                  child: Text(
                    produto.nome,
                    style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w600,
                      color: AppColors.darkGray,
                    ),
                  ),
                ),
                PopupMenuButton<String>(
                  icon: const Icon(Icons.more_vert),
                  onSelected: (value) {
                    if (value == 'edit') {
                      _editarProduto(index);
                    } else if (value == 'delete') {
                      _removerProduto(index);
                    }
                  },
                  itemBuilder: (context) => [
                    const PopupMenuItem(
                      value: 'edit',
                      child: Row(
                        children: [
                          Icon(Icons.edit, color: AppColors.primaryGreen),
                          SizedBox(width: 8),
                          Text('Editar'),
                        ],
                      ),
                    ),
                    const PopupMenuItem(
                      value: 'delete',
                      child: Row(
                        children: [
                          Icon(Icons.delete, color: AppColors.errorRed),
                          SizedBox(width: 8),
                          Text('Remover'),
                        ],
                      ),
                    ),
                  ],
                ),
              ],
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
            fontWeight: FontWeight.w500,
          ),
        ),
      ],
    );
  }
} 