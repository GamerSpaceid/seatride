/* ============================================================
   SEA TRIBE - JavaScript Interactivity
   ============================================================ */

document.addEventListener('DOMContentLoaded', function() {

    // Sidebar toggle (mobile)
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    if (sidebarToggle && sidebar) {
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);

        sidebarToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            overlay.classList.toggle('active');
        });
        overlay.addEventListener('click', () => {
            sidebar.classList.remove('open');
            overlay.classList.remove('active');
        });
    }

    // Password visibility toggle
    document.querySelectorAll('.toggle-pass').forEach(btn => {
        btn.addEventListener('click', function() {
            const input = this.parentElement.querySelector('input');
            const icon = this.querySelector('i');
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.replace('fa-eye', 'fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.replace('fa-eye-slash', 'fa-eye');
            }
        });
    });

    // Auto-hide flash messages
    const flashMsg = document.getElementById('flashMsg');
    if (flashMsg) {
        setTimeout(() => {
            flashMsg.style.transition = 'all 0.4s ease';
            flashMsg.style.transform = 'translateX(120%)';
            flashMsg.style.opacity = '0';
            setTimeout(() => flashMsg.remove(), 400);
        }, 5000);
    }

    // Modal handling
    window.openModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    };
    window.closeModal = function(id) {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
        }
    };
    // Close modal on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                this.classList.remove('active');
                document.body.style.overflow = '';
            }
        });
    });

    // Skin picker
    let selectedSkin = 2;
    document.querySelectorAll('.skin-option').forEach(option => {
        option.addEventListener('click', function() {
            document.querySelectorAll('.skin-option').forEach(o => o.classList.remove('selected'));
            this.classList.add('selected');
            selectedSkin = parseInt(this.dataset.skin);
            const hiddenInput = document.getElementById('skinInput');
            if (hiddenInput) hiddenInput.value = selectedSkin;
        });
    });

    // Character creation form
    const createCharForm = document.getElementById('createCharForm');
    if (createCharForm) {
        createCharForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Membuat...';

            const formData = new FormData(this);
            try {
                const response = await fetch('api/character.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    window.location.href = 'characters.php?msg=' + encodeURIComponent('Karakter berhasil dibuat!') + '&type=success';
                } else {
                    showAlert(data.error || 'Gagal membuat karakter', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                showAlert('Terjadi kesalahan jaringan', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Delete character
    document.querySelectorAll('.btn-delete-char').forEach(btn => {
        btn.addEventListener('click', async function() {
            const charId = this.dataset.id;
            const charName = this.dataset.name;
            if (!confirm('Yakin ingin menghapus karakter "' + charName + '"? Tindakan ini tidak bisa dibatalkan.')) return;

            try {
                const formData = new FormData();
                formData.append('action', 'delete');
                formData.append('char_id', charId);
                const response = await fetch('api/character.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    showAlert(data.error || 'Gagal menghapus', 'danger');
                }
            } catch (err) {
                showAlert('Terjadi kesalahan', 'danger');
            }
        });
    });

    // Forum reply form
    const replyForm = document.getElementById('replyForm');
    if (replyForm) {
        replyForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Mengirim...';

            const formData = new FormData(this);
            try {
                const response = await fetch('api/forum.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success) {
                    window.location.reload();
                } else {
                    showAlert(data.error || 'Gagal mengirim balasan', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                showAlert('Terjadi kesalahan', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // New topic form
    const topicForm = document.getElementById('topicForm');
    if (topicForm) {
        topicForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            const btn = this.querySelector('button[type="submit"]');
            const originalText = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = '<span class="spinner"></span> Membuat...';

            const formData = new FormData(this);
            try {
                const response = await fetch('api/forum.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                if (data.success && data.topic_id) {
                    window.location.href = 'topic.php?id=' + data.topic_id + '&msg=' + encodeURIComponent('Topik berhasil dibuat!') + '&type=success';
                } else {
                    showAlert(data.error || 'Gagal membuat topik', 'danger');
                    btn.disabled = false;
                    btn.innerHTML = originalText;
                }
            } catch (err) {
                showAlert('Terjadi kesalahan', 'danger');
                btn.disabled = false;
                btn.innerHTML = originalText;
            }
        });
    }

    // Auto-refresh online players
    const onlineList = document.getElementById('onlinePlayersList');
    if (onlineList) {
        setInterval(async () => {
            try {
                const response = await fetch('api/online.php');
                const data = await response.json();
                if (data.success) {
                    const countEl = document.getElementById('onlineCount');
                    if (countEl) countEl.textContent = data.count;
                    if (data.count === 0) {
                        onlineList.innerHTML = '<div class="empty-state"><i class="fas fa-user-slash"></i><h3>Tidak ada pemain online</h3><p>Server sedang kosong. Masuk ke game untuk menjadi pemain pertama!</p></div>';
                    } else {
                        onlineList.innerHTML = data.html;
                    }
                }
            } catch (err) {
                // Silent fail
            }
        }, 15000);
    }

    // Fade-in animation on cards
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });
    document.querySelectorAll('.card, .stat-card, .char-card, .topic-item, .announcement-card').forEach(el => {
        observer.observe(el);
    });
});

// Show alert message
function showAlert(message, type = 'info') {
    const existing = document.querySelector('.flash-message');
    if (existing) existing.remove();

    const alert = document.createElement('div');
    alert.className = 'flash-message flash-' + type;
    const icon = type === 'success' ? 'check-circle' : (type === 'warning' ? 'exclamation-triangle' : (type === 'danger' ? 'times-circle' : 'info-circle'));
    alert.innerHTML = '<i class="fas fa-' + icon + '"></i><span>' + message + '</span><button onclick="this.parentElement.remove()"><i class="fas fa-times"></i></button>';
    document.body.appendChild(alert);
    setTimeout(() => {
        alert.style.transition = 'all 0.4s ease';
        alert.style.transform = 'translateX(120%)';
        alert.style.opacity = '0';
        setTimeout(() => alert.remove(), 400);
    }, 5000);
}
