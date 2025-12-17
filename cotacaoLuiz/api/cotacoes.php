<?php
// Configurar tratamento de erros
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não exibir erros diretamente

// Verificar e configurar diretório de uploads
$uploadDir = __DIR__ . '/../uploads/';
if (!is_dir($uploadDir)) {
    mkdir($uploadDir, 0777, true);
}

if (!is_writable($uploadDir)) {
    chmod($uploadDir, 0777);
    // Verificar novamente após a tentativa de correção
    if (!is_writable($uploadDir)) {
        error_log("ERRO: Diretório de uploads não tem permissões de escrita: " . $uploadDir);
    }
}

// Limpar qualquer saída anterior
while (ob_get_level()) {
    ob_end_clean();
}

// Definir cabeçalho JSON
header('Content-Type: application/json');
header('Cache-Control: no-cache, must-revalidate');

// Configurar para retornar erros detalhados em formato JSON
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => get_class($e),
        'message' => $e->getMessage(),
        'file' => $e->getFile(),
        'line' => $e->getLine(),
        'trace' => $e->getTraceAsString()
    ]);
    exit;
});

// Aumentar limites de upload se necessário
ini_set('upload_max_filesize', '10M');
ini_set('post_max_size', '10M');
ini_set('max_execution_time', 300);


session_start();
require_once '../config/database.php';
require_once '../includes/notifications.php';

// Verificação inicial da sessão e do usuário
if (!isset($_SESSION['usuario'])) {
    http_response_code(401);
    exit(json_encode(['success' => false, 'message' => 'Não autorizado']));
}

$conn = conectarDB();

// Verificar e corrigir o ID do usuário na sessão, se necessário
if (isset($_SESSION['usuario']) && isset($_SESSION['usuario']['id'])) {
    // Verificar se o usuário existe no banco de dados
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
    $stmt->execute([$_SESSION['usuario']['id']]);
    if (!$stmt->fetch()) {
        // Se o usuário não existir, tentar encontrar um usuário válido
        $stmt = $conn->prepare("SELECT id FROM usuarios LIMIT 1");
        $stmt->execute();
        $usuarioId = $stmt->fetchColumn();
        
        if ($usuarioId) {
            // Atualizar a sessão com um ID válido
            $_SESSION['usuario']['id'] = $usuarioId;
        } else {
            // Se não houver usuários no banco de dados, isso é um problema mais sério
            error_log("ALERTA: Não há usuários no banco de dados!");
        }
    }
}

// Verificar e criar coluna arquivo_cotacao se não existir
try {
    // Verificar se a coluna existe na tabela cotacoes
    $stmt = $conn->query("SHOW COLUMNS FROM cotacoes LIKE 'arquivo_cotacao'");
    if ($stmt->rowCount() === 0) {
        $conn->exec("ALTER TABLE cotacoes ADD COLUMN arquivo_cotacao VARCHAR(255) NULL");
    }
    
    // Verificar se a coluna existe na tabela itens_cotacao
    $stmt = $conn->query("SHOW COLUMNS FROM itens_cotacao LIKE 'arquivo_cotacao'");
    if ($stmt->rowCount() === 0) {
        $conn->exec("ALTER TABLE itens_cotacao ADD COLUMN arquivo_cotacao VARCHAR(255) NULL");
    }

    // Verificar se a coluna Centro de Distribuição existe na tabela cotacoes
    $stmt = $conn->query("SHOW COLUMNS FROM cotacoes LIKE 'centro_distribuicao'");
    if ($stmt->rowCount() === 0) {
        $conn->exec("ALTER TABLE cotacoes ADD COLUMN centro_distribuicao ENUM('CD CHAPECO', 'CD CURITIBANOS', 'CD TOLEDO', 'MANUTENÇÃO CHAPECO', 'MANUTENÇÃO CURITIBANOS', 'MANUTENÇÃO TOLEDO') NOT NULL DEFAULT 'CD CHAPECO'");
    } else {
        // Atualizar o ENUM para incluir os novos valores
        $conn->exec("ALTER TABLE cotacoes MODIFY COLUMN centro_distribuicao ENUM('CD CHAPECO', 'CD CURITIBANOS', 'CD TOLEDO', 'MANUTENÇÃO CHAPECO', 'MANUTENÇÃO CURITIBANOS', 'MANUTENÇÃO TOLEDO') NOT NULL DEFAULT 'CD CHAPECO'");
    }
} catch (Exception $e) {
    error_log("Erro ao verificar/criar coluna arquivo_cotacao: " . $e->getMessage());
}

