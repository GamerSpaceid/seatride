<?php
/**
 * Pengaturan Akun - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$ucpId = (int)$_SESSION['ucp_id'];
$user = current_user();
$stats = get_user_stats($ucpId);
$characters = get_user_characters($ucpId);

$pageTitle = 'Pengaturan';
$activePage = 'profile';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Pengaturan Akun</h2>
                    <p>Kelola informasi akun Anda</p>
                </div>
            </div>
        </div>

        <div class="content-area">
            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <span>Pengaturan</span>
            </div>

            <div class="grid-2">
                <!-- Profile Info -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-id-card"></i> Informasi Akun</div>
                    </div>
                    <div style="display:flex;align-items:center;gap:20px;margin-bottom:24px;">
                        <div class="user-avatar" style="width:80px;height:80px;font-size:36px;">
                            <i class="fas fa-user-circle"></i>
                        </div>
                        <div>
                            <h3 style="font-size:22px;font-weight:700;"><?= e($user['username']) ?></h3>
                            <p style="color:var(--text-muted);font-size:14px;"><?= e($user['email']) ?></p>
                            <span class="badge badge-accent" style="margin-top:8px;">
                                <i class="fas fa-<?= (bool)$user['is_admin'] ? 'shield' : 'user' ?>"></i>
                                <?= (bool)$user['is_admin'] ? 'Administrator' : 'Pemain' ?>
                            </span>
                        </div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="char-stat">
                            <div class="char-stat-label">Bergabung Sejak</div>
                            <div class="char-stat-value" style="font-size:14px;"><?= date('d M Y', strtotime($user['created_at'])) ?></div>
                        </div>
                        <div class="char-stat">
                            <div class="char-stat-label">Login Terakhir</div>
                            <div class="char-stat-value" style="font-size:14px;"><?= $user['last_login'] ? time_ago($user['last_login']) : 'Baru saja' ?></div>
                        </div>
                    </div>
                </div>

                <!-- Account Stats -->
                <div class="card">
                    <div class="card-header">
                        <div class="card-title"><i class="fas fa-chart-bar"></i> Statistik Akun</div>
                    </div>
                    <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                        <div class="char-stat">
                            <div class="char-stat-label">Total Karakter</div>
                            <div class="char-stat-value"><?= $stats['total_chars'] ?> / <?= MAX_CHARACTERS ?></div>
                            <div class="progress" style="margin-top:8px;">
                                <div class="progress-fill" style="width:<?= ($stats['total_chars'] / MAX_CHARACTERS) * 100 ?>%"></div>
                            </div>
                        </div>
                        <div class="char-stat">
                            <div class="char-stat-label">Total Level</div>
                            <div class="char-stat-value"><?= $stats['total_level'] ?></div>
                        </div>
                        <div class="char-stat">
                            <div class="char-stat-label">Total Uang</div>
                            <div class="char-stat-value" style="color:var(--success);"><?= format_money($stats['total_money']) ?></div>
                        </div>
                        <div class="char-stat">
                            <div class="char-stat-label">Total Bank</div>
                            <div class="char-stat-value" style="color:var(--info);"><?= format_money($stats['total_bank']) ?></div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Characters List -->
            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-users"></i> Daftar Karakter</div>
                    <div class="card-actions">
                        <a href="characters.php" class="btn btn-secondary btn-sm"><i class="fas fa-cog"></i> Kelola</a>
                    </div>
                </div>
                <?php if (empty($characters)): ?>
                <p style="color:var(--text-muted);text-align:center;padding:20px;">Belum ada karakter.</p>
                <?php else: ?>
                <div style="display:flex;flex-direction:column;gap:8px;">
                    <?php foreach ($characters as $char): ?>
                    <div style="display:flex;align-items:center;gap:14px;padding:12px 16px;background:var(--bg-glass);border-radius:var(--radius-md);">
                        <div class="user-avatar" style="width:40px;height:40px;font-size:16px;"><i class="fas fa-user"></i></div>
                        <div style="flex:1;">
                            <div style="font-weight:600;"><?= e($char['name']) ?></div>
                            <div style="font-size:12px;color:var(--text-muted);">Level <?= (int)$char['level'] ?> &middot; <?= format_money((int)$char['money']) ?></div>
                        </div>
                        <span class="char-status <?= (int)$char['is_online'] === 1 ? 'online' : 'offline' ?>">
                            <?= (int)$char['is_online'] === 1 ? 'Online' : 'Offline' ?>
                        </span>
                    </div>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
