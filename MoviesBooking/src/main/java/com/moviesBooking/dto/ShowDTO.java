package com.moviesBooking.dto;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class ShowDTO 
{
  private Long id;
  private Long movieId;
  private Long screenId;
  private LocalDateTime startTime;
  private LocalDateTime endTime;
  private Double price;
  
}
