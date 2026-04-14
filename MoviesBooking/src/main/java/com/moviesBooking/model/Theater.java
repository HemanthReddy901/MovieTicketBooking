package com.moviesBooking.model;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

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
@Table(name="theaters")
@Data
public class Theater 
{
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  private String name;
  private String location;
  private String address;
  private String city;
  private String state;
  private String pincode;
  private String contactNumber;
  private String email;
  private Integer totalScreens;
  @ManyToOne
  @JoinColumn(name="ownerid")
  @JsonIgnoreProperties({"theaters", "password", "verificationToken"})
  private User owner;
  @OneToMany(mappedBy="theater", cascade=CascadeType.ALL)
  @JsonManagedReference
  @JsonIgnoreProperties({"theater", "shows"}) 
  private List<Screen> screens = new ArrayList<>();
  @CreationTimestamp
  @Column(updatable=false)
  private LocalDateTime createdAt;
  @UpdateTimestamp
  private LocalDateTime updatedAt;
}