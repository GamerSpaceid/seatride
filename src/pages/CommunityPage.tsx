import { useEffect, useState, useCallback } from 'react';
import {
  Heart, MessageCircle, Share2, Plus, X, Image as ImageIcon,
  Send, MoreHorizontal, ShieldCheck, Loader2,
} from 'lucide-react';
import { supabase, type SocialPost, type SocialComment } from '../lib/supabase';

type PostWithLiked = SocialPost & { liked: boolean };

export default function CommunityPage() {
  const [posts, setPosts] = useState<PostWithLiked[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [composerOpen, setComposerOpen] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newMediaUrl, setNewMediaUrl] = useState('');
  const [newMediaType, setNewMediaType] = useState<'image' | 'video'>('image');
  const [notice, setNotice] = useState('');
  const [expandedComments, setExpandedComments] = useState<Set<number>>(new Set());
  const [commentMap, setCommentMap] = useState<Record<number, SocialComment[]>>({});
  const [commentText, setCommentText] = useState<Record<number, string>>({});
  const [posting, setPosting] = useState(false);

  const CURRENT_USER = 'Saki_Valentine';
  const CURRENT_UCP = 1;

  const showNotice = (m: string) => { setNotice(m); window.setTimeout(() => setNotice(''), 2500); };

  const loadPosts = useCallback(async () => {
    setLoading(true);
    const { data, error: fetchError } = await supabase.from('social_posts').select('*').order('created_at', { ascending: false });
    if (fetchError) { setError(fetchError.message); setLoading(false); return; }
    const postList = (data as SocialPost[]) ?? [];
    // Check which posts the current user has liked
    const { data: likesData } = await supabase.from('social_likes').select('post_id').eq('character_name', CURRENT_USER);
    const likedSet = new Set((likesData as { post_id: number }[] | null)?.map((l) => l.post_id) ?? []);
    setPosts(postList.map((p) => ({ ...p, liked: likedSet.has(p.id) })));
    setLoading(false);
  }, []);

  useEffect(() => { loadPosts(); }, [loadPosts]);

  const toggleLike = async (post: PostWithLiked) => {
    if (post.liked) {
      await supabase.from('social_likes').delete().eq('post_id', post.id).eq('character_name', CURRENT_USER);
      await supabase.from('social_posts').update({ likes_count: Math.max(0, post.likes_count - 1) }).eq('id', post.id);
    } else {
      await supabase.from('social_likes').insert({ post_id: post.id, character_name: CURRENT_USER });
      await supabase.from('social_posts').update({ likes_count: post.likes_count + 1 }).eq('id', post.id);
    }
    loadPosts();
  };

  const sharePost = async (post: PostWithLiked) => {
    await supabase.from('social_posts').update({ shares_count: post.shares_count + 1 }).eq('id', post.id);
    try { await navigator.clipboard?.writeText(post.content); } catch { /* ignore */ }
    showNotice('Post link copied to clipboard.');
    loadPosts();
  };

  const publishPost = async () => {
    if (!newContent.trim()) return;
    setPosting(true);
    const { error: insError } = await supabase.from('social_posts').insert({
      ucp_id: CURRENT_UCP, character_name: CURRENT_USER, content: newContent.trim(),
      media_url: newMediaUrl.trim() || null, media_type: newMediaType,
    });
    setPosting(false);
    if (insError) { showNotice('Failed to publish post.'); return; }
    setNewContent(''); setNewMediaUrl(''); setNewMediaType('image'); setComposerOpen(false);
    showNotice('Your post is live.');
    loadPosts();
  };

  const toggleComments = async (postId: number) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(postId)) { next.delete(postId); } else { next.add(postId); }
      return next;
    });
    if (!commentMap[postId]) {
      const { data } = await supabase.from('social_comments').select('*').eq('post_id', postId).order('created_at');
      setCommentMap((prev) => ({ ...prev, [postId]: (data as SocialComment[]) ?? [] }));
    }
  };

  const submitComment = async (postId: number) => {
    const text = (commentText[postId] ?? '').trim();
    if (!text) return;
    const { data, error: insError } = await supabase.from('social_comments').insert({
      post_id: postId, ucp_id: CURRENT_UCP, character_name: CURRENT_USER, content: text,
    }).select().single();
    if (insError || !data) { showNotice('Failed to post comment.'); return; }
    setCommentMap((prev) => ({ ...prev, [postId]: [...(prev[postId] ?? []), data as SocialComment] }));
    setCommentText((prev) => ({ ...prev, [postId]: '' }));
    // Update comment count
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, comments_count: p.comments_count + 1 } : p));
  };

  const formatTime = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  if (loading) return <div className="page-status">Loading community feed…</div>;
  if (error) return <div className="page-status error">Unable to load feed: {error}</div>;

  return (
    <div className="page-enter">
      {notice && <div className="toast"><ShieldCheck size={16} />{notice}</div>}

      <div className="page-header-row">
        <div>
          <p className="eyebrow"><span className="pulse-dot" /> COMMUNITY FEED</p>
          <h1>Community</h1>
          <p className="page-sub">Share your moments, squad up, and stay connected with the tribe.</p>
        </div>
        <button className="primary-button" onClick={() => setComposerOpen(true)}><Plus size={18} /> New Post</button>
      </div>

      <div className="community-feed">
        {posts.length === 0 ? (
          <div className="page-status">No posts yet. Be the first to share something.</div>
        ) : posts.map((post) => (
          <article key={post.id} className="social-post-card">
            <div className="social-post-head">
              <div className="avatar avatar-violet">{(post.character_name ?? '??').slice(0, 2).toUpperCase()}</div>
              <div className="social-post-author">
                <strong>{post.character_name?.replace('_', ' ') ?? 'Unknown'}</strong>
                <span>{formatTime(post.created_at)}</span>
              </div>
              <button className="icon-button"><MoreHorizontal size={18} /></button>
            </div>

            <p className="social-post-content">{post.content}</p>

            {post.media_url && (
              <div className="social-post-media">
                {post.media_type === 'video' ? (
                  <video src={post.media_url} controls className="post-media-display" />
                ) : (
                  <img src={post.media_url} alt="" className="post-media-display" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                )}
              </div>
            )}

            <div className="social-post-actions">
              <button className={post.liked ? 'liked' : ''} onClick={() => toggleLike(post)}>
                <Heart size={17} fill={post.liked ? 'currentColor' : 'none'} />
                <span>{post.likes_count}</span>
              </button>
              <button onClick={() => toggleComments(post.id)}>
                <MessageCircle size={17} />
                <span>{post.comments_count}</span>
              </button>
              <button className="share-btn" onClick={() => sharePost(post)}>
                <Share2 size={16} />
                <span>{post.shares_count}</span>
              </button>
            </div>

            {expandedComments.has(post.id) && (
              <div className="social-comments-section">
                <div className="comment-list">
                  {(commentMap[post.id] ?? []).length === 0 ? (
                    <p className="no-comments">No comments yet.</p>
                  ) : (commentMap[post.id] ?? []).map((comment) => (
                    <div key={comment.id} className="comment-item">
                      <div className="avatar avatar-cyan small">{(comment.character_name ?? '??').slice(0, 2).toUpperCase()}</div>
                      <div className="comment-body">
                        <strong>{comment.character_name?.replace('_', ' ') ?? 'Unknown'}</strong>
                        <span className="comment-time">{formatTime(comment.created_at)}</span>
                        <p>{comment.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="comment-composer">
                  <input
                    type="text"
                    placeholder="Write a comment…"
                    value={commentText[post.id] ?? ''}
                    onChange={(e) => setCommentText((prev) => ({ ...prev, [post.id]: e.target.value }))}
                    onKeyDown={(e) => e.key === 'Enter' && submitComment(post.id)}
                  />
                  <button className="comment-send" onClick={() => submitComment(post.id)}><Send size={16} /></button>
                </div>
              </div>
            )}
          </article>
        ))}
      </div>

      {composerOpen && (
        <div className="modal-backdrop" onClick={() => setComposerOpen(false)}>
          <div className="composer-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-heading">
              <div><span className="eyebrow">COMMUNITY / NEW POST</span><h2>Share with the tribe</h2></div>
              <button className="icon-button" onClick={() => setComposerOpen(false)}><X size={19} /></button>
            </div>
            <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="What is happening in the city?" autoFocus />
            <div className="media-composer-row">
              <div className="media-type-toggle">
                <button className={newMediaType === 'image' ? 'active' : ''} onClick={() => setNewMediaType('image')}><ImageIcon size={15} /> Image</button>
                <button className={newMediaType === 'video' ? 'active' : ''} onClick={() => setNewMediaType('video')}><ImageIcon size={15} /> Video</button>
              </div>
              <input className="topic-input media-url-input" value={newMediaUrl} onChange={(e) => setNewMediaUrl(e.target.value)} placeholder="Media URL (optional)…" />
            </div>
            <div className="modal-footer">
              <span>Posted as {CURRENT_USER.replace('_', ' ')}</span>
              <button className="primary-button" onClick={publishPost} disabled={posting}>
                {posting ? <Loader2 size={16} className="spin" /> : <Plus size={16} />}
                Publish post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
