import { useEffect, useState } from 'react';
import logo from '../assets/logo/logo.png';
import {
  Activity, Bell, CarFront, ChevronRight, Clock3, Gamepad2, Heart, Home,
  MessageCircle, MoreHorizontal, PanelLeftClose, PanelLeftOpen, Plus,
  Radio, Search, Settings, ShieldCheck, Sparkles, Trophy, UserRound,
  Users, WalletCards, X, Zap, Shield, UserCog, Radio as RadioIcon, DollarSign,
} from 'lucide-react';
import { supabase, type Announcement } from './lib/supabase';
import CharactersPage from './pages/CharactersPage';
import VehiclesPage from './pages/VehiclesPage';
import ForumPage from './pages/ForumPage';
import CommunityPage from './pages/CommunityPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import TopUpPage from './pages/TopUpPage';
import ServerStatusPage from './pages/ServerStatusPage';

type NavItem = { label: string; icon: typeof Home };

type FeedPost = {
  id: number; author: string; role: string; time: string; initials: string;
  color: string; text: string; likes: number; comments: number; liked: boolean;
};

const navigation: NavItem[] = [
  { label: 'Overview', icon: Home },
  { label: 'Characters', icon: UserRound },
  { label: 'Vehicles', icon: CarFront },
  { label: 'Community', icon: Users },
  { label: 'Forum', icon: MessageCircle },
  { label: 'Server', icon: RadioIcon },
  { label: 'Top Up', icon: DollarSign },
  { label: 'Admin', icon: Shield },
  { label: 'Profile', icon: UserCog },
];

const posts: FeedPost[] = [
  { id: 1, author: 'NoxViper', role: 'Legendary Member', time: '12 min ago', initials: 'NV', color: 'pink', text: 'Finally got the Skyline tuned for the night runs. Who is taking the east highway tonight?', likes: 28, comments: 7, liked: false },
  { id: 2, author: 'Mikaela', role: 'Street Racer', time: '1 hr ago', initials: 'MI', color: 'cyan', text: 'The new update feels incredible. Big respect to the dev team for the new city lighting.', likes: 46, comments: 12, liked: true },
  { id: 3, author: 'Rex_07', role: 'Member', time: '3 hrs ago', initials: 'R7', color: 'orange', text: 'Looking for a crew to run some jobs with this weekend. Drop a message if you are active.', likes: 19, comments: 4, liked: false },
];

function App() {
  const [activeNav, setActiveNav] = useState('Overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [composerOpen, setComposerOpen] = useState(false);
  const [newPost, setNewPost] = useState('');
  const [feed, setFeed] = useState(posts);
  const [notice, setNotice] = useState('');
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('announcements').select('*').eq('is_active', true).order('created_at', { ascending: false }).limit(3);
      if (data) setAnnouncements(data as Announcement[]);
    })();
  }, []);

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(''), 2600);
  };

  const toggleLike = (id: number) => {
    setFeed((current) => current.map((post) => post.id === id
      ? { ...post, liked: !post.liked, likes: post.likes + (post.liked ? -1 : 1) }
      : post));
  };

  const publishPost = () => {
    if (!newPost.trim()) return;
    setFeed((current) => [{
      id: Date.now(), author: 'Saki', role: 'Developer', time: 'Just now', initials: 'SA', color: 'violet',
      text: newPost.trim(), likes: 0, comments: 0, liked: false,
    }, ...current]);
    setNewPost('');
    setComposerOpen(false);
    showNotice('Your post is now live in the community feed.');
  };

  const renderPage = () => {
    switch (activeNav) {
      case 'Characters': return <CharactersPage />;
      case 'Vehicles': return <VehiclesPage />;
      case 'Forum': return <ForumPage />;
      case 'Community': return <CommunityPage />;
      case 'Server': return <ServerStatusPage />;
      case 'Top Up': return <TopUpPage />;
      case 'Admin': return <AdminPage />;
      case 'Profile': return <ProfilePage />;
      default: return null;
    }
  };

  return (
    <div className="app-shell">
      <div className="ambient-glow ambient-glow-one" />
      <div className="ambient-glow ambient-glow-two" />
      {notice && <div className="toast"><Sparkles size={16} />{notice}</div>}

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : 'sidebar-collapsed'}`}>
        <div className="brand-lockup">
          <img src={logo} alt="SEA TRIBE" className="brand-logo" />
          {sidebarOpen && <div><div className="brand-name">SEA TRIBE</div><div className="brand-subtitle">ROLEPLAY NETWORK</div></div>}
        </div>
        <button className="collapse-button" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle sidebar">
          {sidebarOpen ? <PanelLeftClose size={18} /> : <PanelLeftOpen size={18} />}
        </button>

        <div className="side-label">{sidebarOpen ? 'MAIN MENU' : 'MENU'}</div>
        <nav className="primary-nav">
          {navigation.map(({ label, icon: Icon }) => (
            <button key={label} className={`nav-item ${activeNav === label ? 'active' : ''}`} onClick={() => setActiveNav(label)} title={label}>
              <Icon size={19} strokeWidth={activeNav === label ? 2.4 : 1.8} /><span>{sidebarOpen && label}</span>{sidebarOpen && activeNav === label && <ChevronRight className="nav-arrow" size={15} />}
            </button>
          ))}
        </nav>
        <div className="side-label">{sidebarOpen ? 'PERSONAL' : '•'}</div>
        <nav className="primary-nav">
          <button className="nav-item" onClick={() => showNotice('Messages are coming online soon.')}><MessageCircle size={19} /><span>{sidebarOpen && 'Messages'}</span>{sidebarOpen && <span className="unread-count">3</span>}</button>
          <button className={`nav-item ${activeNav === 'Profile' ? 'active' : ''}`} onClick={() => setActiveNav('Profile')}><Settings size={19} /><span>{sidebarOpen && 'Settings'}</span></button>
        </nav>
        <div className="sidebar-footer">
          <div className="profile-mini"><div className="avatar avatar-violet">SA</div>{sidebarOpen && <div className="profile-meta"><strong>Saki</strong><span>Developer <span className="online-dot" /></span></div>}</div>
          {sidebarOpen && <button className="icon-button" onClick={() => showNotice('Profile menu opened.')}><MoreHorizontal size={18} /></button>}
        </div>
      </aside>

      <main className={`main-content ${sidebarOpen ? '' : 'main-expanded'}`}>
        <header className="topbar">
          <div className="breadcrumb"><span>SEA TRIBE</span><ChevronRight size={15} /><strong>{activeNav.toUpperCase()}</strong></div>
          <div className="topbar-actions">
            {searchOpen && <div className="search-box"><Search size={16} /><input autoFocus placeholder="Search the network..." onKeyDown={(event) => event.key === 'Escape' && setSearchOpen(false)} /></div>}
            <button className="icon-button" onClick={() => setSearchOpen(!searchOpen)} aria-label="Search"><Search size={19} /></button>
            <button className="icon-button notification-button" onClick={() => showNotice('You are all caught up.')} aria-label="Notifications"><Bell size={19} /><span /></button>
            <button className="user-pill" onClick={() => showNotice('Profile menu opened.')}><div className="avatar avatar-violet small">SA</div><span>Saki</span><ChevronRight size={14} /></button>
          </div>
        </header>

        <div className="page-wrap">
          {activeNav === 'Overview' ? (
            <>
              <section className="welcome-row">
                <div><p className="eyebrow"><span className="pulse-dot" /> SERVER ONLINE / 24.7.2026</p><h1>Welcome back, <em>Saki</em><span className="headline-mark">✦</span></h1><p className="welcome-copy">Your command center for everything happening in SEA TRIBE.</p></div>
                <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18} />Create post</button>
              </section>

              <section className="stats-grid">
                <StatCard icon={<Users size={20} />} label="Players online" value="184" detail="+12.4%" trend="up" accent="pink" />
                <StatCard icon={<Activity size={20} />} label="Server uptime" value="99.98%" detail="This month" trend="neutral" accent="cyan" />
                <StatCard icon={<Trophy size={20} />} label="Your reputation" value="2,840" detail="Top 8%" trend="up" accent="yellow" />
                <StatCard icon={<WalletCards size={20} />} label="Tribe credits" value="12,450" detail="Top up" trend="action" accent="green" />
              </section>

              <div className="content-grid">
                <div className="feed-column">
                  <div className="section-heading"><div><h2>Community pulse</h2><p>What&apos;s happening in the tribe</p></div><button className="text-button" onClick={() => showNotice('You are viewing the latest posts.')}>Latest <ChevronRight size={15} /></button></div>
                  <div className="feed-composer" onClick={() => setComposerOpen(true)}><div className="avatar avatar-violet">SA</div><span>Share something with the tribe...</span><button className="composer-icon"><Plus size={18} /></button></div>
                  <div className="feed-list">{feed.map((post) => <PostCard key={post.id} post={post} onLike={toggleLike} onComment={() => showNotice('Comments panel opened.')} />)}</div>
                </div>
                <div className="right-column">
                  <ServerCard onCopy={() => showNotice('Server address copied.')} />
                  <AnnouncementCard announcements={announcements} onOpen={() => showNotice('All announcements opened.')} />
                  <DiscordCard onJoin={() => showNotice('Discord invitation opened.')} />
                </div>
              </div>
            </>
          ) : renderPage()}
        </div>
      </main>

      {composerOpen && <div className="modal-backdrop" onClick={() => setComposerOpen(false)}><div className="composer-modal" onClick={(event) => event.stopPropagation()}><div className="modal-heading"><div><span className="eyebrow">COMMUNITY / NEW POST</span><h2>Speak to the tribe</h2></div><button className="icon-button" onClick={() => setComposerOpen(false)}><X size={19} /></button></div><textarea value={newPost} onChange={(event) => setNewPost(event.target.value)} placeholder="What is on your mind, Saki?" autoFocus /><div className="modal-footer"><span>Visible to all tribe members</span><button className="primary-button" onClick={publishPost}>Publish post <Zap size={16} /></button></div></div></div>}
    </div>
  );
}

function StatCard({ icon, label, value, detail, trend, accent }: { icon: React.ReactNode; label: string; value: string; detail: string; trend: string; accent: string }) {
  return <div className={`stat-card accent-${accent}`}><div className="stat-icon">{icon}</div><div className="stat-info"><span>{label}</span><strong>{value}</strong><small className={trend === 'up' ? 'trend-up' : trend === 'action' ? 'trend-action' : ''}>{trend === 'up' && '↗ '}{detail}</small></div></div>;
}

function PostCard({ post, onLike, onComment }: { post: FeedPost; onLike: (id: number) => void; onComment: () => void }) {
  return <article className="post-card"><div className="post-head"><div className={`avatar avatar-${post.color}`}>{post.initials}</div><div className="post-author"><strong>{post.author} {post.author === 'NoxViper' && <ShieldCheck size={14} />}</strong><span>{post.role} <i /> {post.time}</span></div><button className="icon-button"><MoreHorizontal size={18} /></button></div><p className="post-copy">{post.text}</p><div className="post-actions"><button className={post.liked ? 'liked' : ''} onClick={() => onLike(post.id)}><Heart size={17} fill={post.liked ? 'currentColor' : 'none'} />{post.likes}</button><button onClick={onComment}><MessageCircle size={17} />{post.comments}</button><button className="share-button" onClick={() => navigator.clipboard?.writeText(post.text)}><Radio size={16} />Share</button></div></article>;
}

function ServerCard({ onCopy }: { onCopy: () => void }) {
  return <section className="side-card server-card"><div className="card-header"><div><span className="card-kicker"><span className="pulse-dot" /> LIVE STATUS</span><h3>SEA TRIBE RP</h3></div><Gamepad2 size={22} /></div><div className="server-details"><div className="server-detail"><span>SERVER IP</span><strong>play.seatribe.gg</strong></div><div className="server-detail"><span>PORT</span><strong>7777</strong></div></div><div className="player-meter"><div className="meter-label"><span>Players online</span><strong>184 <small>/ 500</small></strong></div><div className="meter-track"><div /></div></div><button className="copy-server" onClick={onCopy}>Copy server address <ChevronRight size={15} /></button></section>;
}

function AnnouncementCard({ announcements, onOpen }: { announcements: Announcement[]; onOpen: () => void }) {
  const latest = announcements[0];
  return <section className="side-card announcement-card"><div className="card-title-row"><div><span className="card-kicker">LATEST INTEL</span><h3>Announcements</h3></div><Bell size={19} /></div><div className="announcement-item"><span className="announcement-tag">{latest ? latest.type.toUpperCase() : 'UPDATE'}</span><h4>{latest ? latest.title : 'Season 04: Afterglow'}</h4><p>{latest ? latest.content : 'New districts, vehicles, and a night market are landing this weekend.'}</p><div className="announcement-meta"><Clock3 size={13} /> {latest ? new Date(latest.created_at).toLocaleDateString() : '2 hours ago'} <span>•</span> {latest ? latest.author : 'Developer'}</div></div><button className="view-all" onClick={onOpen}>View all announcements <ChevronRight size={15} /></button></section>;
}

function DiscordCard({ onJoin }: { onJoin: () => void }) {
  return <section className="discord-card"><div className="discord-symbol">◖</div><div><h3>Join the inner circle</h3><p>Chat, squad up, and never miss an update.</p></div><button onClick={onJoin}>Discord <ChevronRight size={15} /></button></section>;
}

export default App;
