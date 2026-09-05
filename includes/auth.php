<?php
/**
 * Sistem Autentikasi - Login, Register, Session Management
 * Disesuaikan dengan struktur database SA-MP asli (roleplay)
 */

declare(strict_types=1);

require_once __DIR__ . '/../config.php';

/**
 * Cek apakah user sudah login
 */
function is_logged_in(): bool
{
    start_session();
    return isset($_SESSION['ucp_id']) && !empty($_SESSION['ucp_id']);
}

/**
 * Wajib login - redirect ke login jika belum
 */
function require_login(): void
{
    if (!is_logged_in()) {
        redirect('login.php', 'Anda harus login terlebih dahulu', 'warning');
    }
}

/**
 * Cek apakah user adalah admin
 */
function is_admin(): bool
{
    if (!is_logged_in()) return false;
    $user = current_user();
    return (bool)($user['Admin'] ?? 0);
}

/**
 * Login user
 */
function login_user(string $username, string $password): array
{
    $db = db();
    $stmt = $db->prepare('SELECT ID, Username, Email, Password, Admin FROM accounts WHERE Username = ? LIMIT 1');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        return ['success' => false, 'error' => 'Username atau password salah'];
    }
    
    $user = $result->fetch_assoc();
    $stmt->close();
    
    if (!verify_password($password, $user['Password'])) {
        return ['success' => false, 'error' => 'Username atau password salah'];
    }
    
    start_session();
    session_regenerate_id(true);
    $_SESSION['ucp_id'] = (int)$user['ID'];
    $_SESSION['ucp_username'] = $user['Username'];
    $_SESSION['ucp_email'] = $user['Email'];
    $_SESSION['is_admin'] = (bool)$user['Admin'];
    
    $db->query('UPDATE accounts SET LoginDate = ' . time() . ' WHERE ID = ' . (int)$user['ID']);
    
    return ['success' => true];
}

/**
 * Register akun UCP baru
 */
function register_user(string $username, string $email, string $password, string $confirm): array
{
    $errors = [];
    
    if (strlen($username) < 3) {
        $errors[] = 'Username minimal 3 karakter';
    }
    if (strlen($username) > 24) {
        $errors[] = 'Username maksimal 24 karakter';
    }
    if (!preg_match('/^[a-zA-Z0-9_]+$/', $username)) {
        $errors[] = 'Username hanya boleh huruf, angka, dan underscore';
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $errors[] = 'Format email tidak valid';
    }
    if (strlen($password) < 6) {
        $errors[] = 'Password minimal 6 karakter';
    }
    if ($password !== $confirm) {
        $errors[] = 'Konfirmasi password tidak cocok';
    }
    
    if (!empty($errors)) {
        return ['success' => false, 'errors' => $errors];
    }
    
    $db = db();
    
    $stmt = $db->prepare('SELECT ID FROM accounts WHERE Username = ? LIMIT 1');
    $stmt->bind_param('s', $username);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        return ['success' => false, 'errors' => ['Username sudah digunakan']];
    }
    $stmt->close();
    
    $stmt = $db->prepare('SELECT ID FROM accounts WHERE Email = ? LIMIT 1');
    $stmt->bind_param('s', $email);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        return ['success' => false, 'errors' => ['Email sudah terdaftar']];
    }
    $stmt->close();
    
    $hashed = hash_password($password);
    $stmt = $db->prepare('INSERT INTO accounts (Username, Email, Password, SecretWord, SecretHint) VALUES (?, ?, ?, ?, ?)');
    $secretWord = 'default';
    $secretHint = 'default';
    $stmt->bind_param('sssss', $username, $email, $hashed, $secretWord, $secretHint);
    
    if ($stmt->execute()) {
        $stmt->close();
        return ['success' => true];
    }
    
    $stmt->close();
    return ['success' => false, 'errors' => ['Terjadi kesalahan saat mendaftar. Coba lagi.']];
}

/**
 * Logout user
 */
function logout_user(): void
{
    start_session();
    session_unset();
    session_destroy();
}

/**
 * Ambil data user yang sedang login
 */
