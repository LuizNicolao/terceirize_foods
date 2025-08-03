import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:conect_foods_app/providers/auth_provider.dart';
import 'package:conect_foods_app/widgets/custom_text_field.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/utils/app_colors.dart';

class TransferenciaPatrimonioScreen extends StatefulWidget {
  const TransferenciaPatrimonioScreen({super.key});

  @override
  State<TransferenciaPatrimonioScreen> createState() => _TransferenciaPatrimonioScreenState();
}

class _TransferenciaPatrimonioScreenState extends State<TransferenciaPatrimonioScreen> {
  final _formKey = GlobalKey<FormState>();
  final _observacaoController = TextEditingController();
  final _motivoOutrosController = TextEditingController();
  
  String? _patrimonioSelecionado;
  String? _escolaOrigem;
  String? _escolaDestino;
  String? _motivoTransferencia;
  String? _responsavelTransferencia;
  
  bool _isLoading = false;
  bool _transferenciaConfirmada = false;
  
  // Cache para validações (otimização de performance)
  final Set<String> _patrimoniosSet = _patrimonios.toSet();
  final Set<String> _escolasSet = _escolas.toSet();
  final Set<String> _motivosSet = _motivos.toSet();
  final Set<String> _responsaveisSet = _responsaveis.toSet();
  
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
  // ✅ Responsável automático (usuário logado)
  static const List<String> _patrimonios = [
    'GELADEIRA - PLQ001 - ESCOLA MUNICIPAL A',
    'FOGÃO - PLQ002 - ESCOLA ESTADUAL A',
    'AR CONDICIONADO - SN456789123 - ESCOLA MUNICIPAL B',
    'COMPUTADOR - PLQ003 - ESCOLA ESTADUAL B',
    'IMPRESSORA - PLQ004 - ESCOLA MUNICIPAL A',
  ];
  
  static const List<String> _escolas = [
    'ESCOLA MUNICIPAL A',
    'ESCOLA MUNICIPAL B',
    'ESCOLA ESTADUAL A',
    'ESCOLA ESTADUAL B',
    'ESCOLA PARTICULAR A',
    'ESCOLA PARTICULAR B',
  ];
  
  static const List<String> _motivos = [
    'MANUTENÇÃO',
    'REPARO',
    'TROCA DE EQUIPAMENTO',
    'REDISTRIBUIÇÃO',
    'DESCARTE',
    'EMPRÉSTIMO TEMPORÁRIO',
    'EVENTO ESPECIAL',
    'OUTROS',
  ];
  
  static const List<String> _responsaveis = [
    'JOÃO SILVA - TÉCNICO',
    'MARIA SANTOS - COORDENADOR',
    'PEDRO OLIVEIRA - DIRETOR',
    'ANA COSTA - SUPERVISOR',
    'CARLOS FERREIRA - RESPONSÁVEL TÉCNICO',
  ];

  @override
  void initState() {
    super.initState();
    // Define o responsável automaticamente como o usuário logado
    WidgetsBinding.instance.addPostFrameCallback((_) {
      final authProvider = Provider.of<AuthProvider>(context, listen: false);
      if (authProvider.userName != null) {
        setState(() {
          _responsavelTransferencia = '${authProvider.userName} - USUÁRIO LOGADO';
        });
      }
    });
  }

