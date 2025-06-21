import { useState } from "react";
import api from "../api";
import Navbar from "../components/Navbar";
import "../styles/Search.css";

function UserCard({ user }) {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  const handleSendRequest = () => {
    if (user.id === currentUser?.id) {
      alert("You cannot add yourself as a friend.");
      return;
    }
    api.post('/api/friend-requests/', { receiver_id: user.id })
      .then(() => alert('Friend request sent!'))
      .catch(err => {
        if (err.response?.data?.detail) {
          alert(err.response.data.detail);
        } else {
          console.error(err);
        }
      });
  };

  return (
    <div className="user-card">
      <div className="user-info">
        <div className="user-details">
          <p className="user-name">{user.username}</p>
          <p className="user-email">{user.email}</p>
          <p className="user-course">{user.course}</p>
        </div>
      </div>
      <button className="add-friend-button" onClick={handleSendRequest}>
        Add Friend
      </button>
    </div>
  );
}

function Search() {
  const [username, setUsername] = useState("");
  const [course, setCourse] = useState("");
  const [interests, setInterests] = useState("");
  const [students, setStudents] = useState([]);

  const handleSearch = async () => {
    if (!username && !course && !interests) {
      alert("Please enter at least one filter to search.");
      return;
    }

    try {
      const response = await api.get(`/api/search/students/?username=${username}&course=${course}&interests=${interests}`);
      setStudents(response.data);
    } catch (err) {
      console.error("Search failed:", err);
    }
  };

  return (
    <div className="search-page">
      <Navbar />
      <div className="search-container">
        <h1>Search Students</h1>
        <div className="filters-container">
          <input
            type="text"
            placeholder="Filter by username..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by course..."
            value={course}
            onChange={(e) => setCourse(e.target.value)}
          />
          <input
            type="text"
            placeholder="Filter by interests..."
            value={interests}
            onChange={(e) => setInterests(e.target.value)}
          />
        </div>
        <button className="search-input-group button" onClick={handleSearch}>
          Search
        </button>
      </div>
      <div className="search-results-container">
        <h2>Students</h2>
        {students.length > 0 ? (
          students.map(student => (
            <UserCard key={student.id} user={student} />
          ))
        ) : (
          <p className="no-results-message">No students found.</p>
        )}
      </div>
    </div>
  );
}

export default Search;