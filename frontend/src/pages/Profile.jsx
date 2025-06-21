import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api";
import "../styles/Profile.css";
import Navbar from "../components/Navbar";
import Note from "../components/Note";
import CommunityCard from "../components/CommunityCard";

function Profile() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    university_email: "",
    address: "",
    dob: "",
    course: "",
    interests: "",
    bio: "",
    achievements: ""
  });
  const [userCommunities, setUserCommunities] = useState([]);
  const [joinedCommunities, setJoinedCommunities] = useState([]);
  const [userPosts, setUserPosts] = useState([]);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicPreview, setProfilePicPreview] = useState(null);
  const [activeTab, setActiveTab] = useState("posts");

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch current user data first
        let currentUsername = "";
        try {
          const currentUserRes = await api.get("/api/profile/");
          currentUsername = currentUserRes.data.username;
          setIsCurrentUser(!username || currentUsername === username);
        } catch (authError) {
          setIsCurrentUser(false);
        }

        const endpoint = username ? `/api/profiles/${username}/` : "/api/profile/";
        const profileRes = await api.get(endpoint);
        setProfile(profileRes.data);
        setProfilePicPreview(profileRes.data.profile_pic || null);
        setFormData({
          university_email: profileRes.data.university_email || "",
          address: profileRes.data.address || "",
          dob: profileRes.data.dob || "",
          course: profileRes.data.course || "",
          interests: profileRes.data.interests || "",
          bio: profileRes.data.bio || "",
          achievements: ""
        });

        const targetUsername = username || profileRes.data.username;

        // Fetch user's created communities if this is the current user
        if (!username || currentUsername === username) {
          const createdRes = await api.get(`/api/communities/?created_by=${targetUsername}`);
          setUserCommunities(createdRes.data);
        }

        // Fetch ALL joined communities for the profile being viewed
        const joinedRes = await api.get(`/api/communities/?membership=joined&user=${targetUsername}`);
        setJoinedCommunities(joinedRes.data);

        // Fetch user's posts - ALWAYS for the target user
        const postsRes = await api.get(`/api/notes/?author=${targetUsername}`);
        setUserPosts(postsRes.data);

        if (isCurrentUser) {
          const requestsRes = await api.get("/api/friend-requests/");
          setFriendRequests(requestsRes.data);
        }

        // Fetch friends, corrected to show the target user's friends.
        const friendsRes = await api.get(`/api/friends/?user=${targetUsername}`);
        setFriends(friendsRes.data);

      } catch (err) {
        setError(err.response?.data?.detail || err.message || "Error loading profile");
        if (err.response?.status === 404) {
          navigate("/profile");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [username, navigate, isCurrentUser]);

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      setProfilePicPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveProfilePic = () => {
    setProfilePic(null);
    setProfilePicPreview(null);
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const formDataToSend = new FormData();

      // Append all form data
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined) {
          formDataToSend.append(key, formData[key]);
        }
      });

      // Only append profile pic if it exists (now optional)
      if (profilePic) {
        formDataToSend.append('profile_pic', profilePic);
      }

      const config = {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      };

      await api.patch("/api/profile/", formDataToSend, config);
      setIsEditing(false);
      const res = await api.get("/api/profile/");
      setProfile(res.data);
      setProfilePicPreview(res.data.profile_pic || null);
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Error updating profile");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    try {
      await api.delete(`/api/notes/delete/${postId}/`);
      setUserPosts((prev) => prev.filter((post) => post.id !== postId));
      alert("Post deleted successfully");
    } catch (err) {
      console.error("Error deleting post:", err);
      alert("Failed to delete post");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleRespondToRequest = async (id, action) => {
    try {
      await api.patch(`/api/friend-requests/${id}/`, { action });
      setFriendRequests((prev) => prev.filter((req) => req.id !== id));
      if (action === "accept") {
        const friendsRes = await api.get(`/api/friends/?user=${username || profile.username}`);
        setFriends(friendsRes.data);
      }
    } catch (err) {
      console.error("Error responding to friend request:", err);
    }
  };

  const handleRemoveFriend = async (friendId) => {
    if (!window.confirm("Are you sure you want to remove this friend?")) return;
    try {
      await api.delete(`/api/friends/${friendId}/remove/`);
      setFriends((prev) => prev.filter((friend) => friend.id !== friendId));
      alert("Friend removed successfully.");
    } catch (err) {
      console.error("Error removing friend:", err);
      alert("Failed to remove friend.");
    }
  };

  if (loading) return <div className="loading-spinner">Loading...</div>;
  if (error) return <div className="error-message">Error: {error}</div>;
  if (!profile) return <div className="loading-spinner">Loading...</div>;

  const isProfileIncomplete = !profile.university_email && !profile.address &&
    !profile.dob && !profile.course && !profile.interests;

  return (
    <div className="main-content">
      <Navbar />
      <div className="profile-container">
        {/* Profile Header */}
        <div className="profile-header-container">
          <div className="profile-header">
            <div className="profile-pic-container">
              {profilePicPreview ? (
                <img
                  src={profilePicPreview}
                  alt="Profile"
                  className="profile-pic"
                />
              ) : (
                <div className="profile-pic-placeholder">
                  {profile?.username?.charAt(0).toUpperCase()}
                </div>
              )}
              {isEditing && (
                <div className="profile-pic-actions">
                  <label className="upload-btn">
                    {profilePicPreview ? "Change Photo" : "Add Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfilePicChange}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {profilePicPreview && (
                    <button
                      type="button"
                      className="remove-btn"
                      onClick={handleRemoveProfilePic}
                    >
                      Remove
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="profile-info-header">
              <div className="profile-name-section">
                <h1>{profile?.username}</h1>
                {isCurrentUser && (
                  <button
                    onClick={() => setIsEditing(!isEditing)}
                    className="edit-profile-btn"
                  >
                    {isEditing ? "Cancel" : "Edit Profile"}
                  </button>
                )}
              </div>

              {!isEditing && !isProfileIncomplete && (
                <div className="profile-details">
                  <div className="profile-detail-item">
                    <span className="profile-detail-value">{profile.university_email}</span>
                  </div>
                  {profile.course && (
                    <div className="profile-detail-item">
                      <span className="profile-detail-value">{profile.course}</span>
                    </div>
                  )}
                  {profile.bio && (
                    <div className="profile-detail-item">
                      <span className="profile-detail-value">{profile.bio}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {isCurrentUser && isProfileIncomplete && !isEditing && (
            <div className="empty-state">
              <h3>Your profile is incomplete</h3>
              <p>Please complete your profile to share more about yourself with the community.</p>
              <button onClick={() => setIsEditing(true)} className="edit-profile-btn">
                Complete Profile
              </button>
            </div>
          )}
        </div>

        {/* Edit Profile Form */}
        {isEditing && (
          <form onSubmit={handleUpdateProfile} className="profile-form">
            <div className="form-row">
              <div className="form-group">
                <label>University Email:</label>
                <input
                  type="email"
                  name="university_email"
                  value={formData.university_email}
                  onChange={handleChange}
                  placeholder="Your university email address"
                  required
                />
                {formData.university_email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.university_email) && (
                  <p className="error-message">Please enter a valid email address</p>
                )}
              </div>

              <div className="form-group">
                <label>Date of Birth:</label>
                <input
                  type="date"
                  name="dob"
                  value={formData.dob}
                  onChange={handleChange}
                  max={new Date().toISOString().split('T')[0]}
                />
                {formData.dob && new Date(formData.dob) > new Date() && (
                  <p className="error-message">Date of birth cannot be in the future</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Address:</label>
              <textarea
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="Your current address"
                minLength="5"
              />
              {formData.address && formData.address.length < 5 && (
                <p className="error-message">Address must be at least 5 characters</p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Course:</label>
                <input
                  type="text"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  placeholder="What are you studying?"
                  minLength="2"
                />
                {formData.course && formData.course.length < 2 && (
                  <p className="error-message">Course must be at least 2 characters</p>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Interests:</label>
              <textarea
                name="interests"
                value={formData.interests}
                onChange={handleChange}
                placeholder="Your hobbies and interests..."
                minLength="3"
              />
              {formData.interests && formData.interests.length < 3 && (
                <p className="error-message">Please enter at least 3 characters</p>
              )}
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself..."
                minLength="10"
              />
              {formData.bio && formData.bio.length < 10 && (
                <p className="error-message">Bio should be at least 10 characters</p>
              )}
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="save-btn"
                disabled={
                  !formData.university_email ||
                  !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.university_email) ||
                  (formData.address && formData.address.length < 5) ||
                  (formData.dob && new Date(formData.dob) > new Date()) ||
                  (formData.course && formData.course.length < 2) ||
                  (formData.interests && formData.interests.length < 3) ||
                  (formData.bio && formData.bio.length < 10)
                }
              >
                Save Changes
              </button>
            </div>
          </form>
        )}

        {/* Content Tabs */}
        <div className="profile-content-tabs">
          <div className="tabs-header">
            <button
              className={`tab-button ${activeTab === 'posts' ? 'active' : ''}`}
              onClick={() => setActiveTab('posts')}
            >
              Posts
            </button>
            <button
              className={`tab-button ${activeTab === 'communities' ? 'active' : ''}`}
              onClick={() => setActiveTab('communities')}
            >
              Communities
            </button>
            <button
              className={`tab-button ${activeTab === 'friends' ? 'active' : ''}`}
              onClick={() => setActiveTab('friends')}
            >
              Friends
            </button>
          </div>

          <div className="tab-content">
            {activeTab === 'posts' && (
              <div className="posts-section">
                {userPosts.length === 0 ? (
                  <div className="empty-posts">
                    <div className="empty-icon">
                      <svg
                        className="w-10 h-10 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                        />
                      </svg>
                    </div>
                    <h3>No posts yet</h3>
                    <p>
                      You haven't created any posts yet. Share your thoughts, ideas, or questions with your communities.
                    </p>
                  </div>
                ) : (
                  <div className="posts-list">
                    {userPosts.map((post) => (
                      <Note
                        key={post.id}
                        note={post}
                        onDelete={handleDeletePost}
                        showDelete={isCurrentUser}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'communities' && (
              <div className="communities-section">
                {joinedCommunities.length === 0 ? (
                  <div className="empty-communities">
                    <h3>No communities yet</h3>
                    <p>
                      {isCurrentUser
                        ? "You haven't joined any communities yet. Explore communities to join!"
                        : `${profile.username} hasn't joined any communities yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="communities-grid">
                    {joinedCommunities.map((community) => (
                      <CommunityCard key={community.id} community={community} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'friends' && (
              <div className="friends-section">
                {isCurrentUser && friendRequests.length > 0 && (
                  <div className="friend-requests-container">
                    <h3>Friend Requests</h3>
                    <div className="requests-list">
                      {friendRequests.map((req) => (
                        <div key={req.id} className="request-item">
                          <div className="request-info">
                            <p>{req.sender} sent you a friend request.</p>
                          </div>
                          <div className="request-actions">
                            <button
                              onClick={() => handleRespondToRequest(req.id, "accept")}
                              className="accept-btn"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => handleRespondToRequest(req.id, "decline")}
                              className="decline-btn"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {friends.length === 0 ? (
                  <div className="empty-friends">
                    <h3>No friends yet</h3>
                    <p>
                      {isCurrentUser
                        ? "You haven't added any friends yet. Connect with others!"
                        : `${profile.username} hasn't added any friends yet.`}
                    </p>
                  </div>
                ) : (
                  <div className="friends-list">
                    {friends.map((friend) => (
                      <div key={friend.id} className="friend-item">
                        <div className="friend-avatar">
                          {friend.profile_pic ? (
                            <img src={friend.profile_pic} alt={friend.username} />
                          ) : (
                            <div className="avatar-placeholder">
                              {friend.username.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="friend-info">
                          <h4>
                            <Link to={`/profile/${friend.username}`}style={{
                              color: "inherit",
                              padding: "10px",
                              textDecoration: "none",
                            }}>
                              {friend.username}
                            </Link>
                          </h4>
                          {friend.course && <p>{friend.course}</p>}
                        </div>
                        {isCurrentUser && (
                          <button
                            onClick={() => handleRemoveFriend(friend.id)}
                            className="remove-friend-btn"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;