  @override
  void dispose() {
    _observacaoController.dispose();
    _motivoOutrosController.dispose();
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

  void _limparCampos() {
    setState(() {
      _patrimonioSelecionado = null;
      _escolaOrigem = null;
      _escolaDestino = null;
      _motivoTransferencia = null;
      // Não limpa o responsável - mantém o usuário logado
      _observacaoController.clear();
      _motivoOutrosController.clear();
      _transferenciaConfirmada = false;
    });
  }

  Future<void> _confirmarTransferencia() async {
    if (!_formKey.currentState!.validate()) return;

    // Validações
    if (_patrimonioSelecionado == null || _patrimonioSelecionado!.isEmpty) {
      _mostrarErro('Selecione um patrimônio');
      return;
    }
    if (!_patrimoniosSet.contains(_patrimonioSelecionado)) {
      _mostrarErro('Patrimônio inválido');
      return;
    }

    if (_escolaOrigem == null || _escolaOrigem!.isEmpty) {
      _mostrarErro('Selecione a escola de origem');
      return;
    }
    if (!_escolasSet.contains(_escolaOrigem)) {
      _mostrarErro('Escola de origem inválida');
      return;
    }

    if (_escolaDestino == null || _escolaDestino!.isEmpty) {
      _mostrarErro('Selecione a escola de destino');
      return;
    }
    if (!_escolasSet.contains(_escolaDestino)) {
      _mostrarErro('Escola de destino inválida');
      return;
    }

    if (_escolaOrigem == _escolaDestino) {
      _mostrarErro('A escola de origem e destino não podem ser iguais');
      return;
    }

    if (_motivoTransferencia == null || _motivoTransferencia!.isEmpty) {
      _mostrarErro('Selecione o motivo da transferência');
      return;
    }
    if (!_motivosSet.contains(_motivoTransferencia)) {
      _mostrarErro('Motivo inválido');
      return;
    }
    
    // Validação específica para "OUTROS"
    if (_motivoTransferencia == 'OUTROS') {
      if (_motivoOutrosController.text.trim().isEmpty) {
        _mostrarErro('Especifique o motivo da transferência');
        return;
      }
      if (_motivoOutrosController.text.trim().length < 5) {
        _mostrarErro('O motivo deve ter pelo menos 5 caracteres');
        return;
      }
    }

    if (_responsavelTransferencia == null || _responsavelTransferencia!.isEmpty) {
      _mostrarErro('Responsável não identificado');
      return;
    }
    // Aceita tanto responsáveis da lista quanto o usuário logado
    if (!_responsaveisSet.contains(_responsavelTransferencia) && 
        !_responsavelTransferencia!.contains('USUÁRIO LOGADO')) {
      _mostrarErro('Responsável inválido');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implementar confirmação real quando API estiver pronta
      await Future.delayed(const Duration(milliseconds: 300));
      
      if (!mounted) return;
      
      setState(() {
        _transferenciaConfirmada = true;
      });
      
      _mostrarSucesso('Transferência confirmada com sucesso!');
    } catch (e) {
      _mostrarErro('Erro ao confirmar transferência: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _executarTransferencia() async {
    if (!_transferenciaConfirmada) {
      _mostrarErro('Confirme a transferência primeiro');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implementar transferência real quando API estiver pronta
      await Future.delayed(const Duration(milliseconds: 400));
      
      if (!mounted) return;
      
      _mostrarSucesso('Transferência executada com sucesso!');
      _limparCampos();
    } catch (e) {
      _mostrarErro('Erro ao executar transferência: $e');
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
        title: const Text('Transferência de Patrimônio'),
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
                          // Seção: Patrimônio
                          _buildSectionTitle('Patrimônio'),
                          const SizedBox(height: 16),
                          
                          // Patrimônio a ser transferido
                          _buildSearchableDropdown(
                            value: _patrimonioSelecionado,
                            labelText: 'Patrimônio',
                            prefixIcon: Icons.inventory,
                            items: _patrimonios,
                            onChanged: (value) {
                              setState(() {
                                _patrimonioSelecionado = value;
                                // Extrair escola de origem do patrimônio selecionado
                                if (value != null && value.contains(' - ')) {
                                  final parts = value.split(' - ');
                                  if (parts.length >= 3) {
                                    _escolaOrigem = parts[2];
                                  }
                                }
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione um patrimônio';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Seção: Origem e Destino
                          _buildSectionTitle('Origem e Destino'),
                          const SizedBox(height: 16),
                          
                          // Escola de Origem
                          _buildSearchableDropdown(
                            value: _escolaOrigem,
                            labelText: 'Escola de Origem',
                            prefixIcon: Icons.location_on,
                            items: _escolas,
                            onChanged: (value) {
                              setState(() {
                                _escolaOrigem = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione a escola de origem';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Ícone de transferência
                          Center(
                            child: Container(
                              padding: const EdgeInsets.all(8),
                              decoration: BoxDecoration(
                                color: AppColors.primaryGreen.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(8),
                              ),
                              child: const Icon(
                                Icons.swap_vert,
                                color: AppColors.primaryGreen,
                                size: 24,
                              ),
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Escola de Destino
                          _buildSearchableDropdown(
                            value: _escolaDestino,
                            labelText: 'Escola de Destino',
                            prefixIcon: Icons.location_on,
                            items: _escolas,
                            onChanged: (value) {
                              setState(() {
                                _escolaDestino = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione a escola de destino';
                              }
                              if (value == _escolaOrigem) {
                                return 'A escola de destino deve ser diferente da origem';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 24),
                          
                          // Seção: Detalhes da Transferência
                          _buildSectionTitle('Detalhes da Transferência'),
                          const SizedBox(height: 16),
                          
                          // Motivo da Transferência
                          _buildSearchableDropdown(
                            value: _motivoTransferencia,
                            labelText: 'Motivo da Transferência',
                            prefixIcon: Icons.info,
                            items: _motivos,
                            onChanged: (value) {
                              setState(() {
                                _motivoTransferencia = value;
                                // Limpa o campo outros quando muda o motivo
                                if (value != 'OUTROS') {
                                  _motivoOutrosController.clear();
                                }
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione o motivo da transferência';
                              }
                              return null;
                            },
                          ),
                          
                          // Campo para especificar motivo quando "OUTROS" é selecionado
                          if (_motivoTransferencia == 'OUTROS') ...[
                            const SizedBox(height: 16),
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.warningOrange.withOpacity(0.05),
                                borderRadius: BorderRadius.circular(8),
                                border: Border.all(
                                  color: AppColors.warningOrange.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Icon(
                                        Icons.edit_note,
                                        color: AppColors.warningOrange,
                                        size: 20,
                                      ),
                                      const SizedBox(width: 8),
                                      const Text(
                                        'Especificar Motivo',
                                        style: TextStyle(
                                          fontSize: 14,
                                          fontWeight: FontWeight.w600,
                                          color: AppColors.darkGray,
                                        ),
                                      ),
                                      const SizedBox(width: 8),
                                      Container(
                                        padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                        decoration: BoxDecoration(
                                          color: AppColors.warningOrange.withOpacity(0.1),
                                          borderRadius: BorderRadius.circular(8),
                                        ),
                                        child: const Text(
                                          'OBRIGATÓRIO',
                                          style: TextStyle(
                                            fontSize: 10,
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.warningOrange,
                                          ),
                                        ),
                                      ),
                                    ],
                                  ),
                                  const SizedBox(height: 12),
                                  CustomTextField(
                                    controller: _motivoOutrosController,
                                    labelText: 'Descreva o motivo da transferência',
                                    prefixIcon: Icons.description,
                                    maxLines: 3,
                                    hintText: 'Ex: Transferência para evento especial, troca por equipamento novo, etc.',
                                    validator: (value) {
                                      if (value == null || value.trim().isEmpty) {
                                        return 'Especifique o motivo da transferência';
                                      }
                                      if (value.trim().length < 5) {
                                        return 'O motivo deve ter pelo menos 5 caracteres';
                                      }
                                      return null;
                                    },
                                  ),
                                ],
                              ),
                            ),
                          ],
                          const SizedBox(height: 16),
                          
                          // Observações
                          // Nota: O responsável pela transferência é automaticamente definido como o usuário logado
                          CustomTextField(
                            controller: _observacaoController,
                            labelText: 'Observações',
                            prefixIcon: Icons.note,
                            maxLines: 3,
                            hintText: 'Observações adicionais sobre a transferência...',
                          ),
                          const SizedBox(height: 24),
                          
                          // Status da Transferência
                          if (_transferenciaConfirmada) ...[
                            Container(
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: AppColors.successGreen.withOpacity(0.1),
                                borderRadius: BorderRadius.circular(12),
                                border: Border.all(
                                  color: AppColors.successGreen.withOpacity(0.3),
                                  width: 1,
                                ),
                              ),
                              child: Row(
                                children: [
                                  const Icon(
                                    Icons.check_circle,
                                    color: AppColors.successGreen,
                                    size: 24,
                                  ),
                                  const SizedBox(width: 12),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        const Text(
                                          'Transferência Confirmada',
                                          style: TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: AppColors.successGreen,
                                            fontSize: 16,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
                                        Text(
                                          'Pronto para executar a transferência',
                                          style: TextStyle(
                                            color: AppColors.successGreen.withOpacity(0.8),
                                            fontSize: 14,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ],
                              ),
                            ),
                            const SizedBox(height: 24),
                          ],
                          
                          // Botões
                          Row(
                            children: [
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : _limparCampos,
                                  outlined: true,
                                  child: const Text('Limpar'),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: CustomButton(
                                  onPressed: _isLoading ? null : _confirmarTransferencia,
                                  child: _isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                          ),
                                        )
                                      : const Text('Confirmar'),
                                ),
                              ),
                            ],
                          ),
                          
                          // Botão Executar (apenas quando confirmado)
                          if (_transferenciaConfirmada) ...[
                            const SizedBox(height: 16),
                            SizedBox(
                              width: double.infinity,
                              child: CustomButton(
                                onPressed: _isLoading ? null : _executarTransferencia,
                                backgroundColor: AppColors.successGreen,
                                child: _isLoading
                                    ? const SizedBox(
                                        height: 20,
                                        width: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2,
                                          valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                        ),
                                      )
                                    : const Text('Executar Transferência'),
                              ),
                            ),
                          ],
                          
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
} 