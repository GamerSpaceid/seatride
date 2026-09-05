import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Activity, Users, Signal, Wifi, Clock, Zap, Gamepad2,
  Globe, Server, RefreshCw, Copy, Check, AlertCircle, Loader2,
} from 'lucide-react';
import { supabase, type ServerStatus, type Character } from '../lib/supabase';

const SERVER_IP = '127.0.0.1';
const SERVER_PORT = 7777;
const REFRESH_INTERVAL = 15000;

export default function ServerStatusPage() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [onlinePlayers, setOnlinePlayers] = useState<Character[]>([]);
  const [copied, setCopied] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const intervalRef = useRef<number | undefined>(undefined);

  const fetchStatus = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const functionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/server-status?ip=${SERVER_IP}&port=${SERVER_PORT}`;
      const response = await fetch(functionUrl, {
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json() as ServerStatus;
      setStatus(data);
      setError('');
      setLastUpdated(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch server status');
      setStatus({
        online: false,
        hostname: 'SEA TRIBE RP',
        gamemode: 'Roleplay',
        language: 'English',
        players: 0,
        maxPlayers: 500,
        ping: 0,
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const fetchOnlinePlayers = useCallback(async () => {
    const { data } = await supabase.from('characters').select('*').eq('is_online', true).order('level', { ascending: false });
    if (data) setOnlinePlayers(data as Character[]);
  }, []);

  useEffect(() => {
    fetchStatus();
    fetchOnlinePlayers();
    intervalRef.current = window.setInterval(() => {
      fetchStatus();
      fetchOnlinePlayers();
    }, REFRESH_INTERVAL);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [fetchStatus, fetchOnlinePlayers]);

  const copyAddress = () => {
    navigator.clipboard?.writeText(`${SERVER_IP}:${SERVER_PORT}`);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const playerPercent = status ? Math.round((status.players / status.maxPlayers) * 100) : 0;

  if (loading) return <div className="page-status"><Loader2 size={20} className="spin" /> Connecting to server…</div>;

  return (
    <div className="page-enter">
      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> LIVE SERVER STATUS</p>
          <h1>Server Status</h1>
          <p className="page-sub">Real-time data from the SEA TRIBE SA-MP server.</p>
        </div>
        <button className="refresh-btn" onClick={() => fetchStatus(true)} disabled={refreshing}>
          {refreshing ? <Loader2 size={16} className="spin" /> : <RefreshCw size={16} />}
          <span>Refresh</span>
        </button>
      </div>

      {/* Main status card */}
      <div className={`server-status-hero ${status?.online ? 'online' : 'offline'}`}>
        <div className="status-hero-left">
          <div className="status-indicator-large">
            <span className={`status-dot-large ${status?.online ? 'online' : 'offline'}`} />
            <span className="status-label">{status?.online ? 'ONLINE' : 'OFFLINE'}</span>
          </div>
          <div className="status-hero-info">
            <h2>{status?.hostname || 'SEA TRIBE RP'}</h2>
            <p>{status?.gamemode || 'Roleplay'} · {status?.language || 'English'}</p>
            <div className="server-address-row">
              <code>{SERVER_IP}:{SERVER_PORT}</code>
              <button className="copy-address-btn" onClick={copyAddress}>
                {copied ? <Check size={14} /> : <Copy size={14} />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>
        </div>
        <div className="status-hero-right">
          <div className="hero-stat">
            <Users size={24} />
            <strong>{status?.players ?? 0}</strong>
            <small>/ {status?.maxPlayers ?? 500}</small>
          </div>
          <div className="hero-stat">
            <Zap size={24} />
            <strong>{status?.ping ?? 0}</strong>
            <small>ms ping</small>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div className="server-stats-grid">
        <div className="server-stat-tile">
          <Signal size={20} />
          <div><small>Status</small><strong className={status?.online ? 'text-green' : 'text-red'}>{status?.online ? 'Online' : 'Offline'}</strong></div>
        </div>
        <div className="server-stat-tile">
          <Users size={20} />
          <div><small>Players</small><strong>{status?.players ?? 0} / {status?.maxPlayers ?? 500}</strong></div>
        </div>
        <div className="server-stat-tile">
          <Activity size={20} />
          <div><small>Capacity</small><strong>{playerPercent}%</strong></div>
        </div>
        <div className="server-stat-tile">
          <Wifi size={20} />
          <div><small>Ping</small><strong>{status?.ping ?? 0} ms</strong></div>
        </div>
        <div className="server-stat-tile">
          <Gamepad2 size={20} />
          <div><small>Game Mode</small><strong>{status?.gamemode || 'Roleplay'}</strong></div>
        </div>
        <div className="server-stat-tile">
          <Globe size={20} />
          <div><small>Language</small><strong>{status?.language || 'English'}</strong></div>
        </div>
      </div>

      {/* Player meter */}
      <div className="player-meter-card">
        <div className="meter-card-head">
          <h3>Player Capacity</h3>
          <span>{status?.players ?? 0} / {status?.maxPlayers ?? 500} players</span>
        </div>
        <div className="meter-track-large">
          <div style={{ width: `${playerPercent}%` }} />
        </div>
        <div className="meter-labels">
          <span>0</span>
          <span>{status?.maxPlayers ?? 500}</span>
        </div>
      </div>

      {/* Online players list */}
      <div className="online-players-section">
        <div className="section-heading">
          <div><h2>Players Online</h2><p>{onlinePlayers.length} players currently in the city</p></div>
        </div>
        {onlinePlayers.length === 0 ? (
          <div className="page-status">
            <AlertCircle size={20} />
            No players currently online. The server may be starting up.
          </div>
        ) : (
          <div className="online-players-list">
            {onlinePlayers.map((char) => (
              <div key={char.id} className="online-player-row">
                <div className="online-player-avatar">{char.name.slice(0, 2).toUpperCase()}</div>
                <div className="online-player-info">
                  <strong>{char.name.replace('_', ' ')}</strong>
                  <span>Level {char.level}</span>
                </div>
                <div className="online-player-stats">
                  <span>${char.money.toLocaleString()}</span>
                </div>
                <span className="online-dot-large" />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Connection info */}
      <div className="connection-info-section">
        <div className="conn-info-card">
          <Server size={20} />
          <div>
            <h3>How to Connect</h3>
            <p>1. Open SA-MP client<br />2. Add server: <code>{SERVER_IP}:{SERVER_PORT}</code><br />3. Click connect and enjoy!</p>
          </div>
        </div>
        {error && (
          <div className="conn-info-card error-card">
            <AlertCircle size={20} />
            <div>
              <h3>Connection Notice</h3>
              <p>Live query returned: {error}. Showing cached data. The server may be offline or behind a firewall.</p>
            </div>
          </div>
        )}
        {lastUpdated && (
          <div className="last-updated">
            <Clock size={13} /> Last updated: {lastUpdated.toLocaleTimeString()} · Auto-refresh every {REFRESH_INTERVAL / 1000}s
          </div>
        )}
      </div>
    </div>
  );
}
