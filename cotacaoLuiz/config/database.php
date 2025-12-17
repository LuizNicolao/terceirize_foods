<?php
// filepath: c:\Xampp\htdocs\cotacao\config\database.php
function conectarDB() {
    // Tentar ler variáveis de ambiente, usar valores padrão se não disponíveis
    $host = getenv('DB_HOST') ?: ($_SERVER['DB_HOST'] ?? 'db');
    $port = getenv('DB_PORT') ?: ($_SERVER['DB_PORT'] ?? '3306');
    $dbname = getenv('DB_NAME') ?: ($_SERVER['DB_NAME'] ?? 'cotacao_db');
    $username = getenv('DB_USER') ?: ($_SERVER['DB_USER'] ?? 'root');
    $password = getenv('DB_PASSWORD') ?: ($_SERVER['DB_PASSWORD'] ?? 'cotacao_root_password_2024');

    try {
        $conn = new PDO("mysql:host=$host;port=$port;dbname=$dbname;charset=utf8", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        header('Content-Type: application/json');
        echo json_encode([
            'success' => false,
            'message' => 'Database connection error',
            'error' => $e->getMessage()
        ]);
        exit;
    }
}

?>
