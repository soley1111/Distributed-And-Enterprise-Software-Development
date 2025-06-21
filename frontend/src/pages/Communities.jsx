import { useState, useEffect } from "react";
import api from "../api";
import "../styles/Communities.css";
import Navbar from "../components/Navbar";
import CommunityCard from "../components/CommunityCard";
import CommunityForm from "../components/CommunityForm";

function Communities() {
  const [communities, setCommunities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [filters, setFilters] = useState({
    category: "all",
    membership: "all",
    search: "",
    sort: "name"
  });

  const categories = ["All", "Academic", "Arts","Wellness", "Career", "Technology", "Volunteering", "Housing", "Social", "Sports", "Clubs"];
  const membershipFilters = ["All", "Joined", "Not Joined"];

  useEffect(() => {
    fetchCommunities();
  }, [filters]);

  const fetchCommunities = () => {
    setIsLoading(true);
    const params = {
        category: filters.category === 'all' ? null : filters.category.toLowerCase(),
        membership: filters.membership === 'all' ? null : filters.membership.toLowerCase(),
        search: filters.search || null,
        ordering: filters.sort === 'name' ? 'name' : 
                 filters.sort === 'newest' ? '-created_at' : 
                 filters.sort === 'oldest' ? 'created_at' : 
                 filters.sort === 'most_members' ? '-member_count' : 'member_count'
      };
    
      // Remove null/undefined params
      Object.keys(params).forEach(key => params[key] === null && delete params[key]);
    
      api.get("/api/communities/", { params })
        .then(res => {
          setCommunities(res.data);
        })
        .catch(err => {
          console.error("Fetch error:", err);
        })
        .finally(() => setIsLoading(false));
    };

  const handleJoinCommunity = (communityId) => {
    api.post(`/api/communities/${communityId}/join/`, {})
      .then((response) => {
        // Update the specific community in the list
        setCommunities(prev => 
          prev.map(community => 
            community.id === communityId ? response.data : community
          )
        );
      })
      .catch(err => {
        console.error("Join failed:", err.response?.data);
        // Show error message to user
        alert(err.response?.data?.detail || "Failed to join community");
      });
  };

  const handleLeaveCommunity = (communityId) => {
    api.delete(`/api/communities/${communityId}/leave/`)
      .then(() => fetchCommunities())
      .catch(err => console.error(err));
  };

  const handleCreateCommunity = (formData) => {
    api.post("/api/communities/", formData)
      .then((response) => {
        setShowCreateForm(false);
        // Add the new community to the beginning of the list
        setCommunities(prev => [response.data, ...prev]);
      })
      .catch(err => {
        console.error(err);
        // Optionally show error message to user
      });
  };

  const handleDeleteCommunity = (communityId) => {
    if (window.confirm("Are you sure you want to delete this community?")) {
      api.delete(`/api/communities/${communityId}/`)
        .then(() => fetchCommunities())
        .catch(err => console.error(err));
    }
  };

  return (
    <div className="communities-container" style={{ maxWidth: '1200px', margin: '0 auto' }}>
      <Navbar />
      
      <div className="communities-header">
        <h1>University Communities</h1>
        <button 
          className="create-community-btn"
          onClick={() => setShowCreateForm(prev => !prev)}

        >
          + Create New Community
        </button>
      </div>

      <div className="communities-filters">
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={filters.category}
            onChange={(e) => setFilters({...filters, category: e.target.value})}
          >
            {categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
        <label>Membership:</label>
        <select 
            value={filters.membership}
            onChange={(e) => setFilters({...filters, membership: e.target.value})}
        >
            <option value="all">All</option>
            <option value="joined">Joined</option>
            <option value="not_joined">Not Joined</option>
        </select>
        </div>

        <div className="filter-group">
          <label>Sort by:</label>
          <select 
            value={filters.sort}
            onChange={(e) => setFilters({...filters, sort: e.target.value})}
          >
            <option value="name">Name (A-Z)</option>
            <option value="-name">Name (Z-A)</option>
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="most_members">Most Members</option>
            <option value="least_members">Fewest Members</option>
          </select>
        </div>

        <div className="filter-group search-group">
          <label>Search:</label>
          <input 
            type="text" 
            placeholder="Search communities and tags..."
            value={filters.search}
            onChange={(e) => setFilters({...filters, search: e.target.value})}
          />
        </div>
      </div>

      {showCreateForm && (
        <CommunityForm 
          onSubmit={handleCreateCommunity}
          onCancel={() => setShowCreateForm(false)}
          categories={categories.filter(c => c !== "All")}
        />
      )}

      <div className="communities-list">
        {isLoading ? (
          <div className="loading">Loading communities...</div>
        ) : communities.length > 0 ? (
          communities.map(community => (
            <CommunityCard 
              key={community.id}
              community={community}
              onJoin={handleJoinCommunity}
              onLeave={handleLeaveCommunity}
              onDelete={handleDeleteCommunity}
            />
          ))
        ) : (
          <div className="no-communities">
            <p>No communities found. Try adjusting your filters or create the first community!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Communities;