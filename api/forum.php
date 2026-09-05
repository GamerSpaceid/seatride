<?php
/**
 * API Endpoint - Forum
 */
require_once __DIR__ . '/../includes/auth.php';

if (!is_logged_in()) {
    json_response(['success' => false, 'error' => 'Tidak terautentikasi'], 401);
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    json_response(['success' => false, 'error' => 'Metode tidak diizinkan'], 405);
}

$ucpId = (int)$_SESSION['ucp_id'];
$action = $_POST['action'] ?? '';

if ($action === 'create_topic') {
    $catId = (int)($_POST['category_id'] ?? 0);
    $title = trim($_POST['title'] ?? '');
    $content = trim($_POST['content'] ?? '');
    $charName = !empty($_POST['character_name']) ? trim($_POST['character_name']) : null;

    $result = create_topic($ucpId, $catId, $title, $content, $charName);
    json_response($result);
}

if ($action === 'create_reply') {
    $topicId = (int)($_POST['topic_id'] ?? 0);
    $content = trim($_POST['content'] ?? '');
    $charName = !empty($_POST['character_name']) ? trim($_POST['character_name']) : null;

    $topic = get_topic($topicId);
    if (!$topic) {
        json_response(['success' => false, 'error' => 'Topik tidak ditemukan']);
    }
    if ((int)$topic['is_locked'] === 1) {
        json_response(['success' => false, 'error' => 'Topik ini telah dikunci']);
    }

    $result = create_reply($topicId, $ucpId, $content, $charName);
    json_response($result);
}

json_response(['success' => false, 'error' => 'Aksi tidak dikenal'], 400);
