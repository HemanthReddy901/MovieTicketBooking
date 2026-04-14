package com.moviesBooking.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="booked_seats")
@Data
public class BookedSeat
{
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
	@ManyToOne
	@JoinColumn(name="booking_id")
    @JsonIgnoreProperties("bookedSeats")  
	private Booking booking;
	@ManyToOne
	@JoinColumn(name="seat_id")
	 @JsonIgnoreProperties({"bookedSeats", "show"}) 
	private Seat seat;
	private Double price;
}
