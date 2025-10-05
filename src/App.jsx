import React, { useState } from 'react';
import Events from './components/Events';
import Locations from './components/Locations';
import Transportation from './components/Transportation';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState('events');

  return (
    <div className="app">
      <nav className="navbar">
        <div className="nav-container">
          <div className="nav-brand">
            <span className="brand-icon">✈️</span>
            <span className="brand-name">Travel Explorer</span>
          </div>
          
          <div className="nav-tabs">
            <button
              className={`nav-tab ${activeTab === 'events' ? 'active' : ''}`}
              onClick={() => setActiveTab('events')}
            >
              <span className="tab-icon">🎉</span>
              <span className="tab-text">Events</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'locations' ? 'active' : ''}`}
              onClick={() => setActiveTab('locations')}
            >
              <span className="tab-icon">🌍</span>
              <span className="tab-text">Locations</span>
            </button>
            <button
              className={`nav-tab ${activeTab === 'transportation' ? 'active' : ''}`}
              onClick={() => setActiveTab('transportation')}
            >
              <span className="tab-icon">🚀</span>
              <span className="tab-text">Transportation</span>
            </button>
          </div>
        </div>
      </nav>

      <main className="main-content">
        {activeTab === 'events' && <Events />}
        {activeTab === 'locations' && <Locations />}
        {activeTab === 'transportation' && <Transportation />}
      </main>

      <footer className="footer">
        <div className="footer-content">
          <p>© 2025 Travel Explorer - Your Gateway to Amazing Adventures</p>
          <div className="footer-links">
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
            <a href="#privacy">Privacy</a>
            <a href="#terms">Terms</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;