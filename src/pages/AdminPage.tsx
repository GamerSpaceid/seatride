import { useEffect, useState } from 'react';
import {
  ShieldCheck, Bell, FileText, Users, Plus, X, Trash2, Edit3,
  Megaphone, ScrollText, ChevronRight, AlertTriangle, CheckCircle,
  Info, AlertCircle, Lock, Unlock,
} from 'lucide-react';
import {
  supabase, type Announcement, type UpdateLog, type Character,
  getRankFromLevel, type RankInfo,
} from '../lib/supabase';

type Tab = 'overview' | 'announcements' | 'logs' | 'players';

export default function AdminPage() {
  const [rank, setRank] = useState<RankInfo | null>(null);
  const [tab, setTab] = useState<Tab>('overview');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [logs, setLogs] = useState<UpdateLog[]>([]);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [showAnnForm, setShowAnnForm] = useState(false);
  const [showLogForm, setShowLogForm] = useState(false);
  const [editingAnn, setEditingAnn] = useState<Announcement | null>(null);
  const [editingLog, setEditingLog] = useState<UpdateLog | null>(null);

  // Form state
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [annType, setAnnType] = useState('info');
  const [logVersion, setLogVersion] = useState('');
  const [logTitle, setLogTitle] = useState('');
  const [logBody, setLogBody] = useState('');
  const [logCategory, setLogCategory] = useState('feature');

  const showNotice = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 2500); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      // Fetch the admin character (level 10 = Developer)
      const { data: charData } = await supabase.from('characters').select('*').order('level', { ascending: false }).limit(1);
      if (charData && charData.length > 0) {
        const topChar = charData[0] as Character;
        setRank(getRankFromLevel(topChar.level));
      } else {
        setRank(getRankFromLevel(0));
      }

      const [{ data: annData }, { data: logData }, { data: charList }] = await Promise.all([
        supabase.from('announcements').select('*').order('created_at', { ascending: false }),
        supabase.from('update_logs').select('*').order('created_at', { ascending: false }),
        supabase.from('characters').select('*').order('level', { ascending: false }),
      ]);
      if (annData) setAnnouncements(annData as Announcement[]);
      if (logData) setLogs(logData as UpdateLog[]);
      if (charList) setCharacters(charList as Character[]);
      setLoading(false);
    })();
  }, []);

  const refreshAnnouncements = async () => {
    const { data } = await supabase.from('announcements').select('*').order('created_at', { ascending: false });
    if (data) setAnnouncements(data as Announcement[]);
  };

  const refreshLogs = async () => {
    const { data } = await supabase.from('update_logs').select('*').order('created_at', { ascending: false });
    if (data) setLogs(data as UpdateLog[]);
  };

  const saveAnnouncement = async () => {
    if (!annTitle.trim() || !annContent.trim()) return;
    if (editingAnn) {
      const { error } = await supabase.from('announcements').update({
        title: annTitle.trim(), content: annContent.trim(), type: annType,
      }).eq('id', editingAnn.id);
      if (error) { showNotice('Failed to update announcement.'); return; }
      showNotice('Announcement updated.');
    } else {
      const { error } = await supabase.from('announcements').insert({
        title: annTitle.trim(), content: annContent.trim(), type: annType, author: rank?.label ?? 'Admin', is_active: true,
      });
      if (error) { showNotice('Failed to create announcement.'); return; }
      showNotice('Announcement published.');
    }
    setAnnTitle(''); setAnnContent(''); setAnnType('info'); setEditingAnn(null); setShowAnnForm(false);
    refreshAnnouncements();
  };

  const deleteAnnouncement = async (id: number) => {
    const { error } = await supabase.from('announcements').delete().eq('id', id);
    if (error) { showNotice('Failed to delete.'); return; }
    showNotice('Announcement deleted.');
    refreshAnnouncements();
  };

  const toggleAnnouncementActive = async (ann: Announcement) => {
    await supabase.from('announcements').update({ is_active: !ann.is_active }).eq('id', ann.id);
    refreshAnnouncements();
  };

  const saveLog = async () => {
    if (!logVersion.trim() || !logTitle.trim() || !logBody.trim()) return;
    if (editingLog) {
      const { error } = await supabase.from('update_logs').update({
        version: logVersion.trim(), title: logTitle.trim(), body: logBody.trim(), category: logCategory,
      }).eq('id', editingLog.id);
      if (error) { showNotice('Failed to update log.'); return; }
      showNotice('Update log saved.');
    } else {
      const { error } = await supabase.from('update_logs').insert({
        version: logVersion.trim(), title: logTitle.trim(), body: logBody.trim(), category: logCategory, author: rank?.label ?? 'Developer',
      });
      if (error) { showNotice('Failed to create log.'); return; }
      showNotice('Update log created.');
    }
    setLogVersion(''); setLogTitle(''); setLogBody(''); setLogCategory('feature'); setEditingLog(null); setShowLogForm(false);
    refreshLogs();
  };

  const deleteLog = async (id: number) => {
    const { error } = await supabase.from('update_logs').delete().eq('id', id);
    if (error) { showNotice('Failed to delete.'); return; }
    showNotice('Log deleted.');
    refreshLogs();
  };

  const toggleBan = async (char: Character) => {
    const { error } = await supabase.from('characters').update({ is_banned: !char.is_banned }).eq('id', char.id);
    if (error) { showNotice('Failed to update ban status.'); return; }
    showNotice(char.is_banned ? 'Player unbanned.' : 'Player banned.');
    const { data } = await supabase.from('characters').select('*').order('level', { ascending: false });
    if (data) setCharacters(data as Character[]);
  };

  if (loading) return <div className="page-status">Loading admin panel…</div>;
  if (!rank?.isAdmin) return (
    <div className="page-enter">
      <div className="access-denied">
        <Lock size={48} />
        <h1>Access Denied</h1>
        <p>Your rank (Level {rank?.level ?? 0} — {rank?.label ?? 'Member'}) does not have admin privileges.</p>
        <p className="access-hint">You need at least Level 4 (Moderator) to access this panel.</p>
      </div>
    </div>
  );

  const typeIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle size={14} />;
      case 'warning': return <AlertTriangle size={14} />;
      case 'danger': return <AlertCircle size={14} />;
      default: return <Info size={14} />;
    }
  };

  return (
    <div className="page-enter">
      {notice && <div className="toast"><ShieldCheck size={16} />{notice}</div>}

      <div className="admin-header">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> ADMIN CONTROL PANEL</p>
          <h1>Admin Panel</h1>
          <p className="page-sub">Welcome, <strong>{rank.label}</strong> (Level {rank.level})</p>
        </div>
        <div className="admin-rank-badge">
          <ShieldCheck size={18} />
          <span>{rank.label.toUpperCase()}</span>
          <small>Level {rank.level}</small>
        </div>
      </div>

      <div className="admin-tabs">
        <button className={`admin-tab ${tab === 'overview' ? 'active' : ''}`} onClick={() => setTab('overview')}><Megaphone size={16} /> Overview</button>
        {rank.canManageAnnouncements && <button className={`admin-tab ${tab === 'announcements' ? 'active' : ''}`} onClick={() => setTab('announcements')}><Bell size={16} /> Announcements</button>}
        {rank.canManageUpdateLogs && <button className={`admin-tab ${tab === 'logs' ? 'active' : ''}`} onClick={() => setTab('logs')}><ScrollText size={16} /> Update Logs</button>}
        {rank.canBan && <button className={`admin-tab ${tab === 'players' ? 'active' : ''}`} onClick={() => setTab('players')}><Users size={16} /> Players</button>}
      </div>

      {tab === 'overview' && (
        <div className="admin-overview">
          <div className="admin-stat-row">
            <div className="admin-stat-card"><Bell size={20} /><strong>{announcements.length}</strong><span>Announcements</span></div>
            <div className="admin-stat-card"><ScrollText size={20} /><strong>{logs.length}</strong><span>Update Logs</span></div>
            <div className="admin-stat-card"><Users size={20} /><strong>{characters.length}</strong><span>Characters</span></div>
            <div className="admin-stat-card"><ShieldCheck size={20} /><strong>{characters.filter(c => c.is_banned).length}</strong><span>Banned</span></div>
          </div>
          <div className="admin-permissions">
            <h3>Your Permissions</h3>
            <div className="perm-list">
              <div className={`perm-item ${rank.canManageAnnouncements ? 'granted' : 'denied'}`}>{rank.canManageAnnouncements ? <Unlock size={14} /> : <Lock size={14} />} Manage Announcements</div>
              <div className={`perm-item ${rank.canManageUpdateLogs ? 'granted' : 'denied'}`}>{rank.canManageUpdateLogs ? <Unlock size={14} /> : <Lock size={14} />} Manage Update Logs</div>
              <div className={`perm-item ${rank.canBan ? 'granted' : 'denied'}`}>{rank.canBan ? <Unlock size={14} /> : <Lock size={14} />} Ban / Unban Players</div>
            </div>
          </div>
        </div>
      )}

      {tab === 'announcements' && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2>Announcements</h2>
            <button className="primary-button" onClick={() => { setEditingAnn(null); setAnnTitle(''); setAnnContent(''); setAnnType('info'); setShowAnnForm(true); }}><Plus size={17} /> New Announcement</button>
          </div>
          <div className="admin-list">
            {announcements.length === 0 ? <div className="page-status">No announcements yet.</div> : announcements.map((ann) => (
              <div key={ann.id} className={`admin-item ${!ann.is_active ? 'inactive' : ''}`}>
                <div className={`ann-type-badge type-${ann.type}`}>{typeIcon(ann.type)} {ann.type.toUpperCase()}</div>
                <div className="admin-item-body">
                  <h3>{ann.title}</h3>
                  <p>{ann.content}</p>
                  <small>By {ann.author} · {new Date(ann.created_at).toLocaleDateString()} · {ann.is_active ? 'Active' : 'Hidden'}</small>
                </div>
                <div className="admin-item-actions">
                  <button className="icon-button" title={ann.is_active ? 'Hide' : 'Show'} onClick={() => toggleAnnouncementActive(ann)}><Lock size={16} /></button>
                  <button className="icon-button" title="Edit" onClick={() => { setEditingAnn(ann); setAnnTitle(ann.title); setAnnContent(ann.content); setAnnType(ann.type); setShowAnnForm(true); }}><Edit3 size={16} /></button>
                  <button className="icon-button delete-btn" title="Delete" onClick={() => deleteAnnouncement(ann.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'logs' && (
        <div className="admin-section">
          <div className="admin-section-head">
            <h2>Update Logs</h2>
            <button className="primary-button" onClick={() => { setEditingLog(null); setLogVersion(''); setLogTitle(''); setLogBody(''); setLogCategory('feature'); setShowLogForm(true); }}><Plus size={17} /> New Log Entry</button>
          </div>
          <div className="admin-list">
            {logs.length === 0 ? <div className="page-status">No update logs yet.</div> : logs.map((log) => (
              <div key={log.id} className="admin-item">
                <div className={`log-cat-badge cat-${log.category}`}>{log.category.toUpperCase()}</div>
                <div className="admin-item-body">
                  <h3>{log.version} — {log.title}</h3>
                  <p>{log.body}</p>
                  <small>By {log.author} · {new Date(log.created_at).toLocaleDateString()}</small>
                </div>
                <div className="admin-item-actions">
                  <button className="icon-button" title="Edit" onClick={() => { setEditingLog(log); setLogVersion(log.version); setLogTitle(log.title); setLogBody(log.body); setLogCategory(log.category); setShowLogForm(true); }}><Edit3 size={16} /></button>
                  <button className="icon-button delete-btn" title="Delete" onClick={() => deleteLog(log.id)}><Trash2 size={16} /></button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'players' && (
        <div className="admin-section">
          <div className="admin-section-head"><h2>Player Management</h2></div>
          <div className="admin-list">
            {characters.map((char) => (
              <div key={char.id} className="admin-item">
                <div className="admin-player-avatar">{char.name.slice(0, 2).toUpperCase()}</div>
                <div className="admin-item-body">
                  <h3>{char.name.replace('_', ' ')} {char.is_banned && <span className="tag tag-red">BANNED</span>}</h3>
                  <p>Level {char.level} · {char.is_online ? 'Online' : 'Offline'} · ${char.money.toLocaleString()}</p>
                </div>
                <div className="admin-item-actions">
                  <button className={`ban-toggle ${char.is_banned ? 'unban' : 'ban'}`} onClick={() => toggleBan(char)}>
                    {char.is_banned ? 'Unban' : 'Ban'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Announcement form modal */}
      {showAnnForm && (
        <div className="modal-backdrop" onClick={() => setShowAnnForm(false)}>
          <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">ADMIN / {editingAnn ? 'EDIT' : 'NEW'} ANNOUNCEMENT</span><h2>{editingAnn ? 'Edit Announcement' : 'Create Announcement'}</h2></div>
              <button className="icon-button" onClick={() => setShowAnnForm(false)}><X size={19} /></button>
            </div>
            <select className="topic-select" value={annType} onChange={(e) => setAnnType(e.target.value)}>
              <option value="info">Info</option>
              <option value="success">Success</option>
              <option value="warning">Warning</option>
              <option value="danger">Danger</option>
            </select>
            <input className="topic-input" value={annTitle} onChange={(e) => setAnnTitle(e.target.value)} placeholder="Announcement title" />
            <textarea value={annContent} onChange={(e) => setAnnContent(e.target.value)} placeholder="Announcement content…" />
            <div className="modal-footer">
              <span>Visible to all tribe members</span>
              <button className="primary-button" onClick={saveAnnouncement}>{editingAnn ? 'Save changes' : 'Publish'} <ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      )}

      {/* Update log form modal */}
      {showLogForm && (
        <div className="modal-backdrop" onClick={() => setShowLogForm(false)}>
          <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">ADMIN / {editingLog ? 'EDIT' : 'NEW'} UPDATE LOG</span><h2>{editingLog ? 'Edit Log Entry' : 'Create Log Entry'}</h2></div>
              <button className="icon-button" onClick={() => setShowLogForm(false)}><X size={19} /></button>
            </div>
            <div className="form-row">
              <input className="topic-input" value={logVersion} onChange={(e) => setLogVersion(e.target.value)} placeholder="Version (e.g. v4.0.1)" />
              <select className="topic-select" value={logCategory} onChange={(e) => setLogCategory(e.target.value)}>
                <option value="feature">Feature</option>
                <option value="fix">Bug Fix</option>
                <option value="improvement">Improvement</option>
                <option value="general">General</option>
              </select>
            </div>
            <input className="topic-input" value={logTitle} onChange={(e) => setLogTitle(e.target.value)} placeholder="Log title" />
            <textarea value={logBody} onChange={(e) => setLogBody(e.target.value)} placeholder="Describe the changes…" />
            <div className="modal-footer">
              <span>Posted as {rank.label}</span>
              <button className="primary-button" onClick={saveLog}>{editingLog ? 'Save changes' : 'Create log'} <ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
