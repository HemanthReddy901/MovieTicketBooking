package com.moviesBooking.dto;

import java.util.List;

import lombok.Data;

@Data
public class BookingRequest 
{
  private Long showId;
  private List<Long> seatIds;
  private String paymentMethod;
  private String paymentIntentId;
}
