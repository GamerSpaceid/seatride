-- ============================================================
-- SEA TRIBE Roleplay - Skema Database
-- Jalankan di phpMyAdmin atau MySQL CLI pada database "samp"
-- ============================================================

-- Tabel akun UCP (login ke panel web)
CREATE TABLE IF NOT EXISTS `ucp_accounts` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `username` VARCHAR(50) NOT NULL UNIQUE,
    `email` VARCHAR(100) NOT NULL UNIQUE,
    `password` VARCHAR(128) NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    `is_admin` TINYINT(1) DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel karakter (akun SA-MP in-game)
-- Mengikuti format umum SA-MP: nama dalam format "Firstname_Lastname"
CREATE TABLE IF NOT EXISTS `characters` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `ucp_id` INT NOT NULL,
    `name` VARCHAR(24) NOT NULL UNIQUE,
    `password` VARCHAR(128) DEFAULT NULL,
    `level` INT DEFAULT 1,
    `money` INT DEFAULT 5000,
    `bank` INT DEFAULT 0,
    `skin` INT DEFAULT 2,
    `age` INT DEFAULT 25,
    `gender` TINYINT(1) DEFAULT 0 COMMENT '0=Male, 1=Female',
    `health` FLOAT DEFAULT 100.0,
    `armor` FLOAT DEFAULT 0.0,
    `pos_x` FLOAT DEFAULT 0.0,
    `pos_y` FLOAT DEFAULT 0.0,
    `pos_z` FLOAT DEFAULT 0.0,
    `interior` INT DEFAULT 0,
    `virtual_world` INT DEFAULT 0,
    `is_online` TINYINT(1) DEFAULT 0,
    `is_banned` TINYINT(1) DEFAULT 0,
    `ban_reason` VARCHAR(255) DEFAULT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `last_login` TIMESTAMP NULL DEFAULT NULL,
    CONSTRAINT `fk_char_ucp` FOREIGN KEY (`ucp_id`) REFERENCES `ucp_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel forum kategori
CREATE TABLE IF NOT EXISTS `forum_categories` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `name` VARCHAR(100) NOT NULL,
    `description` VARCHAR(255) DEFAULT NULL,
    `icon` VARCHAR(50) DEFAULT 'comments',
    `display_order` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel topik forum
CREATE TABLE IF NOT EXISTS `forum_topics` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `category_id` INT NOT NULL,
    `ucp_id` INT NOT NULL,
    `character_name` VARCHAR(24) DEFAULT NULL,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `is_pinned` TINYINT(1) DEFAULT 0,
    `is_locked` TINYINT(1) DEFAULT 0,
    `views` INT DEFAULT 0,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT `fk_topic_cat` FOREIGN KEY (`category_id`) REFERENCES `forum_categories`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_topic_ucp` FOREIGN KEY (`ucp_id`) REFERENCES `ucp_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel balasan forum
CREATE TABLE IF NOT EXISTS `forum_replies` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `topic_id` INT NOT NULL,
    `ucp_id` INT NOT NULL,
    `character_name` VARCHAR(24) DEFAULT NULL,
    `content` TEXT NOT NULL,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT `fk_reply_topic` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`) ON DELETE CASCADE,
    CONSTRAINT `fk_reply_ucp` FOREIGN KEY (`ucp_id`) REFERENCES `ucp_accounts`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tabel pengumuman
CREATE TABLE IF NOT EXISTS `announcements` (
    `id` INT AUTO_INCREMENT PRIMARY KEY,
    `title` VARCHAR(200) NOT NULL,
    `content` TEXT NOT NULL,
    `type` VARCHAR(20) DEFAULT 'info' COMMENT 'info, success, warning, danger',
    `author` VARCHAR(50) DEFAULT 'Admin',
    `is_active` TINYINT(1) DEFAULT 1,
    `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ============================================================
-- Data Awal
-- ============================================================

INSERT INTO `forum_categories` (`name`, `description`, `icon`, `display_order`) VALUES
('Pengumuman Server', 'Pengumuman resmi dari staff server', 'bullhorn', 1),
('Diskusi Umum', 'Diskusi seputar SA-MP roleplay', 'comments', 2),
('Panduan & Tutorial', 'Panduan bermain untuk pemain baru', 'book', 3),
('Laporan Bug', 'Laporkan bug yang ditemukan', 'bug', 4),
('Permintaan Bantuan', 'Minta bantuan dari staff atau komunitas', 'hands-helping', 5);

INSERT INTO `announcements` (`title`, `content`, `type`, `author`) VALUES
('Selamat Datang di SEA TRIBE Roleplay!', 'Panel kontrol pengguna resmi server kami. Daftar akun, buat karakter, dan kelola permainan Anda di sini. Server berjalan 24/7 dengan komunitas yang aktif.', 'success', 'Admin'),
('Update Sistem 2026', 'Sistem UCP telah diperbarui dengan tampilan modern, forum komunitas, dan pelacak pemain online. Nikmati pengalaman bermain yang lebih baik!', 'info', 'Developer'),
('Aturan Roleplay', 'Pastikan Anda membaca aturan roleplay sebelum bermain. Pelanggaran akan berakibat banned. Selalu gunakan nama format Firstname_Lastname.', 'warning', 'Staff');
