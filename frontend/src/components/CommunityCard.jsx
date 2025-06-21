import { Link } from "react-router-dom";




function CommunityCard({ community, onJoin, onLeave, onDelete }) {
  console.log("SLUG IS:", community.slug);
  const handleAction = (e) => {
    e.stopPropagation();
    if (community.is_member) {
      onLeave(community.id);
    } else {
      onJoin(community.id);
    }
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(community.id);
  };

  return (
      <div className="community-card">
        <div className="community-header">
            <Link
          to={`/communities/${community.slug}`}
          style={{
            color: "inherit",
            padding: "10px",
            textDecoration: "none",
          }}
      onClick={() => console.log("Link click triggered!")}
    >
          <h3>{community.name}</h3>
        </Link>
          <span className="community-category">{community.category}</span>
        </div>
        
        <p className="community-description">{community.description}</p>
        {community.tags && community.tags.length > 0 && (
          <div className="community-tags">
            {community.tags.map((tag, index) => (
              <span key={index} className="tag">
                #{tag}
              </span>
            ))}
          </div>
        )}
        
        <div className="community-meta">
          <span>Created by: {community.created_by}</span>
          <span>Members: {community.member_count}</span>
        </div>
        
        <div className="community-actions">
          <button 
            className={`action-btn ${community.is_member ? 'leave' : 'join'}`}
            onClick={handleAction}
          >
            {community.is_member ? 'Leave' : 'Join'}
          </button>
          
          {(community.user_role === 'admin' || community.is_global_admin) && (
            <button 
              className="action-btn delete"
              onClick={() => onDelete(community.id)}
            >
              Delete
            </button>
          )}
        </div>
      </div>
  );
}

export default CommunityCard;