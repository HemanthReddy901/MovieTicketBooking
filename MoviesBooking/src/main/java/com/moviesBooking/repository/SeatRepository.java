package com.moviesBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Screen;
import com.moviesBooking.model.Seat;
import com.moviesBooking.model.SeatStatus;
import com.moviesBooking.model.Show;
@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {

    List<Seat> findByShow(Show show);

    List<Seat> findByShowAndStatus(Show show, SeatStatus status);

    @Modifying
    @Query("update Seat s set s.status = 'BOOKED' where s.id in :seatIds and s.status = 'AVAILABLE'")
    int bookSeats(@Param("seatIds") List<Long> seatIds);

    List<Seat> findByScreen(Screen screen);

    List<Seat> findByShowAndSeatNumber(Show show, String seatNumber);

    @Modifying
    @Query("update Seat s set s.status = 'AVAILABLE' where s.id in :seatIds and s.status = 'BOOKED'")
    int releaseSeats(@Param("seatIds") List<Long> seatIds);
    
    List<Seat> findByScreenAndShowIsNull(Screen screen);
}