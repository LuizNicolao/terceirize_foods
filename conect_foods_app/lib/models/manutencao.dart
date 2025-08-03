class Manutencao {
  final int? id;
  final String carimboDataHora;
  final String nutricionista;
  final String data;
  final String escola;
  final String descricao;
  final String? foto1;
  final String? foto2;
  final String? foto3;
  final bool sincronizado;

  Manutencao({
    this.id,
    required this.carimboDataHora,
    required this.nutricionista,
    required this.data,
    required this.escola,
    required this.descricao,
    this.foto1,
    this.foto2,
    this.foto3,
    this.sincronizado = false,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'carimboDataHora': carimboDataHora,
      'nutricionista': nutricionista,
      'data': data,
      'escola': escola,
      'descricao': descricao,
      'foto1': foto1,
      'foto2': foto2,
      'foto3': foto3,
      'sincronizado': sincronizado,
    };
  }

  factory Manutencao.fromJson(Map<String, dynamic> json) {
    return Manutencao(
      id: json['id'],
      carimboDataHora: json['carimboDataHora'] ?? '',
      nutricionista: json['nutricionista'] ?? '',
      data: json['data'] ?? '',
      escola: json['escola'] ?? '',
      descricao: json['descricao'] ?? '',
      foto1: json['foto1'],
      foto2: json['foto2'],
      foto3: json['foto3'],
      sincronizado: json['sincronizado'] ?? false,
    );
  }

  Manutencao copyWith({
    int? id,
    String? carimboDataHora,
    String? nutricionista,
    String? data,
    String? escola,
    String? descricao,
    String? foto1,
    String? foto2,
    String? foto3,
    bool? sincronizado,
  }) {
    return Manutencao(
      id: id ?? this.id,
      carimboDataHora: carimboDataHora ?? this.carimboDataHora,
      nutricionista: nutricionista ?? this.nutricionista,
      data: data ?? this.data,
      escola: escola ?? this.escola,
      descricao: descricao ?? this.descricao,
      foto1: foto1 ?? this.foto1,
      foto2: foto2 ?? this.foto2,
      foto3: foto3 ?? this.foto3,
      sincronizado: sincronizado ?? this.sincronizado,
    );
  }
} 