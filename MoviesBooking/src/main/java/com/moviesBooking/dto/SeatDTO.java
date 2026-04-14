package com.moviesBooking.dto;

import lombok.Data;

@Data
public class SeatDTO
{
  private Long id;
  private String seatNumber;
  private String seatType;
  private Double price;
  private String status;
}
