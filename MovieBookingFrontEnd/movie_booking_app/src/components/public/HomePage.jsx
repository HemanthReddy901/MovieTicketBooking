import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import './HomePage.css';

const HomePage = () => {
  const [nowShowing, setNowShowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNowShowing();
  }, []);

  const fetchNowShowing = async () => {
    try {
      const response = await publicAPI.getNowShowing();
      setNowShowing(response.data);
    } catch (error) {
      console.error('Error fetching shows:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="homepage">
      <div className="hero-section">
        <div className="hero-content">
          <h1>Book Your Movie Tickets</h1>
          <p>Experience cinema like never before</p>
          <Link to="/user/search" className="cta-button">Book Now</Link>
        </div>
      </div>

      <div className="now-showing">
        <div className="container">
          <h2>Now Showing</h2>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : (
            <div className="movies-grid">
              {nowShowing.slice(0, 6).map((show) => (
  <div key={show.id} className="movie-card">
    <img 
      src={show.movie?.posterUrl ? `http://localhost:8081${show.movie.posterUrl}` : '/api/placeholder/300/400'} 
      alt={show.movie?.title}
      onError={(e) => {
        e.target.onerror = null;
        e.target.src = '/api/placeholder/300/400';
      }}
    />
    <div className="movie-info">
      <h3>{show.movie?.title}</h3>
      <p>{show.theater?.name}</p>
      <p>{new Date(show.startTime).toLocaleDateString()}</p>
      <Link to={`/user/booking/${show.id}`} className="book-btn">
        Book Now
      </Link>
    </div>
  </div>
))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HomePage;