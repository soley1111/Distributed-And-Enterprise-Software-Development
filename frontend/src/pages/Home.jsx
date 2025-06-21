import { useState, useEffect } from "react";
import api from "../api";
import Note from "../components/Note";
import "../styles/Home.css";
import Navbar from "../components/Navbar";
import PostForm from "../components/PostForm";

function Home() {
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showPostForm, setShowPostForm] = useState(false);
  const [availableCommunities, setAvailableCommunities] = useState([]);
  const [filters, setFilters] = useState({
    category: "all",
    community: "all",
    sort: "newest"
  });

  // Mock data
  const categories = ["All", "Academic", "Social", "Sports", "Clubs"];
  const communities = ["All", "CS101", "Drama Club", "Football Team", "Debate Society"];

  useEffect(() => {
    fetchPosts();
    // Fetch actual communities from API
    api.get("/api/communities/")
      .then(res => {
        setAvailableCommunities(res.data);
      })
      .catch(err => console.error(err));
  }, [filters]);

  const fetchPosts = () => {
    setIsLoading(true);
    const params = {
      category: filters.category === 'all' ? null : filters.category,
      community: filters.community === 'all' ? null : filters.community,
      ordering: filters.sort === 'newest' ? '-created_at' : 'created_at'
    };
  
    api.get("/api/notes/", { params })
      .then(res => {
        setPosts(res.data);
        setIsLoading(false);
      })
      .catch(err => {
        console.error(err);
        setIsLoading(false);
      });
  };

  const createPost = (postData) => {
    api.post("/api/notes/", {
      ...postData,
      community: postData.community.id
    })
      .then(res => {
        setShowPostForm(false);
        fetchPosts();
      })
      .catch(err => console.error(err));
  };

  const deletePost = (id) => {
    api.delete(`/api/notes/delete/${id}/`)
      .then(() => fetchPosts())
      .catch(err => console.error(err));
  };

  return (
    <div className="feed-container">
      <Navbar />
      
      <div className="feed-header">
        <h1>Community Feed</h1>
        <button 
          className="create-post-btn"
          onClick={() => setShowPostForm(true)}
        >
          + Create New Post
        </button>
      </div>

      <div className="feed-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat.toLowerCase()}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Community:</label>
          <select 
            value={filters.community}
            onChange={(e) => setFilters({...filters, community: e.target.value})}
          >
            {communities.map(comm => (
              <option key={comm} value={comm.toLowerCase()}>{comm}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
          </select>
        </div>
      </div>

      {showPostForm && (
          <PostForm 
            onSubmit={createPost} 
            onCancel={() => setShowPostForm(false)}
            categories={categories.filter(c => c !== "All")}
            communities={availableCommunities}
          />
        )}

      <div className="posts-feed">
        {isLoading ? (
          <div className="loading">Loading posts...</div>
        ) : posts.length > 0 ? (
          posts.map(post => (
            <Note 
              key={post.id} 
              note={post} 
              onDelete={deletePost} 
            />
          ))
        ) : (
          <div className="no-posts">
            <p>No posts found. Try adjusting your filters or create the first post!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Home;