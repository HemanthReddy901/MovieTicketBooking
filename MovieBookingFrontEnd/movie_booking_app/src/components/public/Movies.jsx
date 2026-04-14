import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { publicAPI } from '../../services/api';
import './Movies.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchMovies();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await publicAPI.getMovies();
      setMovies(response.data);
    } catch (error) {
      console.error('Error fetching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      fetchMovies();
      return;
    }
    try {
      setLoading(true);
      const response = await publicAPI.searchMovies(searchQuery);
      setMovies(response.data);
    } catch (error) {
      console.error('Error searching movies:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="movies-page">
      <div className="container">
        <div className="search-section">
          <h1 className="page-title">Movies</h1>
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              className="search-input"
            />
            <button onClick={handleSearch} className="search-btn">Search</button>
          </div>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : (
          <div className="movies-grid">
            {movies.map((movie) => (
              <div key={movie.id} className="movie-card">
                <div className="movie-poster">
                  <img src={movie.posterUrl || '/placeholder-poster.jpg'} alt={movie.title} />
                  <div className="movie-overlay">
                    <Link to={`/movies/${movie.id}`} className="view-details">
                      View Details
                    </Link>
                  </div>
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-genre">{movie.genre}</p>
                  <p className="movie-language">{movie.language}</p>
                  <p className="movie-duration">Duration: {movie.duration} mins</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && movies.length === 0 && (
          <div className="no-results">
            <p>No movies found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Movies;