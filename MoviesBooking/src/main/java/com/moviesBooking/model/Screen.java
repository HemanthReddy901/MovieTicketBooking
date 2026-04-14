package com.moviesBooking.model;

import java.util.ArrayList;
import java.util.List;

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
@Table(name="screens")
@Data
public class Screen 
{
  @Id
  @GeneratedValue(strategy=GenerationType.IDENTITY)
  private Long id;
  @Column(nullable=false)
  private String name;
  @Column(name="total_seats")
  private Integer totalSeats;
  @Column(name="row_count")
  private Integer rows;
  @Column(name="column_count")
  private Integer columnCount;
  @ManyToOne
  @JoinColumn(name="theater_id")
  @JsonBackReference 
  @JsonIgnoreProperties({"screens", "movies", "shows", "owner"}) 
  private Theater theater;
  @OneToMany(mappedBy="screen", cascade=CascadeType.ALL)
  @JsonManagedReference  
  @JsonIgnoreProperties({"screen", "show"})
  private List<Seat> seats = new ArrayList<>();
}