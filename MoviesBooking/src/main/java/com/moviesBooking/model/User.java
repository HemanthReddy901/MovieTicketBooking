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
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name="users")
@Data
@NoArgsConstructor
public class User 
{
	@Id
    @GeneratedValue(strategy=GenerationType.IDENTITY)
    private Long Id;
	@Column(unique=true, nullable=false)
	private String email;
	@Column(nullable=false)
	private String password;
	private String fullName;
	private String phoneNumber;
	private boolean isEnabled=false;
	private String verificationToken;
	private LocalDateTime verificationTokenExpiry;
	@Enumerated(EnumType.STRING)
	private Role role;
	private String resetPasswordToken;
	private LocalDateTime resetPasswordTokenExpiry;
	@Column(name="google_id")
	private String googleId;
	private String profilePicture;
	@OneToMany(mappedBy="user",cascade=CascadeType.ALL)
	@JsonIgnoreProperties("user") 
	private List<Booking> bookings=new ArrayList<>();
	@CreationTimestamp
	  @Column(updatable=false)
	private LocalDateTime createdAt;
	  @UpdateTimestamp
	private LocalDateTime updatedAt;
	@PrePersist
	protected void onCreate()
	{
		createdAt=LocalDateTime.now();
		updatedAt=LocalDateTime.now();
	}
	@PreUpdate
	protected void onUpdate()
	{
		updatedAt=LocalDateTime.now();
	}
	
	
    
}
