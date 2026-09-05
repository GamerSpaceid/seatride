<?php
/**
 * Halaman Register - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';

if (is_logged_in()) {
    redirect('dashboard.php');
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $password = $_POST['password'] ?? '';
    $confirm = $_POST['confirm_password'] ?? '';

    $result = register_user($username, $email, $password, $confirm);
    if ($result['success']) {
        // Auto-login setelah register
        $loginResult = login_user($username, $password);
        if ($loginResult['success']) {
            redirect('dashboard.php', 'Akun berhasil dibuat! Selamat datang!', 'success');
        }
        redirect('login.php', 'Akun berhasil dibuat! Silakan login.', 'success');
    } else {
        $errors = $result['errors'];
    }
}

$pageTitle = 'Daftar Akun';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Daftar - <?= e(APP_NAME) ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-logo">
            <div class="logo-icon"><i class="fas fa-user-plus"></i></div>
            <h1>Buat Akun Baru</h1>
            <p>Daftar untuk mulai bermain</p>
        </div>

        <?php if (!empty($errors)): ?>
        <div class="auth-errors">
            <ul>
                <?php foreach ($errors as $err): ?>
                <li><?= e($err) ?></li>
                <?php endforeach; ?>
            </ul>
        </div>
        <?php endif; ?>

        <form class="auth-form" method="POST" action="register.php">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Username</label>
                <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" name="username" placeholder="Minimal 3 karakter" required autocomplete="username" value="<?= e($_POST['username'] ?? '') ?>">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-envelope"></i> Email</label>
                <div class="input-wrapper">
                    <i class="fas fa-envelope input-icon"></i>
                    <input type="email" name="email" placeholder="email@example.com" required autocomplete="email" value="<?= e($_POST['email'] ?? '') ?>">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" name="password" id="password" placeholder="Minimal 6 karakter" required autocomplete="new-password">
                    <button type="button" class="toggle-pass"><i class="fas fa-eye"></i></button>
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Konfirmasi Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" name="confirm_password" placeholder="Ulangi password" required autocomplete="new-password">
                    <button type="button" class="toggle-pass"><i class="fas fa-eye"></i></button>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fas fa-user-plus"></i> Daftar Sekarang</button>
        </form>

        <div class="auth-footer">
            Sudah punya akun? <a href="login.php">Masuk di sini</a>
        </div>
    </div>
</div>
<script src="assets/js/main.js"></script>
</body>
</html>
