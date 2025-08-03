class ContagemEstoque {
  final String? id;
  final String data;
  final String escola;
  final String nutricionista;
  final List<ProdutoContagem> produtos;
  final bool sincronizado;

  ContagemEstoque({
    this.id,
    required this.data,
    required this.escola,
    required this.nutricionista,
    required this.produtos,
    this.sincronizado = false,
  });

  int get quantidadeProdutos => produtos.length;

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'data': data,
      'escola': escola,
      'nutricionista': nutricionista,
      'produtos': produtos.map((p) => p.toJson()).toList(),
      'sincronizado': sincronizado,
    };
  }

  factory ContagemEstoque.fromJson(Map<String, dynamic> json) {
    return ContagemEstoque(
      id: json['id'],
      data: json['data'],
      escola: json['escola'],
      nutricionista: json['nutricionista'],
      produtos: (json['produtos'] as List)
          .map((p) => ProdutoContagem.fromJson(p))
          .toList(),
      sincronizado: json['sincronizado'] ?? false,
    );
  }
}

class ProdutoContagem {
  final String nome;
  final double quantidade;
  final String validade;
  final String lote;
  final String? observacao;

  ProdutoContagem({
    required this.nome,
    required this.quantidade,
    required this.validade,
    required this.lote,
    this.observacao,
  });

  Map<String, dynamic> toJson() {
    return {
      'nome': nome,
      'quantidade': quantidade,
      'validade': validade,
      'lote': lote,
      'observacao': observacao,
    };
  }

  factory ProdutoContagem.fromJson(Map<String, dynamic> json) {
    return ProdutoContagem(
      nome: json['nome'],
      quantidade: json['quantidade'].toDouble(),
      validade: json['validade'],
      lote: json['lote'],
      observacao: json['observacao'],
    );
  }

  ProdutoContagem copyWith({
    String? nome,
    double? quantidade,
    String? validade,
    String? lote,
    String? observacao,
  }) {
    return ProdutoContagem(
      nome: nome ?? this.nome,
      quantidade: quantidade ?? this.quantidade,
      validade: validade ?? this.validade,
      lote: lote ?? this.lote,
      observacao: observacao ?? this.observacao,
    );
  }
} 