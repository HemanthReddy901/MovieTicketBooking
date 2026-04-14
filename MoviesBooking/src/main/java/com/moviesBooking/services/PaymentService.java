package com.moviesBooking.services;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.moviesBooking.dto.PaymentResult;
import com.stripe.Stripe;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;

@Service
public class PaymentService 
{
	@Value("${stripe.api.key}")
    private String stripeApiKey;
	public PaymentIntent createPaymentIntent(double amount,String currency,String description)
	{
		try {
	  Stripe.apiKey=stripeApiKey;
	  PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
	  .setAmount((long)(amount*100))
	  .setCurrency(currency)
	  .setDescription(description)
	  .build();
	 return PaymentIntent.create(params);
	}
		catch(StripeException e)
		{
			throw new RuntimeException("Failed to create Payment Intent ",e);
		}
	}
	
	public PaymentResult processPayment(String paymentIntentId, double amount) {
	    try {
	        Stripe.apiKey = stripeApiKey;

	        PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

	       
	        if ("succeeded".equals(paymentIntent.getStatus()) &&
	            paymentIntent.getAmount() == (long)(amount * 100)) {

	            return new PaymentResult(true, "Payment Successful", paymentIntent.getId());
	        } else {
	            return new PaymentResult(false, "Payment not completed or amount mismatch", null);
	        }

	    } catch (StripeException e) {
	        return new PaymentResult(false, e.getMessage(), null);
	    }
	}
	
}
