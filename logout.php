<?php
/**
 * Logout - SEA TRIBE
 */
require_once __DIR__ . '/includes/auth.php';
logout_user();
redirect('login.php', 'Anda telah keluar. Sampai jumpa!', 'info');
