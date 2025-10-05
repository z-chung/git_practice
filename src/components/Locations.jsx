import React, { useState } from 'react';
import { locations, locationTypes } from '../data/locations';
import './Locations.css';

function Locations() {
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('name');

  let filteredLocations = locations.filter(location => {
    const matchesType = selectedType === 'All' || location.type === selectedType;
    const matchesSearch = location.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         location.country.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Sort locations
  filteredLocations = [...filteredLocations].sort((a, b) => {
    if (sortBy === 'name') return a.name.localeCompare(b.name);
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0;
  });

  return (
    <div className="locations-container">
      <div className="locations-header">
        <h1>🌍 Explore Locations</h1>
        <p>Discover amazing destinations around the world</p>
      </div>

      <div className="locations-controls">
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search destinations, cities, countries..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="name">Sort by Name</option>
            <option value="rating">Sort by Rating</option>
          </select>
        </div>

        <div className="type-filters">
          {locationTypes.map(type => (
            <button
              key={type}
              className={`type-btn ${selectedType === type ? 'active' : ''}`}
              onClick={() => setSelectedType(type)}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      <div className="locations-grid">
        {filteredLocations.map(location => (
          <div key={location.id} className="location-card">
            <div className="location-image">{location.image}</div>
            <div className="location-content">
              <div className="location-type">{location.type}</div>
              <h3>{location.name}</h3>
              <div className="location-place">
                <span className="place-icon">📍</span>
                <span>{location.city}, {location.country}</span>
              </div>
              <div className="location-rating">
                <span className="stars">{'⭐'.repeat(Math.floor(location.rating))}</span>
                <span className="rating-value">{location.rating}</span>
              </div>
              <p className="location-description">{location.description}</p>
              <div className="location-attractions">
                <strong>Top Attractions:</strong>
                <ul>
                  {location.attractions.map((attraction, index) => (
                    <li key={index}>{attraction}</li>
                  ))}
                </ul>
              </div>
              <button className="explore-btn">Explore</button>
            </div>
          </div>
        ))}
      </div>

      {filteredLocations.length === 0 && (
        <div className="no-results">
          <p>No locations found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

export default Locations;