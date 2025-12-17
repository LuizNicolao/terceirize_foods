<?php
// Limpar qualquer saída anterior
while (ob_get_level()) {
    ob_end_clean();
}

// Configurações iniciais
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 0); // Não exibir erros diretamente

// Capturar erros e convertê-los em JSON
set_error_handler(function($errno, $errstr, $errfile, $errline) {
    http_response_code(500);
    echo json_encode([
        'erro' => true,
        'mensagem' => "Erro PHP: $errstr",
        'arquivo' => $errfile,
        'linha' => $errline
    ]);
    exit;
});

// Capturar exceções não tratadas
set_exception_handler(function($e) {
    http_response_code(500);
    echo json_encode([
        'erro' => true,
        'mensagem' => "Exceção: " . $e->getMessage(),
        'arquivo' => $e->getFile(),
        'linha' => $e->getLine()
    ]);
    exit;
});

// Incluir configuração do banco de dados
require_once '../config/database.php';

// Conectar ao banco de dados
try {
    $conn = conectarDB();
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => true,
        'mensagem' => "Erro de conexão: " . $e->getMessage()
    ]);
    exit;
}

// Verificar se a tabela sawing existe
try {
    $stmt = $conn->prepare("SHOW TABLES LIKE 'sawing'");
    $stmt->execute();
    $tabelaExiste = $stmt->fetchColumn();
    
    if (!$tabelaExiste) {
        http_response_code(500);
        echo json_encode([
            'erro' => true,
            'mensagem' => "A tabela 'sawing' não existe no banco de dados"
        ]);
        exit;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'erro' => true,
        'mensagem' => "Erro ao verificar tabela: " . $e->getMessage()
    ]);
    exit;
}

// Função para retornar erro em formato JSON
function retornarErro($mensagem, $codigo = 500) {
    http_response_code($codigo);
    echo json_encode(['error' => $mensagem]);
    exit;
}

// Verificar autenticação
session_start();
if (!isset($_SESSION['usuario'])) {
    retornarErro('Não autorizado', 401);
}

// Verificar se a tabela sawing_itens existe
try {
    $stmt = $conn->prepare("SHOW TABLES LIKE 'sawing_itens'");
    $stmt->execute();
    $tabelaItensExiste = $stmt->fetchColumn();
    
    if (!$tabelaItensExiste) {
        error_log("AVISO: A tabela 'sawing_itens' não existe no banco de dados");
    }
} catch (Exception $e) {
    error_log("Erro na verificação inicial: " . $e->getMessage());
    // Não interromper a execução por causa deste erro
}

// Verificar se é uma solicitação de exportação
if (isset($_GET['exportar']) && $_GET['exportar'] === 'excel') {
    try {
        exportarDados($conn);
    } catch (Exception $e) {
        retornarErro('Erro ao exportar dados: ' . $e->getMessage());
    }
    exit;
}

// Verificar se é uma solicitação de detalhes
if (isset($_GET['id'])) {
    $id = intval($_GET['id']);
    try {
        obterDetalhes($conn, $id);
    } catch (Exception $e) {
        retornarErro('Erro ao obter detalhes: ' . $e->getMessage());
    }
    exit;
}

// Verificar se é uma solicitação de compradores
if (isset($_GET['acao']) && $_GET['acao'] === 'listar_compradores') {
    try {
        listarCompradores($conn);
    } catch (Exception $e) {
        retornarErro('Erro ao listar compradores: ' . $e->getMessage());
    }
    exit;
}

// Caso contrário, listar registros
try {
    listarRegistros($conn);
} catch (Exception $e) {
    retornarErro('Erro ao listar registros: ' . $e->getMessage());
}

