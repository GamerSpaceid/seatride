<?php
/**
 * Halaman Login - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';

if (is_logged_in()) {
    redirect('dashboard.php');
}

$errors = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $username = trim($_POST['username'] ?? '');
    $password = $_POST['password'] ?? '';

    $result = login_user($username, $password);
    if ($result['success']) {
        redirect('dashboard.php', 'Selamat datang kembali, ' . e($username) . '!', 'success');
    } else {
        $errors[] = $result['error'];
    }
}

$pageTitle = 'Login';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - <?= e(APP_NAME) ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Orbitron:wght@700;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<div class="auth-wrapper">
    <div class="auth-card">
        <div class="auth-logo" style="box-shadow: none !important; filter: none !important; background: transparent !important;">
            <div style="background: transparent !important; border: none !important; box-shadow: none !important; filter: none !important; padding: 0; margin-bottom: -5px;">
                <img src="assets/logo/logo.png" alt="Logo" style="width: 140px; height: auto; object-fit: contain; display: block; margin: 0 auto; box-shadow: none !important; filter: none !important;">
            </div>
            <h1 style="font-family: 'Orbitron', sans-serif; font-weight: 900; letter-spacing: 2px; margin-top: 5px; font-size: 24px; color: #ffffff;">SEA TRIBE</h1>
            <p>Masuk ke akun Anda</p>
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

        <form class="auth-form" method="POST" action="login.php">
            <div class="form-group">
                <label><i class="fas fa-user"></i> Username</label>
                <div class="input-wrapper">
                    <i class="fas fa-user input-icon"></i>
                    <input type="text" name="username" placeholder="Masukkan username" required autocomplete="username" value="<?= e($_POST['username'] ?? '') ?>">
                </div>
            </div>
            <div class="form-group">
                <label><i class="fas fa-lock"></i> Password</label>
                <div class="input-wrapper">
                    <i class="fas fa-lock input-icon"></i>
                    <input type="password" name="password" id="password" placeholder="Masukkan password" required autocomplete="current-password">
                    <button type="button" class="toggle-pass"><i class="fas fa-eye"></i></button>
                </div>
            </div>
            <button type="submit" class="btn btn-primary btn-block btn-lg"><i class="fas fa-sign-in-alt"></i> Masuk</button>
        </form>

        <div class="auth-footer">
            Belum punya akun? <a href="register.php">Daftar di sini</a>
        </div>
    </div>
</div>
<script src="assets/js/main.js"></script>
</body>
</html>