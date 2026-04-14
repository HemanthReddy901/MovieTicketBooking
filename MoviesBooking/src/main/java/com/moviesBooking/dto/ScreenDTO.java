package com.moviesBooking.dto;

import com.moviesBooking.model.Theater;

import lombok.Data;

@Data
public class ScreenDTO 
{
   private String name;
   private Integer totalSeats;
   private Integer rows;
   private Integer columns;
   private Long theaterId; 
   
}
