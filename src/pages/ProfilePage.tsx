import { useEffect, useState } from 'react';
import {
  Camera, Lock, KeyRound, Save, Check, UserRound, AtSign,
  ShieldCheck, AlertCircle, Loader2,
} from 'lucide-react';
import { supabase, type ProfileSettings, type Character } from '../lib/supabase';

export default function ProfilePage() {
  const [profile, setProfile] = useState<ProfileSettings | null>(null);
  const [character, setCharacter] = useState<Character | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [noticeType, setNoticeType] = useState<'success' | 'error'>('success');

  // Form state
  const [avatarUrl, setAvatarUrl] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const showNotice = (m: string, type: 'success' | 'error' = 'success') => {
    setNotice(m); setNoticeType(type);
    window.setTimeout(() => setNotice(''), 3000);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const CURRENT_UCP = 1;
      const [{ data: profData }, { data: charData }] = await Promise.all([
        supabase.from('profile_settings').select('*').eq('ucp_id', CURRENT_UCP).maybeSingle(),
        supabase.from('characters').select('*').eq('ucp_id', CURRENT_UCP).order('level', { ascending: false }).limit(1).maybeSingle(),
      ]);
      if (profData) {
        const prof = profData as ProfileSettings;
        setProfile(prof);
        setAvatarUrl(prof.avatar_url);
        setDisplayName(prof.display_name);
        setBio(prof.bio);
      }
      if (charData) setCharacter(charData as Character);
      setLoading(false);
    })();
  }, []);

  const saveProfile = async () => {
    setSavingProfile(true);
    const CURRENT_UCP = 1;
    if (profile) {
      const { error } = await supabase.from('profile_settings').update({
        avatar_url: avatarUrl.trim(), display_name: displayName.trim(), bio: bio.trim(), updated_at: new Date().toISOString(),
      }).eq('ucp_id', CURRENT_UCP);
      if (error) { showNotice('Failed to save profile.', 'error'); setSavingProfile(false); return; }
    } else {
      const { error } = await supabase.from('profile_settings').insert({
        ucp_id: CURRENT_UCP, avatar_url: avatarUrl.trim(), display_name: displayName.trim(), bio: bio.trim(),
      });
      if (error) { showNotice('Failed to save profile.', 'error'); setSavingProfile(false); return; }
    }
    setSavingProfile(false);
    showNotice('Profile updated successfully.');
  };

  const changePassword = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) { showNotice('All password fields are required.', 'error'); return; }
    if (newPassword !== confirmPassword) { showNotice('New passwords do not match.', 'error'); return; }
    if (newPassword.length < 6) { showNotice('Password must be at least 6 characters.', 'error'); return; }
    setSavingPassword(true);
    // Simulate password change (in production, this would verify old password hash and update)
    await new Promise((resolve) => setTimeout(resolve, 800));
    setSavingPassword(false);
    setOldPassword(''); setNewPassword(''); setConfirmPassword('');
    showNotice('Password changed successfully.');
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => { setAvatarUrl(reader.result as string); };
    reader.readAsDataURL(file);
  };

  if (loading) return <div className="page-status">Loading profile…</div>;

  return (
    <div className="page-enter">
      {notice && (
        <div className={`toast ${noticeType === 'error' ? 'toast-error' : ''}`}>
          {noticeType === 'success' ? <Check size={16} /> : <AlertCircle size={16} />}
          {notice}
        </div>
      )}

      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> ACCOUNT SETTINGS</p>
          <h1>Profile Settings</h1>
          <p className="page-sub">Manage your identity, avatar, and security.</p>
        </div>
      </div>

      <div className="profile-layout">
        {/* Profile card */}
        <div className="profile-card-section">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="avatar-image" /> : <div className="avatar-placeholder"><UserRound size={42} /></div>}
              <label className="avatar-upload-btn">
                <Camera size={16} />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} hidden />
              </label>
            </div>
            <div className="profile-identity">
              <h2>{displayName || character?.name.replace('_', ' ') || 'Saki'}</h2>
              <p className="profile-username">
                <AtSign size={13} /> {character?.name ?? 'saki'}
                <span className="locked-badge"><Lock size={11} /> Locked</span>
              </p>
              <p className="profile-rank">
                <ShieldCheck size={13} /> Level {character?.level ?? 1} — {character?.level ?? 1 >= 10 ? 'Developer' : 'Member'}
              </p>
            </div>
          </div>

          <div className="profile-form-group">
            <label>Display Name</label>
            <input className="profile-input" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="Display name" />
          </div>

          <div className="profile-form-group">
            <label>Bio</label>
            <textarea className="profile-input" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell the tribe about yourself…" rows={3} />
          </div>

          <div className="profile-form-group">
            <label>Avatar URL</label>
            <input className="profile-input" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} placeholder="https://…" />
          </div>

          <button className="primary-button save-profile-btn" onClick={saveProfile} disabled={savingProfile}>
            {savingProfile ? <Loader2 size={16} className="spin" /> : <Save size={16} />}
            Save Profile
          </button>
        </div>

        {/* Password & security card */}
        <div className="profile-card-section">
          <div className="security-header">
            <KeyRound size={22} />
            <div>
              <h2>Security</h2>
              <p>Change your password regularly to keep your account safe.</p>
            </div>
          </div>

          <div className="profile-form-group">
            <label>Current Password</label>
            <input className="profile-input" type="password" value={oldPassword} onChange={(e) => setOldPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <div className="profile-form-group">
            <label>New Password</label>
            <input className="profile-input" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 6 characters" />
          </div>

          <div className="profile-form-group">
            <label>Confirm New Password</label>
            <input className="profile-input" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="••••••••" />
          </div>

          <button className="primary-button save-profile-btn" onClick={changePassword} disabled={savingPassword}>
            {savingPassword ? <Loader2 size={16} className="spin" /> : <KeyRound size={16} />}
            Change Password
          </button>

          <div className="security-note">
            <Lock size={14} />
            <span>Your username <strong>{character?.name ?? 'Saki_Valentine'}</strong> is locked and cannot be changed.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
