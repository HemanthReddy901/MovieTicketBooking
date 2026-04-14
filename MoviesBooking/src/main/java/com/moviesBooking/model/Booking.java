package com.moviesBooking.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Table(name="Bookings")
@Data
public class Booking 
{
	@Id
	@GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long id;
	@ManyToOne
	@JoinColumn(name="user_id")
	  @JsonIgnoreProperties({"bookings", "password", "roles"})
	private User user;
	@ManyToOne
	@JoinColumn(name="show_id")
	 @JsonIgnoreProperties({"bookings", "seats"})  
	private Show show;
	@Column(unique=true)
	private String bookingReference;
	@Enumerated(EnumType.STRING)
	private BookingStatus status;
	private Integer numberOfSeats;
	private Double totalAmount;
	@OneToMany(mappedBy="booking", cascade = CascadeType.ALL, orphanRemoval = true)
	  @JsonIgnoreProperties("booking")  
	private List<BookedSeat> bookedSeats = new ArrayList<>();
	private String paymentIntentId;
	@Enumerated(EnumType.STRING)
	private PaymentStatus paymentStatus;
	@CreationTimestamp
	  @Column(updatable=false)
    private LocalDateTime createdAt;
	  @UpdateTimestamp
    private LocalDateTime updatedAt;
	  @CreationTimestamp
	  @Column(updatable=false)
    private LocalDateTime bookingTime;
}
