package com.moviesBooking.dto;

import java.time.LocalDate;

import org.springframework.web.multipart.MultipartFile;

import lombok.Data;

@Data
public class MovieDTO
{
   private Long id;
   private String title;
   private String description;
   private String genre;
   private String language;
   private Integer duration;
   private LocalDate releaseDate;
   private LocalDate endDate;
   private MultipartFile poster;
   private String trailerUrl;
   private String director;
   private String cast;
   private Long theaterId;
}
