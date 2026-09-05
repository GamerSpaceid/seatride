# SEA TRIBE Roleplay - User Control Panel

Panel kontrol pengguna modern untuk server SA-MP dengan PHP 8.2 + MySQL.

## Fitur

- **Autentikasi** - Login & Register dengan password hashing Whirlpool (kompatibel dengan game server SA-MP)
- **Dashboard** - Statistik karakter, pengumuman, topik terbaru
- **Manajemen Karakter** - Buat, lihat, hapus karakter (maksimal 3 per akun)
- **Forum Komunitas** - Kategori, topik, balasan dengan sistem lengkap
- **Pengumuman** - Pengumuman server dari admin
- **Pelacak Pemain Online** - Daftar pemain online real-time dengan auto-refresh
- **Profil Akun** - Lihat dan kelola informasi akun
- **Desain Modern** - Dark glassmorphism dengan neon violet, animasi halus, responsif

## Persyaratan

- PHP 8.2 atau lebih baru
- MySQL / MariaDB (XAMPP)
- Browser modern

## Cara Instalasi

1. **Salin file ke htdocs**
   ```
   Salin folder ini ke: C:\xampp\htdocs\ucp
   ```

2. **Buat database**
   - Buka phpMyAdmin: http://localhost/phpmyadmin
   - Buat database baru bernama `samp`
   - Import file `database.sql` ke database `samp`

3. **Konfigurasi koneksi**
   - File `config.php` sudah diset untuk XAMPP default:
     - Host: 127.0.0.1
     - User: root
     - Password: (kosong)
     - Database: samp

4. **Akses UCP**
   - Buka browser: http://localhost/ucp
   - Daftar akun baru, lalu login
   - Buat karakter dan mulai bermain

## Struktur File

```
ucp/
├── config.php              # Konfigurasi database & fungsi helper
├── database.sql            # Skema database (import ke phpMyAdmin)
├── index.php               # Halaman landing
├── login.php                # Halaman login
├── register.php             # Halaman register
├── logout.php               # Proses logout
├── dashboard.php            # Dashboard utama
├── characters.php           # Manajemen karakter
├── forum.php                # Forum komunitas
├── category.php             # Topik per kategori
├── topic.php                # Lihat & balas topik
├── announcements.php        # Pengumuman server
├── online.php               # Pemain online
├── profile.php              # Pengaturan akun
├── includes/
│   ├── auth.php             # Logika autentikasi & query database
│   ├── header.php           # Template header
│   ├── footer.php           # Template footer
│   └── sidebar.php          # Sidebar navigasi
├── api/
│   ├── character.php        # API buat/hapus karakter (AJAX)
│   ├── forum.php            # API buat topik/balasan (AJAX)
│   └── online.php           # API daftar pemain online (AJAX)
└── assets/
    ├── css/style.css        # Styling glassmorphism dark theme
    └── js/main.js           # Interaktivitas JavaScript
```

## Keamanan

- Password di-hash menggunakan `hash('whirlpool', $password)` - kompatibel dengan SA-MP
- Prepared statements (MySQLi) untuk mencegah SQL injection
- Output escaping (htmlspecialchars) untuk mencegah XSS
- Session management dengan HttpOnly & SameSite cookies
- Validasi input di sisi server dan klien

## Integrasi dengan Game Server

Tabel `characters` menggunakan field yang umum dipakai SA-MP:
- `name` - Format Firstname_Lastname
- `password` - Whirlpool hash (jika game server memerlukan login karakter)
- `level`, `money`, `bank`, `skin`, `health`, `armor`
- `pos_x`, `pos_y`, `pos_z`, `interior`, `virtual_world`
- `is_online`, `is_banned`, `ban_reason`

Game server SA-MP Anda dapat membaca tabel `characters` langsung untuk:
- Validasi login pemain
- Load statistik karakter
- Update status online/offline
- Cek status banned

## Konfigurasi

Edit `config.php` untuk mengubah:
- Koneksi database (host, user, password, nama database)
- Batas maksimal karakter
- Uang dan level awal karakter baru
- Batas usia karakter
- Nama dan versi aplikasi
