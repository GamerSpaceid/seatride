import { useEffect, useState } from 'react';
import { Heart, ShieldCheck, ShieldAlert, MapPin, Wallet, PiggyBank, Activity, ChevronRight } from 'lucide-react';
import { supabase, type Character } from '../lib/supabase';

const skinNames: Record<number, string> = {
  2: 'Cesar Vilariño',
  7: 'Wu Zi Mu',
  29: 'Officer Pulaski',
  141: 'Kate',
};

function skinPreview(skin: number) {
  return skinNames[skin] ?? `Skin #${skin}`;
}

export default function CharactersPage() {
  const [characters, setCharacters] = useState<Character[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<Character | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('characters')
        .select('*')
        .order('level', { ascending: false });
      if (fetchError) {
        setError(fetchError.message);
      } else if (data) {
        setCharacters(data as Character[]);
      }
      setLoading(false);
    })();
  }, []);

  if (loading) return <div className="page-status">Loading characters…</div>;
  if (error) return <div className="page-status error">Unable to load characters: {error}</div>;
  if (characters.length === 0) return <div className="page-status">No characters found yet.</div>;

  return (
    <div className="page-enter">
      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> CITY ROSTER</p>
          <h1>Characters</h1>
          <p className="page-sub">Every player in the SEA TRIBE universe, ranked by level.</p>
        </div>
      </div>

      <div className="card-grid">
        {characters.map((character) => (
          <button key={character.id} className="char-card" onClick={() => setSelected(character)}>
            <div className={`char-banner ${character.is_online ? 'online' : 'offline'}`}>
              <div className="char-skin">{skinPreview(character.skin)}</div>
              <span className="char-status-pill">{character.is_online ? 'ONLINE' : 'OFFLINE'}</span>
            </div>
            <div className="char-body">
              <div className="char-name-row">
                <h3>{character.name.replace('_', ' ')}</h3>
                {character.is_banned ? <ShieldAlert size={16} className="ban-icon" /> : <ShieldCheck size={16} className="verified-icon" />}
              </div>
              <p className="char-role">Level {character.level} · {character.gender ? 'Female' : 'Male'} · {character.age} yrs</p>
              <div className="char-stats">
                <span><Wallet size={13} /> ${character.money.toLocaleString()}</span>
                <span><PiggyBank size={13} /> ${character.bank.toLocaleString()}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
            <div className={`detail-banner ${selected.is_online ? 'online' : 'offline'}`}>
              <div className="detail-skin-circle">{skinPreview(selected.skin)}</div>
              <button className="icon-button close-detail" onClick={() => setSelected(null)}>✕</button>
            </div>
            <div className="detail-content">
              <p className="eyebrow">CHARACTER #{selected.id}</p>
              <h2>{selected.name.replace('_', ' ')}</h2>
              <div className="detail-tags">
                <span className="tag tag-pink">Level {selected.level}</span>
                <span className="tag tag-cyan">{selected.gender ? 'Female' : 'Male'}</span>
                <span className="tag tag-yellow">{selected.age} years</span>
                {selected.is_banned && <span className="tag tag-red">Banned</span>}
              </div>
              <div className="detail-grid">
                <DetailStat icon={<Wallet size={16} />} label="Cash" value={`$${selected.money.toLocaleString()}`} />
                <DetailStat icon={<PiggyBank size={16} />} label="Bank" value={`$${selected.bank.toLocaleString()}`} />
                <DetailStat icon={<Heart size={16} />} label="Health" value={`${selected.health}%`} />
                <DetailStat icon={<ShieldCheck size={16} />} label="Armor" value={`${selected.armor}%`} />
                <DetailStat icon={<Activity size={16} />} label="Status" value={selected.is_online ? 'Online' : 'Offline'} />
                <DetailStat icon={<MapPin size={16} />} label="Skin" value={skinPreview(selected.skin)} />
              </div>
              {selected.is_banned && selected.ban_reason && (
                <div className="ban-notice"><ShieldAlert size={16} /> {selected.ban_reason}</div>
              )}
              <div className="detail-footer">
                <span>Created {new Date(selected.created_at).toLocaleDateString()}</span>
                <button className="primary-button" onClick={() => setSelected(null)}>Close <ChevronRight size={15} /></button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DetailStat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="detail-stat">
      <span className="detail-icon">{icon}</span>
      <div><small>{label}</small><strong>{value}</strong></div>
    </div>
  );
}
