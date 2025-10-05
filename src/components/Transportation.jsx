import React, { useState } from 'react';
import { transportation, transportTypes } from '../data/transportation';
import './Transportation.css';

function Transportation() {
  const [selectedType, setSelectedType] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('price');

  let filteredTransport = transportation.filter(transport => {
    const matchesType = selectedType === 'All' || transport.type === selectedType;
    const matchesSearch = transport.from.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.to.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         transport.carrier.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  // Sort transportation
  filteredTransport = [...filteredTransport].sort((a, b) => {
    if (sortBy === 'price') {
      const priceA = parseFloat(a.price.replace(/[^0-9.]/g, ''));
      const priceB = parseFloat(b.price.replace(/[^0-9.]/g, ''));
      return priceA - priceB;
    }
    if (sortBy === 'duration') {
      const durationA = a.duration.replace(/[^0-9]/g, '');
      const durationB = b.duration.replace(/[^0-9]/g, '');
      return parseInt(durationA) - parseInt(durationB);
    }
    return 0;
  });

  return (
    <div className="transportation-container">
      <div className="transportation-header">
        <h1>🚀 Find Transportation</h1>
        <p>Compare and book flights, trains, buses, and more</p>
      </div>

      <div className="transportation-controls">
        <div className="search-sort">
          <input
            type="text"
            placeholder="Search by origin, destination, or carrier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <select 
            value={sortBy} 
            onChange={(e) => setSortBy(e.target.value)}
            className="sort-select"
          >
            <option value="price">Sort by Price</option>
            <option value="duration">Sort by Duration</option>
          </select>
        </div>

        <div className="type-filters">
          {transportTypes.map(type => (
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

      <div className="transportation-list">
        {filteredTransport.map(transport => (
          <div key={transport.id} className="transport-card">
            <div className="transport-icon">{transport.image}</div>
            
            <div className="transport-route">
              <div className="route-point">
                <div className="route-location">{transport.from}</div>
                <div className="route-time">{transport.departure.split(' ')[1]}</div>
                <div className="route-date">{transport.departure.split(' ')[0]}</div>
              </div>
              
              <div className="route-line">
                <div className="route-duration">
                  <span className="duration-badge">{transport.duration}</span>
                  <span className="stops-badge">{transport.stops}</span>
                </div>
                <div className="line"></div>
              </div>
              
              <div className="route-point">
                <div className="route-location">{transport.to}</div>
                <div className="route-time">{transport.arrival.split(' ')[1]}</div>
                <div className="route-date">{transport.arrival.split(' ')[0]}</div>
              </div>
            </div>

            <div className="transport-details">
              <div className="detail-row">
                <span className="detail-label">Carrier:</span>
                <span className="detail-value">{transport.carrier}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Class:</span>
                <span className="detail-value">{transport.class}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value type-badge">{transport.type}</span>
              </div>
            </div>

            <div className="transport-action">
              <div className="transport-price">{transport.price}</div>
              <button className="book-transport-btn">Book Now</button>
            </div>
          </div>
        ))}
      </div>

      {filteredTransport.length === 0 && (
        <div className="no-results">
          <p>No transportation options found. Try adjusting your filters.</p>
        </div>
      )}
    </div>
  );
}

export default Transportation;