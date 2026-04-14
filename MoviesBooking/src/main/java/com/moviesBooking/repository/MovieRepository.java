package com.moviesBooking.repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Movie;
import com.moviesBooking.model.Theater;

@Repository
public interface MovieRepository extends JpaRepository<Movie,Long>{
    List<Movie> findByTheater(Theater theater);
    List<Movie> findByGenre(String genre);
    List<Movie> findByLanguage(String Language);
    List<Movie> findByReleaseDateLessThanEqualAndEndDateGreaterThanEqual(LocalDate date1,LocalDate date2);
    @Query("SELECT m FROM Movie m WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(m.genre) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
    List<Movie> searchMovies(@Param("searchTerm") String searchTerm);
    Optional<Movie> findByTitle(String title);
}
