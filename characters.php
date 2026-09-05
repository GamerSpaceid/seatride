<?php
/**
 * Manajemen Karakter - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$ucpId = (int)$_SESSION['ucp_id'];
$errorMsg = '';
$successMsg = '';

// Handle pembuatan karakter via POST biasa (bypass JS intercept)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['action']) && $_POST['action'] === 'create') {
    $charName = trim($_POST['name'] ?? '');
    $age = (int)($_POST['age'] ?? 25);
    $gender = (int)($_POST['gender'] ?? 0);
    $skin = (int)($_POST['skin'] ?? 2);
    $charPassword = $_POST['char_password'] ?? '';

    $result = create_character($ucpId, $charName, $age, $gender, $skin, $charPassword);
    if ($result['success']) {
        redirect('characters.php', 'Karakter berhasil dibuat!', 'success');
    } else {
        $errorMsg = $result['error'];
    }
}

$characters = get_user_characters($ucpId);

// Daftar skin populer SA-MP
$skins = [
    2 => 'Toni Cipriani', 7 => 'Claude', 9 => 'Bos Mafia', 15 => 'Pria Klasik',
    18 => 'Pria Jas', 21 => 'Pria Tato', 23 => 'Pria Pantai', 25 => 'Pria Bisnis',
    29 => 'Polisi Pria', 30 => 'Polisi 2', 32 => 'Polisi 3', 46 => 'Pria Tua',
    56 => 'Pria Bandana', 60 => 'Pria Kulot', 61 => 'Pria Kemeja', 65 => 'Pria Olahraga',
    67 => 'Pria Pantai 2', 72 => 'Pria Hoodie', 78 => 'Pria Topi', 79 => 'Pria Tato 2',
    83 => 'Wanita Dress', 90 => 'Wanita Pantai', 93 => 'Wanita Jas', 130 => 'Wanita Topi',
    137 => 'Wanita Tato', 140 => 'Wanita Klasik', 150 => 'Wanita Bandana', 152 => 'Wanita Hoodie',
    190 => 'Pria Kasual', 200 => 'Pria Keren', 211 => 'Pria Pakaian Dalam', 233 => 'Wanita Kasual',
    250 => 'Pria Tampan', 262 => 'Pria Tua 2', 287 => 'Pria Olahraga 2', 294 => 'Wanita Keren',
];

$pageTitle = 'Karakter Saya';
$activePage = 'characters';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Karakter Saya</h2>
                    <p>Kelola karakter roleplay Anda</p>
                </div>
            </div>
            <div class="topbar-right">
                <?php if (count($characters) < MAX_CHARACTERS): ?>
                <button class="btn btn-primary" onclick="openModal('createCharModal')"><i class="fas fa-plus"></i> Buat Karakter</button>
                <?php else: ?>
                <span class="badge badge-warning"><i class="fas fa-exclamation-triangle"></i> Batas Maksimal</span>
                <?php endif; ?>
            </div>
        </div>

        <div class="content-area">
            <?php if (!empty($errorMsg)): ?>
            <div class="alert alert-danger" style="background:rgba(239,68,68,0.1);color:#ef4444;padding:12px;border-radius:8px;margin-bottom:16px;">
                <i class="fas fa-exclamation-circle"></i> <?= e($errorMsg) ?>
            </div>
            <?php endif; ?>

            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <span>Karakter</span>
            </div>

            <?php if (empty($characters)): ?>
            <div class="card">
                <div class="empty-state">
                    <i class="fas fa-user-plus"></i>
                    <h3>Belum Ada Karakter</h3>
                    <p>Anda belum membuat karakter apapun. Buat karakter pertama Anda untuk mulai bermain di server. Karakter yang dibuat di sini bisa langsung digunakan di in-game.</p>
                    <button class="btn btn-primary btn-lg" onclick="openModal('createCharModal')"><i class="fas fa-plus"></i> Buat Karakter Pertama</button>
                </div>
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
                                <div class="char-stat-label">Uang Tunai</div>
                                <div class="char-stat-value"><?= format_money((int)$char['money']) ?></div>
                            </div>
                            <div class="char-stat">
                                <div class="char-stat-label">Bank</div>
                                <div class="char-stat-value"><?= format_money((int)$char['bank']) ?></div>
                            </div>
                            <div class="char-stat">
                                <div class="char-stat-label">Skin</div>
                                <div class="char-stat-value">#<?= (int)$char['skin'] ?></div>
                            </div>
                            <div class="char-stat">
                                <div class="char-stat-label">Kesehatan</div>
                                <div class="char-stat-value"><?= (int)$char['health'] ?> HP</div>
                            </div>
                        </div>
                        <div style="display:flex;align-items:center;justify-content:space-between;margin-top:12px;">
                            <span class="char-status <?= (int)$char['is_online'] === 1 ? 'online' : 'offline' ?>">
                                <span style="width:6px;height:6px;border-radius:50%;background:currentColor;display:inline-block;"></span>
                                <?= (int)$char['is_online'] === 1 ? 'Online' : 'Offline' ?>
                            </span>
                        </div>
                        <div class="char-actions" style="margin-top:12px;">
                            <button class="btn btn-secondary btn-sm" onclick="openModal('charInfoModal_<?= (int)$char['id'] ?>')"><i class="fas fa-info-circle"></i> Detail</button>
                        </div>
                    </div>
                </div>
                <?php endforeach; ?>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>

<!-- Create Character Modal -->
<div class="modal-overlay" id="createCharModal" style="<?= !empty($errorMsg) ? 'display:flex;' : '' ?>">
    <div class="modal">
        <div class="modal-header">
            <h3><i class="fas fa-user-plus"></i> Buat Karakter Baru</h3>
            <button class="modal-close" onclick="closeModal('createCharModal')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <!-- Tanpa ID agar tidak di-intercept oleh main.js -->
            <form method="POST" action="characters.php">
                <input type="hidden" name="action" value="create">
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-id-badge"></i> Nama Karakter (Format: Firstname_Lastname)</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user input-icon"></i>
                        <input type="text" name="name" placeholder="Contoh: John_Smith" required value="<?= e($_POST['name'] ?? '') ?>">
                    </div>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;">
                    <div class="form-group">
                        <label><i class="fas fa-birthday-cake"></i> Usia</label>
                        <div class="input-wrapper">
                            <i class="fas fa-birthday-cake input-icon"></i>
                            <input type="number" name="age" min="18" max="80" value="<?= (int)($_POST['age'] ?? 25) ?>" required>
                        </div>
                    </div>
                    <div class="form-group">
                        <label><i class="fas fa-venus-mars"></i> Gender</label>
                        <div class="input-wrapper">
                            <i class="fas fa-venus-mars input-icon"></i>
                            <select name="gender">
                                <option value="0">Laki-laki</option>
                                <option value="1">Perempuan</option>
                            </select>
                        </div>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-tshirt"></i> Pilih Skin</label>
                    <input type="hidden" name="skin" id="skinInput" value="2">
                    <div class="skin-picker" style="max-height:150px;overflow-y:auto;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;">
                        <?php foreach ($skins as $id => $name): ?>
                        <div class="skin-option <?= $id === 2 ? 'selected' : '' ?>" data-skin="<?= $id ?>" onclick="document.getElementById('skinInput').value='<?= $id ?>'; document.querySelectorAll('.skin-option').forEach(el=>el.classList.remove('selected')); this.classList.add('selected');" style="cursor:pointer;padding:8px;border:1px solid rgba(255,255,255,0.1);border-radius:6px;">
                            <i class="fas fa-user"></i> <span><?= e($name) ?> (#<?= $id ?>)</span>
                        </div>
                        <?php endforeach; ?>
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-lock"></i> Password Karakter (opsional)</label>
                    <div class="input-wrapper">
                        <i class="fas fa-lock input-icon"></i>
                        <input type="password" name="char_password" placeholder="Kosongkan jika tidak perlu">
                    </div>
                </div>
                <div class="modal-footer" style="padding:0;border:none;margin-top:20px;">
                    <button class="btn btn-secondary" type="button" onclick="closeModal('createCharModal')">Batal</button>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-check"></i> Buat Karakter</button>
                </div>
            </form>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>