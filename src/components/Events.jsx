import React, { useState } from 'react';
import { events, categories } from '../data/events';
import './Events.css';

function Events() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEvents = events.filter(event => {
    const matchesCategory = selectedCategory === 'All' || event.category === selectedCategory;
    const matchesSearch = event.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.location.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="events-container">
      <div className="events-header">
        <h1>🎉 Discover Events</h1>
        <p>Find amazing events happening around the world</p>
      </div>

      <div className="events-controls">
        <input
          type="text"
          placeholder="Search events or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />

        <div className="category-filters">
          {categories.map(category => (
            <button
              key={category}
              className={`category-btn ${selectedCategory === category ? 'active' : ''}`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="events-grid">
        {filteredEvents.map(event => (
          <div key={event.id} className="event-card">
            <div className="event-image">{event.image}</div>
            <div className="event-content">
              <div className="event-category">{event.category}</div>
              <h3>{event.name}</h3>
              <p className="event-description">{event.description}</p>
              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-icon">📍</span>
                  <span>{event.location}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-icon">🕐</span>
                  <span>{event.time}</span>
                </div>
              </div>
              <div className="event-footer">
                <span className="event-price">{event.price}</span>
                <button className="book-btn">Book Now</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredEvents.length === 0 && (
        <div className="no-results">
          <p>No events found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

export default Events;