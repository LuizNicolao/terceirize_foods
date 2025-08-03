import 'package:flutter/material.dart';

class AppColors {
  // Cores Principais (seguindo o padrão do CILS e Cotação)
  static const Color primaryGreen = Color(0xFF4CAF50);
  static const Color darkGreen = Color(0xFF388E3C);
  static const Color lightGreen = Color(0xFF81C784);
  
  // Cores Neutras
  static const Color white = Color(0xFFFFFFFF);
  static const Color lightGray = Color(0xFFF5F5F5);
  static const Color gray = Color(0xFF757575);
  static const Color darkGray = Color(0xFF333333);
  
  // Cores Secundárias
  static const Color blue = Color(0xFF2196F3);
  static const Color orange = Color(0xFFFF9800);
  static const Color errorRed = Color(0xFFF44336);
  static const Color successGreen = Color(0xFF4CAF50);
  static const Color warningOrange = Color(0xFFFF9800);
  static const Color warningYellow = Color(0xFFFFCC00);
  
  // Gradientes
  static const LinearGradient primaryGradient = LinearGradient(
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
    colors: [primaryGreen, darkGreen],
  );
  
  // Sombras
  static BoxShadow cardShadow = BoxShadow(
    color: Colors.black.withOpacity(0.1),
    blurRadius: 8,
    offset: const Offset(0, 2),
  );
  
  static BoxShadow buttonShadow = BoxShadow(
    color: primaryGreen.withOpacity(0.3),
    blurRadius: 8,
    offset: const Offset(0, 4),
  );
} 