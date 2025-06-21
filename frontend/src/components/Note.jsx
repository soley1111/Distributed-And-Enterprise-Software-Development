import React from "react";
import "../styles/Note.css";

function Note({ note, onDelete, showDelete }) {
  const formattedDate = new Date(note.created_at).toLocaleDateString('en-UK', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  return (
    <div className="note-card">
      <div className="note-header">
        <div>
          <span className="note-author">{note.author.username}</span>
          <span className="note-meta"> in {note.community} • {note.category}</span>
        </div>
        <span className="note-date">{formattedDate}</span>
      </div>
      <h3 className="note-title">{note.title}</h3>
      <p className="note-content">{note.content}</p>
      {showDelete && (
        <div className="note-actions">
          <button 
            className="delete-button"
            onClick={() => onDelete(note.id)}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}

export default Note;