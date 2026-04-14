import React, { useState, useEffect } from 'react';
import { ownerAPI } from '../../services/api';
import toast from 'react-hot-toast';
import './ShowManagement.css';

const ShowManagement = () => {
  const [theaters, setTheaters] = useState([]);
  const [selectedTheater, setSelectedTheater] = useState('');
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([]);
  const [shows, setShows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedShow, setSelectedShow] = useState(null);
  const [seatPrices, setSeatPrices] = useState({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [initializingShow, setInitializingShow] = useState(null);
  const [formData, setFormData] = useState({
    movieId: '',
    screenId: '',
    startTime: '',
    endTime: '',
    price: 10
  });

  useEffect(() => {
    fetchMyTheaters();
  }, []);

  const fetchMyTheaters = async () => {
    try {
      const response = await ownerAPI.getMyTheaters();
      setTheaters(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error('Error fetching theaters:', error);
      toast.error('Failed to load theaters');
      setTheaters([]);
    }
  };

  const fetchMoviesAndScreens = async (theaterId) => {
    if (!theaterId) return;
    try {
      const [moviesRes, screensRes] = await Promise.all([
        ownerAPI.getTheaterMovies(theaterId),
        ownerAPI.getTheaterScreens(theaterId)
      ]);
      setMovies(Array.isArray(moviesRes.data) ? moviesRes.data : []);
      setScreens(Array.isArray(screensRes.data) ? screensRes.data : []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load movies and screens');
      setMovies([]);
      setScreens([]);
    }
  };

  const fetchShows = async (theaterId = selectedTheater) => {
    if (!theaterId) {
      console.log('No theaterId, exiting');
      return;
    }
    
    setLoading(true);
    try {
      const response = await ownerAPI.getTheaterShows(theaterId);
      setShows(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      setShows([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTheaterChange = async (e) => {
    const theaterId = e.target.value;
    setSelectedTheater(theaterId);
    if (theaterId) {
      await fetchMoviesAndScreens(theaterId);
      await fetchShows(theaterId); 
    } else {
      console.log('No theater selected');
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.movieId || !formData.screenId || !formData.startTime || !formData.endTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (new Date(formData.endTime) <= new Date(formData.startTime)) {
      toast.error('End time must be after start time');
      return;
    }

    try {
      const showData = {
        movieId: parseInt(formData.movieId),
        screenId: parseInt(formData.screenId),
        startTime: formData.startTime,
        endTime: formData.endTime,
        price: parseFloat(formData.price)
      };
      
      const response = await ownerAPI.createShow(showData);
      toast.success('Show created successfully with seats initialized');
      setShowModal(false);
      resetForm();
      await fetchShows();
    } catch (error) {
      console.error('Error creating show:', error);
      toast.error(error.response?.data || 'Failed to create show');
    }
  };

  const handleInitializeSeats = async (showId, showTitle) => {
    setInitializingShow(showId);
    try {
      await ownerAPI.initializeShowSeats(showId);
      toast.success(`Seats initialized successfully for "${showTitle}"`);
      await fetchShows();
    } catch (error) {
      console.error('Error initializing seats:', error);
      toast.error(error.response?.data || 'Failed to initialize seats');
    } finally {
      setInitializingShow(null);
    }
  };

  const handleDeleteShow = async (showId, showTitle) => {
    try {
      await ownerAPI.deleteShow(showId);
      toast.success(`Show "${showTitle}" deleted successfully`);
      setShowDeleteConfirm(null);
      await fetchShows();
    } catch (error) {
      console.error('Error deleting show:', error);
      toast.error(error.response?.data || 'Failed to delete show');
    }
  };

  const handleViewSeats = async (showId) => {
    try {
      const response = await ownerAPI.getShowSeats(showId);
      const seatsData = Array.isArray(response.data) ? response.data : [];
      
      if (seatsData.length === 0) {
        toast.error('No seats found for this show. Please initialize seats first.');
        return;
      }
      
      setSelectedShow({ id: showId, seats: seatsData });
      const prices = {};
      seatsData.forEach(seat => {
        if (seat && seat.seatNumber) {
          prices[seat.seatNumber] = seat.price;
        }
      });
      setSeatPrices(prices);
    } catch (error) {
      console.error('Error fetching seats:', error);
      toast.error('Failed to load seat information');
    }
  };

  const handleUpdateSeatPricing = async (showId) => {
    try {
      await ownerAPI.updateSeatPricing(showId, seatPrices);
      toast.success('Seat prices updated successfully');
      setSelectedShow(null);
    } catch (error) {
      console.error('Error updating prices:', error);
      toast.error(error.response?.data || 'Failed to update seat prices');
    }
  };

  const resetForm = () => {
    setFormData({
      movieId: '',
      screenId: '',
      startTime: '',
      endTime: '',
      price: 10
    });
  };

  return (
    <div className="show-management">
      <div className="container">
        <div className="management-header">
          <h1>Show Management</h1>
          <button 
            className="btn-primary" 
            onClick={() => {
              if (!selectedTheater) {
                toast.error('Please select a theater first');
                return;
              }
              if (movies.length === 0) {
                toast.error('Please add movies to this theater first');
                return;
              }
              if (screens.length === 0) {
                toast.error('Please add screens to this theater first');
                return;
              }
              resetForm();
              setShowModal(true);
            }}
            disabled={!selectedTheater}
          >
            + Schedule New Show
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
          <div className="shows-section">
            <div className="info-cards">
              <div className="info-card">
                <h3>Movies Available</h3>
                <p className="count">{Array.isArray(movies) ? movies.length : 0}</p>
                <small>Total movies in this theater</small>
              </div>
              <div className="info-card">
                <h3>Screens Available</h3>
                <p className="count">{Array.isArray(screens) ? screens.length : 0}</p>
                <small>Total screens in this theater</small>
              </div>
            </div>

            {Array.isArray(shows) && shows.length > 0 && (
              <div className="shows-list">
                <h2>Scheduled Shows</h2>
                <div className="shows-grid">
                  {shows.map(show => (
                    <div key={show.id} className="show-card">
                      <div className="show-info">
                        <h3>{show.movie?.title || 'Movie ID: ' + show.movie?.id}</h3>
                        <p><strong>Screen:</strong> {show.screen?.name || 'Screen ID: ' + show.screen?.id}</p>
                        <p><strong>Start:</strong> {new Date(show.startTime).toLocaleString()}</p>
                        <p><strong>End:</strong> {new Date(show.endTime).toLocaleString()}</p>
                        <p><strong>Base Price:</strong> ${show.price}</p>
                      </div>
                      <div className="show-actions">
                        <button 
                          className="btn-secondary"
                          onClick={() => handleViewSeats(show.id)}
                        >
                          View & Manage Seats
                        </button>
                        <button 
                          className="btn-initialize"
                          onClick={() => handleInitializeSeats(show.id, show.movie?.title)}
                          disabled={initializingShow === show.id}
                        >
                          {initializingShow === show.id ? 'Initializing...' : 'Initialize Seats'}
                        </button>
                        <button 
                          className="btn-danger"
                          onClick={() => setShowDeleteConfirm(show)}
                        >
                          Delete Show
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(!Array.isArray(shows) || shows.length === 0) && (
              <div className="no-data">
                <p>No shows scheduled yet. Click the button above to schedule your first show!</p>
              </div>
            )}
          </div>
        )}

        {showDeleteConfirm && (
          <div className="modal-overlay" onClick={() => setShowDeleteConfirm(null)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Confirm Delete</h2>
                <button className="close-btn" onClick={() => setShowDeleteConfirm(null)}>&times;</button>
              </div>
              <div className="delete-confirm-content">
                <p>Are you sure you want to delete the show:</p>
                <p className="show-title"><strong>"{showDeleteConfirm.movie?.title}"</strong></p>
                <p><strong>Screen:</strong> {showDeleteConfirm.screen?.name}</p>
                <p><strong>Date:</strong> {new Date(showDeleteConfirm.startTime).toLocaleDateString()}</p>
                <p><strong>Time:</strong> {new Date(showDeleteConfirm.startTime).toLocaleTimeString()} - {new Date(showDeleteConfirm.endTime).toLocaleTimeString()}</p>
                <p className="warning-text">⚠️ This action cannot be undone. All seat bookings for this show will be cancelled.</p>
              </div>
              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowDeleteConfirm(null)}
                >
                  Cancel
                </button>
                <button 
                  className="btn-danger" 
                  onClick={() => handleDeleteShow(showDeleteConfirm.id, showDeleteConfirm.movie?.title)}
                >
                  Yes, Delete Show
                </button>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal-overlay" onClick={() => setShowModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Schedule New Show</h2>
                <button className="close-btn" onClick={() => setShowModal(false)}>&times;</button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label>Select Movie *</label>
                  <select name="movieId" value={formData.movieId} onChange={handleInputChange} required>
                    <option value="">Choose a movie</option>
                    {Array.isArray(movies) && movies.map(movie => (
                      <option key={movie.id} value={movie.id}>
                        {movie.title} ({movie.language}) - {movie.duration} mins
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Select Screen *</label>
                  <select name="screenId" value={formData.screenId} onChange={handleInputChange} required>
                    <option value="">Choose a screen</option>
                    {Array.isArray(screens) && screens.map(screen => (
                      <option key={screen.id} value={screen.id}>
                        {screen.name} - {screen.totalSeats} seats
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Time *</label>
                    <input
                      type="datetime-local"
                      name="startTime"
                      value={formData.startTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Time *</label>
                    <input
                      type="datetime-local"
                      name="endTime"
                      value={formData.endTime}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Base Ticket Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleInputChange}
                    min="1"
                    step="0.5"
                    required
                  />
                  <small>This price will be overridden by seat-specific pricing if configured</small>
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn-primary">
                    Schedule Show
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {selectedShow && (
          <div className="modal-overlay" onClick={() => setSelectedShow(null)}>
            <div className="modal-content large" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <h2>Manage Show Seats</h2>
                <button className="close-btn" onClick={() => setSelectedShow(null)}>&times;</button>
              </div>
              <div className="seats-management">
                <div className="seat-pricing-grid">
                  <h3>Seat Pricing Configuration</h3>
                  <div className="seat-prices">
                    {Array.isArray(selectedShow.seats) && selectedShow.seats.map((seat) => (
                      <div key={seat.id} className="seat-price-item">
                        <label>{seat.seatNumber} ({seat.seatType})</label>
                        <input
                          type="number"
                          value={seatPrices[seat.seatNumber] || seat.price}
                          onChange={(e) => setSeatPrices({
                            ...seatPrices,
                            [seat.seatNumber]: parseFloat(e.target.value)
                          })}
                          step="0.5"
                          min="1"
                        />
                      </div>
                    ))}
                  </div>
                  <button 
                    className="btn-primary" 
                    onClick={() => handleUpdateSeatPricing(selectedShow.id)}
                  >
                    Update All Prices
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ShowManagement;