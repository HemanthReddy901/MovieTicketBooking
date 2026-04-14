package com.moviesBooking.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import lombok.Data;

@Data
public class MovieResponseDTO {
    private Long id;
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
    private Long theaterId;
    private String theaterName;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}