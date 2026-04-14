package com.moviesBooking.repository;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Movie;
import com.moviesBooking.model.Screen;
import com.moviesBooking.model.Show;
import com.moviesBooking.model.Theater;
@Repository
public interface ShowRepository extends JpaRepository<Show, Long> {

    List<Show> findByMovie(Movie movie);
    List<Show> findByTheater(Theater theater);
    List<Show> findByScreen(Screen screen);
    List<Show> findByStartTimeBetween(LocalDateTime start, LocalDateTime end);
    List<Show> findByMovieAndStartTimeBetween(Movie movie, LocalDateTime start, LocalDateTime end);

    @Query("SELECT s FROM Show s WHERE s.theater.city = :city AND s.startTime >= :date")
    List<Show> findByCityAndDate(@Param("city") String city,@Param("date") LocalDateTime date);

    @Query("SELECT s FROM Show s WHERE LOWER(s.movie.title) LIKE LOWER(CONCAT('%', :moviename, '%')) AND s.startTime >= :date")
    List<Show> findByMovieNameAndDate(@Param("moviename") String moviename,@Param("date") LocalDateTime date);
    
    @Query("SELECT DISTINCT s FROM Show s " +
           "LEFT JOIN FETCH s.movie m " +
           "LEFT JOIN FETCH s.theater t " +
           "LEFT JOIN FETCH s.screen sc " +
           "WHERE LOWER(t.city) = LOWER(:city) " +
           "AND LOWER(m.title) LIKE LOWER(CONCAT('%', :movieName, '%')) " +
           "AND s.startTime BETWEEN :startDate AND :endDate")
    List<Show> findByCityAndMovieNameAndDate(@Param("city") String city,@Param("movieName") String movieName,@Param("startDate") LocalDateTime startDate,@Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT s FROM Show s " +
           "LEFT JOIN FETCH s.movie m " +
           "LEFT JOIN FETCH s.theater t " +
           "LEFT JOIN FETCH s.screen sc " +
           "WHERE LOWER(t.city) = LOWER(:city) " +
           "AND s.startTime BETWEEN :startDate AND :endDate")
    List<Show> findByCityAndDate(@Param("city") String city,@Param("startDate") LocalDateTime startDate,@Param("endDate") LocalDateTime endDate);
    
    @Query("SELECT DISTINCT s FROM Show s " +
           "LEFT JOIN FETCH s.movie m " +
           "LEFT JOIN FETCH s.theater t " +
           "LEFT JOIN FETCH s.screen sc " +
           "WHERE LOWER(m.title) LIKE LOWER(CONCAT('%', :movieName, '%')) " +
           "AND s.startTime BETWEEN :startDate AND :endDate")
    List<Show> findByMovieNameAndDate(@Param("movieName") String movieName,@Param("startDate") LocalDateTime startDate,@Param("endDate") LocalDateTime endDate);
}