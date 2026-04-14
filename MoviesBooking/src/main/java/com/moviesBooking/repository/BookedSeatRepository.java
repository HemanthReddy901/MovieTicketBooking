package com.moviesBooking.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.BookedSeat;

@Repository
public interface BookedSeatRepository extends JpaRepository<BookedSeat,Long>{

}
