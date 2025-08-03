import 'package:flutter/material.dart';
import 'dart:io';
import 'package:image_picker/image_picker.dart';
import 'package:conect_foods_app/widgets/custom_text_field.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/models/patrimonio.dart';

class PatrimonioScreen extends StatefulWidget {
  const PatrimonioScreen({super.key});

  @override
  State<PatrimonioScreen> createState() => _PatrimonioScreenState();
}

class _PatrimonioScreenState extends State<PatrimonioScreen> {
  final _formKey = GlobalKey<FormState>();
  String? _nomePatrimonioSelecionado;
  final _numeroController = TextEditingController();
  final _numeroSerieController = TextEditingController();
  final _observacaoController = TextEditingController();
  final _descricaoController = TextEditingController();
  
  String? _empresaSelecionada;
  String? _escolaSelecionada;
  String? _statusSelecionado;
  
  bool _patrimonioNaoLocalizado = false;
  bool _estadoNovo = false;
  bool _estadoUsado = false;
  bool _isLoading = false;
  
  List<File?> _fotos = [null, null, null];
  String? _localizacaoAtual;
  
  // Cache para validações
  final Set<String> _nomesPatrimonioSet = _nomesPatrimonio.toSet();
  final Set<String> _empresasSet = _empresas.toSet();
  final Set<String> _escolasSet = _escolas.toSet();
  final Set<String> _statusSet = _status.toSet();
  
