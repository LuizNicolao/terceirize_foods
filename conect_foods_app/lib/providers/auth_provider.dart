import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class AuthProvider extends ChangeNotifier {
  bool _isAuthenticated = false;
  String? _userToken;
  String? _userName;
  String? _userEmail;

  bool get isAuthenticated => _isAuthenticated;
  String? get userToken => _userToken;
  String? get userName => _userName;
  String? get userEmail => _userEmail;

  AuthProvider() {
    _loadAuthState().then((_) {
      // Estado carregado com sucesso
    }).catchError((error) {
      debugPrint('Erro ao carregar estado de autenticação: $error');
    });
  }

  Future<void> _loadAuthState() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      _userToken = prefs.getString('user_token');
      _userName = prefs.getString('user_name');
      _userEmail = prefs.getString('user_email');
      _isAuthenticated = _userToken != null;
      notifyListeners();
    } catch (e) {
      debugPrint('Erro ao carregar dados do SharedPreferences: $e');
    }
  }

  Future<bool> login(String email, String password) async {
    try {
      // TODO: Implementar chamada real para API quando estiver pronta
      // Por enquanto, simula um login bem-sucedido
      await Future.delayed(const Duration(milliseconds: 300));
      
      // Simula dados de resposta da API
      _userToken = 'mock_token_${DateTime.now().millisecondsSinceEpoch}';
      _userName = 'Usuário Teste';
      _userEmail = email;
      _isAuthenticated = true;

      // Salva no SharedPreferences
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString('user_token', _userToken!);
      await prefs.setString('user_name', _userName!);
      await prefs.setString('user_email', _userEmail!);

      notifyListeners();
      return true;
    } catch (e) {
      debugPrint('Erro no login: $e');
      return false;
    }
  }

  Future<void> logout() async {
    _isAuthenticated = false;
    _userToken = null;
    _userName = null;
    _userEmail = null;

    // Remove dados do SharedPreferences
    final prefs = await SharedPreferences.getInstance();
    await prefs.remove('user_token');
    await prefs.remove('user_name');
    await prefs.remove('user_email');

    notifyListeners();
  }

  Future<void> checkAuthStatus() async {
    await _loadAuthState();
  }
} 