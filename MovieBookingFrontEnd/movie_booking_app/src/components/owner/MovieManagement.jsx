import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './MovieManagement.css';

const MovieManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [posterPreview, setPosterPreview] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    genre: '',
    language: '',
    duration: '',
    releaseDate: '',
    endDate: '',
    trailerUrl: '',
    director: '',
    cast: '',
    theaterId: ''
  });

  useEffect(() => {
    fetchMyTheaters();
  }, []);

  const fetchMyTheaters = async () => {
    try {
      const response = await ownerAPI.getMyTheaters();
      let theatersData = response.data;
      if (typeof theatersData === 'string') {
        theatersData = JSON.parse(theatersData);
      }
      
      setTheaters(Array.isArray(theatersData) ? theatersData : []);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      toast.error('Failed to load theaters');
      setTheaters([]);
    }
  };

  const fetchMovies = async (theaterId) => {
    if (!theaterId) return;
    setLoading(true);
    try {
      const response = await ownerAPI.getTheaterMovies(theaterId);
      console.log('Raw response:', response);
      
      let moviesData = response.data;
      
      if (typeof moviesData === 'string') {
        try {
          moviesData = JSON.parse(moviesData);
        } catch (parseError) {
          console.error('Failed to parse movies data:', parseError);
          moviesData = [];
        }
      }
 
      const moviesArray = Array.isArray(moviesData) ? moviesData : [];
      console.log('Final movies array:', moviesArray);
      
      setMovies(moviesArray);
      
      if (moviesArray.length === 0) {
        toast('No movies found for this theater', { icon: 'ℹ️' });
      }
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to load movies');
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTheaterChange = (e) => {
    const theaterId = e.target.value;
    setSelectedTheater(theaterId);
    setFormData({ ...formData, theaterId });
    if (theaterId) {
      fetchMovies(theaterId);
    } else {
      setMovies([]);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePosterChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPosterFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.genre || !formData.language || 
        !formData.duration || !formData.releaseDate || !formData.endDate) {
      toast.error('Please fill in all required fields');
      return;
    }

    const formDataToSend = new FormData();
    const movieData = {
      ...formData,
      theaterId: parseInt(formData.theaterId),
      duration: parseInt(formData.duration)
    };
    
    formDataToSend.append('movie', JSON.stringify(movieData));
    if (posterFile) {
      formDataToSend.append('poster', posterFile);
    }

    try {
      if (editingMovie) {
        await ownerAPI.updateMovie(editingMovie.id, formDataToSend);
        toast.success('Movie updated successfully');
      } else {
        await ownerAPI.createMovie(formDataToSend);
        toast.success('Movie created successfully');
      }
      setShowModal(false);
      resetForm();
      if (selectedTheater) {
        await fetchMovies(selectedTheater);
      }
    } catch (error) {
      console.error('Error saving movie:', error);
      toast.error(error.response?.data || 'Failed to save movie');
    }
  };

  const handleEdit = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title || '',
      description: movie.description || '',
      genre: movie.genre || '',
      language: movie.language || '',
      duration: movie.duration || '',
      releaseDate: movie.releaseDate ? movie.releaseDate.split('T')[0] : '',
      endDate: movie.endDate ? movie.endDate.split('T')[0] : '',
      trailerUrl: movie.trailerUrl || '',
      director: movie.director || '',
      cast: movie.cast || '',
      theaterId: movie.theater?.id || selectedTheater
    });
    if (movie.posterUrl) {
      setPosterPreview(`http://localhost:8081${movie.posterUrl}`);
    }
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await ownerAPI.deleteMovie(id);
        toast.success('Movie deleted successfully');
        await fetchMovies(selectedTheater);
      } catch (error) {
        console.error('Error deleting movie:', error);
        toast.error(error.response?.data || 'Failed to delete movie');
      }
    }
  };

  const resetForm = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      description: '',
      genre: '',
      language: '',
      duration: '',
      releaseDate: '',
      endDate: '',
      trailerUrl: '',
      director: '',
      cast: '',
      theaterId: selectedTheater
    });
    setPosterFile(null);
    setPosterPreview('');
  };

  const genres = ['Action', 'Comedy', 'Drama', 'Horror', 'Romance', 'Sci-Fi', 'Thriller', 'Animation', 'Documentary'];
  const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Malayalam', 'Kannada', 'Bengali', 'Marathi'];

  return (
    <div className="movie-management">
      <div className="container">
        <div className="management-header">
          <h1>Movie Management</h1>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (!selectedTheater) {
                toast.error('Please select a theater first');
                return;
              }
              resetForm();
              setShowModal(true);
            }}
            disabled={!selectedTheater}
          >
            + Add New Movie
          </button>
        </div>

        <div className="theater-selector">
          <label>Select Theater:</label>
          <select value={selectedTheater} onChange={handleTheaterChange}>
            <option value="">Choose a theater</option>
            {Array.isArray(theaters) && theaters.map(theater => (
              <option key={theater.id} value={theater.id}>
                {theater.name} - {theater.city}
              </option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : selectedTheater && (
          <>
            {(!Array.isArray(movies) || movies.length === 0) ? (
              <div className="no-data">
                <p>No movies found for this theater. Add your first movie!</p>
                {movies && typeof movies === 'object' && !Array.isArray(movies) && (
                  <p className="error-details">Debug: Received data type: {typeof movies}</p>
                )}
              </div>
            ) : (
              <div className="movies-grid">
                {movies.map((movie) => (
                  <div key={movie.id} className="movie-card">
                    <div className="movie-poster">
                      <img 
                        src={movie.posterUrl ? `http://localhost:8081${movie.posterUrl}` : '/api/placeholder/300/400'} 
                        alt={movie.title}
                        onError={(e) => {
                          e.target.src = '/api/placeholder/300/400';
                        }}
                      />
                      <div className="movie-actions">
                        <button className="edit-btn" onClick={() => handleEdit(movie)}>Edit</button>
                        <button className="delete-btn" onClick={() => handleDelete(movie.id)}>Delete</button>
                      </div>
                    </div>
                    <div className="movie-info">
                      <h3>{movie.title}</h3>
                      <p><strong>Genre:</strong> {movie.genre}</p>
                      <p><strong>Language:</strong> {movie.language}</p>
                      <p><strong>Duration:</strong> {movie.duration} mins</p>
                      <p><strong>Release:</strong> {movie.releaseDate ? new Date(movie.releaseDate).toLocaleDateString() : 'N/A'}</p>
                      <p><strong>Director:</strong> {movie.director || 'N/A'}</p>
                      <p className="description">{movie.description ? movie.description.substring(0, 100) : 'No description'}...</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>{editingMovie ? 'Edit Movie' : 'Add New Movie'}</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Movie Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Genre *</label>
                    <select name="genre" value={formData.genre} onChange={handleInputChange} required>
                      <option value="">Select Genre</option>
                      {genres.map(genre => (
                        <option key={genre} value={genre}>{genre}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Language *</label>
                    <select name="language" value={formData.language} onChange={handleInputChange} required>
                      <option value="">Select Language</option>
                      {languages.map(lang => (
                        <option key={lang} value={lang}>{lang}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Release Date *</label>
                    <input
                      type="date"
                      name="releaseDate"
                      value={formData.releaseDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows="4"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Director</label>
                    <input
                      type="text"
                      name="director"
                      value={formData.director}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>Cast</label>
                    <input
                      type="text"
                      name="cast"
                      value={formData.cast}
                      onChange={handleInputChange}
                      placeholder="e.g., Actor1, Actor2, Actress1"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Trailer URL</label>
                  <input
                    type="url"
                    name="trailerUrl"
                    value={formData.trailerUrl}
                    onChange={handleInputChange}
                    placeholder="YouTube trailer link"
                  />
                </div>

                <div className="form-group">
                  <label>Movie Poster</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handlePosterChange}
                  />
                  {posterPreview && (
                    <div className="poster-preview">
                      <img src={posterPreview} alt="Poster preview" />
                    </div>
                  )}
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    {editingMovie ? 'Update' : 'Create'} Movie
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MovieManagement;