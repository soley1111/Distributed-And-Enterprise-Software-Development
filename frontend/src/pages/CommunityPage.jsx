import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";
import "../styles/CommunityPage.css";

function CommunityPage() {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showCreateEventForm, setShowCreateEventForm] = useState(false);
  const [members, setMembers] = useState([]);
  const [newEvent, setNewEvent] = useState({
    title: '',
    description: '',
    date: '',
    time: '',
    event_type: 'in_person',
    max_capacity: '',
    required_materials: ''
  });

  useEffect(() => {
    fetchCommunityDetails();
  }, [slug]);

  const fetchCommunityDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/api/communities/slug/${slug}/`);
      setCommunity(res.data);
      const postsRes = await api.get(`/api/communities/slug/${slug}/posts/`);
      setPosts(postsRes.data);
      fetchCommunityMembers(res.data.id);
    } catch (err) {
      console.error("Error fetching community:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCommunityMembers = async (communityId) => {
    try {
      const res = await api.get(`/api/communities/${communityId}/members/`);
      setMembers(res.data);
    } catch (err) {
      console.error("Error fetching members:", err);
    }
  };

  const promoteToModerator = async (membershipId) => {
    try {
      await api.patch(`/api/memberships/${membershipId}/`, { role: 'moderator' });
      fetchCommunityMembers(community.id);
    } catch (err) {
      console.error("Failed to promote member:", err);
      alert("Failed to promote member.");
    }
  };

  const handleCreatePost = (postData) => {
    api.post("/api/notes/", postData)
      .then(res => {
        setPosts(prev => [res.data, ...prev]);
        setShowPostForm(false);
      })
      .catch(err => {
        console.error("Post creation failed:", err);
        alert("Failed to create post.");
      });
  };

  const handleDeletePost = (postId) => {
    if (!window.confirm("Delete this post?")) return;
    api.delete(`/api/notes/delete/${postId}/`)
      .then(() => setPosts(prev => prev.filter(p => p.id !== postId)))
      .catch(err => console.error(err));
  };

  const handleCreateEvent = (e) => {
    e.preventDefault();
    if (!newEvent.title || !newEvent.description || !newEvent.date || !newEvent.time) {
      alert("All fields are required.");
      return;
    }

    const payload = {
      ...newEvent,
      community_id: community.id,
      max_capacity: newEvent.max_capacity || null,
      required_materials: newEvent.required_materials || ''
    };

    api.post('/api/events/', payload)
      .then(() => {
        alert("Event created successfully!");
        setNewEvent({
          title: '',
          description: '',
          date: '',
          time: '',
          event_type: 'in_person',
          max_capacity: '',
          required_materials: ''
        });
        setShowCreateEventForm(false);
      })
      .catch((err) => {
        console.error("Error creating event:", err.response?.data || err);
        alert("Failed to create event.");
      });
  };

  if (loading) return <p>Loading...</p>;
  if (!community) return <p>Community not found</p>;

  return (
    <div className="community-page-container">
      <Navbar />
      <div className="community-header">
        <h1>{community.name}</h1>
        <p className="community-description">{community.description}</p>
        <p><strong>Members:</strong> {community.member_count}</p>
      </div>

      {community.tags?.length > 0 && (
        <div className="community-tags">
          <strong>Tags:</strong>
          {community.tags.map((tag, index) => (
            <span key={index} className="tag-pill">#{tag}</span>
          ))}
        </div>
      )}

      {community.is_member && (
        <div className="post-actions">
          <button className="create-post-btn" onClick={() => setShowPostForm(true)}>+ New Post</button>
          {(community.user_role === 'moderator' || community.user_role === 'admin' || community.is_global_admin) && (
            <button className="create-post-btn create-event-btn" onClick={() => setShowCreateEventForm(prev => !prev)}>
              {showCreateEventForm ? 'Cancel Event' : '+ Create Event'}
            </button>
          )}
        </div>
      )}

      {showPostForm && (
        <PostForm
          onSubmit={handleCreatePost}
          onCancel={() => setShowPostForm(false)}
          categories={["Academic", "Social", "Sports", "Clubs"]}
          defaultCommunity={community.slug}
        />
      )}

      {(community.user_role === 'admin' || community.is_global_admin) && (
        <div className="member-list">
          <h3>Community Members</h3>
          {members.length === 0 ? (
            <p>No members yet.</p>
          ) : (
            members.map(member => (
              <div key={member.id} className="member-row">
                <span>{member.user} — <strong>{member.role}</strong></span>
                {member.role !== 'moderator' && (
                  <button className="promote-btn" onClick={() => promoteToModerator(member.id)}>Make Moderator</button>
                )}
              </div>
            ))
          )}
        </div>
      )}

      <h2 className="feed-heading">Community Feed</h2>
      {posts.length === 0 ? (
        <p>No posts yet.</p>
      ) : (
        posts.map(post => (
          <div key={post.id} className="post-card">
            <h4>{post.title}</h4>
            <p>{post.content}</p>
            <div className="post-meta">
              <span>By {post.author}</span>
              <span>{new Date(post.created_at).toLocaleString()}</span>
            </div>
            {(community.user_role === 'admin' || community.is_global_admin || community.user_role === 'moderator') && (
              <button className="delete-post-btn" onClick={() => handleDeletePost(post.id)}>Delete</button>
            )}
          </div>
        ))
      )}

      {showCreateEventForm && (
        <form onSubmit={handleCreateEvent} className="event-form">
          <h3>Create Event</h3>
          <input type="text" placeholder="Title" value={newEvent.title} onChange={e => setNewEvent({ ...newEvent, title: e.target.value })} required />
          <textarea placeholder="Description" value={newEvent.description} onChange={e => setNewEvent({ ...newEvent, description: e.target.value })} required />
          <input type="date" value={newEvent.date} onChange={e => setNewEvent({ ...newEvent, date: e.target.value })} required />
          <input type="time" value={newEvent.time} onChange={e => setNewEvent({ ...newEvent, time: e.target.value })} required />
          <select value={newEvent.event_type} onChange={e => setNewEvent({ ...newEvent, event_type: e.target.value })}>
            <option value="in_person">In-Person</option>
            <option value="virtual">Virtual</option>
          </select>
          <input type="number" placeholder="Max Capacity" value={newEvent.max_capacity} onChange={e => setNewEvent({ ...newEvent, max_capacity: e.target.value })} min="1" />
          <textarea placeholder="Required Materials" value={newEvent.required_materials} onChange={e => setNewEvent({ ...newEvent, required_materials: e.target.value })} />
          <button type="submit" className="create-post-btn">Create Event</button>
        </form>
      )}
    </div>
  );
}

export default CommunityPage;