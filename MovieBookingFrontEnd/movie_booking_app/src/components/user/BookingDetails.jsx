import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './BookingDetails.css';

const BookingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBookingDetails();
  }, [id]);

  const fetchBookingDetails = async () => {
    try {
      setLoading(true);
      const response = await userAPI.getBookingDetails(id);
      console.log('Booking details:', response.data);
      setBooking(response.data);
    } catch (error) {
      console.error('Error fetching booking details:', error);
      setError('Failed to load booking details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async () => {
    try {
      const response = await userAPI.downloadReceipt(id);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${booking.bookingReference || id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  const cancelBooking = async () => {
    if (window.confirm('Are you sure you want to cancel this booking?')) {
      try {
        await userAPI.cancelBooking(id);
        alert('Booking cancelled successfully!');
        navigate('/user/bookings');
      } catch (error) {
        console.error('Error cancelling booking:', error);
        alert('Failed to cancel booking. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Invalid Date';
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    if (!timeString) return 'N/A';
    const date = new Date(timeString);
    if (isNaN(date.getTime())) return timeString;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };


  const getSeatNumbers = () => {
    if (booking.bookedSeats && booking.bookedSeats.length > 0) {
      return booking.bookedSeats.map(seat => seat.seat?.seatNumber || seat.seatNumber).join(', ');
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
        <Link to="/user/bookings" className="btn-primary">Back to Bookings</Link>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="not-found-container">
        <p>Booking not found</p>
        <Link to="/user/bookings" className="btn-primary">Back to Bookings</Link>
      </div>
    );
  }

  return (
    <div className="booking-details-container">
      <div className="container">
        <div className="booking-header">
          <Link to="/user/bookings" className="back-link">← Back to My Bookings</Link>
          <h1>Booking Details</h1>
          <p className="booking-id">Booking ID: #{booking.id}</p>
          <p className="booking-ref">Reference: {booking.bookingReference}</p>
        </div>

        <div className="booking-details-card">
          <div className="booking-status-section">
            <span className={`status-badge status-${booking.status?.toLowerCase()}`}>
              {booking.status}
            </span>
            <span className={`status-badge status-${booking.paymentStatus?.toLowerCase()}`}>
              Payment: {booking.paymentStatus}
            </span>
            <p className="booking-date">
              Booked on: {formatDate(booking.bookingTime)} at {formatTime(booking.bookingTime)}
            </p>
          </div>

          <div className="movie-info-section">
            <h2>Movie Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Movie Title:</label>
                <p>{booking.show?.movie?.title || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Language:</label>
                <p>{booking.show?.movie?.language || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Genre:</label>
                <p>{booking.show?.movie?.genre || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Duration:</label>
                <p>{booking.show?.movie?.duration || 'N/A'} mins</p>
              </div>
            </div>
          </div>

          <div className="theater-info-section">
            <h2>Theater Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Theater Name:</label>
                <p>{booking.show?.theater?.name || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Location:</label>
                <p>{booking.show?.theater?.location || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Screen:</label>
                <p>{booking.show?.screen?.name || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="show-info-section">
            <h2>Show Details</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Show Date:</label>
                <p>{formatDate(booking.show?.startTime)}</p>
              </div>
              <div className="info-item">
                <label>Show Time:</label>
                <p>{formatTime(booking.show?.startTime)}</p>
              </div>
              <div className="info-item">
                <label>End Time:</label>
                <p>{formatTime(booking.show?.endTime)}</p>
              </div>
            </div>
          </div>

          <div className="booking-info-section">
            <h2>Booking Information</h2>
            <div className="info-grid">
              <div className="info-item">
                <label>Number of Seats:</label>
                <p>{booking.numberOfSeats || booking.numberofSeats || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Seat Numbers:</label>
                <p className="seat-numbers">{getSeatNumbers()}</p>
              </div>
              <div className="info-item">
                <label>Price per Seat:</label>
                <p>${booking.show?.price || 'N/A'}</p>
              </div>
              <div className="info-item">
                <label>Total Amount:</label>
                <p className="total-amount">${booking.totalAmount?.toFixed(2) || 'N/A'}</p>
              </div>
            </div>
          </div>

          <div className="booking-actions-section">
            <button onClick={downloadReceipt} className="btn-primary">
              Download Receipt
            </button>
            {booking.status === 'CONFIRMED' && (
              <button onClick={cancelBooking} className="btn-danger">
                Cancel Booking
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingDetails;