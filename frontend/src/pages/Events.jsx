import React, { useState, useEffect } from 'react';
import api from '../api';
import Navbar from '../components/Navbar';
import '../styles/Events.css';

function EventList() {
  const [events, setEvents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredEvents, setFilteredEvents] = useState([]);

  const currentUser = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    api.get('/api/events/').then((res) => {
      setEvents(res.data);
      setFilteredEvents(res.data);
    });
  }, []);

  useEffect(() => {
    const filtered = events.filter((event) =>
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredEvents(filtered);
  }, [searchTerm, events]);

  const handleDeleteEvent = (eventId) => {
    api.delete(`/api/events/${eventId}/`)
      .then(() => {
        setEvents((prev) => prev.filter((event) => event.id !== eventId));
        setFilteredEvents((prev) => prev.filter((event) => event.id !== eventId));
      })
      .catch((err) => {
        console.error('Error deleting event:', err);
      });
  };

  const handleSignup = (eventId) => {
    api.post('/api/events/signup/', { event: eventId })
      .then(() => {
        alert("You successfully signed up!");
      })
      .catch((err) => {
        console.error("Signup failed:", err.response?.data || err);
        alert(err.response?.data?.detail || "Could not sign up.");
      });
  };

  return (
    <div className="events-container">
      <Navbar />
      <div className="events-header">
        <h2>Events</h2>
        <input
          type="text"
          placeholder="Search events..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="event-search"
        />
      </div>

      <ul className="event-list">
        {filteredEvents.map((event) => {
          const userSignedUp = event.signups?.some(
            signup => signup.user === currentUser?.username || signup.user === currentUser?.id
          );

          return (
            <li key={event.id} className="event-card">
              <h3>{event.title}</h3>
              <p><strong>Description:</strong> {event.description}</p>
              <p><strong>Date:</strong> {event.date}</p>
              <p><strong>Time:</strong> {event.time}</p>
              <p><strong>Type:</strong> {event.event_type === 'virtual' ? 'Virtual' : 'In-Person'}</p>

              {event.community && <p><strong>Community:</strong> {event.community}</p>}
              {event.max_capacity && <p><strong>Max Capacity:</strong> {event.max_capacity}</p>}
              {event.required_materials && <p><strong>Required Materials:</strong> {event.required_materials}</p>}
              {event.location && <p><strong>Location:</strong> {event.location}</p>}
              {event.virtual_link && (
                <p>
                  <strong>Virtual Link:</strong>{' '}
                  <a href={event.virtual_link} target="_blank" rel="noreferrer">
                    {event.virtual_link}
                  </a>
                </p>
              )}
              <p><strong>Signed Up:</strong> {event.signup_count} / {event.max_capacity || "∞"}</p>

              {(event.user_role === 'member' || event.user_role === 'moderator' || event.user_role === 'admin') ? (
                userSignedUp ? (
                  <button className="joined-button" disabled>✅ Joined!</button>
                ) : (
                  <button className="signup-button" onClick={() => handleSignup(event.id)}>Join Event</button>
                )
              ) : (
                <p className="join-warning">You must join the community to participate.</p>
              )}

              {(event.user_role === 'admin' || event.user_role === 'moderator' || event.is_global_admin) && (
                <button className="delete-button" onClick={() => handleDeleteEvent(event.id)}>Delete</button>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default EventList;