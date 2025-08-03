import 'package:flutter/material.dart';
import 'package:conect_foods_app/widgets/custom_text_field.dart';
import 'package:conect_foods_app/widgets/custom_button.dart';
import 'package:conect_foods_app/widgets/searchable_dropdown.dart';
import 'package:conect_foods_app/utils/app_colors.dart';
import 'package:conect_foods_app/models/manutencao.dart';
import 'package:conect_foods_app/providers/auth_provider.dart';
import 'package:provider/provider.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:io';

class ManutencaoScreen extends StatefulWidget {
  const ManutencaoScreen({super.key});

  @override
  State<ManutencaoScreen> createState() => _ManutencaoScreenState();
}

class _ManutencaoScreenState extends State<ManutencaoScreen> {
  final _formKey = GlobalKey<FormState>();
  final _descricaoController = TextEditingController();
  final _dataController = TextEditingController();
  
  String? _escolaSelecionada;
  String? _nutricionistaLogado;
  
  bool _isLoading = false;
  
  // Controle das fotos
  final List<File?> _fotos = [null, null, null];
  final ImagePicker _picker = ImagePicker();
  
  // Cache para validações
  final Set<String> _escolasSet = _escolas.toSet();
  
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
  }

  void _carregarUsuarioLogado() {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);
    _nutricionistaLogado = authProvider.userName ?? 'Usuário';
  }

  @override
  void dispose() {
    _descricaoController.dispose();
    _dataController.dispose();
    super.dispose();
  }

  Future<void> _capturarFoto(int index) async {
    if (_isLoading) return;
    
    try {
      setState(() {
        _isLoading = true;
      });
      
      final XFile? photo = await _picker.pickImage(
        source: ImageSource.camera,
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
      
      final XFile? photo = await _picker.pickImage(
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

  void _mostrarErro(String mensagem) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(mensagem),
        backgroundColor: AppColors.errorRed,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    );
  }

  Widget _buildFotoButton(int index) {
    final foto = _fotos[index];
    final temFoto = foto != null;
    
    return GestureDetector(
      onTap: () => _mostrarOpcoesFoto(index),
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Nova Solicitação'),
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
            padding: const EdgeInsets.all(16),
            child: Form(
              key: _formKey,
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Card principal
                  Expanded(
                    child: SingleChildScrollView(
                      child: Container(
                        decoration: BoxDecoration(
                          color: AppColors.white,
                          borderRadius: BorderRadius.circular(16),
                          boxShadow: [AppColors.cardShadow],
                        ),
                        padding: const EdgeInsets.all(20),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // Título
                            Row(
                              children: [
                                Container(
                                  padding: const EdgeInsets.all(8),
                                  decoration: BoxDecoration(
                                    color: AppColors.primaryGreen.withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                  ),
                                  child: const Icon(
                                    Icons.build,
                                    color: AppColors.primaryGreen,
                                    size: 24,
                                  ),
                                ),
                                const SizedBox(width: 12),
                                const Expanded(
                                  child: Text(
                                    'Solicitação de Manutenção',
                                    style: TextStyle(
                                      fontSize: 20,
                                      fontWeight: FontWeight.bold,
                                      color: AppColors.darkGray,
                                    ),
                                  ),
                                ),
                              ],
                            ),
                            const SizedBox(height: 24),
                            
                            // Campo Escola
                            SearchableDropdown<String>(
                              labelText: 'Escola *',
                              hintText: 'Selecione a escola',
                              value: _escolaSelecionada,
                              items: _escolas.map((escola) => DropdownMenuItem(
                                value: escola,
                                child: Text(escola),
                              )).toList(),
                              onChanged: (value) {
                                setState(() {
                                  _escolaSelecionada = value;
                                });
                              },
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Selecione uma escola';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 24),
                            
                            // Campo Data
                            CustomTextField(
                              controller: _dataController,
                              labelText: 'Data *',
                              hintText: 'DD/MM/AAAA',
                              prefixIcon: Icons.calendar_today,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Informe a data';
                                }
                                // Validação básica de formato
                                if (!RegExp(r'^\d{2}/\d{2}/\d{4}$').hasMatch(value)) {
                                  return 'Formato inválido (DD/MM/AAAA)';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 24),
                            
                            // Campo Descrição
                            CustomTextField(
                              controller: _descricaoController,
                              labelText: 'Descrição do Problema *',
                              hintText: 'Descreva o problema que precisa de manutenção',
                              prefixIcon: Icons.description,
                              maxLines: 4,
                              validator: (value) {
                                if (value == null || value.isEmpty) {
                                  return 'Informe a descrição do problema';
                                }
                                if (value.length < 10) {
                                  return 'A descrição deve ter pelo menos 10 caracteres';
                                }
                                return null;
                              },
                            ),
                            const SizedBox(height: 32),
                            
                            // Seção de Fotos
                            const Text(
                              'Fotos do Problema',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                                color: AppColors.darkGray,
                              ),
                            ),
                            const SizedBox(height: 8),
                            const Text(
                              'Adicione fotos para melhor visualização do problema',
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
                                    Expanded(child: _buildFotoButton(0)),
                                    const SizedBox(width: 12),
                                    Expanded(child: _buildFotoButton(1)),
                                  ],
                                ),
                                const SizedBox(height: 12),
                                Row(
                                  children: [
                                    Expanded(child: _buildFotoButton(2)),
                                    const SizedBox(width: 12),
                                    const Expanded(child: SizedBox()), // Espaço vazio para manter alinhamento
                                  ],
                                ),
                              ],
                            ),
                            const SizedBox(height: 32),
                            
                            // Botão Salvar
                            SizedBox(
                              width: double.infinity,
                              child: CustomButton(
                                onPressed: _isLoading ? null : _salvarManutencao,
                                backgroundColor: AppColors.primaryGreen,
                                isLoading: _isLoading,
                                child: Text(
                                  _isLoading ? 'Salvando...' : 'Salvar Solicitação',
                                  style: const TextStyle(
                                    fontSize: 16,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
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
      ),
    );
  }

  void _salvarManutencao() async {
    if (!_formKey.currentState!.validate()) {
      return;
    }

    setState(() {
      _isLoading = true;
    });

    try {
      // Simular delay de salvamento
      await Future.delayed(const Duration(milliseconds: 300));

      // Criar objeto de manutenção
      final manutencao = Manutencao(
        carimboDataHora: DateTime.now().toIso8601String(),
        nutricionista: _nutricionistaLogado ?? 'Usuário',
        data: _dataController.text,
        escola: _escolaSelecionada!,
        descricao: _descricaoController.text,
        foto1: _fotos[0]?.path,
        foto2: _fotos[1]?.path,
        foto3: _fotos[2]?.path,
      );

      // Aqui você faria a integração com o backend
      print('Manutenção salva: ${manutencao.toJson()}');

      // Mostrar sucesso
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text('Solicitação de manutenção salva com sucesso!'),
            backgroundColor: AppColors.successGreen,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );

        // Limpar formulário
        _limparFormulario();
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: Text('Erro ao salvar: $e'),
            backgroundColor: AppColors.errorRed,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(8),
            ),
          ),
        );
      }
    } finally {
      if (mounted) {
        setState(() {
          _isLoading = false;
        });
      }
    }
  }

  void _limparFormulario() {
    setState(() {
      _escolaSelecionada = null;
      _fotos[0] = null;
      _fotos[1] = null;
      _fotos[2] = null;
    });
    _dataController.clear();
    _descricaoController.clear();
  }
} 