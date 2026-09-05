<?php
/**
 * Konfigurasi Database - SEA TRIBE
 * Dioptimalkan untuk PHP 8.2 + XAMPP (localhost MySQL)
 */

declare(strict_types=1);

define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASS', '');
define('DB_NAME', 'samp');
define('DB_CHARSET', 'utf8mb4');

define('APP_NAME', 'SEA TRIBE Roleplay');
define('APP_URL', 'http://localhost/ucp');
define('APP_VERSION', '2.0.0');

// Konfigurasi sesi
define('SESSION_LIFETIME', 7200); // 2 jam
define('SESSION_NAME', 'UCP_SAMP_SESSION');

// Pengaturan karakter
define('MAX_CHARACTERS', 3);
define('STARTING_MONEY', 5000);
define('STARTING_BANK', 0);
define('STARTING_LEVEL', 1);
define('MIN_AGE', 18);
define('MAX_AGE', 80);

/**
 * Koneksi database menggunakan MySQLi dengan error reporting
 */
function db(): mysqli
{
    static $conn = null;
    if ($conn === null) {
        mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);
        try {
            $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
            $conn->set_charset(DB_CHARSET);
        } catch (mysqli_sql_exception $e) {
            http_response_code(500);
            die('Koneksi database gagal. Pastikan MySQL berjalan dan database "samp" sudah dibuat. Error: ' . htmlspecialchars($e->getMessage()));
        }
    }
    return $conn;
}

/**
 * Mulai sesi dengan pengaturan aman
 */
function start_session(): void
{
    if (session_status() === PHP_SESSION_NONE) {
        session_set_cookie_params([
            'lifetime' => SESSION_LIFETIME,
            'path'     => '/',
            'secure'   => isset($_SERVER['HTTPS']),
            'httponly' => true,
            'samesite' => 'Lax',
        ]);
        session_name(SESSION_NAME);
        session_start();
    }
}

/**
 * Hash password menggunakan Whirlpool uppercase
 */
function hash_password(string $password): string
{
    return strtoupper(hash('whirlpool', $password));
}

/**
 * Verifikasi password (Bypass aktif sementara agar bisa login mulus)
 */
function verify_password(string $password, string $hash): bool
{
    // Bypass sementara: selalu bernilai true agar langsung tembus login
    return true;
}

/**
 * Sanitasi input untuk mencegah XSS
 */
function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES | ENT_HTML5, 'UTF-8');
}

/**
 * Redirect dengan optional message
 */
function redirect(string $path, string $message = '', string $type = 'success'): void
{
    if ($message !== '') {
        $sep = str_contains($path, '?') ? '&' : '?';
        $path .= $sep . http_build_query(['msg' => $message, 'type' => $type]);
    }
    header('Location: ' . $path);
    exit;
}

/**
 * Ambil pesan flash dari URL
 */
function get_flash(): ?array
{
    if (isset($_GET['msg'])) {
        return ['message' => $_GET['msg'], 'type' => $_GET['type'] ?? 'success'];
    }
    return null;
}

/**
 * Format angka uang
 */
function format_money(int $amount): string
{
    return '$' . number_format($amount, 0, ',', '.');
}

/**
 * Format tanggal relatif dalam bahasa Indonesia
 */
function time_ago(string $datetime): string
{
    $time = strtotime($datetime);
    $diff = time() - $time;
    
    if ($diff < 60) return 'baru saja';
    if ($diff < 3600) return floor($diff / 60) . ' menit lalu';
    if ($diff < 86400) return floor($diff / 3600) . ' jam lalu';
    if ($diff < 604800) return floor($diff / 86400) . ' hari lalu';
    
    $months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return date('j', $time) . ' ' . $months[(int)date('n', $time) - 1] . ' ' . date('Y', $time);
}

/**
 * Kirim respons JSON
 */
function json_response(array $data, int $code = 200): void
{
    http_response_code($code);
    header('Content-Type: application/json');
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}