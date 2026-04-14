import React, { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import './PaymentForm.css';

const PaymentForm = ({ amount, clientSecret, onSuccess, onError, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
        },
      });

      if (error) {
        console.error('Payment error:', error);
        onError(error.message);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        onSuccess(paymentIntent.id);
      }
    } catch (err) {
      console.error('Payment processing error:', err);
      onError('Payment processing failed. Please try again.');
    } finally {
      setProcessing(false);
    }
  };

  const cardElementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#424770',
        '::placeholder': {
          color: '#aab7c4',
        },
      },
      invalid: {
        color: '#9e2146',
      },
    },
  };

  return (
    <div className="payment-modal">
      <div className="payment-modal-content">
        <h3>Complete Payment</h3>
        <div className="payment-amount">
          <strong>Total Amount:</strong> ${amount}
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="card-element-container">
            <CardElement options={cardElementOptions} />
          </div>
          
          <div className="payment-buttons">
            <button 
              type="button" 
              onClick={onCancel}
              className="btn-cancel"
              disabled={processing}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={!stripe || processing}
              className="btn-pay"
            >
              {processing ? 'Processing...' : `Pay $${amount}`}
            </button>
          </div>
        </form>
        
        <p className="secure-note">
          🔒 Secure payment powered by Stripe
        </p>
      </div>
    </div>
  );
};

export default PaymentForm;