import React, { useState } from "react";
import "../styles/PostForm.css";

function PostForm({
  onSubmit,
  onCancel,
  categories = [],
  communities = [],
  defaultCommunity = null,
}) {
  const transformedCategories = categories.map(cat => ({
    display: cat,
    value: cat.toLowerCase().replace(' ', '_')
  }));

  const transformedCommunities = communities.map(comm => ({
    display: comm,
    value: comm.toLowerCase().replace(' ', '_')
  }));

  const [postData, setPostData] = useState({
    title: "",
    content: "",
    category: transformedCategories[0]?.value || "",
    community: defaultCommunity || transformedCommunities[0]?.value || ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPostData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(postData);
  };

  return (
    <div className="post-form-modal">
      <div className="post-form-container">
        <h2>Create New Post</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title</label>
            <input
              type="text"
              name="title"
              value={postData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Content</label>
            <textarea
              name="content"
              value={postData.content}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Category</label>
            <select
              name="category"
              value={postData.category}
              onChange={handleChange}
              required
            >
              {transformedCategories.map(cat => (
                <option key={cat.value} value={cat.value}>
                  {cat.display}
                </option>
              ))}
            </select>
          </div>

          {/* ✅ Only show community dropdown if NOT locked to a default */}
          {!defaultCommunity && (
            <div className="form-group">
              <label>Community</label>
              <select
                name="community"
                value={postData.community}
                onChange={handleChange}
                required
              >
                {transformedCommunities.map(comm => (
                  <option key={comm.value} value={comm.value}>
                    {comm.display}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="form-actions">
            <button type="button" onClick={onCancel}>Cancel</button>
            <button type="submit">Post</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostForm;