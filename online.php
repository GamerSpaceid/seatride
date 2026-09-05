<?php
/**
 * Pemain Online - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$onlinePlayers = get_online_players(100);
$onlineCount = count($onlinePlayers);

$pageTitle = 'Pemain Online';
$activePage = 'online';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Pemain Online</h2>
                    <p>Pelacak pemain real-time</p>
                </div>
            </div>
            <div class="topbar-right">
                <div class="topbar-info">
                    <span class="live-dot"></span>
                    <span><strong id="onlineCount"><?= $onlineCount ?></strong> pemain online</span>
                </div>
            </div>
        </div>

        <div class="content-area">
            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <span>Pemain Online</span>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-signal"></i> Daftar Pemain Online</div>
                    <span class="badge badge-success"><span class="live-dot" style="width:8px;height:8px;border-radius:50%;background:var(--success);display:inline-block;margin-right:4px;"></span> Live</span>
                </div>
                <div id="onlinePlayersList">
                    <?php if (empty($onlinePlayers)): ?>
                    <div class="empty-state">
                        <i class="fas fa-user-slash"></i>
                        <h3>Tidak Ada Pemain Online</h3>
                        <p>Server sedang kosong. Masuk ke game untuk menjadi pemain pertama yang online!</p>
                    </div>
                    <?php else: ?>
                    <div style="overflow-x:auto;">
                        <table class="player-table">
                            <thead>
                                <tr>
                                    <th>Nama Karakter</th>
                                    <th>Level</th>
                                    <th>Uang</th>
                                    <th>Skin</th>
                                    <th>Kesehatan</th>
                                    <th>Posisi</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($onlinePlayers as $p): ?>
                                <tr>
                                    <td>
                                        <div class="player-name-cell">
                                            <div class="pavatar"><i class="fas fa-user"></i></div>
                                            <?= e($p['name']) ?>
                                        </div>
                                    </td>
                                    <td><span class="badge badge-accent">Lv. <?= (int)$p['level'] ?></span></td>
                                    <td style="font-family:var(--font-mono);color:var(--success);"><?= format_money((int)$p['money']) ?></td>
                                    <td>#<?= (int)$p['skin'] ?></td>
                                    <td>
                                        <div style="display:flex;align-items:center;gap:8px;">
                                            <div class="health-bar">
                                                <div class="health-bar-fill" style="width:<?= (float)$p['health'] ?>%;"></div>
                                            </div>
                                            <span style="font-size:12px;"><?= (int)$p['health'] ?>%</span>
                                        </div>
                                    </td>
                                    <td style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">
                                        <?= number_format((float)$p['pos_x'], 1) ?>, <?= number_format((float)$p['pos_y'], 1) ?>
                                    </td>
                                </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