try {
    switch ($_SERVER['REQUEST_METHOD']) {
        case 'GET':
            if (isset($_GET['id'])) {
                try {
                    // Buscar dados da cotação
                    $stmt = $conn->prepare("
                        SELECT c.*, u.nome as usuario_nome, u.id as usuario_id
                        FROM cotacoes c
                        LEFT JOIN usuarios u ON c.usuario_id = u.id
                        WHERE c.id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $cotacao = $stmt->fetch(PDO::FETCH_ASSOC);

                    if (!$cotacao) {
                        http_response_code(404);
                        echo json_encode(['success' => false, 'message' => 'Cotação não encontrada']);
                        exit;
                    }

                    // Se a cotação estiver aprovada, buscar dados da tabela sawing
                    if ($cotacao['status'] === 'aprovado') {
                        // Buscar dados do sawing
                        $stmt = $conn->prepare("
                            SELECT s.*, u.nome as comprador_nome
                            FROM sawing s
                            LEFT JOIN usuarios u ON s.usuario_id = u.id
                            WHERE s.cotacao_id = ?
                        ");
                        $stmt->execute([$_GET['id']]);
                        $sawing = $stmt->fetch(PDO::FETCH_ASSOC);

                        if ($sawing) {
                            // Atualizar dados da cotação com informações do sawing
                            $cotacao['data_aprovacao'] = $sawing['data_aprovacao'];
                            $cotacao['observacoes'] = $sawing['observacoes'];
                            $cotacao['valor_total_inicial'] = $sawing['valor_total_inicial'];
                            $cotacao['valor_total_final'] = $sawing['valor_total_final'];
                            $cotacao['economia'] = $sawing['economia'];
                            $cotacao['economia_percentual'] = $sawing['economia_percentual'];
                            $cotacao['rodadas'] = $sawing['rodadas'];
                            $cotacao['comprador'] = $sawing['comprador_nome'];

                            // Buscar itens do sawing
                            $stmt = $conn->prepare("
                                SELECT si.*
                                FROM sawing_itens si
                                WHERE si.sawing_id = ?
                            ");
                            $stmt->execute([$sawing['id']]);
                            $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

                            // Formatar itens para o formato esperado pelo frontend
                            $itensFormatados = [];
                            foreach ($itens as $item) {
                                $itensFormatados[] = [
                                    'produto_nome' => $item['descricao'],
                                    'quantidade' => $item['quantidade'],
                                    'unidade' => 'UN', // Valor padrão
                                    'prazo_entrega' => $item['prazo_entrega'],
                                    'ultimo_valor_aprovado' => $item['valor_unitario_inicial'],
                                    'valor_unitario' => $item['valor_unitario_final'],
                                    'valor_unitario_difal_frete' => $item['valor_unitario_final'],
                                    'data_entrega' => $item['data_entrega_fn'],
                                    'total' => $item['valor_unitario_final'] * $item['quantidade'],
                                    'fornecedor_nome' => $item['fornecedor'],
                                    'frete' => $item['frete'],
                                    'difal' => $item['difal'],
                                    'prazo_pagamento' => $item['prazo_pagamento']
                                ];
                            }
                            $cotacao['itens'] = $itensFormatados;
                        }
                    } else {
                    // Verificar se a coluna 'aprovado' existe na tabela itens_cotacao
                    try {
                        $checkColumn = $conn->query("SHOW COLUMNS FROM itens_cotacao LIKE 'aprovado'");
                        if ($checkColumn->rowCount() == 0) {
                            // A coluna não existe, vamos criá-la
                            $conn->exec("ALTER TABLE itens_cotacao ADD COLUMN aprovado TINYINT(1) DEFAULT 0");
                        }
                    } catch (Exception $e) {
                        // Ignorar erros aqui, pois a consulta principal ainda pode funcionar
                    }

                    // Buscar os itens da cotação com cálculo de variação
                    $stmt = $conn->prepare("
                        SELECT ic.*,
                               (SELECT si.valor_unitario_final 
                                FROM sawing_itens si 
                                JOIN sawing s ON si.sawing_id = s.id 
                                WHERE si.descricao = ic.produto_nome 
                                  AND s.status = 'concluido'
                                  AND s.tipo = 'programada'
                                ORDER BY s.data_registro DESC 
                                LIMIT 1) as ultimo_valor_aprovado,
                               (SELECT si.fornecedor 
                                FROM sawing_itens si 
                                JOIN sawing s ON si.sawing_id = s.id 
                                WHERE si.descricao = ic.produto_nome 
                                  AND s.status = 'concluido'
                                  AND s.tipo = 'programada'
                                ORDER BY s.data_registro DESC 
                                LIMIT 1) as ultimo_fornecedor_aprovado,
                               ic.ultimo_preco as valor_anterior
                        FROM itens_cotacao ic 
                        WHERE ic.cotacao_id = ?
                    ");
                    $stmt->execute([$_GET['id']]);
                    $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

                    // Calcular a variação percentual para cada item
                    foreach ($itens as &$item) {
                            // Calcular valor com DIFAL e frete
                            $valorUnitario = floatval($item['valor_unitario']);
                            $difal = floatval($item['difal'] ?? 0);
                            $frete = floatval($item['frete'] ?? 0);
                            
                            // Calcular valor com DIFAL
                            $valorComDifal = $valorUnitario * (1 + ($difal / 100));
                            
                            // Calcular frete por unidade
                            $quantidade = floatval($item['quantidade']);
                            $fretePorUnidade = $quantidade > 0 ? $frete / $quantidade : 0;
                            
                            // Calcular valor final
                            $valorFinal = $valorComDifal + $fretePorUnidade;
                            
                            // Adicionar valores calculados ao item
                            $item['valor_unitario_difal_frete'] = $valorFinal;
                            $item['total'] = $valorFinal * $quantidade;
                        }
                        
                        $cotacao['itens'] = $itens;
                    }
                    
                    // Buscar histórico de versões se solicitado
                    if (isset($_GET['historico']) && $_GET['historico'] == 1) {
                    $stmt = $conn->prepare("
                            SELECT v.*, u.nome as usuario_nome
                            FROM versoes_cotacao v
                            LEFT JOIN usuarios u ON v.usuario_id = u.id
                            WHERE v.cotacao_id = ?
                            ORDER BY v.versao DESC
                    ");
                    $stmt->execute([$_GET['id']]);
                        $versoes = $stmt->fetchAll(PDO::FETCH_ASSOC);
                        echo json_encode($versoes);
                        exit;
                    }
                    
                    // Buscar versão específica se solicitado
                    if (isset($_GET['versao'])) {
                        $stmt = $conn->prepare("
                            SELECT v.*, u.nome as usuario_nome
                            FROM versoes_cotacao v
                            LEFT JOIN usuarios u ON v.usuario_id = u.id
                            WHERE v.cotacao_id = ? AND v.versao = ?
                        ");
                        $stmt->execute([$_GET['id'], $_GET['versao']]);
                        $versao = $stmt->fetch(PDO::FETCH_ASSOC);
                        
                        if ($versao) {
                            $dadosVersao = json_decode($versao['dados_json'], true);
                            $versao['itens'] = $dadosVersao['itens'] ?? [];
                            echo json_encode($versao);
                            exit;
                        }
                    }
                    
                    // Fetch renegotiation data
                    $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome FROM cotacoes_renegociacoes WHERE cotacao_id = ?");
                    $stmt->execute([$_GET['id']]);
                    $produtosRenegociar = $stmt->fetchAll(PDO::FETCH_ASSOC);
                    $cotacao['produtos_renegociar'] = $produtosRenegociar;

                    echo json_encode($cotacao);
                    exit;
                } catch (Exception $e) {
                    error_log("Erro ao buscar cotação: " . $e->getMessage());
                    http_response_code(500);
                    echo json_encode([
                        'success' => false,
                        'message' => 'Erro ao buscar cotação: ' . $e->getMessage()
                    ]);
                    exit;
                }
            }
            break;

            case 'POST':
                // Verificar se é um envio com arquivos (FormData) ou JSON
                $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
                
                // Verificar se é uma simulação de PUT
                $isPut = isset($_POST['_method']) && $_POST['_method'] === 'PUT';
                
                if (strpos($contentType, 'multipart/form-data') !== false) {
                    // Processamento de FormData com arquivos
                    if (!isset($_POST['dados'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Dados inválidos - campo "dados" não encontrado']);
                        exit;
                    }
                    
                    $dados = json_decode($_POST['dados'], true);
                    
                    if (!$dados) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Dados JSON inválidos']);
                        exit;
                    }
                    
                    try {
                        $conn->beginTransaction();
                        
                        // Criar diretório de uploads se não existir
                        $uploadDir = '../uploads/cotacoes/';
                        if (!file_exists($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }
                        
                        // Obter informações do usuário logado
                        $usuarioId = $_SESSION['usuario']['id'] ?? null;
                        $nomeComprador = '';

                        if ($usuarioId) {
                            $stmt = $conn->prepare("SELECT nome FROM usuarios WHERE id = ?");
                            $stmt->execute([$usuarioId]);
                            $usuario = $stmt->fetch(PDO::FETCH_ASSOC);
                            if ($usuario && !empty($usuario['nome'])) {
                                // Limpar e formatar o nome do comprador
                                $nomeComprador = preg_replace('/[^a-zA-Z0-9]/', '_', strtolower(trim($usuario['nome'])));
                            }
                        }

                        // Se não conseguir obter o nome do comprador, usar um valor padrão
                        if (empty($nomeComprador)) {
                            $nomeComprador = 'sem_nome';
                        }

                        // Criar estrutura de pastas baseada na data e comprador
                        $data = new DateTime();
                        $ano = $data->format('Y');
                        $mes = $data->format('m');
                        $dia = $data->format('d');

                        // Criar estrutura completa de pastas
                        $pathParts = [
                            $uploadDir,
                            $nomeComprador,
                            $ano,
                            $mes,
                            $dia
                        ];

                        $currentPath = '';
                        foreach ($pathParts as $part) {
                            $currentPath .= $part . '/';
                            if (!file_exists($currentPath)) {
                                mkdir($currentPath, 0777, true);
                            }
                        }
                        
                        // Verificar se todos os fornecedores têm arquivo anexado
                        $fornecedoresSemArquivo = [];
                        foreach ($dados['fornecedores'] as $index => $fornecedor) {
                            $arquivoKey = 'arquivo_cotacao_' . $index;
                            if (!isset($_FILES[$arquivoKey]) || $_FILES[$arquivoKey]['error'] === UPLOAD_ERR_NO_FILE) {
                                $fornecedoresSemArquivo[] = $fornecedor['fornecedor_nome'];
                            }
                        }
                        
                        if (!empty($fornecedoresSemArquivo)) {
                            throw new Exception('Os seguintes fornecedores não possuem cotação anexada: ' . implode(', ', $fornecedoresSemArquivo));
                        }
                        
                        // Processar arquivos de cotação
                        $arquivosProcessados = [];
                        foreach ($_FILES as $key => $file) {
                            if (strpos($key, 'arquivo_cotacao_') === 0 && $file['error'] === UPLOAD_ERR_OK) {
                                // Validar tipo de arquivo
                                $allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
                                if (!in_array($file['type'], $allowedTypes)) {
                                    throw new Exception('Tipo de arquivo não permitido: ' . $file['type']);
                                }
                                
                                // Gerar nome único para o arquivo
                                $extension = pathinfo($file['name'], PATHINFO_EXTENSION);
                                $newFileName = uniqid('cotacao_') . '.' . $extension;
                                $targetPath = $currentPath . $newFileName;
                                
                                // Mover arquivo para o diretório de uploads
                                if (!move_uploaded_file($file['tmp_name'], $targetPath)) {
                                    throw new Exception('Erro ao mover arquivo para o diretório de uploads');
                                }
                                
                                // Extrair índice do fornecedor do nome do campo
                                $index = str_replace('arquivo_cotacao_', '', $key);
                                $arquivosProcessados[$index] = $newFileName;
                            }
                        }
                        
                        // Adicionar nomes dos arquivos aos dados dos fornecedores
                        if (isset($dados['fornecedores']) && is_array($dados['fornecedores'])) {
                            foreach ($dados['fornecedores'] as $index => $fornecedor) {
                                if (isset($arquivosProcessados[$index])) {
                                    $dados['fornecedores'][$index]['arquivo_cotacao'] = $arquivosProcessados[$index];
                                }
                            }
                        }
                        
                        if ($isPut) {
                            // Lógica de atualização (PUT)
                            // Buscar os valores originais antes de excluir os itens
                            $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome, primeiro_valor, valor_unitario, rodadas FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$dados['id']]);
                            $valoresOriginais = [];
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $key = $row['produto_id'] . '_' . $row['fornecedor_nome'];
                                $valoresOriginais[$key] = [
                                    'primeiro_valor' => $row['primeiro_valor'],
                                    'ultimo_preco' => $row['valor_unitario'], // valor atual se torna último preço
                                    'rodadas' => $row['rodadas'] ?? 0
                                ];
                            }
                            
                            // Remover os itens existentes
                            $stmt = $conn->prepare("DELETE FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$dados['id']]);
                            
                            // Atualizar o status
                            $novoStatus = $dados['status'] ?? 'pendente';
                            $stmt = $conn->prepare("UPDATE cotacoes SET status = ? WHERE id = ?");
                            $stmt->execute([$novoStatus, $dados['id']]);
                            
                            $cotacao_id = $dados['id'];
                        } else {
                            // Lógica de criação (POST)
                            // Inserir a cotação
                            $stmt = $conn->prepare("
                                INSERT INTO cotacoes (
                                    usuario_id,
                                    status,
                                    tipo,
                                    motivo_emergencial,
                                    centro_distribuicao,
                                    data_criacao
                                ) VALUES (?, ?, ?, ?, ?, NOW())
                            ");

                            $stmt->execute([
                                $_SESSION['usuario']['id'],
                                'pendente',
                                $dados['tipo'] ?? 'programada',
                                $dados['motivo_emergencial'] ?? null,
                                $dados['centro_distribuicao'] ?? 'CD CHAPECO'
                            ]);

                            $cotacao_id = $conn->lastInsertId();
                        }
                        
                        // Buscar o maior produto_id existente para esta cotação e fornecedor
                        $stmt = $conn->prepare("SELECT MAX(produto_id) as max_id FROM itens_cotacao WHERE cotacao_id = ?");
                        $stmt->execute([$cotacao_id]);
                        $result = $stmt->fetch(PDO::FETCH_ASSOC);
                        $produto_id = ($result['max_id'] ?? 0) + 1;

                        foreach ($dados['fornecedores'] as $fornecedor) {
                            foreach ($fornecedor['produtos'] as $produto) {
                                $stmt = $conn->prepare("
                                    INSERT INTO itens_cotacao (
                                        cotacao_id, 
                                        produto_id,
                                        produto_nome, 
                                        fornecedor_nome, 
                                        quantidade, 
                                        valor_unitario, 
                                        valor_total, 
                                        unidade,
                                        prazo_entrega,
                                        frete,
                                        difal,
                                        prazo_pagamento,
                                        primeiro_valor,
                                        ultimo_preco,
                                        data_entrega_fn
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ");
                                
                                $valorTotal = floatval($produto['quantidade']) * floatval($produto['valor_unitario']);
                                $ultimoPreco = isset($produto['ultimo_preco']) ? $produto['ultimo_preco'] : $produto['valor_unitario'];
                                
                                $stmt->execute([
                                    $cotacao_id,
                                    $produto_id++,
                                    $produto['nome'],
                                    $fornecedor['fornecedor_nome'],
                                    $produto['quantidade'],
                                    $produto['valor_unitario'],
                                    $valorTotal,
                                    $produto['unidade'],
                                    $produto['prazo_entrega'] ?? null,
                                    $fornecedor['frete'] ?? 0,
                                    $fornecedor['difal'] ?? 0,
                                    $fornecedor['prazo_pagamento'] ?? null,
                                    $produto['valor_unitario'],
                                    $ultimoPreco,
                                    $produto['prazo_entrega'] ?? null
                                ]);
                            }
                        }
                        
                        // Atualizar a cotação
                        $stmt = $conn->prepare("
                            UPDATE cotacoes 
                            SET tipo = ?,
                                motivo_emergencial = ?,
                                arquivo_cotacao = ?,
                                centro_distribuicao = ?
                            WHERE id = ?
                        ");

                        $stmt->execute([
                            $dados['tipo'],
                            $dados['motivo_emergencial'],
                            $arquivosProcessados[0] ?? null, // Usar o primeiro arquivo como principal
                            $dados['centro_distribuicao'] ?? 'CD CHAPECO',
                            $dados['id']
                        ]);

                        // Salvar arquivos dos fornecedores
                        if (isset($dados['fornecedores']) && is_array($dados['fornecedores'])) {
                            foreach ($dados['fornecedores'] as $fornecedor) {
                                if (isset($fornecedor['arquivo_cotacao'])) {
                                    $stmt = $conn->prepare("
                                        UPDATE itens_cotacao 
                                        SET arquivo_cotacao = ? 
                                        WHERE cotacao_id = ? AND fornecedor_nome = ?
                                    ");
                                    $stmt->execute([
                                        $fornecedor['arquivo_cotacao'],
                                        $dados['id'],
                                        $fornecedor['fornecedor_nome']
                                    ]);
                                }
                            }
                        }
                        
                        $conn->commit();
                        echo json_encode(['success' => true]);
                    } catch (Exception $e) {
                        $conn->rollBack();
                        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                    }
                } else {
                    // Processamento JSON padrão (código existente)
                    $dados = json_decode(file_get_contents('php://input'), true);
                    try {
                        $conn->beginTransaction();
                        
                        // Verificar se é uma edição (PUT simulado via POST)
                        $isPut = isset($dados['id']) && !empty($dados['id']);
                        
                        if ($isPut) {
                            // Buscar os valores originais antes de excluir os itens
                            $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome, primeiro_valor, valor_unitario, rodadas FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$dados['id']]);
                            $valoresOriginais = [];
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $key = $row['produto_id'] . '_' . $row['fornecedor_nome'];
                                $valoresOriginais[$key] = [
                                    'primeiro_valor' => $row['primeiro_valor'],
                                    'ultimo_preco' => $row['valor_unitario'],
                                    'rodadas' => $row['rodadas'] ?? 0
                                ];
                            }
                            
                            // Remover os itens existentes
                            $stmt = $conn->prepare("DELETE FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$dados['id']]);
                            
                            // Atualizar o status
                            $novoStatus = $dados['status'] ?? 'pendente';
                            $stmt = $conn->prepare("UPDATE cotacoes SET status = ? WHERE id = ?");
                            $stmt->execute([$novoStatus, $dados['id']]);
                            
                            $cotacao_id = $dados['id'];
                        } else {
                            $prazo_pagamento = $dados['fornecedores'][0]['prazo_pagamento'] ?? null;
                            
                            // Inserir a cotação
                            $stmt = $conn->prepare("
                                INSERT INTO cotacoes (
                                    usuario_id,
                                    status,
                                    tipo,
                                    motivo_emergencial,
                                    centro_distribuicao,
                                    data_criacao
                                ) VALUES (?, ?, ?, ?, ?, NOW())
                            ");

                            $stmt->execute([
                                $_SESSION['usuario']['id'],
                                'pendente',
                                $dados['tipo'] ?? 'programada',
                                $dados['motivo_emergencial'] ?? null,
                                $dados['centro_distribuicao'] ?? 'CD CHAPECO'
                            ]);

                            $cotacao_id = $conn->lastInsertId();
                        }
                        
                        // Buscar o maior produto_id existente para esta cotação e fornecedor
                        $stmt = $conn->prepare("SELECT MAX(produto_id) as max_id FROM itens_cotacao WHERE cotacao_id = ?");
                        $stmt->execute([$cotacao_id]);
                        $result = $stmt->fetch(PDO::FETCH_ASSOC);
                        $produto_id = ($result['max_id'] ?? 0) + 1;

                        foreach ($dados['fornecedores'] as $fornecedor) {
                            foreach ($fornecedor['produtos'] as $produto) {
                                $stmt = $conn->prepare("
                                    INSERT INTO itens_cotacao (
                                        cotacao_id, 
                                        produto_id,
                                        produto_nome, 
                                        fornecedor_nome, 
                                        quantidade, 
                                        valor_unitario, 
                                        valor_total, 
                                        unidade,
                                        prazo_entrega,
                                        frete,
                                        difal,
                                        prazo_pagamento,
                                        primeiro_valor,
                                        ultimo_preco,
                                        data_entrega_fn
                                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                ");
                                
                                $valorTotal = floatval($produto['quantidade']) * floatval($produto['valor_unitario']);
                                $ultimoPreco = isset($produto['ultimo_preco']) ? $produto['ultimo_preco'] : $produto['valor_unitario'];
                                
                                $stmt->execute([
                                    $cotacao_id,
                                    $produto_id++,
                                    $produto['nome'],
                                    $fornecedor['fornecedor_nome'],
                                    $produto['quantidade'],
                                    $produto['valor_unitario'],
                                    $valorTotal,
                                    $produto['unidade'],
                                    $produto['prazo_entrega'] ?? null,
                                    $fornecedor['frete'] ?? 0,
                                    $fornecedor['difal'] ?? 0,
                                    $fornecedor['prazo_pagamento'] ?? null,
                                    $produto['valor_unitario'],
                                    $ultimoPreco,
                                    $produto['prazo_entrega'] ?? null
                                ]);
                            }
                        }
                        
                        $conn->commit();
                        echo json_encode(['success' => true]);
                    } catch (Exception $e) {
                        $conn->rollBack();
                        echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                    }
                }
                break;
            
            

            case 'PUT':
                // Verificar se é um envio com arquivos (FormData) ou JSON
                $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
                
                if (strpos($contentType, 'multipart/form-data') !== false) {
                    // Processamento de FormData com arquivos para PUT
                    if (!isset($_POST['dados'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Dados inválidos - campo "dados" não encontrado']);
                        exit;
                    }
                    
                    $dados = json_decode($_POST['dados'], true);
                    
                    if (!$dados || !isset($dados['id'])) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Dados JSON inválidos ou ID não fornecido']);
                        exit;
                    }
                    
                    try {
                        $conn->beginTransaction();
                        
                        // Criar diretório de uploads se não existir
                        $uploadDir = '../uploads/cotacoes/';
                        if (!file_exists($uploadDir)) {
                            mkdir($uploadDir, 0777, true);
                        }
                        
                        // Buscar os valores atuais antes de qualquer modificação
                        $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome, valor_unitario, primeiro_valor, ultimo_preco, rodadas FROM itens_cotacao WHERE cotacao_id = ?");
                        $stmt->execute([$dados['id']]);
                        $valoresAnteriores = [];
                        while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                            $key = $row['produto_id'] . '_' . $row['fornecedor_nome'];
                            $valoresAnteriores[$key] = [
                                'primeiro_valor' => $row['primeiro_valor'] ?? $row['valor_unitario'],
                                'ultimo_preco' => $row['ultimo_preco'] ?? $row['valor_unitario'], // Preservar o último preço atual
                                'rodadas' => $row['rodadas'] ? (int)$row['rodadas'] : 0
                            ];
                        }
                        
                        // Atualizar o status
                        $novoStatus = $dados['status'] ?? 'pendente';
                        $stmt = $conn->prepare("UPDATE cotacoes SET status = ? WHERE id = ?");
                        $stmt->execute([$novoStatus, $dados['id']]);
                        
                        // Atualizar a cotação
                        $stmt = $conn->prepare("
                            UPDATE cotacoes 
                            SET tipo = ?,
                                motivo_emergencial = ?
                            WHERE id = ?
                        ");
                        
                        $stmt->execute([
                            $dados['tipo'] ?? 'programada',
                            $dados['motivo_emergencial'] ?? null,
                            $dados['id']
                        ]);
                        
                        // Inserir novos itens
                        $stmt = $conn->prepare("
                            INSERT INTO itens_cotacao (
                                cotacao_id, 
                                produto_id,
                                produto_nome, 
                                fornecedor_nome, 
                                quantidade, 
                                valor_unitario, 
                                valor_total, 
                                unidade,
                                prazo_entrega,
                                frete,
                                difal,
                                prazo_pagamento,
                                primeiro_valor,
                                ultimo_preco,
                                data_entrega_fn
                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                        ");
                        
                        $produto_id = 1; // Inicializa o contador
                        foreach ($dados['fornecedores'] as $fornecedor) {
                            foreach ($fornecedor['produtos'] as $produto) {
                                $stmt->execute([
                                    $dados['id'],
                                    $produto_id++,
                                    $produto['nome'],
                                    $fornecedor['fornecedor_nome'],
                                    $produto['quantidade'],
                                    $produto['valor_unitario'],
                                    $produto['valor_total'],
                                    $produto['unidade'],
                                    $produto['prazo_entrega'] ?? null,
                                    $fornecedor['frete'] ?? 0,
                                    $fornecedor['difal'] ?? 0,
                                    $fornecedor['prazo_pagamento'] ?? null,
                                    $produto['valor_unitario'],
                                    $produto['ultimo_preco'] ?? $produto['valor_unitario'],
                                    $produto['data_entrega_fn'] ?? null
                                ]);
                            }
                        }
                        
                        // Excluir itens que não estão mais no payload
                        $produtosMantidos = [];
                        foreach ($dados['fornecedores'] as $fornecedor) {
                            foreach ($fornecedor['produtos'] as $produto) {
                                $produtosMantidos[] = [
                                    'produto_nome' => $produto['nome'],
                                    'fornecedor_nome' => $fornecedor['fornecedor_nome'],
                                    'prazo_entrega' => $produto['prazo_entrega'] ?? null
                                ];
                            }
                        }

                        // Construir a query de exclusão
                        $placeholders = [];
                        $params = [];
                        foreach ($produtosMantidos as $produto) {
                            $placeholders[] = "(produto_nome = ? AND fornecedor_nome = ? AND prazo_entrega = ?)";
                            $params[] = $produto['produto_nome'];
                            $params[] = $produto['fornecedor_nome'];
                            $params[] = $produto['prazo_entrega'];
                        }

                        $sql = "DELETE FROM itens_cotacao WHERE cotacao_id = ?";
                        if (!empty($placeholders)) {
                            $sql .= " AND NOT (" . implode(" OR ", $placeholders) . ")";
                        }
                        
                        $stmt = $conn->prepare($sql);
                        $params = array_merge([$dados['id']], $params);
                        $stmt->execute($params);
                        
                        $conn->commit();
                        echo json_encode(['success' => true, 'message' => 'Cotação atualizada com sucesso']);
                    } catch (Exception $e) {
                        $conn->rollBack();
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Erro ao atualizar cotação',
                            'error' => $e->getMessage()
                        ]);
                    }
                } else {
                    // Processamento JSON padrão
                    $dados = json_decode(file_get_contents('php://input'), true);
                    
                    if (!$dados) {
                        http_response_code(400);
                        echo json_encode(['success' => false, 'message' => 'Dados inválidos']);
                        exit;
                    }
                
                    try {
                        $conn->beginTransaction();
                
                        // Verificação obrigatória do ID
                        if (!isset($dados['id'])) {
                            throw new Exception('ID da cotação não fornecido');
                        }
                        
                        // Lógica de renegociação
                        if ($dados['status'] === 'renegociacao' && isset($dados['produtos_renegociar'])) {
                            $cotacaoId = $dados['id'];
                            $produtosRenegociar = $dados['produtos_renegociar'];
                            $motivoRenegociacao = $dados['motivo_renegociacao'] ?? 'Atualização automática ao liberar para gerência';
                            
                            // Buscar os valores atuais para preservar ultimo_preco, primeiro_valor e rodadas
                            $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome, valor_unitario, primeiro_valor, rodadas FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$cotacaoId]);
                            $valoresAtuais = [];
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $key = $row['produto_id'] . '_' . $row['fornecedor_nome'];
                                $valoresAtuais[$key] = [
                                    'valor_unitario' => $row['valor_unitario'],
                                    'primeiro_valor' => $row['primeiro_valor'] ?? $row['valor_unitario'],
                                    'rodadas' => $row['rodadas'] ? (int)$row['rodadas'] : 0
                                ];
                            }
                            
                            // Apaga produtos renegociados anteriores
                            $stmt = $conn->prepare("DELETE FROM cotacoes_renegociacoes WHERE cotacao_id = ?");
                            $stmt->execute([$cotacaoId]);
                        
                            // Se houver produtos para renegociar, insere-os
                            if (!empty($produtosRenegociar)) {
                                $stmtInsert = $conn->prepare("INSERT INTO cotacoes_renegociacoes (cotacao_id, produto_id, fornecedor_nome) VALUES (?, ?, ?)");
                                
                                foreach ($produtosRenegociar as $item) {
                                    // Validar produto_id antes da inserção
                                    if (!empty($item['produto_id']) && is_numeric($item['produto_id'])) {
                                        $stmtInsert->execute([
                                            $cotacaoId, 
                                            (int)$item['produto_id'], 
                                            $item['fornecedor_nome']
                                        ]);
                                    } else {
                                        error_log("Tentativa de inserir produto_id inválido na renegociação: " . json_encode($item));
                                    }
                                }
                            }
                        
                            // Atualiza o status da cotação e o motivo da renegociação
                            $stmt = $conn->prepare("UPDATE cotacoes SET status = ?, motivo_renegociacao = ? WHERE id = ?");
                            $stmt->execute(['renegociacao', $motivoRenegociacao, $cotacaoId]);
                            
                            $conn->commit();
                            echo json_encode(['success' => true, 'message' => 'Cotação atualizada com sucesso']);
                            exit;
                        }
                        
                        // ATUALIZAÇÃO SIMPLES DE STATUS
                        if (isset($dados['status']) && !isset($dados['fornecedores'])) {
                            $statusPermitidos = ['pendente', 'aguardando_aprovacao', 'aguardando_aprovacao_supervisor', 'aprovado', 'rejeitado', 'renegociacao'];
                            
                            if (!in_array($dados['status'], $statusPermitidos)) {
                                throw new Exception('Status inválido');
                            }
                
                            // LÓGICA DE VERSIONAMENTO - CRIAR NOVA VERSÃO AO ENVIAR PARA APROVAÇÃO
if ($dados['status'] === 'aguardando_aprovacao') {
    error_log("Iniciando processo de envio para aprovação da cotação ID: " . $dados['id']);
    
    try {
        // Verificar se o usuário na sessão existe no banco de dados
        $usuarioId = $_SESSION['usuario']['id'];
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
        $stmt->execute([$usuarioId]);
        $usuarioExiste = $stmt->fetch();
        
        // Se o usuário não existir, usar o usuário da cotação
        if (!$usuarioExiste) {
            $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
            $stmt->execute([$dados['id']]);
            $usuarioId = $stmt->fetchColumn();
            
            // Se ainda não encontrar um usuário válido, usar um administrador
            if (!$usuarioId) {
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1");
                $stmt->execute();
                $usuarioId = $stmt->fetchColumn();
                
                // Se não houver administrador, usar o primeiro usuário disponível
                if (!$usuarioId) {
                    $stmt = $conn->prepare("SELECT id FROM usuarios LIMIT 1");
                    $stmt->execute();
                    $usuarioId = $stmt->fetchColumn();
                    
                    // Se não houver nenhum usuário, lançar erro
                    if (!$usuarioId) {
                        throw new Exception("Não foi possível encontrar um usuário válido para registrar a versão");
                    }
                }
            }
            
            // Atualizar a sessão com o ID válido
            $_SESSION['usuario']['id'] = $usuarioId;
        }
        
        // 1. Busca a versão atual da cotação
        $stmt = $conn->prepare("SELECT COUNT(*) as total_versoes FROM cotacoes_versoes WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $novaVersao = (int)$result['total_versoes'] + 1;
        error_log("Nova versão será: " . $novaVersao);

        // 2. Busca todos os dados atuais da cotação
        $stmt = $conn->prepare("SELECT * FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $cotacao = $stmt->fetch(PDO::FETCH_ASSOC);

        // 3. Busca todos os itens da cotação
        $stmt = $conn->prepare("SELECT * FROM itens_cotacao WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Prepara os dados para armazenar como versão
        $dadosVersao = [
            'cotacao' => $cotacao,
            'itens' => $itens,
            'motivo' => $dados['motivo'] ?? 'Envio para aprovação',
            'usuario' => $usuarioId // Usar o ID verificado
        ];

        // 5. Insere a nova versão
        $stmt = $conn->prepare("INSERT INTO cotacoes_versoes
                              (cotacao_id, versao, dados_json, usuario_id)
                              VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $dados['id'],
            $novaVersao,
            json_encode($dadosVersao),
            $usuarioId // Usar o ID verificado
        ]);

        // Create notification for approvers
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo IN ('admin', 'gerencia', 'administrador')");
        $stmt->execute();
        $approvers = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($approvers as $approver) {
            createNotification(
                $conn,
                $approver['id'],
                $dados['id'],
                "Nova cotação #{$dados['id']} aguardando aprovação",
                'nova_cotacao'
            );
        }
    } catch (Exception $e) {
        error_log("Erro ao criar versão: " . $e->getMessage());
        throw $e; // Mantém a exceção para que seja tratada no nível superior
    }
}

// Atualiza o status da cotação e possivelmente o motivo
if ($dados['status'] === 'aprovado') {
    // Verificar se há motivo de aprovação
    if (!isset($dados['motivo_aprovacao']) || empty(trim($dados['motivo_aprovacao']))) {
        throw new Exception('Motivo da aprovação é obrigatório');
    }

    try {
        $stmt = $conn->prepare("DELETE FROM cotacoes_renegociacoes WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        error_log("Itens de renegociação removidos para a cotação #" . $dados['id']);
    } catch (Exception $e) {
        // Apenas log do erro, não interromper o fluxo de aprovação
        error_log("Erro ao remover itens de renegociação: " . $e->getMessage());
    }
    
    // Verificar se há itens aprovados específicos
    if (isset($dados['itens_aprovados']) && is_array($dados['itens_aprovados']) && count($dados['itens_aprovados']) > 0) {
        try {
            // Primeiro, marcar todos os itens como não aprovados
            $stmt = $conn->prepare("UPDATE itens_cotacao SET aprovado = 0 WHERE cotacao_id = ?");
            $stmt->execute([$dados['id']]);
            
            // Depois, marcar apenas os itens selecionados como aprovados
            foreach ($dados['itens_aprovados'] as $item) {
                $stmt = $conn->prepare("
                    UPDATE itens_cotacao 
                    SET aprovado = 1 
                    WHERE cotacao_id = ? 
                    AND produto_nome = ?
                    AND fornecedor_nome = ?
                ");
                $stmt->execute([
                    $dados['id'],
                    $item['produto_nome'],
                    $item['fornecedor_nome']
                ]);
            }

            // Atualizar o status da cotação para aprovado
            $stmt = $conn->prepare("UPDATE cotacoes SET status = 'aprovado', data_aprovacao = NOW(), motivo_aprovacao = ? WHERE id = ?");
            $stmt->execute([$dados['motivo_aprovacao'], $dados['id']]);
        } catch (Exception $e) {
            // Se a coluna 'aprovado' não existir, criá-la
            if (!columnExists($conn, 'itens_cotacao', 'aprovado')) {
            $conn->exec("ALTER TABLE itens_cotacao ADD COLUMN aprovado TINYINT(1) DEFAULT 0");
            }
            
            // Tentar novamente após criar a coluna
            $stmt = $conn->prepare("UPDATE itens_cotacao SET aprovado = 0 WHERE cotacao_id = ?");
            $stmt->execute([$dados['id']]);
            
            foreach ($dados['itens_aprovados'] as $item) {
                $stmt = $conn->prepare("
                    UPDATE itens_cotacao 
                    SET aprovado = 1 
                    WHERE cotacao_id = ? 
                    AND produto_nome = ?
                    AND fornecedor_nome = ?
                ");
                $stmt->execute([
                    $dados['id'],
                    $item['produto_nome'],
                    $item['fornecedor_nome']
                ]);
            }
        }
        
        $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $usuario_id = $stmt->fetchColumn();
        
        $tipoAprovacao = isset($dados['tipo_aprovacao']) ? $dados['tipo_aprovacao'] : 'manual';
        $message = "Cotação #{$dados['id']} foi aprovada" . 
                  ($tipoAprovacao === 'melhor-preco' ? " (melhor preço)" : " (seleção manual)");
        
        try {
            $stmt = $conn->prepare("
                INSERT INTO notifications (
                    user_id, 
                    cotacao_id, 
                    message, 
                    type, 
                    details
                ) VALUES (?, ?, ?, ?, ?)
            ");
            $detalhes = json_encode([
                'tipo_aprovacao' => $tipoAprovacao,
                'itens_aprovados' => count($dados['itens_aprovados']),
                'motivo' => $dados['motivo_aprovacao']
            ]);
            $stmt->execute([$usuario_id, $dados['id'], $message, 'aprovado_parcial', $detalhes]);
        } catch (Exception $e) {
            $stmt = $conn->prepare("
                INSERT INTO notifications (
                    user_id, 
                    cotacao_id, 
                    message, 
                    type
                ) VALUES (?, ?, ?, ?)
            ");
            $stmt->execute([$usuario_id, $dados['id'], $message, 'aprovado_parcial']);
        }

        // Create notification for the buyer
        $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $buyerId = $stmt->fetchColumn();

        if ($buyerId) {
            createNotification(
                $conn,
                $buyerId,
                $dados['id'],
                "Sua cotação #{$dados['id']} foi aprovada",
                'aprovado'
            );
        }
    } else {
        try {
            $stmt = $conn->prepare("UPDATE itens_cotacao SET aprovado = 1 WHERE cotacao_id = ?");
            $stmt->execute([$dados['id']]);
        } catch (Exception $e) {
            $conn->exec("ALTER TABLE itens_cotacao ADD COLUMN aprovado TINYINT(1) DEFAULT 0");
            $stmt = $conn->prepare("UPDATE itens_cotacao SET aprovado = 1 WHERE cotacao_id = ?");
            $stmt->execute([$dados['id']]);
        }
    }
    
    // Após aprovar a cotação, criar registro de sawing
    try {
        // Verificar se o usuário na sessão existe no banco de dados
        $usuarioId = $_SESSION['usuario']['id'];
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
        $stmt->execute([$usuarioId]);
        $usuarioExiste = $stmt->fetch();
        
        // Se o usuário não existir, usar o usuário da cotação
        if (!$usuarioExiste) {
            $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
            $stmt->execute([$dados['id']]);
            $usuarioId = $stmt->fetchColumn();
            
            // Se ainda não encontrar um usuário válido, usar um administrador
            if (!$usuarioId) {
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1");
                $stmt->execute();
                $usuarioId = $stmt->fetchColumn();
                
                // Se não houver administrador, usar o primeiro usuário disponível
                if (!$usuarioId) {
                    $stmt = $conn->prepare("SELECT id FROM usuarios LIMIT 1");
                    $stmt->execute();
                    $usuarioId = $stmt->fetchColumn();
                    
                    // Se não houver nenhum usuário, lançar erro
                    if (!$usuarioId) {
                        throw new Exception("Não foi possível encontrar um usuário válido para registrar a versão");
                    }
                }
            }
            
            // Atualizar a sessão com o ID válido
            if ($usuarioId) {
                $_SESSION['usuario']['id'] = $usuarioId;
            }
        }
        
        // Buscar os itens aprovados com seus detalhes
        $itensAprovados = array();
        if (isset($dados['itens_aprovados']) && is_array($dados['itens_aprovados'])) {
            foreach ($dados['itens_aprovados'] as $item) {
                $stmt = $conn->prepare("
                    SELECT ic.* 
                    FROM itens_cotacao ic 
                    WHERE ic.cotacao_id = ? 
                    AND ic.produto_codigo = ? 
                    AND ic.fornecedor_nome = ?
                ");
                $stmt->execute([$dados['id'], $item['produto_id'], $item['fornecedor_nome']]);
                $itemData = $stmt->fetch(PDO::FETCH_ASSOC);
                
                if ($itemData) {
                    $itensAprovados[] = array(
                        'fornecedor_nome' => $itemData['fornecedor_nome'],
                        'produto_nome' => $itemData['produto_nome'],
                        'produto_id' => $itemData['produto_codigo'],
                        'quantidade' => $itemData['quantidade'],
                        'valor_unitario' => $itemData['valor_unitario'],
                        'primeiro_valor' => $itemData['primeiro_valor']
                    );
                }
            }
        }
        
        // Salvar histórico de aprovação
        salvarHistoricoCotacao(
            $conn,
            $dados['id'],
            $usuarioId,
            'aprovacao',
            $dados['motivo_aprovacao'] ?? null,
            $itensAprovados,
            $dados['tipo_aprovacao'] ?? 'manual'
        );

        // Criar registro na tabela sawing
        // Buscar valores iniciais e finais da cotação
        $valorInicial = 0;
        $valorFinal = 0;
        $rodadas = 1; // Valor padrão
        
        // Buscar o ID do comprador original da cotação
        $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $compradorId = $stmt->fetchColumn();
        
        // Buscar o número de rodadas
        $stmt = $conn->prepare("SELECT MAX(versao) as max_versao FROM cotacoes_versoes WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        $maxVersao = $stmt->fetchColumn();
        if ($maxVersao) {
            $rodadas = (int)$maxVersao;
        }
        
        // Calcular valores iniciais e finais
        if (count($itensAprovados) > 0) {
            foreach ($itensAprovados as $item) {
                $quantidade = floatval($item['quantidade']);
                $valorUnitario = floatval($item['valor_unitario']);
                $primeiroValor = floatval($item['primeiro_valor']);
                
                $valorFinal += $quantidade * $valorUnitario;
                $valorInicial += $quantidade * $primeiroValor;
            }
        } else {
            // Se não houver itens aprovados específicos, buscar todos os itens da cotação
            $stmt = $conn->prepare("
                SELECT quantidade, valor_unitario, primeiro_valor 
                FROM itens_cotacao 
                WHERE cotacao_id = ? AND aprovado = 1
            ");
            $stmt->execute([$dados['id']]);
            $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            foreach ($itens as $item) {
                $quantidade = floatval($item['quantidade']);
                $valorUnitario = floatval($item['valor_unitario']);
                $primeiroValor = floatval($item['primeiro_valor']);
                
                $valorFinal += $quantidade * $valorUnitario;
                $valorInicial += $quantidade * $primeiroValor;
            }
        }
        
        // Calcular economia (se houver valores iniciais)
        $economia = $valorInicial - $valorFinal;
        $economiaPercentual = $valorInicial > 0 ? ($economia / $valorInicial * 100) : 0;
        
        // Inserir na tabela sawing
        $stmt = $conn->prepare("
            INSERT INTO sawing (
                cotacao_id, 
                usuario_id, 
                data_registro, 
                data_aprovacao,
                valor_total_inicial, 
                valor_total_final, 
                economia, 
                economia_percentual, 
                rodadas, 
                status, 
                observacoes,
                tipo,
                motivo_emergencial,
                centro_distribuicao
            ) VALUES (?, ?, NOW(), NOW(), ?, ?, ?, ?, ?, 'concluido', ?, ?, ?, ?)
        ");
        
        $observacoes = "Cotação aprovada: " . ($dados['motivo_aprovacao'] ?? 'Sem motivo informado');
        
        $stmt->execute([
            $dados['id'],
            $compradorId, // Usar o ID do comprador original em vez do aprovador
            $valorInicial,
            $valorFinal,
            $economia,
            $economiaPercentual,
            $rodadas,
            $observacoes,
            $cotacao['tipo'] ?? 'programada',
            $cotacao['motivo_emergencial'] ?? null,
            $cotacao['centro_distribuicao'] ?? 'CD CHAPECO'
        ]);
        
        $sawingId = $conn->lastInsertId();
        
        // Inserir itens na tabela sawing_itens
        if ($sawingId) {
            // Buscar todos os itens aprovados
            $stmt = $conn->prepare("
                SELECT id, produto_nome, quantidade, valor_unitario, primeiro_valor, fornecedor_nome, prazo_entrega, prazo_pagamento, data_entrega_fn
                FROM itens_cotacao 
                WHERE cotacao_id = ? AND aprovado = 1
            ");
            $stmt->execute([$dados['id']]);
            $itensSawing = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            // Calcular valor_total_inicial e valor_total_final
            $valorTotalInicial = 0;
            $valorTotalFinal = 0;
            
            foreach ($itensSawing as $item) {
                $valorInicialItem = floatval($item['primeiro_valor']);
                $valorFinalItem = floatval($item['valor_unitario']);
                $quantidade = floatval($item['quantidade']);
                
                $valorTotalInicial += $valorInicialItem * $quantidade;
                $valorTotalFinal += $valorFinalItem * $quantidade;
                
                $economiaItem = ($valorInicialItem - $valorFinalItem) * $quantidade;
                $economiaPercentualItem = $valorInicialItem > 0 ? (($valorInicialItem - $valorFinalItem) / $valorInicialItem * 100) : 0;
                
                $stmt = $conn->prepare("
                    INSERT INTO sawing_itens (
                        sawing_id, 
                        item_id, 
                        descricao,
                        fornecedor,
                        valor_unitario_inicial, 
                        valor_unitario_final, 
                        economia, 
                        economia_percentual, 
                        quantidade,
                        prazo_entrega,
                        data_entrega_fn,
                        prazo_pagamento
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ");
                
                $stmt->execute([
                    $sawingId,
                    $item['id'],
                    $item['produto_nome'],
                    $item['fornecedor_nome'],
                    $valorInicialItem,
                    $valorFinalItem,
                    $economiaItem,
                    $economiaPercentualItem,
                    $quantidade,
                    $item['prazo_entrega'],
                    $item['data_entrega_fn'],
                    $item['prazo_pagamento']
                ]);
            }
            
            // Atualizar os valores totais na tabela sawing
            $economia = $valorTotalInicial - $valorTotalFinal;
            $economiaPercentual = $valorTotalInicial > 0 ? ($economia / $valorTotalInicial * 100) : 0;
            
            $stmt = $conn->prepare("
                UPDATE sawing SET 
                    valor_total_inicial = ?,
                    valor_total_final = ?,
                    economia = ?,
                    economia_percentual = ?
                WHERE id = ?
            ");
            
            $stmt->execute([
                $valorTotalInicial,
                $valorTotalFinal,
                $economia,
                $economiaPercentual,
                $sawingId
            ]);

            // Remover itens da cotação após mover para sawing_itens
            $stmt = $conn->prepare("DELETE FROM itens_cotacao WHERE cotacao_id = ?");
            $stmt->execute([$dados['id']]);

            // Remover a cotação após mover os itens
            $stmt = $conn->prepare("DELETE FROM cotacoes WHERE id = ?");
            $stmt->execute([$dados['id']]);
        }

        error_log("Registro de sawing criado para cotação #{$dados['id']}");
    } catch (Exception $e) {
        error_log("Erro ao criar registro de sawing: " . $e->getMessage());
    }
} else if ($dados['status'] === 'rejeitado' && isset($dados['motivo_rejeicao'])) {
    $stmt = $conn->prepare("UPDATE cotacoes SET status = ?, motivo_rejeicao = ? WHERE id = ?");
    $stmt->execute([$dados['status'], $dados['motivo_rejeicao'], $dados['id']]);

    // Salvar histórico de rejeição
    salvarHistoricoCotacao(
        $conn,
        $dados['id'],
        $_SESSION['usuario']['id'],
        'rejeicao',
        $dados['motivo_rejeicao']
    );
} else {
    $stmt = $conn->prepare("UPDATE cotacoes SET status = ? WHERE id = ?");
    $stmt->execute([$dados['status'], $dados['id']]);
}

// Se for aprovação/rejeição, cria notificação
if ($dados['status'] === 'aprovado' || $dados['status'] === 'rejeitado') {
    $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
    $stmt->execute([$dados['id']]);
    $usuario_id = $stmt->fetchColumn();

    $message = $dados['status'] === 'aprovado'
        ? "Sua cotação #{$dados['id']} foi aprovada"
        : "Sua cotação #{$dados['id']} foi rejeitada. Motivo: " . ($dados['motivo_rejeicao'] ?? 'Não informado');

    $stmt = $conn->prepare("INSERT INTO notifications (user_id, cotacao_id, message, type) VALUES (?, ?, ?, ?)");
    $stmt->execute([$usuario_id, $dados['id'], $message, $dados['status']]);
}

$conn->commit();
echo json_encode([
    'success' => true,
    'message' => isset($novaVersao)
        ? "Cotação enviada para aprovação (Versão {$novaVersao})"
        : 'Status atualizado com sucesso'
]);
exit;
                        }
                
                        // ATUALIZAÇÃO COMPLETA DA COTAÇÃO (com fornecedores e produtos)
                        if (isset($dados['fornecedores'])) {
                            $stmt = $conn->prepare("SELECT status FROM cotacoes WHERE id = ?");
                            $stmt->execute([$dados['id']]);
                            $statusAtual = $stmt->fetchColumn();
                
                            if ($statusAtual === 'renegociacao') {
                                // Busca a versão atual
                                $stmt = $conn->prepare("SELECT COUNT(*) as total_versoes FROM cotacoes_versoes WHERE cotacao_id = ?");
                                $stmt->execute([$dados['id']]);
                                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                                $novaVersao = (int)$result['total_versoes'] + 1;
                
                                // Busca os dados atuais
                                $stmt = $conn->prepare("SELECT * FROM cotacoes WHERE id = ?");
                                $stmt->execute([$dados['id']]);
                                $cotacao = $stmt->fetch(PDO::FETCH_ASSOC);
                
                                $stmt = $conn->prepare("SELECT * FROM itens_cotacao WHERE cotacao_id = ?");
                                $stmt->execute([$dados['id']]);
                                $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                                // Insere a versão
                                $stmt = $conn->prepare("INSERT INTO cotacoes_versoes
                                                      (cotacao_id, versao, dados_json, usuario_id)
                                                      VALUES (?, ?, ?, ?)");
                                $stmt->execute([
                                    $dados['id'],
                                    $novaVersao,
                                    json_encode([
                                        'cotacao' => $cotacao,
                                        'itens' => $itens,
                                        'motivo' => 'Renegociação',
                                        'usuario' => $_SESSION['usuario']['id']
                                    ]),
                                    $_SESSION['usuario']['id']
                                ]);
                            }
                
                            // Buscar os valores atuais antes de remover os itens
                            $stmt = $conn->prepare("SELECT produto_id, fornecedor_nome, valor_unitario, primeiro_valor, ultimo_preco, rodadas FROM itens_cotacao WHERE cotacao_id = ?");
                            $stmt->execute([$dados['id']]);
                            $valoresAnteriores = [];
                            while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
                                $key = $row['produto_id'] . '_' . $row['fornecedor_nome'];
                                $valoresAnteriores[$key] = [
                                    'primeiro_valor' => $row['primeiro_valor'] ?? $row['valor_unitario'],
                                    'ultimo_preco' => $row['ultimo_preco'] ?? $row['valor_unitario'], // Preservar o último preço atual
                                    'rodadas' => $row['rodadas'] ? (int)$row['rodadas'] : 0
                                ];
                            }
                            
                            // Atualizar o status
                            $novoStatus = $dados['status'] ?? 'pendente';
                            $stmt = $conn->prepare("UPDATE cotacoes SET status = ? WHERE id = ?");
                            $stmt->execute([$novoStatus, $dados['id']]);
                            
                            // Atualizar ou inserir produtos
                            foreach ($dados['fornecedores'] as $fornecedor) {
                                foreach ($fornecedor['produtos'] as $produto) {
                                    // Verificar se o item já existe usando a chave composta
                                    $stmt = $conn->prepare("
                                        SELECT id, produto_id, valor_unitario, ultimo_preco
                                        FROM itens_cotacao 
                                        WHERE cotacao_id = ? 
                                        AND produto_nome = ? 
                                        AND fornecedor_nome = ?
                                        AND prazo_entrega = ?
                                    ");
                                    $stmt->execute([
                                        $dados['id'],
                                        $produto['nome'],
                                        $fornecedor['fornecedor_nome'],
                                        $produto['prazo_entrega'] ?? null
                                    ]);
                                    $itemExistente = $stmt->fetch(PDO::FETCH_ASSOC);
                                    
                                    if ($itemExistente) {
                                        // Usar os dados do item existente
                                        $valorAtual = $itemExistente['valor_unitario'];
                                        $ultimoPrecoAtual = $itemExistente['ultimo_preco'];
                                        $produtoId = $itemExistente['produto_id'];

                                        // Atualizar item existente
                                        $stmt = $conn->prepare("
                                            UPDATE itens_cotacao 
                                            SET produto_nome = ?,
                                                quantidade = ?,
                                                valor_unitario = ?,
                                                valor_total = ?,
                                                unidade = ?,
                                                prazo_entrega = ?,
                                                frete = ?,
                                                difal = ?,
                                                prazo_pagamento = ?,
                                                data_entrega_fn = ?,
                                                ultimo_preco = ?,
                                                rodadas = CASE 
                                                    WHEN ? != ? THEN rodadas + 1 
                                                    ELSE rodadas 
                                                END,
                                                primeiro_valor = CASE 
                                                    WHEN primeiro_valor IS NULL OR primeiro_valor = 0 THEN ? 
                                                    ELSE primeiro_valor 
                                                END
                                            WHERE cotacao_id = ? 
                                            AND produto_id = ? 
                                            AND fornecedor_nome = ?
                                        ");
                                        
                                        $valorTotal = floatval($produto['quantidade']) * floatval($produto['valor_unitario']);
                                        
                                        // Determinar o novo último preço
                                        $novoUltimoPreco = ($produto['valor_unitario'] != $valorAtual) ? $valorAtual : $ultimoPrecoAtual;
                                        
                                        $stmt->execute([
                                            $produto['nome'],
                                            $produto['quantidade'],
                                            $produto['valor_unitario'],
                                            $valorTotal,
                                            $produto['unidade'],
                                            $produto['prazo_entrega'] ?? null,
                                            $fornecedor['frete'] ?? 0,
                                            $fornecedor['difal'] ?? 0,
                                            $fornecedor['prazo_pagamento'] ?? null,
                                            $produto['data_entrega_fn'] ?? null,
                                            $novoUltimoPreco,
                                            $produto['valor_unitario'],
                                            $valorAtual,
                                            $produto['valor_unitario'],
                                            $dados['id'],
                                            $produtoId,
                                            $fornecedor['fornecedor_nome']
                                        ]);
                                    } else {
                                        // Buscar o maior produto_id para esta cotação
                                        $stmt = $conn->prepare("SELECT MAX(produto_id) as max_id FROM itens_cotacao WHERE cotacao_id = ?");
                                        $stmt->execute([$dados['id']]);
                                        $result = $stmt->fetch(PDO::FETCH_ASSOC);
                                        $produto_id = ($result['max_id'] ?? 0) + 1;
                                        
                                        // Inserir novo item
                                        $stmt = $conn->prepare("
                                            INSERT INTO itens_cotacao (
                                                cotacao_id, 
                                                produto_id,
                                                produto_nome, 
                                                fornecedor_nome, 
                                                quantidade, 
                                                valor_unitario, 
                                                valor_total,
                                                unidade,
                                                prazo_entrega,
                                                frete,
                                                difal,
                                                prazo_pagamento,
                                                primeiro_valor,
                                                ultimo_preco,
                                                data_entrega_fn
                                            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                                        ");
                                        
                                        $valorTotal = floatval($produto['quantidade']) * floatval($produto['valor_unitario']);
                                        
                                        $stmt->execute([
                                            $dados['id'],
                                            $produto_id,
                                            $produto['nome'],
                                            $fornecedor['fornecedor_nome'],
                                            $produto['quantidade'],
                                            $produto['valor_unitario'],
                                            $valorTotal,
                                            $produto['unidade'],
                                            $produto['prazo_entrega'] ?? null,
                                            $fornecedor['frete'] ?? 0,
                                            $fornecedor['difal'] ?? 0,
                                            $fornecedor['prazo_pagamento'] ?? null,
                                            $produto['valor_unitario'], // primeiro_valor
                                            $produto['valor_unitario'], // ultimo_preco para novos itens
                                            $produto['data_entrega_fn'] ?? null
                                        ]);
                                    }
                                }
                            }
                            
                            // Excluir itens que não estão mais no payload
                            $produtosMantidos = [];
                            foreach ($dados['fornecedores'] as $fornecedor) {
                                foreach ($fornecedor['produtos'] as $produto) {
                                    $produtosMantidos[] = [
                                        'produto_nome' => $produto['nome'],
                                        'fornecedor_nome' => $fornecedor['fornecedor_nome'],
                                        'prazo_entrega' => $produto['prazo_entrega'] ?? null
                                    ];
                                }
                            }

                            // Construir a query de exclusão
                            $placeholders = [];
                            $params = [];
                            foreach ($produtosMantidos as $produto) {
                                $placeholders[] = "(produto_nome = ? AND fornecedor_nome = ? AND prazo_entrega = ?)";
                                $params[] = $produto['produto_nome'];
                                $params[] = $produto['fornecedor_nome'];
                                $params[] = $produto['prazo_entrega'];
                            }

                            $sql = "DELETE FROM itens_cotacao WHERE cotacao_id = ?";
                            if (!empty($placeholders)) {
                                $sql .= " AND NOT (" . implode(" OR ", $placeholders) . ")";
                            }
                            
                            $stmt = $conn->prepare($sql);
                            $params = array_merge([$dados['id']], $params);
                            $stmt->execute($params);
                            
                            $conn->commit();
                            echo json_encode([
                                'success' => true,
                                'message' => isset($novaVersao)
                                    ? "Cotação renegociada (Versão {$novaVersao})"
                                    : 'Cotação atualizada com sucesso'
                            ]);
                            exit;
                        }
                
                        throw new Exception('Nenhum dado válido para atualização fornecido');
                
                    } catch (Exception $e) {
                        $conn->rollBack();
                        http_response_code(500);
                        echo json_encode([
                            'success' => false,
                            'message' => 'Erro ao atualizar cotação',
                            'error' => $e->getMessage()
                        ]);
                    }
                }
                break;            

        case 'DELETE':
            if (isset($_GET['id'])) {
                try {
                    $conn->beginTransaction();
                    $stmt = $conn->prepare("DELETE FROM itens_cotacao WHERE cotacao_id = ?");
                    $stmt->execute([$_GET['id']]);
                    $stmt = $conn->prepare("DELETE FROM cotacoes WHERE id = ?");
                    $stmt->execute([$_GET['id']]);
                    $conn->commit();
                    echo json_encode(['success' => true]);
                } catch (Exception $e) {
                    $conn->rollBack();
                    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
                }
            }
            break;
    }

    if (isset($dados['status']) && ($dados['status'] === 'aprovado' || $dados['status'] === 'rejeitado')) {
        $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $usuario_id = $stmt->fetchColumn();

        $message = $dados['status'] === 'aprovado'
            ? "Sua cotação #" . $dados['id'] . " foi aprovada"
            : "Sua cotação #" . $dados['id'] . " foi rejeitada. Motivo: " . $dados['motivo_rejeicao'];

        $stmt = $conn->prepare("INSERT INTO notifications (user_id, cotacao_id, message, type) VALUES (?, ?, ?, ?)");
        $stmt->execute([$usuario_id, $dados['id'], $message, $dados['status']]);
    }
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}

// Função para salvar histórico de cotação
function salvarHistoricoCotacao($conn, $cotacaoId, $usuarioId, $acao, $motivo = null, $itensAprovados = null, $tipoAprovacao = null) {
    try {
        // Preparar a query base
        $sql = "INSERT INTO historico_cotacao (
            cotacao_id, 
            usuario_id, 
            acao, 
            detalhes, 
            data_acao, 
            fornecedor, 
            produto_nome, 
            qtd, 
            valor_unitario,
            valor_aprovado, 
            total, 
            status
        ) VALUES (?, ?, ?, ?, NOW(), ?, ?, ?, ?, ?, ?, ?)";
        
        $stmt = $conn->prepare($sql);
        
        // Se houver itens aprovados, inserir um registro para cada item
        if ($itensAprovados && is_array($itensAprovados)) {
            foreach ($itensAprovados as $item) {
                $detalhes = json_encode([
                    'motivo' => $motivo,
                    'tipo_aprovacao' => $tipoAprovacao
                ]);
                
                $total = $item['quantidade'] * $item['valor_unitario'];
                
                $stmt->execute([
                    $cotacaoId,
                    $usuarioId,
                    $acao,
                    $detalhes,
                    $item['fornecedor_nome'] ?? null,
                    $item['produto_nome'] ?? null,
                    $item['quantidade'] ?? null,
                    $item['valor_unitario'] ?? null,
                    $item['valor_unitario'] ?? null,
                    $total,
                    $tipoAprovacao
                ]);
            }
        } else {
            // Se não houver itens específicos, inserir um registro geral
            $detalhes = json_encode([
                'motivo' => $motivo,
                'tipo_aprovacao' => $tipoAprovacao
            ]);
            
            $stmt->execute([
                $cotacaoId,
                $usuarioId,
                $acao,
                $detalhes,
                null, // fornecedor
                null, // produto_nome
                null, // qtd
                null, // valor_unitario
                null, // valor_aprovado
                null, // total
                $tipoAprovacao
            ]);
        }
        
        return true;
    } catch (Exception $e) {
        error_log("Erro ao salvar histórico de cotação: " . $e->getMessage());
        return false;
    }
}

// Função auxiliar para verificar se uma coluna existe
function columnExists($conn, $table, $column) {
    try {
        $stmt = $conn->prepare("SHOW COLUMNS FROM {$table} LIKE ?");
        $stmt->execute([$column]);
        return $stmt->rowCount() > 0;
    } catch (Exception $e) {
        return false;
    }
}

// When a cotação is sent for approval
if ($dados['status'] === 'aguardando_aprovacao') {

    // Create notification for approvers
    $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo IN ('admin', 'gerencia', 'administrador')");
    $stmt->execute();
    $approvers = $stmt->fetchAll(PDO::FETCH_ASSOC);

    foreach ($approvers as $approver) {
        createNotification(
            $conn,
            $approver['id'],
            $dados['id'],
            "Nova cotação #{$dados['id']} aguardando aprovação",
            'nova_cotacao'
        );
    }
}

// When a cotação is approved
if ($dados['status'] === 'aprovado') {

    // Create notification for the buyer
    $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
    $stmt->execute([$dados['id']]);
    $buyerId = $stmt->fetchColumn();

    if ($buyerId) {
        createNotification(
            $conn,
            $buyerId,
            $dados['id'],
            "Sua cotação #{$dados['id']} foi aprovada",
            'aprovado'
        );
    }
}

if ($dados['status'] === 'aguardando_aprovacao_supervisor') {
    error_log("Iniciando processo de envio para aprovação do supervisor da cotação ID: " . $dados['id']);
    
    try {
        // Verificar se o usuário na sessão existe no banco de dados
        $usuarioId = $_SESSION['usuario']['id'];
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE id = ?");
        $stmt->execute([$usuarioId]);
        $usuarioExiste = $stmt->fetch();
        
        // Se o usuário não existir, usar o usuário da cotação
        if (!$usuarioExiste) {
            $stmt = $conn->prepare("SELECT usuario_id FROM cotacoes WHERE id = ?");
            $stmt->execute([$dados['id']]);
            $usuarioId = $stmt->fetchColumn();
            
            // Se ainda não encontrar um usuário válido, usar um administrador
            if (!$usuarioId) {
                $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo = 'admin' LIMIT 1");
                $stmt->execute();
                $usuarioId = $stmt->fetchColumn();
                
                // Se não houver administrador, usar o primeiro usuário disponível
                if (!$usuarioId) {
                    $stmt = $conn->prepare("SELECT id FROM usuarios LIMIT 1");
                    $stmt->execute();
                    $usuarioId = $stmt->fetchColumn();
                    
                    // Se não houver nenhum usuário, lançar erro
                    if (!$usuarioId) {
                        throw new Exception("Não foi possível encontrar um usuário válido para registrar a versão");
                    }
                }
            }
            
            // Atualizar a sessão com o ID válido
            $_SESSION['usuario']['id'] = $usuarioId;
        }
        
        // 1. Busca a versão atual da cotação
        $stmt = $conn->prepare("SELECT COUNT(*) as total_versoes FROM cotacoes_versoes WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        $result = $stmt->fetch(PDO::FETCH_ASSOC);
        $novaVersao = (int)$result['total_versoes'] + 1;
        error_log("Nova versão será: " . $novaVersao);

        // 2. Busca todos os dados atuais da cotação
        $stmt = $conn->prepare("SELECT * FROM cotacoes WHERE id = ?");
        $stmt->execute([$dados['id']]);
        $cotacao = $stmt->fetch(PDO::FETCH_ASSOC);

        // 3. Busca todos os itens da cotação
        $stmt = $conn->prepare("SELECT * FROM itens_cotacao WHERE cotacao_id = ?");
        $stmt->execute([$dados['id']]);
        $itens = $stmt->fetchAll(PDO::FETCH_ASSOC);

        // 4. Prepara os dados para armazenar como versão
        $dadosVersao = [
            'cotacao' => $cotacao,
            'itens' => $itens,
            'motivo' => $dados['motivo'] ?? 'Envio para aprovação do supervisor',
            'usuario' => $usuarioId // Usar o ID verificado
        ];

        // 5. Insere a nova versão
        $stmt = $conn->prepare("INSERT INTO cotacoes_versoes
                              (cotacao_id, versao, dados_json, usuario_id)
                              VALUES (?, ?, ?, ?)");
        $stmt->execute([
            $dados['id'],
            $novaVersao,
            json_encode($dadosVersao),
            $usuarioId // Usar o ID verificado
        ]);

        // Create notification for supervisors
        $stmt = $conn->prepare("SELECT id FROM usuarios WHERE tipo = 'supervisor'");
        $stmt->execute();
        $supervisors = $stmt->fetchAll(PDO::FETCH_ASSOC);

        foreach ($supervisors as $supervisor) {
            createNotification(
                $conn,
                $supervisor['id'],
                $dados['id'],
                "Nova cotação #{$dados['id']} aguardando análise do supervisor",
                'nova_cotacao_supervisor'
            );
        }
    } catch (Exception $e) {
        error_log("Erro ao processar envio para aprovação do supervisor: " . $e->getMessage());
        throw $e;
    }
}

