package com.moviesBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Screen;
import com.moviesBooking.model.Theater;

@Repository
public interface ScreenRepository extends JpaRepository<Screen,Long>{
  List<Screen> findByTheater(Theater theater);
}
