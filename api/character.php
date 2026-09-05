<?php
/**
 * API Endpoint - Manajemen Karakter
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

if ($action === 'create') {
    $name = trim($_POST['name'] ?? '');
    $age = (int)($_POST['age'] ?? 25);
    $gender = (int)($_POST['gender'] ?? 0);
    $skin = (int)($_POST['skin'] ?? 2);
    $password = $_POST['char_password'] ?? '';

    $result = create_character($ucpId, $name, $age, $gender, $skin, $password);
    json_response($result);
}

if ($action === 'delete') {
    $charId = (int)($_POST['char_id'] ?? 0);
    $result = delete_character($charId, $ucpId);
    json_response($result);
}

json_response(['success' => false, 'error' => 'Aksi tidak dikenal'], 400);
