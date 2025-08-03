# 🍽️ Conect Foods App

Aplicativo Flutter para gestão de alimentos e equipamentos, seguindo o padrão visual dos sistemas CILS e Cotação.

## 📱 Funcionalidades

- **Autenticação**: Sistema de login com validação
- **Módulos**: Interface para acesso aos diferentes módulos do sistema
- **Design Responsivo**: Interface adaptável para diferentes tamanhos de tela
- **Tema Consistente**: Seguindo o padrão visual dos sistemas existentes

## 🚀 Tecnologias Utilizadas

- **Flutter**: Framework de desenvolvimento mobile
- **Provider**: Gerenciamento de estado
- **Google Fonts**: Tipografia personalizada
- **Shared Preferences**: Armazenamento local
- **HTTP/Dio**: Cliente HTTP para APIs (preparado para integração)

## 📋 Pré-requisitos

- Flutter SDK 3.0.0 ou superior
- Android Studio / VS Code
- Android SDK (para compilação Android)

## 🛠️ Instalação e Configuração

### 1. Clone o repositório
```bash
cd conect_foods_app
```

### 2. Instalar dependências
```bash
flutter pub get
```

### 3. Configurar Flutter SDK (se necessário)
Crie um arquivo `local.properties` na pasta `android/` com o caminho do seu Flutter SDK:
```properties
flutter.sdk=C:\\flutter
```

### 4. Executar o projeto
```bash
flutter run
```

## 📁 Estrutura do Projeto

```
lib/
├── main.dart                 # Ponto de entrada da aplicação
├── providers/               # Gerenciamento de estado
│   └── auth_provider.dart   # Provider de autenticação
├── screens/                 # Telas da aplicação
│   ├── login_screen.dart    # Tela de login
│   └── home_screen.dart     # Tela principal
├── widgets/                 # Widgets customizados
│   ├── custom_button.dart   # Botões personalizados
│   └── custom_text_field.dart # Campos de texto
└── utils/                   # Utilitários
    └── app_colors.dart      # Cores da aplicação
```

## 🎨 Design System

### Cores Principais
- **Verde Primário**: #4CAF50
- **Verde Escuro**: #388E3C
- **Verde Claro**: #81C784

### Cores Neutras
- **Branco**: #FFFFFF
- **Cinza Claro**: #F5F5F5
- **Cinza**: #757575
- **Cinza Escuro**: #333333

### Cores Secundárias
- **Azul**: #2196F3
- **Laranja**: #FF9800
- **Vermelho**: #F44336

## 🔧 Configuração para Android Studio

1. Abra o Android Studio
2. Selecione "Open an existing project"
3. Navegue até a pasta `conect_foods_app`
4. Aguarde a sincronização do Gradle
5. Execute o projeto em um emulador ou dispositivo

## 📱 Módulos Disponíveis

- **Patrimônio**: Gestão de equipamentos
- **Contagem**: Controle de estoque
- **NAE**: Nutrição Alimentar Escolar
- **Manutenção**: Solicitações de manutenção
- **Faturamento**: Relatórios financeiros
- **Ocorrências**: Gestão de problemas hortifruti

## 🔄 Próximos Passos

- [ ] Integração com APIs do backend
- [ ] Implementação dos módulos individuais
- [ ] Sistema de sincronização offline
- [ ] Captura de fotos e geolocalização
- [ ] Banco de dados local (SQLite)

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe de desenvolvimento.

---

**Desenvolvido com ❤️ para Conect Foods** 