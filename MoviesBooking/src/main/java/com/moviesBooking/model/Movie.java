package com.moviesBooking.model;

import java.time.LocalDate;
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
@Table(name="movies")
@Data
public class Movie 
{
   @Id
   @GeneratedValue(strategy=GenerationType.IDENTITY)
   private Long id;
   
   @Column(nullable=false)
   private String title;
   private String description;
   private String genre;
   private String language;
   private Integer duration;
   private LocalDate releaseDate;
   private LocalDate endDate;
   private String director;
   private String cast;
   private String trailerUrl;
   private String posterUrl;
   
   @ManyToOne
   @JoinColumn(name="theater_id")
   @JsonIgnoreProperties({"movies", "screens", "owner", "shows"})
   private Theater theater;
   
   @OneToMany(mappedBy = "movie", cascade = CascadeType.ALL)
   @JsonManagedReference
   @JsonIgnoreProperties("movie")
   private List<Show> shows = new ArrayList<>();
   
   @CreationTimestamp
   @Column(updatable=false)
   private LocalDateTime createdAt;
   
   @UpdateTimestamp
   private LocalDateTime updatedAt;
}