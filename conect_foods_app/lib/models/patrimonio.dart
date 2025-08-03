class Patrimonio {
  final int? id;
  final String nome;
  final String empresa;
  final String? numero;
  final String? numeroSerie;
  final String estado;
  final String filial;
  final String escola;
  final String? observacao;
  final bool sincronizado;
  final String? foto1;
  final String? foto2;
  final String? foto3;
  final String? latLong;
  final String status;
  final bool patrimonioNaoLocalizado;
  final String? descricao;

  Patrimonio({
    this.id,
    required this.nome,
    required this.empresa,
    this.numero,
    this.numeroSerie,
    required this.estado,
    required this.filial,
    required this.escola,
    this.observacao,
    this.sincronizado = false,
    this.foto1,
    this.foto2,
    this.foto3,
    this.latLong,
    required this.status,
    this.patrimonioNaoLocalizado = false,
    this.descricao,
  });

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'nome': nome,
      'empresa': empresa,
      'numero': numero,
      'numeroSerie': numeroSerie,
      'estado': estado,
      'filial': filial,
      'escola': escola,
      'observacao': observacao,
      'sincronizado': sincronizado,
      'foto1': foto1,
      'foto2': foto2,
      'foto3': foto3,
      'latLong': latLong,
      'status': status,
      'patrimonioNaoLocalizado': patrimonioNaoLocalizado,
      'descricao': descricao,
    };
  }

  factory Patrimonio.fromJson(Map<String, dynamic> json) {
    return Patrimonio(
      id: json['id'],
      nome: json['nome'],
      empresa: json['empresa'],
      numero: json['numero'],
      numeroSerie: json['numeroSerie'],
      estado: json['estado'],
      filial: json['filial'],
      escola: json['escola'],
      observacao: json['observacao'],
      sincronizado: json['sincronizado'] ?? false,
      foto1: json['foto1'],
      foto2: json['foto2'],
      foto3: json['foto3'],
      latLong: json['latLong'],
      status: json['status'],
      patrimonioNaoLocalizado: json['patrimonioNaoLocalizado'] ?? false,
      descricao: json['descricao'],
    );
  }

  Patrimonio copyWith({
    int? id,
    String? nome,
    String? empresa,
    String? numero,
    String? numeroSerie,
    String? estado,
    String? filial,
    String? escola,
    String? observacao,
    bool? sincronizado,
    String? foto1,
    String? foto2,
    String? foto3,
    String? latLong,
    String? status,
    bool? patrimonioNaoLocalizado,
    String? descricao,
  }) {
    return Patrimonio(
      id: id ?? this.id,
      nome: nome ?? this.nome,
      empresa: empresa ?? this.empresa,
      numero: numero ?? this.numero,
      numeroSerie: numeroSerie ?? this.numeroSerie,
      estado: estado ?? this.estado,
      filial: filial ?? this.filial,
      escola: escola ?? this.escola,
      observacao: observacao ?? this.observacao,
      sincronizado: sincronizado ?? this.sincronizado,
      foto1: foto1 ?? this.foto1,
      foto2: foto2 ?? this.foto2,
      foto3: foto3 ?? this.foto3,
      latLong: latLong ?? this.latLong,
      status: status ?? this.status,
      patrimonioNaoLocalizado: patrimonioNaoLocalizado ?? this.patrimonioNaoLocalizado,
      descricao: descricao ?? this.descricao,
    );
  }
} 