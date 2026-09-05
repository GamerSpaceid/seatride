<?php
/**
 * Forum - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$categories = get_forum_categories();
$recentTopics = get_recent_topics(10);

$pageTitle = 'Forum';
$activePage = 'forum';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Forum Komunitas</h2>
                    <p>Diskusi dan berinteraksi dengan komunitas</p>
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
                <span>Forum</span>
            </div>

            <!-- Categories -->
            <?php foreach ($categories as $cat): ?>
            <div class="forum-category">
                <a href="category.php?id=<?= (int)$cat['id'] ?>" style="text-decoration:none;color:inherit;">
                    <div class="forum-cat-header">
                        <div class="forum-cat-icon"><i class="fas fa-<?= e($cat['icon']) ?>"></i></div>
                        <div class="forum-cat-info">
                            <h3><?= e($cat['name']) ?></h3>
                            <p><?= e($cat['description']) ?></p>
                        </div>
                        <div class="forum-cat-count">
                            <strong><?= (int)$cat['topic_count'] ?></strong>
                            <span>Topik</span>
                        </div>
                    </div>
                </a>
            </div>
            <?php endforeach; ?>

            <!-- Recent Topics -->
            <div class="card" style="margin-top:24px;">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-clock"></i> Topik Terbaru</div>
                </div>
                <?php if (empty($recentTopics)): ?>
                <div class="empty-state" style="padding:40px 20px;">
                    <i class="fas fa-comments"></i>
                    <h3>Belum Ada Topik</h3>
                    <p>Jadilah yang pertama memulai diskusi di forum komunitas!</p>
                    <button class="btn btn-primary" onclick="openModal('newTopicModal')"><i class="fas fa-pen"></i> Buat Topik</button>
                </div>
                <?php else: ?>
                <div class="topic-list">
                    <?php foreach ($recentTopics as $topic): ?>
                    <a href="topic.php?id=<?= (int)$topic['id'] ?>" class="topic-item <?= (int)$topic['is_pinned'] === 1 ? 'pinned' : '' ?> <?= (int)$topic['is_locked'] === 1 ? 'locked' : '' ?>">
                        <div class="topic-avatar"><i class="fas fa-user"></i></div>
                        <div class="topic-info">
                            <div class="topic-title">
                                <?php if ((int)$topic['is_pinned'] === 1): ?><i class="fas fa-thumbtack pin-icon"></i><?php endif; ?>
                                <?php if ((int)$topic['is_locked'] === 1): ?><i class="fas fa-lock pin-icon" style="color:var(--text-muted);"></i><?php endif; ?>
                                <?= e($topic['title']) ?>
                                <span class="badge badge-accent"><?= e($topic['category_name']) ?></span>
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
                <div class="form-group" style="margin-bottom:16px;">
                    <label><i class="fas fa-folder"></i> Kategori</label>
                    <div class="input-wrapper">
                        <i class="fas fa-folder input-icon"></i>
                        <select name="category_id" required>
                            <?php foreach ($categories as $cat): ?>
                            <option value="<?= (int)$cat['id'] ?>"><?= e($cat['name']) ?></option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
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
                        <textarea name="content" placeholder="Tulis isi topik di sini (minimal 10 karakter)" required minlength="10"></textarea>
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
