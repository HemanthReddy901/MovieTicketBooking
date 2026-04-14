import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './MovieSearch.css';

const MovieSearch = () => {
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    city: '',
    movieName: '',
    date: ''
  });
  const navigate = useNavigate();

  
  useEffect(() => {
  
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Please login to search movies');
      navigate('/login');
      return;
    }
    handleSearch();
  }, []);

  const handleSearch = async () => {
   
    const token = localStorage.getItem('token');
    if (!token) {
      toast.error('Session expired. Please login again.');
      navigate('/login');
      return;
    }

    setLoading(true);
    try {
      const params = {};
      if (filters.city && filters.city.trim()) {
        params.city = filters.city.trim();
      }
      if (filters.movieName && filters.movieName.trim()) {
        params.movieName = filters.movieName.trim();
      }
      if (filters.date) {
        params.date = filters.date;
      }
      
      console.log('Making search request with params:', params);
      console.log('Token being sent:', localStorage.getItem('token'));
      
      const response = await userAPI.searchShows(params);
      console.log('Search response:', response.data);
      
      if (response.data && Array.isArray(response.data)) {
        setShows(response.data);
        if (response.data.length === 0) {
          toast('No shows found for the selected criteria', { icon: '🔍' });
        }
      } else {
        setShows([]);
      }
    } catch (error) {
      console.error('Error searching shows:', error);
    
      if (error.response && error.response.status === 401) {
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        toast.error('Failed to search shows. Please try again.');
      }
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = (showId) => {
    navigate(`/user/booking/${showId}`);
  };

  return (
    <div className="movie-search">
      <div className="container">
        <h1 className="search-title">Search Movies</h1>
        
        <div className="filters-section">
          <div className="filter-group">
            <input
              type="text"
              placeholder="City"
              value={filters.city}
              onChange={(e) => setFilters({...filters, city: e.target.value})}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <input
              type="text"
              placeholder="Movie Name"
              value={filters.movieName}
              onChange={(e) => setFilters({...filters, movieName: e.target.value})}
              className="filter-input"
            />
          </div>
          <div className="filter-group">
            <input
              type="date"
              value={filters.date}
              onChange={(e) => setFilters({...filters, date: e.target.value})}
              className="filter-input"
            />
          </div>
          <button onClick={handleSearch} className="search-button">
            Search
          </button>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="shows-list">
            {shows.map((show) => (
              <div key={show.id} className="show-card">
                <div className="show-info">
                  <h3>{show.movie?.title || 'N/A'}</h3>
                  <p><strong>Theater:</strong> {show.theater?.name || 'N/A'}</p>
                  <p><strong>Location:</strong> {show.theater?.city || 'N/A'}, {show.theater?.state || 'N/A'}</p>
                  <p><strong>Date & Time:</strong> {show.startTime ? new Date(show.startTime).toLocaleString() : 'N/A'}</p>
                  <p><strong>Screen:</strong> {show.screen?.name || 'N/A'}</p>
                  <p><strong>Price:</strong> ${show.price || '0'}</p>
                </div>
                <button 
                  onClick={() => handleBookNow(show.id)}
                  className="book-now-btn"
                >
                  Book Now
                </button>
              </div>
            ))}
            {shows.length === 0 && !loading && (
              <div className="no-results">
                <p>No shows found. Try different search criteria.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieSearch;