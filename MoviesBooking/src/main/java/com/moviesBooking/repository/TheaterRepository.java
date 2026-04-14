package com.moviesBooking.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.Theater;
import com.moviesBooking.model.User;

@Repository
public interface TheaterRepository extends JpaRepository<Theater,Long>{
    
	List<Theater> findByOwner(User user);
	List<Theater> findByCity(String city);
	@Query("SELECT t FROM Theater t WHERE LOWER(t.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR LOWER(t.city) LIKE LOWER(CONCAT('%', :searchTerm, '%'))")
	List<Theater> searchTheater(@Param("searchTerm") String searchTerm);}
