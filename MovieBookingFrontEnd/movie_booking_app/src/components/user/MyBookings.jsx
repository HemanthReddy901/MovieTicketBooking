import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './MyBookings.css';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const response = await userAPI.getBookings();
      setBookings(response.data);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadReceipt = async (bookingId) => {
    try {
      const response = await userAPI.downloadReceipt(bookingId);
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `receipt-${bookingId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Error downloading receipt:', error);
    }
  };

  return (
    <div className="my-bookings">
      <div className="container">
        <h1 className="bookings-title">My Bookings</h1>
        
        {loading ? (
          <div className="loading-spinner">Loading...</div>
        ) : bookings.length === 0 ? (
          <div className="no-bookings">
            <p>You haven't made any bookings yet.</p>
            <Link to="/user/search" className="btn-primary">Browse Movies</Link>
          </div>
        ) : (
          <div className="bookings-grid">
            {bookings.map((booking) => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.show?.movie?.title}</h3>
                  <span className={`status-badge ${booking.status?.toLowerCase()}`}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>Booking ID:</strong> {booking.bookingReference}</p>
                  <p><strong>Theater:</strong> {booking.show?.theater?.name}</p>
                  <p><strong>Date:</strong> {new Date(booking.show?.startTime).toLocaleDateString()}</p>
                  <p><strong>Time:</strong> {new Date(booking.show?.startTime).toLocaleTimeString()}</p>
                  <p><strong>Seats:</strong> {booking.numberofSeats}</p>
                  <p><strong>Total Amount:</strong> ${booking.totalAmount}</p>
                  <p><strong>Booked On:</strong> {new Date(booking.bookingTime).toLocaleString()}</p>
                </div>
                <div className="booking-actions">
                  <button onClick={() => downloadReceipt(booking.id)} className="btn-secondary">
                    Download Receipt
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;