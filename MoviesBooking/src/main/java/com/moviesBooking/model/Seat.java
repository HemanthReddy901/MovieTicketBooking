package com.moviesBooking.model;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="seats")
@Data
public class Seat 
{
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
	private String seatNumber;
	private SeatType seatType;
	private Double price;
	@ManyToOne
	@JoinColumn(name="screen_id",nullable = true)
	@JsonBackReference 
	@JsonIgnoreProperties({"seats", "shows", "theater"}) 
	private Screen screen;
	@ManyToOne
	@JoinColumn(name="show_id")
	@JsonBackReference
	@JsonIgnoreProperties({"seats", "bookings", "movie", "screen", "theater"})
	private Show show;
	@Enumerated(EnumType.STRING)
	private SeatStatus status;
}