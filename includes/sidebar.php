<?php
/**
 * Sidebar Navigasi - SEA TRIBE
 */
$charCount = is_logged_in() ? count(get_user_characters((int)$_SESSION['ucp_id'])) : 0;
$onlineCount = get_online_count();
?>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&display=swap" rel="stylesheet">

<aside class="sidebar" id="sidebar">
    <div class="sidebar-header" style="padding: 15px 20px; align-items: center;">
        <div class="logo" style="display: flex; align-items: center; gap: 10px;">
            <img src="assets/logo/logo.png" alt="Logo" style="width: 38px; height: auto; object-fit: contain; box-shadow: none !important; filter: none !important; background: transparent !important;">
            <span style="font-family: 'Orbitron', sans-serif; font-weight: 900; font-size: 16px; letter-spacing: 1px; color: #ffffff;">SEA TRIBE</span>
        </div>
        <button class="sidebar-toggle" id="sidebarToggle">
            <i class="fas fa-bars"></i>
        </button>
    </div>

    <div class="sidebar-user">
        <div class="user-avatar">
            <i class="fas fa-user-circle"></i>
        </div>
        <div class="user-info">
            <span class="user-name"><?= e($currentUser['username'] ?? 'Tamu') ?></span>
            <span class="user-role"><?= (bool)($currentUser['is_admin'] ?? false) ? 'Administrator' : 'Pemain' ?></span>
        </div>
    </div>

    <nav class="sidebar-nav">
        <div class="nav-section">
            <span class="nav-label">Utama</span>
            <a href="dashboard.php" class="nav-link <?= $activePage === 'dashboard' ? 'active' : '' ?>">
                <i class="fas fa-tachometer-alt"></i><span>Dashboard</span>
            </a>
            <a href="characters.php" class="nav-link <?= $activePage === 'characters' ? 'active' : '' ?>">
                <i class="fas fa-users"></i><span>Karakter Saya</span>
                <?php if ($charCount > 0): ?><span class="nav-badge"><?= $charCount ?></span><?php endif; ?>
            </a>
            <a href="online.php" class="nav-link <?= $activePage === 'online' ? 'active' : '' ?>">
                <i class="fas fa-signal"></i><span>Pemain Online</span>
                <?php if ($onlineCount > 0): ?><span class="nav-badge live"><?= $onlineCount ?></span><?php endif; ?>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-label">Komunitas</span>
            <a href="forum.php" class="nav-link <?= $activePage === 'forum' ? 'active' : '' ?>">
                <i class="fas fa-comments"></i><span>Forum</span>
            </a>
            <a href="announcements.php" class="nav-link <?= $activePage === 'announcements' ? 'active' : '' ?>">
                <i class="fas fa-bullhorn"></i><span>Pengumuman</span>
            </a>
        </div>

        <div class="nav-section">
            <span class="nav-label">Akun</span>
            <a href="profile.php" class="nav-link <?= $activePage === 'profile' ? 'active' : '' ?>">
                <i class="fas fa-cog"></i><span>Pengaturan</span>
            </a>
            <a href="logout.php" class="nav-link nav-danger">
                <i class="fas fa-sign-out-alt"></i><span>Keluar</span>
            </a>
        </div>
    </nav>

    <div class="sidebar-footer">
        <div class="server-status">
            <div class="status-dot"></div>
            <div class="status-text">
                <span>Server Status</span>
                <strong>Online</strong>
            </div>
        </div>
        <p class="version">v<?= e(APP_VERSION) ?></p>
    </div>
</aside>