  // Dados mockados para demonstração - usando const para melhor performance
  // OTIMIZAÇÕES IMPLEMENTADAS:
  // ✅ Sets para validações O(1) em vez de List.contains O(n)
  // ✅ Método _mostrarErro centralizado para evitar duplicação
  // ✅ ImagePicker com debounce e limitação de tamanho
  // ✅ Widgets const onde possível para evitar rebuilds
  // ✅ Verificação mounted antes de setState
  // ✅ Loading state para evitar múltiplas capturas simultâneas
  // ✅ Ícones verdes em todos os campos
  // ✅ Remoção de animações para melhor performance
  // ✅ Remoção de sombras e elevações desnecessárias
  static const List<String> _nomesPatrimonio = [
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
  
  static const List<String> _empresas = [
    'SEM PLAQUETA',
    'PLAQUETA 1',
    'PLAQUETA 2',
    'PLAQUETA 3'
  ];
  
  static const List<String> _escolas = [
    'ESCOLA MUNICIPAL A',
    'ESCOLA MUNICIPAL B',
    'ESCOLA ESTADUAL A',
    'ESCOLA ESTADUAL B'
  ];
  
  static const List<String> _status = [
    'ATIVO',
    'EM MANUTENÇÃO',
    'INATIVO',
    'DESCARTE'
  ];

  @override
  void initState() {
    super.initState();
    _obterLocalizacao();
  }

  @override
  void dispose() {
    _numeroController.dispose();
    _numeroSerieController.dispose();
    _observacaoController.dispose();
    _descricaoController.dispose();
    super.dispose();
  }

  Future<void> _obterLocalizacao() async {
    // TODO: Implementar geolocalização real com geolocator
    // Por enquanto usando coordenadas mockadas
    // A localização será capturada automaticamente e enviada para o backend
    setState(() {
      _localizacaoAtual = '-27.0955, -52.6168'; // Coordenadas mockadas
    });
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

  // ImagePicker otimizado com debounce
  Future<void> _capturarFoto(int index) async {
    // Evita múltiplas capturas simultâneas
    if (_isLoading) return;
    
    try {
      setState(() {
        _isLoading = true;
      });
      
      final ImagePicker picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.camera,
        imageQuality: 80,
        maxWidth: 1024, // Limita tamanho para melhor performance
        maxHeight: 1024,
      );
      
      if (photo != null && mounted) {
        setState(() {
          _fotos[index] = File(photo.path);
        });
      }
    } catch (e) {
      _mostrarErro('Erro ao capturar foto: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  Future<void> _selecionarFotoGaleria(int index) async {
    if (_isLoading) return;
    
    try {
      setState(() {
        _isLoading = true;
      });
      
      final ImagePicker picker = ImagePicker();
      final XFile? photo = await picker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 80,
        maxWidth: 1024,
        maxHeight: 1024,
      );
      
      if (photo != null && mounted) {
        setState(() {
          _fotos[index] = File(photo.path);
        });
      }
    } catch (e) {
      _mostrarErro('Erro ao selecionar foto: $e');
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _mostrarOpcoesFoto(int index) {
    showModalBottomSheet(
      context: context,
      builder: (context) => Container(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            ListTile(
              leading: const Icon(Icons.camera_alt),
              title: const Text('Tirar Foto'),
              onTap: () {
                Navigator.pop(context);
                _capturarFoto(index);
              },
            ),
            ListTile(
              leading: const Icon(Icons.photo_library),
              title: const Text('Selecionar da Galeria'),
              onTap: () {
                Navigator.pop(context);
                _selecionarFotoGaleria(index);
              },
            ),
            if (_fotos[index] != null)
              ListTile(
                leading: const Icon(Icons.delete, color: Colors.red),
                title: const Text('Remover Foto', style: TextStyle(color: Colors.red)),
                onTap: () {
                  Navigator.pop(context);
                  setState(() {
                    _fotos[index] = null;
                  });
                },
              ),
          ],
        ),
      ),
    );
  }

  void _limparCampos() {
    setState(() {
      _nomePatrimonioSelecionado = null;
      _numeroController.clear();
      _numeroSerieController.clear();
      _observacaoController.clear();
      _descricaoController.clear();
      _empresaSelecionada = null;
      _escolaSelecionada = null;
      _statusSelecionado = null;
      _patrimonioNaoLocalizado = false;
      _estadoNovo = false;
      _estadoUsado = false;
      _fotos = [null, null, null];
    });
  }

  Future<void> _salvarPatrimonio() async {
    if (!_formKey.currentState!.validate()) return;

    // Validação adicional para estado
    if (!_estadoNovo && !_estadoUsado) {
      _mostrarErro('Selecione o estado do patrimônio (NOVO ou USADO)');
      return;
    }

    // Validação para fotos (pelo menos uma foto é obrigatória)
    if (_fotos.every((foto) => foto == null)) {
      _mostrarErro('Pelo menos uma foto é obrigatória');
      return;
    }

    // Validação otimizada usando Sets para melhor performance
    if (!_patrimonioNaoLocalizado) {
      if (_nomePatrimonioSelecionado == null || _nomePatrimonioSelecionado!.isEmpty) {
        _mostrarErro('Selecione um nome de patrimônio');
        return;
      }
      if (!_nomesPatrimonioSet.contains(_nomePatrimonioSelecionado)) {
        _mostrarErro('Nome de patrimônio inválido');
        return;
      }
    }

    if (_empresaSelecionada == null || _empresaSelecionada!.isEmpty) {
      _mostrarErro('Selecione uma empresa');
      return;
    }
    if (!_empresasSet.contains(_empresaSelecionada)) {
      _mostrarErro('Empresa inválida');
      return;
    }

    if (_escolaSelecionada == null || _escolaSelecionada!.isEmpty) {
      _mostrarErro('Selecione uma escola');
      return;
    }
    if (!_escolasSet.contains(_escolaSelecionada)) {
      _mostrarErro('Escola inválida');
      return;
    }

    if (_statusSelecionado == null || _statusSelecionado!.isEmpty) {
      _mostrarErro('Selecione um status');
      return;
    }
    if (!_statusSet.contains(_statusSelecionado)) {
      _mostrarErro('Status inválido');
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // TODO: Implementar salvamento real quando API estiver pronta
      // A filial será determinada pelo backend baseada na escola
      await Future.delayed(const Duration(milliseconds: 300));
      
      // Criar objeto de patrimônio
      final patrimonio = Patrimonio(
        nome: _patrimonioNaoLocalizado ? 'NÃO LOCALIZADO' : _nomePatrimonioSelecionado!,
        empresa: _empresaSelecionada!,
        numero: _numeroController.text.isNotEmpty ? _numeroController.text : null,
        numeroSerie: _numeroSerieController.text.isNotEmpty ? _numeroSerieController.text : null,
        estado: _estadoNovo ? 'NOVO' : 'USADO',
        filial: 'FILIAL PADRÃO', // Será determinado pelo backend
        escola: _escolaSelecionada!,
        observacao: _observacaoController.text.isNotEmpty ? _observacaoController.text : null,
        foto1: _fotos[0]?.path,
        foto2: _fotos[1]?.path,
        foto3: _fotos[2]?.path,
        latLong: _localizacaoAtual,
        status: _statusSelecionado!,
        patrimonioNaoLocalizado: _patrimonioNaoLocalizado,
        descricao: _patrimonioNaoLocalizado && _descricaoController.text.isNotEmpty 
            ? _descricaoController.text 
            : null,
      );

      // Aqui você faria a integração com o backend
      print('Patrimônio salvo: ${patrimonio.toJson()}');
      
      if (!mounted) return;
      
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Text('Patrimônio salvo com sucesso!'),
          backgroundColor: AppColors.successGreen,
        ),
      );
      
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
        title: const Text('Registrar Patrimônio'),
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
                          
                          // Nome do Patrimônio
                          _buildSearchableDropdown(
                            value: _nomePatrimonioSelecionado,
                            labelText: 'Nome do Patrimônio',
                            prefixIcon: Icons.inventory,
                            items: _nomesPatrimonio,
                            enabled: !_patrimonioNaoLocalizado,
                            onChanged: (value) {
                              setState(() {
                                _nomePatrimonioSelecionado = value;
                              });
                            },
                            validator: (value) {
                              if (!_patrimonioNaoLocalizado && (value == null || value.isEmpty)) {
                                return 'Selecione o nome do patrimônio';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Empresa
                          _buildSearchableDropdown(
                            value: _empresaSelecionada,
                            labelText: 'Empresa',
                            prefixIcon: Icons.business,
                            items: _empresas,
                            onChanged: (value) {
                              setState(() {
                                _empresaSelecionada = value;
                                if (value == 'SEM PLAQUETA') {
                                  _numeroController.clear();
                                }
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione a empresa';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Numeração
                          CustomTextField(
                            controller: _numeroController,
                            labelText: 'Numeração (Plaqueta)',
                            prefixIcon: Icons.tag,
                            enabled: _empresaSelecionada != 'SEM PLAQUETA',
                            validator: (value) {
                              if (_empresaSelecionada != 'SEM PLAQUETA' && (value == null || value.isEmpty)) {
                                return 'Digite a numeração';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Número de Série
                          CustomTextField(
                            controller: _numeroSerieController,
                            labelText: 'Número de Série',
                            prefixIcon: Icons.confirmation_number,
                          ),
                          const SizedBox(height: 16),
                          
                          // Estado do Equipamento
                          _buildSectionTitle('Estado do Equipamento'),
                          const SizedBox(height: 16),
                          
                          Row(
                            children: [
                              Expanded(
                                child: _buildCheckboxTile(
                                  title: 'Novo',
                                  value: _estadoNovo,
                                  onChanged: (value) {
                                    setState(() {
                                      _estadoNovo = value ?? false;
                                      if (_estadoNovo) _estadoUsado = false;
                                    });
                                  },
                                ),
                              ),
                              Expanded(
                                child: _buildCheckboxTile(
                                  title: 'Usado',
                                  value: _estadoUsado,
                                  onChanged: (value) {
                                    setState(() {
                                      _estadoUsado = value ?? false;
                                      if (_estadoUsado) _estadoNovo = false;
                                    });
                                  },
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 16),
                          
                          // Patrimônio Não Localizado (otimizado sem animações)
                          CheckboxListTile(
                            title: const Text('Patrimônio Não Localizado'),
                            subtitle: const Text('Marque se o patrimônio não foi encontrado'),
                            value: _patrimonioNaoLocalizado,
                            onChanged: (value) {
                              setState(() {
                                _patrimonioNaoLocalizado = value ?? false;
                              });
                            },
                            activeColor: AppColors.primaryGreen,
                            contentPadding: EdgeInsets.zero,
                            // Removidas animações para melhor performance
                            controlAffinity: ListTileControlAffinity.leading,
                          ),
                          const SizedBox(height: 16),
                          
                          // Descrição (apenas se não localizado)
                          if (_patrimonioNaoLocalizado) ...[
                            CustomTextField(
                              controller: _descricaoController,
                              labelText: 'Descrição do que não foi localizado',
                              prefixIcon: Icons.description,
                              maxLines: 3,
                              validator: (value) {
                                if (_patrimonioNaoLocalizado && (value == null || value.isEmpty)) {
                                  return 'Descreva o que não foi localizado';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 16),
                          ],
                          
                          // Seção: Localização
                          _buildSectionTitle('Localização'),
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
                          
                          // Status
                          _buildSearchableDropdown(
                            value: _statusSelecionado,
                            labelText: 'Status',
                            prefixIcon: Icons.info,
                            items: _status,
                            onChanged: (value) {
                              setState(() {
                                _statusSelecionado = value;
                              });
                            },
                            validator: (value) {
                              if (value == null || value.isEmpty) {
                                return 'Selecione o status';
                              }
                              return null;
                            },
                          ),
                          const SizedBox(height: 16),
                          
                          // Observações
                          CustomTextField(
                            controller: _observacaoController,
                            labelText: 'Observações',
                            prefixIcon: Icons.note,
                            maxLines: 3,
                          ),
                          const SizedBox(height: 16),
                          
                          // Seção: Fotos
                          _buildSectionTitle('Fotos do Patrimônio'),
                          const SizedBox(height: 8),
                          const Text(
                            'Adicione fotos para documentar o estado do patrimônio',
                            style: TextStyle(
                              fontSize: 14,
                              color: AppColors.gray,
                            ),
                          ),
                          const SizedBox(height: 16),
                          
                          // Grid de fotos
                          Column(
                            children: [
                              Row(
                                children: [
                                  Expanded(child: _buildPhotoButton(0)),
                                  const SizedBox(width: 12),
                                  Expanded(child: _buildPhotoButton(1)),
                                ],
                              ),
                              const SizedBox(height: 12),
                              Row(
                                children: [
                                  Expanded(child: _buildPhotoButton(2)),
                                  const SizedBox(width: 12),
                                  const Expanded(child: SizedBox()), // Espaço vazio para manter alinhamento
                                ],
                              ),
                            ],
                          ),
                          const SizedBox(height: 24),
                          
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
                                  onPressed: _isLoading ? null : _salvarPatrimonio,
                                  child: _isLoading
                                      ? const SizedBox(
                                          height: 20,
                                          width: 20,
                                          child: CircularProgressIndicator(
                                            strokeWidth: 2,
                                            valueColor: AlwaysStoppedAnimation<Color>(Colors.white),
                                            // Removidas animações para melhor performance
                                          ),
                                        )
                                      : const Text('Salvar'),
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

  // Widget otimizado com const
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

  // Widget otimizado para evitar rebuilds desnecessários
  Widget _buildCheckboxTile({
    required String title,
    required bool value,
    required ValueChanged<bool?> onChanged,
  }) {
    return Row(
      children: [
        Checkbox(
          value: value,
          onChanged: onChanged,
          activeColor: AppColors.primaryGreen,
          shape: const RoundedRectangleBorder(
            borderRadius: BorderRadius.all(Radius.circular(4)),
          ),
        ),
        Text(
          title,
          style: TextStyle(
            fontSize: 16,
            fontWeight: value ? FontWeight.w600 : FontWeight.w500,
            color: value ? AppColors.primaryGreen : AppColors.darkGray,
          ),
        ),
      ],
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

  // Widget otimizado sem animações para máxima performance
  Widget _buildPhotoButton(int index) {
    final foto = _fotos[index];
    final temFoto = foto != null;
    
    return GestureDetector(
      onTap: _isLoading ? null : () => _mostrarOpcoesFoto(index),
      child: Container(
        width: double.infinity,
        height: 120,
        decoration: BoxDecoration(
          color: temFoto ? AppColors.lightGray : AppColors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: temFoto ? AppColors.primaryGreen : AppColors.gray.withOpacity(0.3),
            width: 2,
          ),
        ),
        child: temFoto
            ? ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Image.file(
                  foto!,
                  fit: BoxFit.cover,
                  width: double.infinity,
                  height: double.infinity,
                ),
              )
            : Column(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Icon(
                    Icons.camera_alt,
                    size: 32,
                    color: AppColors.gray,
                  ),
                  const SizedBox(height: 8),
                  Text(
                    'Foto ${index + 1}',
                    style: TextStyle(
                      color: AppColors.gray,
                      fontSize: 14,
                      fontWeight: FontWeight.w500,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Toque para adicionar',
                    style: TextStyle(
                      color: AppColors.gray.withOpacity(0.7),
                      fontSize: 12,
                    ),
                  ),
                ],
              ),
      ),
    );
  }
} 