// Função para listar registros
function listarRegistros($conn) {
    try {
        // Parâmetros de paginação
        $pagina = isset($_GET['pagina']) ? intval($_GET['pagina']) : 1;
        $limite = isset($_GET['limite']) ? intval($_GET['limite']) : 10;
        $offset = ($pagina - 1) * $limite;
        
        // Construir a consulta SQL base
        $sqlBase = "
                FROM sawing s
                LEFT JOIN usuarios u ON s.usuario_id = u.id
                WHERE 1=1";
        
        // Aplicar filtros, se houver
        $filtros = [];
        $paramsConsulta = [];
        
        if (isset($_GET['comprador']) && !empty($_GET['comprador'])) {
            $filtros[] = "s.usuario_id = ?";
            $paramsConsulta[] = $_GET['comprador'];
        }
        
        if (isset($_GET['status']) && !empty($_GET['status'])) {
            $filtros[] = "s.status = ?";
            $paramsConsulta[] = $_GET['status'];
        }
        
        if (isset($_GET['tipo']) && !empty($_GET['tipo'])) {
            $filtros[] = "s.tipo = ?";
            $paramsConsulta[] = $_GET['tipo'];
        }
        
        if (isset($_GET['data_inicio']) && !empty($_GET['data_inicio'])) {
            $filtros[] = "DATE(s.data_registro) >= ?";
            $paramsConsulta[] = $_GET['data_inicio'];
        }
        
        if (isset($_GET['data_fim']) && !empty($_GET['data_fim'])) {
            $filtros[] = "DATE(s.data_registro) <= ?";
            $paramsConsulta[] = $_GET['data_fim'];
        }
        
        // Adicionar filtros à query base
        if (!empty($filtros)) {
            $sqlBase .= " AND " . implode(" AND ", $filtros);
        }
        
        // Consulta para contar total de registros (sem LIMIT e OFFSET)
        $sqlCount = "SELECT COUNT(*) " . $sqlBase;
        
        // Consulta principal (com LIMIT e OFFSET)
        $sql = "SELECT s.*, u.nome as comprador_nome " . $sqlBase . " ORDER BY s.data_registro DESC LIMIT " . $limite . " OFFSET " . $offset;
        
        // Executar consulta para contar total de registros
        $stmtCount = $conn->prepare($sqlCount);
        $stmtCount->execute($paramsConsulta);
        $totalRegistros = $stmtCount->fetchColumn();
        
        // Executar consulta principal
        $stmt = $conn->prepare($sql);
        $stmt->execute($paramsConsulta);
        $registros = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular resumo
        $resumo = calcularResumo($conn, $paramsConsulta);
        
        // Retornar dados
        echo json_encode([
            'registros' => $registros,
            'total' => $totalRegistros,
            'pagina' => $pagina,
            'limite' => $limite,
            'resumo' => $resumo
        ]);
        
    } catch (Exception $e) {
        retornarErro('Erro ao listar registros: ' . $e->getMessage());
    }
}

