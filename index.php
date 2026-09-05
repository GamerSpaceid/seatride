<?php
/**
 * Halaman Landing - SEA TRIBE
 */
require_once __DIR__ . '/config.php';

// Definisi fungsi fallback pengaman jika belum ada di file include
if (!function_exists('start_session')) {
    function start_session() {
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
    }
}

if (!function_exists('is_logged_in')) {
    function is_logged_in() {
        return isset($_SESSION['user_id']) || isset($_SESSION['username']);
    }
}

if (!function_exists('e')) {
    function e($string) {
        return htmlspecialchars($string ?? '', ENT_QUOTES, 'UTF-8');
    }
}

if (!function_exists('get_online_count')) {
    function get_online_count() {
        // Koneksi database langsung menggunakan parameter dari config.php
        $conn = @mysqli_connect(DB_HOST, DB_USER, DB_PASS, DB_NAME);
        if (!$conn) {
            return 0;
        }
        
        // Sesuaikan nama tabel player online di server SA-MP lu (misal: players atau users)
        $result = @mysqli_query($conn, "SELECT COUNT(*) as total FROM players WHERE online = 1");
        if ($result) {
            $data = mysqli_fetch_assoc($result);
            mysqli_close($conn);
            return (int)$data['total'];
        }
        
        mysqli_close($conn);
        return 0;
    }
}

start_session();

$onlineCount = 0;
try {
    $onlineCount = get_online_count();
} catch (Exception $e) {
    $onlineCount = 0;
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e(defined('APP_NAME') ? APP_NAME : 'SEA TRIBE') ?> - User Control Panel</title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<div class="landing-hero">
    <div class="landing-content">
        <div class="landing-badge">
            <span class="live-dot"></span>
            <span><?= $onlineCount ?> Pemain Online Sekarang</span>
        </div>
        <h1>Selamat Datang di <span class="gradient-text">SEA TRIBE Roleplay</span></h1>
        <p>Panel kontrol pengguna resmi server SA-MP kami. Kelola karakter, ikuti forum komunitas, dan rasakan pengalaman roleplay terbaik.</p>
        <div class="landing-buttons">
            <?php if (is_logged_in()): ?>
                <a href="dashboard.php" class="btn btn-primary btn-lg"><i class="fas fa-tachometer-alt"></i> Ke Dashboard</a>
            <?php else: ?>
                <a href="login.php" class="btn btn-primary btn-lg"><i class="fas fa-sign-in-alt"></i> Masuk</a>
                <a href="register.php" class="btn btn-secondary btn-lg"><i class="fas fa-user-plus"></i> Daftar Akun</a>
            <?php endif; ?>
        </div>

        <div class="landing-features">
            <div class="landing-feature">
                <i class="fas fa-users"></i>
                <h3>Manajemen Karakter</h3>
                <p>Buat dan kelola hingga 3 karakter dengan statistik lengkap</p>
            </div>
            <div class="landing-feature">
                <i class="fas fa-comments"></i>
                <h3>Forum Komunitas</h3>
                <p>Diskusi, panduan, dan pengumuman dalam satu tempat</p>
            </div>
            <div class="landing-feature">
                <i class="fas fa-signal"></i>
                <h3>Pelacak Pemain</h3>
                <p>Lihat siapa yang sedang online secara real-time</p>
            </div>
            <div class="landing-feature">
                <i class="fas fa-shield-alt"></i>
                <h3>Keamanan Terjamin</h3>
                <p>Password di-hash dengan Whirlpool, sesuai game server</p>
            </div>
        </div>
    </div>
</div>
<script src="assets/js/main.js"></script>
</body>
</html>