function current_user(): ?array
{
    if (!is_logged_in()) return null;
    static $user = null;
    if ($user === null) {
        $db = db();
        $stmt = $db->prepare('SELECT ID as id, Username as username, Email as email, Admin as is_admin, RegisterDate as created_at, LoginDate as last_login FROM accounts WHERE ID = ? LIMIT 1');
        $id = (int)$_SESSION['ucp_id'];
        $stmt->bind_param('i', $id);
        $stmt->execute();
        $result = $stmt->get_result();
        $user = $result->fetch_assoc();
        $stmt->close();
    }
    return $user;
}

/**
 * Ambil semua karakter milik user
 */
function get_user_characters(int $ucpId): array
{
    $db = db();
    $stmt = $db->prepare('SELECT ID as id, char_name as name, Level as level, Cash as money, BankAccount as bank, Model as skin, Online as is_online FROM characters WHERE master = ? ORDER BY ID ASC');
    $stmt->bind_param('i', $ucpId);
    $stmt->execute();
    $result = $stmt->get_result();
    $chars = [];
    while ($row = $result->fetch_assoc()) {
        // Berikan nilai default untuk properti usia agar tampilan profil tidak error
        $row['age'] = 20; 
        $row['gender'] = 0;
        $row['health'] = 150.0;
        $row['armor'] = 0.0;
        $row['is_banned'] = 0;
        $row['created_at'] = date('Y-m-d H:i:s');
        $chars[] = $row;
    }
    $stmt->close();
    return $chars;
}

/**
 * Ambil karakter berdasarkan ID dan UCP (memastikan kepemilikan)
 */
function get_character(int $charId, int $ucpId): ?array
{
    $db = db();
    $stmt = $db->prepare('SELECT ID as id, char_name as name, Level as level, Cash as money, BankAccount as bank, Model as skin, Online as is_online FROM characters WHERE ID = ? AND master = ? LIMIT 1');
    $stmt->bind_param('ii', $charId, $ucpId);
    $stmt->execute();
    $result = $stmt->get_result();
    $char = $result->fetch_assoc();
    $stmt->close();
    
    if ($char) {
        $char['age'] = 20;
        $char['gender'] = 0;
        $char['health'] = 150.0;
        $char['armor'] = 0.0;
        $char['is_banned'] = 0;
    }
    
    return $char ?: null;
}

/**
 * Buat karakter baru (disesuaikan dengan kolom SQL asli)
 */