// Função para obter detalhes de um registro
function obterDetalhes($conn, $id) {
    try {
        // Obter dados básicos do registro
        $stmt = $conn->prepare("
            SELECT s.*, u.nome as comprador_nome
            FROM sawing s
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            WHERE s.id = ?
        ");
        $stmt->execute([$id]);
        $registro = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if (!$registro) {
            http_response_code(404);
            echo json_encode(['error' => 'Registro não encontrado']);
            exit;
        }
        
        // Inicializar arrays vazios para produtos e rodadas
        $registro['produtos'] = [];
        $registro['rodadas_historico'] = [];
        
        // Buscar itens do sawing
        try {
                $stmt = $conn->prepare("
                SELECT *
                FROM sawing_itens
                WHERE sawing_id = ?
                ");
                $stmt->execute([$id]);
                $registro['produtos'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
                
                // Mapear campos para o formato esperado pelo frontend
                foreach ($registro['produtos'] as &$produto) {
                $produto['nome'] = $produto['descricao'] ?? 'Produto sem nome';
                    $produto['quantidade'] = $produto['quantidade'] ?? 1;
                $produto['fornecedor'] = $produto['fornecedor'] ?? 'N/A';
            }
        } catch (Exception $e) {
            error_log("Erro ao buscar itens: " . $e->getMessage());
        }
        
        // Buscar histórico de rodadas (se existir)
        try {
            $checkTable = $conn->query("SHOW TABLES LIKE 'sawing_rodadas'");
            if ($checkTable->rowCount() > 0) {
                $stmt = $conn->prepare("
                    SELECT * FROM sawing_rodadas
                    WHERE sawing_id = ?
                    ORDER BY data ASC
                ");
                $stmt->execute([$id]);
                $registro['rodadas_historico'] = $stmt->fetchAll(PDO::FETCH_ASSOC);
            } else {
                // Criar um histórico básico com base nos dados disponíveis
                $registro['rodadas_historico'] = [
                    [
                        'data' => $registro['data_registro'],
                        'valor' => $registro['valor_total_inicial'],
                        'economia_acumulada' => 0,
                        'economia_percentual' => 0,
                        'observacao' => 'Valor inicial'
                    ],
                    [
                        'data' => $registro['data_registro'],
                        'valor' => $registro['valor_total_final'],
                        'economia_acumulada' => $registro['economia'],
                        'economia_percentual' => $registro['economia_percentual'],
                        'observacao' => 'Valor final após negociação'
                    ]
                ];
            }
        } catch (Exception $e) {
            error_log("Erro ao buscar rodadas: " . $e->getMessage());
        }
        
        // Retornar resultado como JSON
        echo json_encode($registro);
        
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'error' => 'Erro ao obter detalhes: ' . $e->getMessage()
        ]);
    }
}

// Função para calcular resumo
function calcularResumo($conn, $paramsConsulta) {
    try {
        // Consulta para calcular resumo geral
        $sql = "
            SELECT 
                COALESCE(SUM(economia), 0) as economia_total,
                COALESCE(SUM(valor_total_inicial), 0) as valor_inicial_total,
                COALESCE(SUM(valor_total_final), 0) as valor_final_total,
                COUNT(*) as total_registros,
                COALESCE(SUM(rodadas), 0) as total_rodadas
            FROM sawing s
            WHERE 1=1
        ";
        
        // Aplicar os mesmos filtros da consulta principal
        $filtros = [];
        
        if (isset($_GET['comprador']) && !empty($_GET['comprador'])) {
            $filtros[] = "s.usuario_id = ?";
        }
        
        if (isset($_GET['status']) && !empty($_GET['status'])) {
            $filtros[] = "s.status = ?";
        }
        
        if (isset($_GET['tipo']) && !empty($_GET['tipo'])) {
            $filtros[] = "s.tipo = ?";
        }
        
        if (isset($_GET['data_inicio']) && !empty($_GET['data_inicio'])) {
            $filtros[] = "DATE(s.data_registro) >= ?";
        }
        
        if (isset($_GET['data_fim']) && !empty($_GET['data_fim'])) {
            $filtros[] = "DATE(s.data_registro) <= ?";
        }
        
        if (!empty($filtros)) {
            $sql .= " AND " . implode(" AND ", $filtros);
        }
        
        $stmt = $conn->prepare($sql);
        $stmt->execute($paramsConsulta);
        $dados = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Consulta para calcular métricas por comprador
        $sqlCompradores = "
            SELECT 
                u.nome as comprador_nome,
                COUNT(*) as total_registros,
                COALESCE(SUM(s.economia), 0) as economia_total,
                COALESCE(SUM(s.valor_total_inicial), 0) as valor_inicial_total,
                COALESCE(SUM(s.valor_total_final), 0) as valor_final_total,
                COALESCE(SUM(s.rodadas), 0) as total_rodadas
            FROM sawing s
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            WHERE 1=1
        ";
        
        // Aplicar os mesmos filtros
        if (!empty($filtros)) {
            $sqlCompradores .= " AND " . implode(" AND ", $filtros);
        }
        $sqlCompradores .= " GROUP BY s.usuario_id, u.nome";
        
        $stmtCompradores = $conn->prepare($sqlCompradores);
        $stmtCompradores->execute($paramsConsulta);
        $compradores = $stmtCompradores->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular economia percentual média
        $economiaPercentual = $dados['valor_inicial_total'] > 0 ? 
            ($dados['economia_total'] / $dados['valor_inicial_total'] * 100) : 0;
        
        return [
            'economia_total' => $dados['economia_total'],
            'economia_percentual' => $economiaPercentual,
            'total_negociado' => $dados['valor_inicial_total'],
            'total_aprovado' => $dados['valor_final_total'],
            'total_rodadas' => $dados['total_rodadas'],
            'compradores' => $compradores
        ];
        
    } catch (Exception $e) {
        error_log("Erro ao calcular resumo: " . $e->getMessage());
        return [
            'economia_total' => 0,
            'economia_percentual' => 0,
            'total_negociado' => 0,
            'total_aprovado' => 0,
            'total_rodadas' => 0,
            'compradores' => []
        ];
    }
}

// Função para exportar
function exportarDados($conn) {
    $formato = $_GET['formato'] ?? 'excel';
    
    // Construir query base com as colunas existentes
    $sql = "SELECT s.*, u.nome as comprador_nome 
            FROM sawing s
            LEFT JOIN usuarios u ON s.usuario_id = u.id 
            WHERE 1=1";
    
    // Aplicar filtros
    $params = [];
    if (isset($_GET['comprador']) && !empty($_GET['comprador'])) {
        $sql .= " AND s.usuario_id = ?";
        $params[] = $_GET['comprador'];
    }
    
    if (isset($_GET['status']) && !empty($_GET['status'])) {
        $sql .= " AND s.status = ?";
        $params[] = $_GET['status'];
    }
    
    if (isset($_GET['tipo']) && !empty($_GET['tipo'])) {
        $sql .= " AND s.tipo = ?";
        $params[] = $_GET['tipo'];
    }
    
    if (isset($_GET['data_inicio']) && !empty($_GET['data_inicio'])) {
        $sql .= " AND s.data_registro >= ?";
        $params[] = $_GET['data_inicio'];
    }
    
    if (isset($_GET['data_fim']) && !empty($_GET['data_fim'])) {
        $sql .= " AND s.data_registro <= ?";
        $params[] = $_GET['data_fim'];
    }
    
    if (isset($_GET['motivo_emergencial']) && !empty($_GET['motivo_emergencial'])) {
        $sql .= " AND s.motivo_emergencial = ?";
        $params[] = $_GET['motivo_emergencial'];
    }
    
    $sql .= " ORDER BY u.nome, s.data_registro DESC";
    
    $stmt = $conn->prepare($sql);
    $stmt->execute($params);
    $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
    
    if ($formato === 'excel') {
        // Configurar headers para Excel
        header('Content-Type: application/vnd.ms-excel; charset=UTF-8');
        header('Content-Disposition: attachment; filename="sawing_export_' . date('Y-m-d') . '.xls"');
        header('Cache-Control: max-age=0');
        header('Pragma: public');
    
        // Início do arquivo Excel com BOM para UTF-8
        echo "\xEF\xBB\xBF";
        
        // Estilo CSS para melhor formatação
        echo '<style>
            .header { background-color: #4472C4; color: white; font-weight: bold; }
            .subheader { background-color: #D9E1F2; font-weight: bold; }
            .total-row { background-color: #E2EFDA; font-weight: bold; }
            .comprador-header { background-color: #FCE4D6; font-weight: bold; }
            .item-row { background-color: #F5F5F5; }
            .summary-row { background-color: #FFF2CC; font-weight: bold; }
            .emergency-row { background-color: #FFD9D9; }
            .highlight { background-color: #FFEB9C; }
            .success { background-color: #C6EFCE; }
            .warning { background-color: #FFEB9C; }
            .error { background-color: #FFC7CE; }
        </style>';
        
        // Resumo Geral
        echo '<h2>Resumo Geral</h2>';
    echo '<table border="1">';
        echo '<tr class="header">';
        echo '<th>Total de Cotações</th>';
        echo '<th>Total Economia</th>';
        echo '<th>Média Percentual</th>';
        echo '<th>Total Concluídos</th>';
        echo '<th>Total Cancelados</th>';
        echo '<th>Total Emergenciais</th>';
        echo '<th>Média de Rodadas</th>';
        echo '<th>Valor Total Negociado</th>';
        echo '<th>Valor Total Aprovado</th>';
        echo '<th>Economia Média por Cotação</th>';
        echo '</tr>';
        
        $sql_geral = "SELECT 
            COUNT(DISTINCT id) as total_cotacoes,
            SUM(economia) as total_economia,
            AVG(economia_percentual) as media_percentual,
            COUNT(DISTINCT CASE WHEN status = 'concluido' THEN id END) as total_concluidos,
            COUNT(DISTINCT CASE WHEN status = 'cancelado' THEN id END) as total_cancelados,
            COUNT(DISTINCT CASE WHEN tipo = 'emergencial' THEN id END) as total_emergenciais,
            AVG(rodadas) as media_rodadas,
            SUM(valor_total_inicial) as valor_total_negociado,
            SUM(valor_total_final) as valor_total_aprovado,
            AVG(economia) as economia_media
        FROM sawing";
        
        $stmt_geral = $conn->prepare($sql_geral);
        $stmt_geral->execute();
        $metricas_gerais = $stmt_geral->fetch(PDO::FETCH_ASSOC);
        
        echo '<tr class="summary-row">';
        echo '<td>' . htmlspecialchars($metricas_gerais['total_cotacoes'] ?? '0') . '</td>';
        echo '<td>R$ ' . number_format($metricas_gerais['total_economia'] ?? 0, 2, ',', '.') . '</td>';
        echo '<td>' . number_format($metricas_gerais['media_percentual'] ?? 0, 2, ',', '.') . '%</td>';
        echo '<td>' . htmlspecialchars($metricas_gerais['total_concluidos'] ?? '0') . '</td>';
        echo '<td>' . htmlspecialchars($metricas_gerais['total_cancelados'] ?? '0') . '</td>';
        echo '<td>' . htmlspecialchars($metricas_gerais['total_emergenciais'] ?? '0') . '</td>';
        echo '<td>' . number_format($metricas_gerais['media_rodadas'] ?? 0, 1, ',', '.') . '</td>';
        echo '<td>R$ ' . number_format($metricas_gerais['valor_total_negociado'] ?? 0, 2, ',', '.') . '</td>';
        echo '<td>R$ ' . number_format($metricas_gerais['valor_total_aprovado'] ?? 0, 2, ',', '.') . '</td>';
        echo '<td>R$ ' . number_format($metricas_gerais['economia_media'] ?? 0, 2, ',', '.') . '</td>';
        echo '</tr>';
        echo '</table>';
        
        echo '<br><br>';
        
        // Comparação entre Compradores
        echo '<h2>Comparação entre Compradores</h2>';
        echo '<table border="1">';
        echo '<tr class="header">';
        echo '<th>Comprador</th>';
        echo '<th>Total Cotações</th>';
        echo '<th>Total Economia</th>';
        echo '<th>Média % Economia</th>';
        echo '<th>Economia/Cotação</th>';
        echo '<th>Taxa Conclusão</th>';
        echo '<th>Taxa Cancelamento</th>';
        echo '<th>Média Rodadas</th>';
        echo '<th>Valor Médio Cotação</th>';
        echo '<th>Ranking Economia</th>';
        echo '<th>Ranking Eficiência</th>';
    echo '</tr>';
    
        $sql_comparacao = "SELECT 
            u.nome as comprador_nome,
            COUNT(s.id) as total_cotacoes,
            SUM(s.economia) as total_economia,
            AVG(s.economia_percentual) as media_percentual,
            AVG(s.economia) as economia_media,
            COUNT(CASE WHEN s.status = 'concluido' THEN 1 END) * 100.0 / COUNT(s.id) as taxa_conclusao,
            COUNT(CASE WHEN s.status = 'cancelado' THEN 1 END) * 100.0 / COUNT(s.id) as taxa_cancelamento,
            AVG(s.rodadas) as media_rodadas,
            AVG(s.valor_total_inicial) as valor_medio_cotacao
        FROM sawing s
        LEFT JOIN usuarios u ON s.usuario_id = u.id
        GROUP BY s.usuario_id, u.nome
        ORDER BY total_economia DESC";
        
        $stmt_comparacao = $conn->prepare($sql_comparacao);
        $stmt_comparacao->execute();
        $comparacao = $stmt_comparacao->fetchAll(PDO::FETCH_ASSOC);
        
        // Calcular rankings
        $rankings = [];
        foreach ($comparacao as $index => $comprador) {
            // Ranking por economia total
            $rankings[$comprador['comprador_nome']]['economia'] = $index + 1;
            
            // Ranking por eficiência (média de economia percentual * taxa de conclusão)
            $eficiencia = ($comprador['media_percentual'] ?? 0) * ($comprador['taxa_conclusao'] ?? 0) / 100;
            $rankings[$comprador['comprador_nome']]['eficiencia'] = $eficiencia;
        }
        
        // Ordenar por eficiência para o ranking
        uasort($rankings, function($a, $b) {
            return $b['eficiencia'] <=> $a['eficiencia'];
        });
        
        // Atribuir posições do ranking de eficiência
        $posicao = 1;
        foreach ($rankings as $comprador => $ranking) {
            $rankings[$comprador]['posicao_eficiencia'] = $posicao++;
        }
        
        foreach ($comparacao as $comprador) {
            $rowClass = '';
            if ($rankings[$comprador['comprador_nome']]['economia'] === 1) {
                $rowClass = 'highlight';
            }
            
            echo '<tr class="' . $rowClass . '">';
            echo '<td>' . htmlspecialchars($comprador['comprador_nome']) . '</td>';
            echo '<td>' . htmlspecialchars($comprador['total_cotacoes']) . '</td>';
            echo '<td>R$ ' . number_format($comprador['total_economia'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($comprador['media_percentual'] ?? 0, 2, ',', '.') . '%</td>';
            echo '<td>R$ ' . number_format($comprador['economia_media'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($comprador['taxa_conclusao'] ?? 0, 1, ',', '.') . '%</td>';
            echo '<td>' . number_format($comprador['taxa_cancelamento'] ?? 0, 1, ',', '.') . '%</td>';
            echo '<td>' . number_format($comprador['media_rodadas'] ?? 0, 1, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($comprador['valor_medio_cotacao'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . $rankings[$comprador['comprador_nome']]['economia'] . 'º</td>';
            echo '<td>' . $rankings[$comprador['comprador_nome']]['posicao_eficiencia'] . 'º</td>';
            echo '</tr>';
        }
        echo '</table>';
        
        echo '<br><br>';
        
        // Análise por Tipo
        echo '<h2>Análise por Tipo</h2>';
        echo '<table border="1">';
        echo '<tr class="header">';
        echo '<th>Tipo</th>';
        echo '<th>Quantidade</th>';
        echo '<th>Total Economia</th>';
        echo '<th>Média Percentual</th>';
        echo '<th>Valor Total Negociado</th>';
        echo '<th>Valor Total Aprovado</th>';
        echo '<th>Média de Rodadas</th>';
        echo '<th>Economia Média</th>';
                    echo '</tr>';
                    
        $sql_tipos = "SELECT 
            tipo,
            COUNT(*) as quantidade,
            SUM(economia) as total_economia,
            AVG(economia_percentual) as media_percentual,
            SUM(valor_total_inicial) as valor_total_negociado,
            SUM(valor_total_final) as valor_total_aprovado,
            AVG(rodadas) as media_rodadas,
            AVG(economia) as economia_media
        FROM sawing
        GROUP BY tipo";
        
        $stmt_tipos = $conn->prepare($sql_tipos);
        $stmt_tipos->execute();
        $tipos = $stmt_tipos->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($tipos as $tipo) {
            echo '<tr class="item-row">';
            echo '<td>' . htmlspecialchars($tipo['tipo'] ?? 'Não especificado') . '</td>';
            echo '<td>' . htmlspecialchars($tipo['quantidade'] ?? '0') . '</td>';
            echo '<td>R$ ' . number_format($tipo['total_economia'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($tipo['media_percentual'] ?? 0, 2, ',', '.') . '%</td>';
            echo '<td>R$ ' . number_format($tipo['valor_total_negociado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($tipo['valor_total_aprovado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($tipo['media_rodadas'] ?? 0, 1, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($tipo['economia_media'] ?? 0, 2, ',', '.') . '</td>';
                        echo '</tr>';
                    }
                    echo '</table>';
        
        echo '<br><br>';
        
        // Análise por Status
        echo '<h2>Análise por Status</h2>';
        echo '<table border="1">';
        echo '<tr class="header">';
        echo '<th>Status</th>';
        echo '<th>Quantidade</th>';
        echo '<th>Total Economia</th>';
        echo '<th>Média Percentual</th>';
        echo '<th>Valor Total Negociado</th>';
        echo '<th>Valor Total Aprovado</th>';
        echo '<th>Média de Rodadas</th>';
        echo '</tr>';
        
        $sql_status = "SELECT 
            status,
            COUNT(*) as quantidade,
            SUM(economia) as total_economia,
            AVG(economia_percentual) as media_percentual,
            SUM(valor_total_inicial) as valor_total_negociado,
            SUM(valor_total_final) as valor_total_aprovado,
            AVG(rodadas) as media_rodadas
        FROM sawing
        GROUP BY status";
        
        $stmt_status = $conn->prepare($sql_status);
        $stmt_status->execute();
        $status_list = $stmt_status->fetchAll(PDO::FETCH_ASSOC);
        
        foreach ($status_list as $status) {
            $rowClass = $status['status'] === 'concluido' ? 'success' : 
                       ($status['status'] === 'cancelado' ? 'error' : 'item-row');
            
            echo '<tr class="' . $rowClass . '">';
            echo '<td>' . htmlspecialchars(traduzirStatus($status['status'])) . '</td>';
            echo '<td>' . htmlspecialchars($status['quantidade'] ?? '0') . '</td>';
            echo '<td>R$ ' . number_format($status['total_economia'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($status['media_percentual'] ?? 0, 2, ',', '.') . '%</td>';
            echo '<td>' . number_format($status['valor_total_negociado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($status['valor_total_aprovado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($status['media_rodadas'] ?? 0, 1, ',', '.') . '</td>';
            echo '</tr>';
        }
        echo '</table>';
        
        echo '<br><br>';
        
        // Agrupar por comprador
        $compradores = [];
        foreach ($result as $row) {
            $compradores[$row['comprador_nome']][] = $row;
        }
        
        foreach ($compradores as $comprador => $registros) {
            // Cabeçalho do Comprador
            echo '<h2>Comprador: ' . htmlspecialchars($comprador) . '</h2>';
            
            // Resumo do Comprador
            $sql_comprador = "SELECT 
                    COUNT(DISTINCT s.id) as total_cotacoes,
                    SUM(s.economia) as total_economia,
                AVG(s.economia_percentual) as media_percentual,
                COUNT(DISTINCT CASE WHEN s.status = 'concluido' THEN s.id END) as total_concluidos,
                COUNT(DISTINCT CASE WHEN s.status = 'cancelado' THEN s.id END) as total_cancelados,
                COUNT(DISTINCT CASE WHEN s.tipo = 'emergencial' THEN s.id END) as total_emergenciais,
                AVG(s.rodadas) as media_rodadas,
                SUM(s.valor_total_inicial) as valor_total_negociado,
                SUM(s.valor_total_final) as valor_total_aprovado,
                AVG(s.economia) as economia_media
                FROM sawing s
            LEFT JOIN usuarios u ON s.usuario_id = u.id
            WHERE u.nome = ?";
                
            $stmt_comprador = $conn->prepare($sql_comprador);
            $stmt_comprador->execute([$comprador]);
            $metricas_comprador = $stmt_comprador->fetch(PDO::FETCH_ASSOC);
            
            echo '<table border="1">';
            echo '<tr class="comprador-header">';
                echo '<th>Total de Cotações</th>';
                echo '<th>Total Economia</th>';
                echo '<th>Média Percentual</th>';
            echo '<th>Total Concluídos</th>';
            echo '<th>Total Cancelados</th>';
            echo '<th>Total Emergenciais</th>';
            echo '<th>Média de Rodadas</th>';
            echo '<th>Valor Total Negociado</th>';
            echo '<th>Valor Total Aprovado</th>';
            echo '<th>Economia Média</th>';
                echo '</tr>';
                
            echo '<tr class="summary-row">';
            echo '<td>' . htmlspecialchars($metricas_comprador['total_cotacoes'] ?? '0') . '</td>';
            echo '<td>R$ ' . number_format($metricas_comprador['total_economia'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>' . number_format($metricas_comprador['media_percentual'] ?? 0, 2, ',', '.') . '%</td>';
            echo '<td>' . htmlspecialchars($metricas_comprador['total_concluidos'] ?? '0') . '</td>';
            echo '<td>' . htmlspecialchars($metricas_comprador['total_cancelados'] ?? '0') . '</td>';
            echo '<td>' . htmlspecialchars($metricas_comprador['total_emergenciais'] ?? '0') . '</td>';
            echo '<td>' . number_format($metricas_comprador['media_rodadas'] ?? 0, 1, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($metricas_comprador['valor_total_negociado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($metricas_comprador['valor_total_aprovado'] ?? 0, 2, ',', '.') . '</td>';
            echo '<td>R$ ' . number_format($metricas_comprador['economia_media'] ?? 0, 2, ',', '.') . '</td>';
                    echo '</tr>';
                echo '</table>';
            
            echo '<br>';
            
            // Lista de Cotações do Comprador
            echo '<table border="1">';
            echo '<tr class="header">';
            echo '<th>ID</th>';
            echo '<th>Cotação</th>';
            echo '<th>Data</th>';
            echo '<th>Status</th>';
            echo '<th>Tipo</th>';
            echo '<th>Valor Inicial</th>';
            echo '<th>Valor Final</th>';
            echo '<th>Economia</th>';
            echo '<th>% Economia</th>';
            echo '<th>Rodadas</th>';
            echo '<th>Motivo Emergencial</th>';
            echo '<th>Observações</th>';
            echo '</tr>';
            
            foreach ($registros as $row) {
                $rowClass = '';
                if ($row['tipo'] === 'emergencial') {
                    $rowClass = 'emergency-row';
                } elseif ($row['status'] === 'concluido') {
                    $rowClass = 'success';
                } elseif ($row['status'] === 'cancelado') {
                    $rowClass = 'error';
                }
                
                echo '<tr class="' . $rowClass . '">';
                echo '<td>' . htmlspecialchars($row['id']) . '</td>';
                echo '<td>' . htmlspecialchars($row['cotacao_id'] ?? '') . '</td>';
                echo '<td>' . date('d/m/Y H:i', strtotime($row['data_registro'])) . '</td>';
                echo '<td>' . htmlspecialchars(traduzirStatus($row['status'])) . '</td>';
                echo '<td>' . htmlspecialchars($row['tipo'] ?? '') . '</td>';
                echo '<td>R$ ' . number_format($row['valor_total_inicial'] ?? 0, 2, ',', '.') . '</td>';
                echo '<td>R$ ' . number_format($row['valor_total_final'] ?? 0, 2, ',', '.') . '</td>';
                echo '<td>R$ ' . number_format($row['economia'] ?? 0, 2, ',', '.') . '</td>';
                echo '<td>' . number_format($row['economia_percentual'] ?? 0, 2, ',', '.') . '%</td>';
                echo '<td>' . htmlspecialchars($row['rodadas'] ?? '0') . '</td>';
                echo '<td>' . htmlspecialchars($row['motivo_emergencial'] ?? '') . '</td>';
                echo '<td>' . htmlspecialchars($row['observacoes'] ?? '') . '</td>';
                echo '</tr>';
                
                // Itens da Cotação
                $sql_itens = "SELECT * FROM sawing_itens WHERE sawing_id = ?";
                $stmt_itens = $conn->prepare($sql_itens);
                $stmt_itens->execute([$row['id']]);
                $itens = $stmt_itens->fetchAll(PDO::FETCH_ASSOC);
                
                if (!empty($itens)) {
                    echo '<tr><td colspan="12">';
                    echo '<table border="1" style="margin-left: 20px;">';
                    echo '<tr class="subheader">';
                    echo '<th>Produto</th>';
                    echo '<th>Fornecedor</th>';
                    echo '<th>Quantidade</th>';
                    echo '<th>Valor Unit. Inicial</th>';
                    echo '<th>Valor Unit. Final</th>';
                    echo '<th>Economia Unit.</th>';
                    echo '<th>% Economia</th>';
                    echo '<th>Valor Total</th>';
                    echo '<th>Status</th>';
                    echo '</tr>';
                    
                    foreach ($itens as $item) {
                        $valorTotal = ($item['quantidade'] ?? 0) * ($item['valor_unitario_final'] ?? 0);
                        $itemClass = '';
                        if ($item['status'] === 'aprovado') {
                            $itemClass = 'success';
                        } elseif ($item['status'] === 'rejeitado') {
                            $itemClass = 'error';
                        }
                        
                        echo '<tr class="' . $itemClass . '">';
                        echo '<td>' . htmlspecialchars($item['descricao'] ?? '') . '</td>';
                        echo '<td>' . htmlspecialchars($item['fornecedor'] ?? '') . '</td>';
                        echo '<td>' . htmlspecialchars($item['quantidade'] ?? '') . '</td>';
                        echo '<td>R$ ' . number_format($item['valor_unitario_inicial'] ?? 0, 2, ',', '.') . '</td>';
                        echo '<td>R$ ' . number_format($item['valor_unitario_final'] ?? 0, 2, ',', '.') . '</td>';
                        echo '<td>R$ ' . number_format($item['economia'] ?? 0, 2, ',', '.') . '</td>';
                        echo '<td>' . number_format($item['economia_percentual'] ?? 0, 2, ',', '.') . '%</td>';
                        echo '<td>R$ ' . number_format($valorTotal, 2, ',', '.') . '</td>';
                        echo '<td>' . htmlspecialchars($item['status'] ?? '') . '</td>';
                echo '</tr>';
                    }
                echo '</table>';
                echo '</td></tr>';
            }
    }
    echo '</table>';
            echo '<br><br>';
        }
    } else {
        http_response_code(400);
        echo json_encode(['erro' => 'Formato de exportação não suportado']);
    }
}

function traduzirStatus($status) {
    $status_map = [
        'pendente' => 'Pendente',
        'aprovado' => 'Aprovado',
        'rejeitado' => 'Rejeitado'
    ];
    return $status_map[$status] ?? $status;
}

// Função para listar compradores
function listarCompradores($conn) {
    try {
        $sql = "SELECT DISTINCT u.id, u.nome 
                FROM usuarios u 
                INNER JOIN sawing s ON u.id = s.usuario_id 
                ORDER BY u.nome";
        
        $stmt = $conn->prepare($sql);
        $stmt->execute();
        $compradores = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode([
            'success' => true,
            'compradores' => $compradores
        ]);
    } catch (Exception $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'mensagem' => "Erro ao listar compradores: " . $e->getMessage()
        ]);
    }
}
