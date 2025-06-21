import React from "react";

function NoteForm({ onSubmit, title, setTitle, content, setContent }) {
  return (
    <form onSubmit={onSubmit}>
      <label htmlFor="title">Title:</label>
      <br />
      <input
        type="text"
        id="title"
        name="title"
        value={title}
        required
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="content">Content:</label>
      <br />
      <textarea
        id="content"
        name="content"
        required
        value={content}
        onChange={(e) => setContent(e.target.value)}
      />
      <input type="submit" value="Submit" />
    </form>
  );
}

export default NoteForm;