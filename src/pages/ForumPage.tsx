import { useEffect, useState } from 'react';
import { MessageCircle, Pin, Lock, Eye, ChevronRight, Plus, X, ArrowLeft } from 'lucide-react';
import { supabase, type ForumCategory, type ForumTopic, type ForumReply } from '../lib/supabase';

type TopicWithMeta = ForumTopic & { reply_count: number; category_name: string };

export default function ForumPage() {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [topics, setTopics] = useState<TopicWithMeta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [selectedTopic, setSelectedTopic] = useState<TopicWithMeta | null>(null);
  const [replies, setReplies] = useState<ForumReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [newReply, setNewReply] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [newTopicTitle, setNewTopicTitle] = useState('');
  const [newTopicContent, setNewTopicContent] = useState('');
  const [notice, setNotice] = useState('');

  const showNotice = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 2500); };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [{ data: cats }, { data: tops }] = await Promise.all([
        supabase.from('forum_categories').select('*').order('display_order'),
        supabase.from('forum_topics').select('*').order('is_pinned', { ascending: false }).order('updated_at', { ascending: false }),
      ]);
      if (cats) setCategories(cats as ForumCategory[]);
      if (tops) {
        const topsList = tops as ForumTopic[];
        const { data: repData } = await supabase.from('forum_replies').select('topic_id');
        const counts = new Map<number, number>();
        (repData as { topic_id: number }[] | null)?.forEach((r) => counts.set(r.topic_id, (counts.get(r.topic_id) ?? 0) + 1));
        const catMap = new Map<number, string>();
        (cats as ForumCategory[] | null)?.forEach((c) => catMap.set(c.id, c.name));
        setTopics(topsList.map((t) => ({
          ...t, reply_count: counts.get(t.id) ?? 0, category_name: catMap.get(t.category_id) ?? 'General',
        })));
      }
      setLoading(false);
    })();
  }, []);

  const openTopic = async (topic: TopicWithMeta) => {
    setSelectedTopic(topic);
    setRepliesLoading(true);
    const { data } = await supabase.from('forum_replies').select('*').eq('topic_id', topic.id).order('created_at');
    setReplies((data as ForumReply[]) ?? []);
    setRepliesLoading(false);
    await supabase.from('forum_topics').update({ views: topic.views + 1 }).eq('id', topic.id);
  };

  const submitReply = async () => {
    if (!selectedTopic || !newReply.trim()) return;
    const { data, error: insError } = await supabase.from('forum_replies').insert({
      topic_id: selectedTopic.id, ucp_id: selectedTopic.ucp_id, character_name: 'Saki_Valentine', content: newReply.trim(),
    }).select().single();
    if (insError) { showNotice('Could not post reply.'); return; }
    if (data) setReplies((prev) => [...prev, data as ForumReply]);
    setNewReply('');
    showNotice('Reply posted.');
  };

  const submitTopic = async () => {
    if (!newTopicTitle.trim() || !newTopicContent.trim() || !activeCategory) return;
    const { data, error: insError } = await supabase.from('forum_topics').insert({
      category_id: activeCategory, ucp_id: 1, character_name: 'Saki_Valentine',
      title: newTopicTitle.trim(), content: newTopicContent.trim(),
    }).select().single();
    if (insError || !data) { showNotice('Could not create topic.'); return; }
    const cat = categories.find((c) => c.id === activeCategory);
    const newTop: TopicWithMeta = { ...(data as ForumTopic), reply_count: 0, category_name: cat?.name ?? 'General' };
    setTopics((prev) => [newTop, ...prev]);
    setNewTopicTitle(''); setNewTopicContent(''); setComposerOpen(false);
    showNotice('Topic created.');
  };

  if (loading) return <div className="page-status">Loading forum…</div>;
  if (error) return <div className="page-status error">{error}</div>;

  if (selectedTopic) {
    return (
      <div className="page-enter">
        {notice && <div className="toast"><MessageCircle size={16} />{notice}</div>}
        <button className="back-button" onClick={() => setSelectedTopic(null)}><ArrowLeft size={16} /> Back to forum</button>
        <div className="topic-detail">
          <div className="topic-detail-head">
            <div>
              <p className="eyebrow">{selectedTopic.category_name.toUpperCase()}</p>
              <h1>{selectedTopic.title}</h1>
              <p className="topic-meta">By {selectedTopic.character_name?.replace('_', ' ') ?? 'Unknown'} · {new Date(selectedTopic.created_at).toLocaleDateString()} · <Eye size={12} /> {selectedTopic.views} views</p>
            </div>
            <div className="topic-badges">
              {selectedTopic.is_pinned && <span className="tag tag-yellow"><Pin size={12} /> Pinned</span>}
              {selectedTopic.is_locked && <span className="tag tag-red"><Lock size={12} /> Locked</span>}
            </div>
          </div>
          <p className="topic-content">{selectedTopic.content}</p>

          <div className="replies-section">
            <h3>{replies.length} Replies</h3>
            {repliesLoading ? <p className="page-status">Loading replies…</p> : replies.length === 0 ? <p className="page-status">No replies yet. Be the first.</p> : (
              <div className="reply-list">
                {replies.map((reply) => (
                  <div key={reply.id} className="reply-item">
                    <div className="avatar avatar-violet small">{(reply.character_name ?? '??').slice(0, 2).toUpperCase()}</div>
                    <div>
                      <strong>{reply.character_name?.replace('_', ' ') ?? 'Unknown'}</strong>
                      <span className="reply-time">{new Date(reply.created_at).toLocaleString()}</span>
                      <p>{reply.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            {!selectedTopic.is_locked && (
              <div className="reply-composer">
                <textarea value={newReply} onChange={(e) => setNewReply(e.target.value)} placeholder="Write a reply…" />
                <button className="primary-button" onClick={submitReply}>Post reply <ChevronRight size={15} /></button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  const filtered = activeCategory ? topics.filter((t) => t.category_id === activeCategory) : topics;

  return (
    <div className="page-enter">
      {notice && <div className="toast"><MessageCircle size={16} />{notice}</div>}
      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> COMMUNITY BOARD</p>
          <h1>Forum</h1>
          <p className="page-sub">Discussions, guides, and announcements from the tribe.</p>
        </div>
        <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={17} /> New topic</button>
      </div>

      <div className="forum-layout">
        <aside className="forum-cats">
          <button className={`cat-item ${activeCategory === null ? 'active' : ''}`} onClick={() => setActiveCategory(null)}>All topics</button>
          {categories.map((cat) => (
            <button key={cat.id} className={`cat-item ${activeCategory === cat.id ? 'active' : ''}`} onClick={() => setActiveCategory(cat.id)}>
              {cat.name}
            </button>
          ))}
        </aside>
        <div className="forum-topics">
          {filtered.length === 0 ? <div className="page-status">No topics in this category yet.</div> : filtered.map((topic) => (
            <button key={topic.id} className="topic-row" onClick={() => openTopic(topic)}>
              <div className="topic-row-main">
                <div className="topic-row-title">
                  {topic.is_pinned && <Pin size={14} className="pin-icon" />}
                  {topic.is_locked && <Lock size={14} className="lock-icon" />}
                  <h3>{topic.title}</h3>
                </div>
                <p className="topic-row-meta">{topic.character_name?.replace('_', ' ') ?? 'Unknown'} · {topic.category_name}</p>
              </div>
              <div className="topic-row-stats">
                <span><Eye size={13} /> {topic.views}</span>
                <span><MessageCircle size={13} /> {topic.reply_count}</span>
                <ChevronRight size={15} />
              </div>
            </button>
          ))}
        </div>
      </div>

      {composerOpen && (
        <div className="modal-backdrop" onClick={() => setComposerOpen(false)}>
          <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">FORUM / NEW TOPIC</span><h2>Start a discussion</h2></div>
              <button className="icon-button" onClick={() => setComposerOpen(false)}><X size={19} /></button>
            </div>
            <select className="topic-select" value={activeCategory ?? ''} onChange={(e) => setActiveCategory(Number(e.target.value))}>
              <option value="" disabled>Select a category…</option>
              {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}
            </select>
            <input className="topic-input" value={newTopicTitle} onChange={(e) => setNewTopicTitle(e.target.value)} placeholder="Topic title" />
            <textarea value={newTopicContent} onChange={(e) => setNewTopicContent(e.target.value)} placeholder="Write your topic…" />
            <div className="modal-footer">
              <span>Posted as Saki Valentine</span>
              <button className="primary-button" onClick={submitTopic}>Publish topic <ChevronRight size={15} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
