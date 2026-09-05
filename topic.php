<?php
/**
 * Topik Forum - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
require_login();

$topicId = (int)($_GET['id'] ?? 0);
if ($topicId === 0) {
    redirect('forum.php');
}

$topic = get_topic($topicId);
if (!$topic) {
    redirect('forum.php', 'Topik tidak ditemukan', 'danger');
}

increment_topic_views($topicId);
$replies = get_topic_replies($topicId);

$pageTitle = e($topic['title']);
$activePage = 'forum';
include __DIR__ . '/includes/header.php';
?>
<div class="app-layout">
    <?php include __DIR__ . '/includes/sidebar.php'; ?>
    <div class="main-content">
        <div class="topbar">
            <div class="topbar-left">
                <div class="topbar-title">
                    <h2>Topik Forum</h2>
                    <p><?= e($topic['category_name']) ?></p>
                </div>
            </div>
            <div class="topbar-right">
                <a href="forum.php" class="btn btn-secondary"><i class="fas fa-arrow-left"></i> Kembali ke Forum</a>
            </div>
        </div>

        <div class="content-area">
            <div class="breadcrumb">
                <a href="dashboard.php"><i class="fas fa-home"></i> Dashboard</a>
                <i class="fas fa-chevron-right"></i>
                <a href="forum.php">Forum</a>
                <i class="fas fa-chevron-right"></i>
                <a href="category.php?id=<?= (int)$topic['cat_id'] ?>"><?= e($topic['category_name']) ?></a>
                <i class="fas fa-chevron-right"></i>
                <span>Topik</span>
            </div>

            <div class="topic-view-header">
                <h1>
                    <?php if ((int)$topic['is_pinned'] === 1): ?><i class="fas fa-thumbtack" style="color:var(--warning);"></i> <?php endif; ?>
                    <?php if ((int)$topic['is_locked'] === 1): ?><i class="fas fa-lock" style="color:var(--text-muted);"></i> <?php endif; ?>
                    <?= e($topic['title']) ?>
                </h1>
                <div class="topic-view-meta">
                    <span class="badge"><i class="fas fa-user"></i> <?= e($topic['author']) ?></span>
                    <span><i class="fas fa-clock"></i> <?= time_ago($topic['created_at']) ?></span>
                    <span><i class="fas fa-eye"></i> <?= (int)$topic['views'] ?> dilihat</span>
                    <span><i class="fas fa-reply"></i> <?= count($replies) ?> balasan</span>
                </div>
            </div>

            <!-- Original Post -->
            <div class="post-card">
                <div class="post-header">
                    <div class="post-avatar"><i class="fas fa-user"></i></div>
                    <div class="post-author-info">
                        <div class="post-author">
                            <?= e($topic['author']) ?>
                            <?php if ((bool)$topic['is_admin'] ?? false): ?><span class="admin-tag">ADMIN</span><?php endif; ?>
                        </div>
                        <div class="post-date"><?= time_ago($topic['created_at']) ?><?= $topic['character_name'] ? ' &middot; sebagai ' . e($topic['character_name']) : '' ?></div>
                    </div>
                </div>
                <div class="post-content"><?= e($topic['content']) ?></div>
            </div>

            <!-- Replies -->
            <?php foreach ($replies as $reply): ?>
            <div class="post-card">
                <div class="post-header">
                    <div class="post-avatar"><i class="fas fa-user"></i></div>
                    <div class="post-author-info">
                        <div class="post-author">
                            <?= e($reply['author']) ?>
                            <?php if ((bool)$reply['is_admin']): ?><span class="admin-tag">ADMIN</span><?php endif; ?>
                        </div>
                        <div class="post-date"><?= time_ago($reply['created_at']) ?><?= $reply['character_name'] ? ' &middot; sebagai ' . e($reply['character_name']) : '' ?></div>
                    </div>
                </div>
                <div class="post-content"><?= e($reply['content']) ?></div>
            </div>
            <?php endforeach; ?>

            <!-- Reply Form -->
            <?php if ((int)$topic['is_locked'] === 1): ?>
            <div class="card" style="text-align:center;padding:32px;">
                <i class="fas fa-lock" style="font-size:32px;color:var(--text-muted);margin-bottom:12px;"></i>
                <h3 style="font-size:16px;margin-bottom:4px;">Topik Terkunci</h3>
                <p style="color:var(--text-muted);font-size:13px;">Topik ini telah dikunci dan tidak menerima balasan baru.</p>
            </div>
            <?php else: ?>
            <div class="card reply-form">
                <div class="card-header">
                    <div class="card-title"><i class="fas fa-reply"></i> Tulis Balasan</div>
                </div>
                <form id="replyForm">
                    <input type="hidden" name="action" value="create_reply">
                    <input type="hidden" name="topic_id" value="<?= $topicId ?>">
                    <div class="form-group" style="margin-bottom:16px;">
                        <div class="input-wrapper">
                            <textarea name="content" placeholder="Tulis balasan Anda di sini..." required minlength="2"></textarea>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom:16px;">
                        <label><i class="fas fa-user-tag"></i> Nama Karakter (opsional)</label>
                        <div class="input-wrapper">
                            <i class="fas fa-user-tag input-icon"></i>
                            <input type="text" name="character_name" placeholder="Firstname_Lastname">
                        </div>
                    </div>
                    <button type="submit" class="btn btn-primary"><i class="fas fa-paper-plane"></i> Kirim Balasan</button>
                </form>
            </div>
            <?php endif; ?>
        </div>
    </div>
</div>
<?php include __DIR__ . '/includes/footer.php'; ?>
