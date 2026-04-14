import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { userAPI } from '../../services/api';
import './UserDashboard.css';

const UserDashboard = () => {
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
    <div className="user-dashboard">
      <div className="container">
        <h1 className="dashboard-title">My Dashboard</h1>
        
        <div className="dashboard-stats">
          <div className="stat-card">
            <h3>Total Bookings</h3>
            <p className="stat-number">{bookings.length}</p>
          </div>
          <div className="stat-card">
            <h3>Total Spent</h3>
            <p className="stat-number">
              ${bookings.reduce((sum, b) => sum + b.totalAmount, 0).toFixed(2)}
            </p>
          </div>
        </div>

        <div className="recent-bookings">
          <h2>Recent Bookings</h2>
          {loading ? (
            <div className="loading-spinner">Loading...</div>
          ) : bookings.length === 0 ? (
            <div className="no-bookings">
              <p>No bookings yet.</p>
              <Link to="/user/search" className="btn-primary">Book Now</Link>
            </div>
          ) : (
            <div className="bookings-list">
              {bookings.slice(0, 5).map((booking) => (
                <div key={booking.id} className="booking-card">
                  <div className="booking-info">
                    <h3>{booking.show?.movie?.title}</h3>
                    <p>Theater: {booking.show?.theater?.name}</p>
                    <p>Date: {new Date(booking.bookingTime).toLocaleDateString()}</p>
                    <p>Seats: {booking.numberofSeats}</p>
                    <p>Total: ${booking.totalAmount}</p>
                    <p>Status: <span className={`status-${booking.status?.toLowerCase()}`}>
                      {booking.status}
                    </span></p>
                  </div>
                  <div className="booking-actions">
                    <Link to={`/user/bookings/${booking.id}`} className="btn-secondary">
                      View Details
                    </Link>
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
    </div>
  );
};

export default UserDashboard;