function create_character(int $ucpId, string $name, int $age, int $gender, int $skin, string $password = ''): array
{
    if (!preg_match('/^[A-Z][a-z]+_[A-Z][a-z]+$/', $name)) {
        return ['success' => false, 'error' => 'Nama harus format Firstname_Lastname (contoh: John_Smith)'];
    }
    
    $db = db();
    
    $stmt = $db->prepare('SELECT ID FROM characters WHERE char_name = ? LIMIT 1');
    $stmt->bind_param('s', $name);
    $stmt->execute();
    if ($stmt->get_result()->num_rows > 0) {
        $stmt->close();
        return ['success' => false, 'error' => 'Nama karakter sudah digunakan'];
    }
    $stmt->close();
    
    $chars = get_user_characters($ucpId);
    if (count($chars) >= 3) {
        return ['success' => false, 'error' => 'Anda sudah mencapai batas maksimal 3 karakter'];
    }
    
    // Query disesuaikan dengan kolom tabel characters yang ada di SQL lu (tanpa kolom age)
    $stmt = $db->prepare('INSERT INTO characters (master, char_name, Model, Cash, BankAccount, Level, Health, Armour) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
    $cash = 10000;
    $bank = 5000;
    $level = 1;
    $health = 150.0;
    $armour = 0.0;
    $stmt->bind_param('isiiiiid', $ucpId, $name, $skin, $cash, $bank, $level, $health, $armour);
    
    if ($stmt->execute()) {
        $charId = $stmt->insert_id;
        $stmt->close();
        return ['success' => true, 'char_id' => $charId];
    }
    
    $stmt->close();
    return ['success' => false, 'error' => 'Gagal membuat karakter. Coba lagi.'];
}

/**
 * Hapus karakter
 */
function delete_character(int $charId, int $ucpId): array
{
    $char = get_character($charId, $ucpId);
    if (!$char) {
        return ['success' => false, 'error' => 'Karakter tidak ditemukan'];
    }
    if ((int)$char['is_online'] === 1) {
        return ['success' => false, 'error' => 'Tidak bisa menghapus karakter yang sedang online'];
    }
    
    $db = db();
    $stmt = $db->prepare('DELETE FROM characters WHERE ID = ? AND master = ?');
    $stmt->bind_param('ii', $charId, $ucpId);
    if ($stmt->execute()) {
        $stmt->close();
        return ['success' => true];
    }
    $stmt->close();
    return ['success' => false, 'error' => 'Gagal menghapus karakter'];
}

/**
 * Hitung total statistik user
 */
function get_user_stats(int $ucpId): array
{
    $db = db();
    $stmt = $db->prepare('SELECT COUNT(*) as total, SUM(Cash) as total_money, SUM(BankAccount) as total_bank, SUM(Level) as total_level FROM characters WHERE master = ?');
    $stmt->bind_param('i', $ucpId);
    $stmt->execute();
    $result = $stmt->get_result()->fetch_assoc();
    $stmt->close();
    return [
        'total_chars'   => (int)($result['total'] ?? 0),
        'total_money'   => (int)($result['total_money'] ?? 0),
        'total_bank'    => (int)($result['total_bank'] ?? 0),
        'total_level'   => (int)($result['total_level'] ?? 0),
    ];
}

/**
 * Ambil jumlah pemain online
 */
function get_online_count(): int
{
    $db = db();
    $result = $db->query('SELECT COUNT(*) as cnt FROM characters WHERE Online = 1');
    if (!$result) return 0;
    $row = $result->fetch_assoc();
    return (int)($row['cnt'] ?? 0);
}

/**
 * Ambil daftar pemain online
 */
function get_online_players(int $limit = 50): array
{
    $db = db();
    $stmt = $db->prepare('SELECT char_name as name, Level as level, Cash as money, Model as skin, Health as health, PosX as pos_x, PosY as pos_y, PosZ as pos_z FROM characters WHERE Online = 1 ORDER BY Level DESC LIMIT ?');
    $stmt->bind_param('i', $limit);
    $stmt->execute();
    $result = $stmt->get_result();
    $players = [];
    while ($row = $result->fetch_assoc()) {
        $players[] = $row;
    }
    $stmt->close();
    return $players;
}

/**
 * Ambil pengumuman aktif (Fallback aman jika tabel tidak ada)
 */
function get_announcements(int $limit = 5): array
{
    return [
        [
            'id' => 1,
            'title' => 'Selamat Datang di Server Roleplay',
            'content' => 'Gunakan UCP ini untuk mengelola akun dan karakter game Anda dengan mudah.',
            'type' => 'info',
            'created_at' => date('Y-m-d H:i:s')
        ]
    ];
}

/**
 * Ambil kategori forum (Fallback aman)
 */
function get_forum_categories(): array
{
    return [
        ['id' => 1, 'name' => 'Pengumuman Resmi', 'description' => 'Informasi penting dari staff server', 'display_order' => 1, 'topic_count' => 1],
        ['id' => 2, 'name' => 'Diskusi Umum', 'description' => 'Ngobrol santai seputar game', 'display_order' => 2, 'topic_count' => 0]
    ];
}

/**
 * Ambil topik berdasarkan kategori (Fallback aman)
 */
function get_topics_by_category(int $catId, int $limit = 20): array
{
    return [];
}

/**
 * Ambil topik terbaru untuk dashboard (Fallback aman)
 */
function get_recent_topics(int $limit = 5): array
{
    return [];
}

/**
 * Ambil detail topik (Fallback aman)
 */
function get_topic(int $topicId): ?array
{
    return null;
}

/**
 * Ambil balasan topik (Fallback aman)
 */
function get_topic_replies(int $topicId): array
{
    return [];
}

/**
 * Buat topik baru (Fallback aman)
 */
function create_topic(int $ucpId, int $catId, string $title, string $content, ?string $charName = null): array
{
    return ['success' => false, 'error' => 'Fitur forum sedang dalam pemeliharaan'];
}

/**
 * Buat balasan (Fallback aman)
 */
function create_reply(int $topicId, int $ucpId, string $content, ?string $charName = null): array
{
    return ['success' => false, 'error' => 'Fitur forum sedang dalam pemeliharaan'];
}

/**
 * Tambah views topik
 */
function increment_topic_views(int $topicId): void
{
    // Do nothing
}