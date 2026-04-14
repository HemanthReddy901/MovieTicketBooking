import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { userAPI } from '../../services/api';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import PaymentForm from './PaymentForm';
import toast from 'react-hot-toast';
import './BookingPage.css';
//Your Api Key
const stripePromise = loadStripe('Enter Your Stripe Api key');

const BookingPage = () => {
  const { showId } = useParams();
  const navigate = useNavigate();
  const [show, setShow] = useState(null);
  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookingInProgress, setBookingInProgress] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    fetchShowAndSeats();
  }, [showId]);

  const fetchShowAndSeats = async () => {
    try {
      const showResponse = await userAPI.getShowDetails(showId);
      setShow(showResponse.data);
    
      const seatsResponse = await userAPI.getShowSeats(showId);
      const seatsData = seatsResponse.data;
      const seatsArray = Array.isArray(seatsData) ? seatsData : (seatsData.seats || []);
      setSeats(seatsArray);
      
    } catch (error) {
      console.error('Error fetching show details:', error);
      toast.error('Failed to load show details');
      navigate('/user/search');
    } finally {
      setLoading(false);
    }
  };

  const handleSeatSelect = (seat) => {
    if (seat.status !== 'AVALIABLE') {
      if (seat.status === 'BOOKED') {
        toast.error(`Seat ${seat.seatNumber} is already booked`);
      } else if (seat.status === 'BLOCKED') {
        toast.error(`Seat ${seat.seatNumber} is temporarily blocked`);
      }
      return;
    }
    
    if (selectedSeats.find(s => s.id === seat.id)) {
      setSelectedSeats(selectedSeats.filter(s => s.id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat]);
    }
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0).toFixed(2);
  };

  const handleProceedToPayment = async () => {
    if (selectedSeats.length === 0) {
      toast.error('Please select at least one seat');
      return;
    }

    setBookingInProgress(true);
    
    try {
      // Create Payment Intent on backend
      const paymentIntentData = {
        showIds: parseInt(showId),
        seatIds: selectedSeats.map(s => s.id)
      };
      
      const paymentIntentResponse = await userAPI.createPaymentIntent(paymentIntentData);
      const { clientSecret, paymentIntentId, amount } = paymentIntentResponse.data;
      
      setPaymentDetails({
        clientSecret,
        paymentIntentId,
        amount: amount.toFixed(2)
      });
      
      setShowPaymentModal(true);
      
    } catch (error) {
      console.error('Failed to create payment intent:', error);
      toast.error('Failed to initialize payment. Please try again.');
    } finally {
      setBookingInProgress(false);
    }
  };

  const handlePaymentSuccess = async (paymentIntentId) => {
    try {
      // Create Booking after successful payment
      const bookingData = {
        showId: parseInt(showId),
        seatIds: selectedSeats.map(s => s.id),
        paymentIntentId: paymentIntentId
      };
      
      const bookingResponse = await userAPI.createBooking(bookingData);
      
      toast.success('Booking confirmed successfully!');
      setShowPaymentModal(false);
      navigate(`/user/bookings/${bookingResponse.data.id}`);
      
    } catch (error) {
      console.error('Booking creation failed:', error);
      toast.error('Payment succeeded but booking failed. Please contact support.');
    }
  };

  const handlePaymentError = (errorMessage) => {
    toast.error(`Payment failed: ${errorMessage}`);
    setShowPaymentModal(false);
  };

  const handlePaymentCancel = () => {
    setShowPaymentModal(false);
    toast.info('Payment cancelled');
  };

  const getSeatClass = (seat) => {
    if (selectedSeats.find(s => s.id === seat.id)) return 'selected';
    switch(seat.status) {
      case 'AVALIABLE': return 'available';
      case 'BOOKED': return 'booked';
      case 'BLOCKED': return 'blocked';
      default: return 'available';
    }
  };

  const getSeatTypeColor = (seatType) => {
    switch(seatType) {
      case 'PLATINUM': return 'platinum';
      case 'GOLD': return 'gold';
      case 'SILVER': return 'silver';
      default: return '';
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading show details and seat layout...</p>
      </div>
    );
  }

  if (!show) {
    return (
      <div className="error-container">
        <h2>Show not found</h2>
        <button onClick={() => navigate('/user/search')} className="btn-primary">
          Back to Search
        </button>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="booking-header">
          <h1>Select Your Seats</h1>
          <div className="movie-info-card">
            <h2>{show.movie?.title}</h2>
            <div className="movie-details">
              <p><strong>Theater:</strong> {show.theater?.name}</p>
              <p><strong>Screen:</strong> {show.screen?.name}</p>
              <p><strong>Date:</strong> {new Date(show.startTime).toLocaleDateString()}</p>
              <p><strong>Time:</strong> {new Date(show.startTime).toLocaleTimeString()}</p>
              <p><strong>Language:</strong> {show.movie?.language}</p>
              <p><strong>Genre:</strong> {show.movie?.genre}</p>
            </div>
          </div>
        </div>

        <div className="seating-layout">
          <div className="screen-display">
            <div className="screen">SCREEN</div>
            <div className="screen-label">THIS WAY TO SCREEN</div>
          </div>
          
          <div className="seats-container">
            <div className="seats-grid">
              {Array.isArray(seats) && seats.map((seat) => (
                <button
                  key={seat.id}
                  className={`seat ${getSeatClass(seat)} ${getSeatTypeColor(seat.seatType)}`}
                  onClick={() => handleSeatSelect(seat)}
                  disabled={seat.status !== 'AVALIABLE'}
                  title={`Seat ${seat.seatNumber} - ${seat.seatType} - $${seat.price}`}
                >
                  <span className="seat-number">{seat.seatNumber}</span>
                  <span className="seat-price">${seat.price}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="seat-legend">
          <div className="legend-title">Seat Legend</div>
          <div className="legend-items">
            <div className="legend-item">
              <div className="seat-demo available-demo"></div>
              <span>Available</span>
              <small>Click to select</small>
            </div>
            <div className="legend-item">
              <div className="seat-demo selected-demo"></div>
              <span>Selected</span>
              <small>Your choice</small>
            </div>
            <div className="legend-item">
              <div className="seat-demo booked-demo"></div>
              <span>Booked</span>
              <small>Already taken</small>
            </div>
            <div className="legend-item">
              <div className="seat-demo blocked-demo"></div>
              <span>Blocked</span>
              <small>Temporarily unavailable</small>
            </div>
          </div>
          <div className="seat-type-legend">
            <div className="legend-item">
              <div className="seat-demo platinum-demo"></div>
              <span>Platinum</span>
              <small>$15</small>
            </div>
            <div className="legend-item">
              <div className="seat-demo gold-demo"></div>
              <span>Gold</span>
              <small>$12</small>
            </div>
            <div className="legend-item">
              <div className="seat-demo silver-demo"></div>
              <span>Silver</span>
              <small>$10</small>
            </div>
          </div>
        </div>

        <div className="booking-summary">
          <div className="summary-header">
            <h3>Booking Summary</h3>
            <button 
              className="clear-seats-btn"
              onClick={() => setSelectedSeats([])}
              disabled={selectedSeats.length === 0}
            >
              Clear All
            </button>
          </div>
          
          <div className="summary-details">
            <div className="selected-seats-info">
              <p><strong>Selected Seats:</strong></p>
              {selectedSeats.length > 0 ? (
                <div className="selected-seats-list">
                  {selectedSeats.map(seat => (
                    <span key={seat.id} className="selected-seat-tag">
                      {seat.seatNumber} (${seat.price})
                    </span>
                  ))}
                </div>
              ) : (
                <p className="no-seats">No seats selected</p>
              )}
            </div>
            
            <div className="price-breakdown">
              <div className="price-row">
                <span>Ticket Price:</span>
                <span>${calculateTotal()}</span>
              </div>
              <div className="price-row">
                <span>Convenience Fee:</span>
                <span>$0.00</span>
              </div>
              <div className="price-row total">
                <span>Total Amount:</span>
                <span>${calculateTotal()}</span>
              </div>
            </div>
          </div>
          
          <button 
            className="proceed-btn"
            onClick={handleProceedToPayment}
            disabled={selectedSeats.length === 0 || bookingInProgress}
          >
            {bookingInProgress ? (
              <>
                <span className="spinner-small"></span>
                Initializing Payment...
              </>
            ) : (
              `Proceed to Payment ($${calculateTotal()})`
            )}
          </button>
          
          <p className="payment-note">
            * Payment will be processed securely via Stripe
          </p>
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && paymentDetails && (
        <Elements stripe={stripePromise}>
          <PaymentForm
            amount={paymentDetails.amount}
            clientSecret={paymentDetails.clientSecret}
            onSuccess={handlePaymentSuccess}
            onError={handlePaymentError}
            onCancel={handlePaymentCancel}
          />
        </Elements>
      )}
    </div>
  );
};

export default BookingPage;