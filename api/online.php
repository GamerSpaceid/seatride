<?php
/**
 * API Endpoint - Pemain Online (Auto-refresh)
 */
require_once __DIR__ . '/../includes/auth.php';

if (!is_logged_in()) {
    json_response(['success' => false, 'error' => 'Tidak terautentikasi'], 401);
}

$players = get_online_players(100);
$count = count($players);

if ($count === 0) {
    $html = '<div class="empty-state"><i class="fas fa-user-slash"></i><h3>Tidak Ada Pemain Online</h3><p>Server sedang kosong.</p></div>';
} else {
    $html = '<div style="overflow-x:auto;"><table class="player-table"><thead><tr><th>Nama Karakter</th><th>Level</th><th>Uang</th><th>Skin</th><th>Kesehatan</th><th>Posisi</th></tr></thead><tbody>';
    foreach ($players as $p) {
        $html .= '<tr>';
        $html .= '<td><div class="player-name-cell"><div class="pavatar"><i class="fas fa-user"></i></div>' . e($p['name']) . '</div></td>';
        $html .= '<td><span class="badge badge-accent">Lv. ' . (int)$p['level'] . '</span></td>';
        $html .= '<td style="font-family:var(--font-mono);color:var(--success);">' . format_money((int)$p['money']) . '</td>';
        $html .= '<td>#' . (int)$p['skin'] . '</td>';
        $healthPct = max(0, min(100, (float)$p['health']));
        $html .= '<td><div style="display:flex;align-items:center;gap:8px;"><div class="health-bar"><div class="health-bar-fill" style="width:' . $healthPct . '%;"></div></div><span style="font-size:12px;">' . (int)$p['health'] . '%</span></div></td>';
        $html .= '<td style="font-family:var(--font-mono);font-size:12px;color:var(--text-muted);">' . number_format((float)$p['pos_x'], 1) . ', ' . number_format((float)$p['pos_y'], 1) . '</td>';
        $html .= '</tr>';
    }
    $html .= '</tbody></table></div>';
}

json_response(['success' => true, 'count' => $count, 'html' => $html]);
