package com.moviesBooking.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TheaterDTO 
{
  private Long id;
  @NotBlank
  private String name;
  @NotBlank
  private String location;
  private String address;
  private String city;
  private String state;
  private String pincode;
  private String contactNumber;
  private String email;
  @NotBlank
  private Integer totalScreens;
}
