import { useState } from "react";

function CommunityForm({ onSubmit, onCancel, categories }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category: categories[0].toLowerCase(),
    tags: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      ...formData,
      tags: formData.tags
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag) 
    };
    onSubmit(payload);
  };

  return (
    <div className="community-form-modal">
      <div className="community-form-container">
        <h2>Create New Community</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Community Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              required
            >
              {categories.map(cat => (
                <option key={cat} value={cat.toLowerCase()}>{cat}</option>
              ))}
            </select>
          </div>
  
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input
              type="text"
              name="tags"
              placeholder="e.g. chess, strategy, logic"
              value={formData.tags}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-actions">
            <button type="button" onClick={onCancel}>
              Cancel
            </button>
            <button type="submit">
              Create Community
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CommunityForm;