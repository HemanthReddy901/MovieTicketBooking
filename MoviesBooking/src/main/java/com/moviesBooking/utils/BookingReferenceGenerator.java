package com.moviesBooking.utils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Random;

public class BookingReferenceGenerator 
{
  private static final String PREFIX="BK";
  private static final Random random=new Random();
  public static String generate()
  {
	  LocalDateTime now = LocalDateTime.now();
	  String datePart=now.format(DateTimeFormatter.ofPattern("yyyymmdd"));
	  String timePart=now.format(DateTimeFormatter.ofPattern("HHmmss"));
	  int randomPart=random.nextInt(1000);
	  return PREFIX+datePart+timePart+String.format("%03d", randomPart);
  }
}
