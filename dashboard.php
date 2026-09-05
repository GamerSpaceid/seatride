<?php
/**
 * Dashboard - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$ucpId = (int)$_SESSION['ucp_id'];
$stats = get_user_stats($ucpId);
$characters = get_user_characters($ucpId);
$onlineCount = get_online_count();
$announcements = get_announcements(3);
$recentTopics = get_recent_topics(4);

$pageTitle = 'Dashboard';
$activePage = 'dashboard';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Dashboard</h2>
                    <p>Selamat datang kembali, <?= e($currentUser['username']) ?>!</p>
                </div>
            </div>
            <div class="topbar-right">
                <div class="topbar-info">
                    <span class="live-dot"></span>
                    <span><?= $onlineCount ?> Online</span>
                </div>
            </div>
        </div>

        <div class="content-area">
            <!-- Stats Grid -->
            <div class="stats-grid">
                <div class="stat-card">
                    <div class="stat-icon"><i class="fas fa-users"></i></div>
                    <div class="stat-value"><?= $stats['total_chars'] ?></div>
                    <div class="stat-label">Total Karakter</div>
                </div>
                <div class="stat-card success">
                    <div class="stat-icon"><i class="fas fa-dollar-sign"></i></div>
                    <div class="stat-value"><?= format_money($stats['total_money']) ?></div>
                    <div class="stat-label">Total Uang Tunai</div>
                </div>
                <div class="stat-card info">
                    <div class="stat-icon"><i class="fas fa-university"></i></div>
                    <div class="stat-value"><?= format_money($stats['total_bank']) ?></div>
                    <div class="stat-label">Total di Bank</div>
                </div>
                <div class="stat-card warning">
                    <div class="stat-icon"><i class="fas fa-star"></i></div>
                    <div class="stat-value"><?= $stats['total_level'] ?></div>
                    <div class="stat-label">Total Level</div>
                </div>
            </div>

            <div class="grid-sidebar">
                <!-- Left Column -->
                <div>
                    <!-- Quick Actions -->
                    <div class="card" style="margin-bottom:24px;">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-bolt"></i> Aksi Cepat</div>
                        </div>
                        <div style="display:flex;gap:12px;flex-wrap:wrap;">
                            <a href="characters.php" class="btn btn-primary"><i class="fas fa-plus"></i> Buat Karakter</a>
                            <a href="forum.php" class="btn btn-secondary"><i class="fas fa-comments"></i> Buka Forum</a>
                            <a href="online.php" class="btn btn-secondary"><i class="fas fa-signal"></i> Pemain Online</a>
                        </div>
                    </div>

                    <!-- My Characters -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-users"></i> Karakter Saya</div>
                            <div class="card-actions">
                                <a href="characters.php" class="btn btn-secondary btn-sm"><i class="fas fa-arrow-right"></i> Lihat Semua</a>
                            </div>
                        </div>
                        <?php if (empty($characters)): ?>
                        <div class="empty-state">
                            <i class="fas fa-user-plus"></i>
                            <h3>Belum Ada Karakter</h3>
                            <p>Anda belum membuat karakter apapun. Buat karakter pertama Anda dan mulai bermain!</p>
                            <a href="characters.php" class="btn btn-primary"><i class="fas fa-plus"></i> Buat Karakter Pertama</a>
                        </div>
                        <?php else: ?>
                        <div class="char-grid">
                            <?php foreach ($characters as $char): ?>
                            <div class="char-card">
                                <div class="char-card-banner"></div>
                                <div class="char-card-body">
                                    <div class="char-avatar"><i class="fas fa-user"></i></div>
                                    <div class="char-name"><?= e($char['name']) ?></div>
                                    <div class="char-meta">
                                        <span><i class="fas fa-star"></i> Lv. <?= (int)$char['level'] ?></span>
                                        <span><i class="fas fa-birthday-cake"></i> <?= (int)$char['age'] ?> thn</span>
                                        <span><i class="fas fa-<?= (int)$char['gender'] === 1 ? 'venus' : 'mars' ?>"></i> <?= (int)$char['gender'] === 1 ? 'Perempuan' : 'Laki-laki' ?></span>
                                    </div>
                                    <div class="char-stats">
                                        <div class="char-stat">
                                            <div class="char-stat-label">Uang</div>
                                            <div class="char-stat-value"><?= format_money((int)$char['money']) ?></div>
                                        </div>
                                        <div class="char-stat">
                                            <div class="char-stat-label">Bank</div>
                                            <div class="char-stat-value"><?= format_money((int)$char['bank']) ?></div>
                                        </div>
                                    </div>
                                    <span class="char-status <?= (int)$char['is_online'] === 1 ? 'online' : 'offline' ?>">
                                        <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;"></span>
                                        <?= (int)$char['is_online'] === 1 ? 'Online' : 'Offline' ?>
                                    </span>
                                </div>
                            </div>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                    </div>
                </div>

                <!-- Right Sidebar -->
                <div>
                    <!-- Announcements -->
                    <div class="card" style="margin-bottom:24px;">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-bullhorn"></i> Pengumuman</div>
                        </div>
                        <?php foreach ($announcements as $ann): ?>
                        <div class="announcement-card <?= e($ann['type']) ?>" style="margin-bottom:12px;padding:16px;">
                            <div class="announcement-header">
                                <div class="announcement-type-icon">
                                    <i class="fas fa-<?= $ann['type'] === 'success' ? 'check-circle' : ($ann['type'] === 'warning' ? 'exclamation-triangle' : ($ann['type'] === 'danger' ? 'times-circle' : 'info-circle')) ?>"></i>
                                </div>
                                <div class="announcement-title"><?= e($ann['title']) ?></div>
                            </div>
                            <div class="announcement-content" style="font-size:13px;"><?= e($ann['content']) ?></div>
                        </div>
                        <?php endforeach; ?>
                        <a href="announcements.php" class="btn btn-secondary btn-block btn-sm"><i class="fas fa-arrow-right"></i> Semua Pengumuman</a>
                    </div>

                    <!-- Recent Forum Topics -->
                    <div class="card">
                        <div class="card-header">
                            <div class="card-title"><i class="fas fa-comments"></i> Topik Terbaru</div>
                        </div>
                        <?php if (empty($recentTopics)): ?>
                        <p style="color:var(--text-muted);font-size:13px;text-align:center;padding:20px 0;">Belum ada topik.</p>
                        <?php else: ?>
                        <div class="topic-list">
                            <?php foreach ($recentTopics as $topic): ?>
                            <a href="topic.php?id=<?= (int)$topic['id'] ?>" class="topic-item" style="padding:12px 14px;">
                                <div class="topic-info">
                                    <div class="topic-title" style="font-size:13px;">
                                        <?= (int)$topic['is_pinned'] === 1 ? '<i class="fas fa-thumbtack pin-icon"></i>' : '' ?>
                                        <?= e($topic['title']) ?>
                                    </div>
                                    <div class="topic-meta">
                                        <span><i class="fas fa-user"></i> <?= e($topic['author']) ?></span>
                                        <span><i class="fas fa-reply"></i> <?= (int)$topic['reply_count'] ?></span>
                                    </div>
                                </div>
                            </a>
                            <?php endforeach; ?>
                        </div>
                        <?php endif; ?>
                        <a href="forum.php" class="btn btn-secondary btn-block btn-sm" style="margin-top:12px;"><i class="fas fa-arrow-right"></i> Ke Forum</a>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
