package com.moviesBooking.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Booking;
import com.moviesBooking.model.BookingStatus;
import com.moviesBooking.model.Show;
import com.moviesBooking.model.User;

@Repository
public interface BookingRepository extends JpaRepository<Booking,Long>{
  List<Booking> findByUser(User user);
  Optional<Booking> findByBookingReference(String bookingReference);
  
  List<Booking> findByUserOrderByBookingTimeDesc(User user);
  List<Booking> findByShow(Show show);
  List<Booking> findByShowAndStatus(Show show,BookingStatus status);
  Optional<Booking> findByPaymentIntentId(String paymentIntentId);
  
}
