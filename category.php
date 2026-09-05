<?php
/**
 * Kategori Forum - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$catId = (int)($_GET['id'] ?? 0);
if ($catId === 0) {
    redirect('forum.php');
}

$db = db();
$stmt = $db->prepare('SELECT * FROM forum_categories WHERE id = ? LIMIT 1');
$stmt->bind_param('i', $catId);
$stmt->execute();
$category = $stmt->get_result()->fetch_assoc();
$stmt->close();

if (!$category) {
    redirect('forum.php', 'Kategori tidak ditemukan', 'danger');
}

$topics = get_topics_by_category($catId);

$pageTitle = e($category['name']);
$activePage = 'forum';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2><?= e($category['name']) ?></h2>
                    <p><?= e($category['description']) ?></p>
                </div>
            </div>
            <div class="topbar-right">
                <button class="btn btn-primary" onclick="openModal('newTopicModal')"><i class="fas fa-pen"></i> Topik Baru</button>
            </div>
        </div>

        <div class="content-area">
            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <a href="forum.php">Forum</a>
                <i class="fas fa-chevron-right"></i>
                <span><?= e($category['name']) ?></span>
            </div>

            <div class="card">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-<?= e($category['icon']) ?>"></i> Topik di Kategori Ini</div>
                    <span class="badge badge-accent"><?= count($topics) ?> Topik</span>
                </div>
                <?php if (empty($topics)): ?>
                <div class="empty-state">
                    <i class="fas fa-comments"></i>
                    <h3>Belum Ada Topik</h3>
                    <p>Jadilah yang pertama memulai diskusi di kategori ini!</p>
                    <button class="btn btn-primary" onclick="openModal('newTopicModal')"><i class="fas fa-pen"></i> Buat Topik</button>
                </div>
                <?php else: ?>
                <div class="topic-list">
                    <?php foreach ($topics as $topic): ?>
                    <a href="topic.php?id=<?= (int)$topic['id'] ?>" class="topic-item <?= (int)$topic['is_pinned'] === 1 ? 'pinned' : '' ?> <?= (int)$topic['is_locked'] === 1 ? 'locked' : '' ?>">
                        <div class="topic-avatar"><i class="fas fa-user"></i></div>
                        <div class="topic-info">
                            <div class="topic-title">
                                <?php if ((int)$topic['is_pinned'] === 1): ?><i class="fas fa-thumbtack pin-icon"></i><?php endif; ?>
                                <?php if ((int)$topic['is_locked'] === 1): ?><i class="fas fa-lock pin-icon" style="color:var(--text-muted);"></i><?php endif; ?>
                                <?= e($topic['title']) ?>
                            </div>
                            <div class="topic-meta">
                                <span><i class="fas fa-user"></i> <?= e($topic['author']) ?></span>
                                <span><i class="fas fa-clock"></i> <?= time_ago($topic['updated_at']) ?></span>
                            </div>
                        </div>
                        <div class="topic-stats">
                            <div class="topic-stat"><strong><?= (int)$topic['reply_count'] ?></strong> Balasan</div>
                            <div class="topic-stat"><strong><?= (int)$topic['views'] ?></strong> Dilihat</div>
                        </div>
                    </a>
                    <?php endforeach; ?>
                </div>
                <?php endif; ?>
            </div>
        </div>
    </div>
</div>

<!-- New Topic Modal -->
<div class="modal-overlay" id="newTopicModal">
    <div class="modal">
        <div class="modal-header">
            <h3><i class="fas fa-pen"></i> Buat Topik Baru</h3>
            <button class="modal-close" onclick="closeModal('newTopicModal')"><i class="fas fa-times"></i></button>
        </div>
        <div class="modal-body">
            <form id="topicForm">
                <input type="hidden" name="action" value="create_topic">
                <input type="hidden" name="category_id" value="<?= $catId ?>">
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-heading"></i> Judul</label>
                    <div class="input-wrapper">
                        <i class="fas fa-heading input-icon"></i>
                        <input type="text" name="title" placeholder="Judul topik (minimal 5 karakter)" required minlength="5">
                    </div>
                </div>
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-align-left"></i> Konten</label>
                    <div class="input-wrapper">
                        <textarea name="content" placeholder="Tulis isi topik di sini" required minlength="10"></textarea>
                    </div>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-user-tag"></i> Nama Karakter (opsional)</label>
                    <div class="input-wrapper">
                        <i class="fas fa-user-tag input-icon"></i>
                        <input type="text" name="character_name" placeholder="Firstname_Lastname">
                    </div>
                </div>
            </form>
        </div>
        <div class="modal-footer">
            <button class="btn btn-secondary" onclick="closeModal('newTopicModal')">Batal</button>
            <button type="submit" form="topicForm" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Publikasikan</button>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
