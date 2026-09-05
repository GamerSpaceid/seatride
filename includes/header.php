<?php
/**
 * Header Template - SEA TRIBE
 */
require_once __DIR__ . '/auth.php';

$currentUser = is_logged_in() ? current_user() : null;
$flash = get_flash();
$pageTitle = $pageTitle ?? 'SEA TRIBE';
$activePage = $activePage ?? '';
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title><?= e($pageTitle) ?> - <?= e(APP_NAME) ?></title>
    <link rel="stylesheet" href="assets/css/style.css">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
</head>
<body>
<?php if ($flash): ?>
<div class="flash-message flash-<?= e($flash['type']) ?>" id="flashMsg">
    <i class="fas fa-<?= $flash['type'] === 'success' ? 'check-circle' : ($flash['type'] === 'warning' ? 'exclamation-triangle' : ($flash['type'] === 'danger' ? 'times-circle' : 'info-circle')) ?>"></i>
    <span><?= e($flash['message']) ?></span>
    <button onclick="document.getElementById('flashMsg').remove()"><i class="fas fa-times"></i></button>
</div>
<?php endif; ?>
