import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ownerAPI } from '../../services/api';
import './OwnerDashboard.css';

const OwnerDashboard = () => {
  const [theaters, setTheaters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalTheaters: 0,
    totalMovies: 0,
    totalShows: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
    
      const theatersResponse = await ownerAPI.getMyTheaters();
      const theatersData = Array.isArray(theatersResponse.data) ? theatersResponse.data : [];
      setTheaters(theatersData);
      let totalMoviesCount = 0;
      let totalShowsCount = 0;
      

      for (const theater of theatersData) {
        try {
      
          const moviesResponse = await ownerAPI.getTheaterMovies(theater.id);
          const movies = Array.isArray(moviesResponse.data) ? moviesResponse.data : [];
          totalMoviesCount += movies.length;
        
          const showsResponse = await ownerAPI.getTheaterShows(theater.id);
          const shows = Array.isArray(showsResponse.data) ? showsResponse.data : [];
          totalShowsCount += shows.length;
        } catch (error) {
          console.error(`Error fetching data for theater ${theater.id}:`, error);
         
        }
      }
      
      setStats({
        totalTheaters: theatersData.length,
        totalMovies: totalMoviesCount,
        totalShows: totalShowsCount
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="owner-dashboard">
      <div className="container">
        <h1 className="dashboard-title">Theater Owner Dashboard</h1>
        
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎭</div>
            <div className="stat-info">
              <h3>Total Theaters</h3>
              <p className="stat-number">{stats.totalTheaters}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎬</div>
            <div className="stat-info">
              <h3>Total Movies</h3>
              <p className="stat-number">{stats.totalMovies}</p>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🎫</div>
            <div className="stat-info">
              <h3>Total Shows</h3>
              <p className="stat-number">{stats.totalShows}</p>
            </div>
          </div>
        </div>

        <div className="quick-actions">
          <h2>Quick Actions</h2>
          <div className="actions-grid">
            <Link to="/owner/theaters" className="action-card">
              <div className="action-icon">🏢</div>
              <h3>Manage Theaters</h3>
              <p>Add or edit your theaters</p>
            </Link>
            <Link to="/owner/movies" className="action-card">
              <div className="action-icon">🎬</div>
              <h3>Manage Movies</h3>
              <p>Add new movies to your theaters</p>
            </Link>
            <Link to="/owner/screens" className="action-card">
              <div className="action-icon">📺</div>
              <h3>Manage Screens</h3>
              <p>Configure screens and seats</p>
            </Link>
            <Link to="/owner/shows" className="action-card">
              <div className="action-icon">⏰</div>
              <h3>Manage Shows</h3>
              <p>Schedule movie shows</p>
            </Link>
          </div>
        </div>

        <div className="recent-theaters">
          <h2>Your Theaters</h2>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : theaters.length === 0 ? (
            <div className="no-data">
              <p>You haven't added any theaters yet.</p>
              <Link to="/owner/theaters" className="btn-primary">Add Your First Theater</Link>
            </div>
          ) : (
            <div className="theaters-list">
              {theaters.map((theater) => (
                <div key={theater.id} className="theater-card">
                  <h3>{theater.name}</h3>
                  <p>{theater.city}, {theater.state}</p>
                  <p>{theater.address}</p>
                  <p>Total Screens: {theater.totalScreens}</p>
                  
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;