<?php
/**
 * Pengumuman - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$announcements = get_announcements(20);

$pageTitle = 'Pengumuman';
$activePage = 'announcements';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Pengumuman</h2>
                    <p>Berita dan info terbaru dari server</p>
                </div>
            </div>
        </div>

        <div class="content-area">
            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <span>Pengumuman</span>
            </div>

            <?php if (empty($announcements)): ?>
            <div class="card">
                <div class="empty-state">
                    <i class="fas fa-bullhorn"></i>
                    <h3>Belum Ada Pengumuman</h3>
                    <p>Belum ada pengumuman dari staff server saat ini.</p>
                </div>
            </div>
            <?php else: ?>
            <?php foreach ($announcements as $ann): ?>
            <div class="announcement-card <?= e($ann['type']) ?>">
                <div class="announcement-header">
                    <div class="announcement-type-icon">
                        <i class="fas fa-<?= $ann['type'] === 'success' ? 'check-circle' : ($ann['type'] === 'warning' ? 'exclamation-triangle' : ($ann['type'] === 'danger' ? 'times-circle' : 'info-circle')) ?>"></i>
                    </div>
                    <div class="announcement-title"><?= e($ann['title']) ?></div>
                    <div class="announcement-date"><?= time_ago($ann['created_at']) ?></div>
                </div>
                <div class="announcement-content"><?= e($ann['content']) ?></div>
                <div style="margin-top:12px;font-size:12px;color:var(--text-muted);">
                    <i class="fas fa-user-shield"></i> Diposting oleh <?= e($ann['author']) ?>
                </div>
            </div>
            <?php endforeach; ?>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
