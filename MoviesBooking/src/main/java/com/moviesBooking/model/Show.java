package com.moviesBooking.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonManagedReference;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="shows")
@Data
public class Show 
{
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
	@ManyToOne
	@JoinColumn(name="movie_id")
	  @JsonIgnoreProperties({"shows"})
	private Movie movie;
	@ManyToOne
	@JoinColumn(name="screen_id")
	 @JsonIgnoreProperties({"shows", "seats"}) 
	private Screen screen;
	@ManyToOne
	@JoinColumn(name="theater_id")
	 @JsonIgnoreProperties({"movies", "screens", "shows", "owner"})
	private Theater theater;
	private LocalDateTime startTime;
	private LocalDateTime endTime;
	private Double price;
	@OneToMany(mappedBy="show", cascade=CascadeType.ALL)
	@JsonManagedReference  // Parent side with Booking
	 @JsonIgnoreProperties("show") 
	private List<Booking> bookings = new ArrayList<>();
	@OneToMany(mappedBy="show", cascade=CascadeType.ALL)
	 @JsonIgnoreProperties({"show", "screen"})  
	private List<Seat> seats = new ArrayList<>();
	@CreationTimestamp
	@Column(updatable=false)
	private LocalDateTime createdAt;
	@UpdateTimestamp
	private LocalDateTime updatedAt;
}