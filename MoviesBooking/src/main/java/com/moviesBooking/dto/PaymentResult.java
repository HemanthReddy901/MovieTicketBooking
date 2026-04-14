package com.moviesBooking.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class PaymentResult 
{
  private boolean isSuccess;
  private String message;
  private String paymentIntentId;
}
