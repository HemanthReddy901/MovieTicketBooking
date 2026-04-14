package com.moviesBooking.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.moviesBooking.model.User;

@Repository
public interface UserRepository extends JpaRepository<User,Long>
{
	
  Optional<User> findByEmail(String email);
  Optional<User> findByVerificationToken(String token);
  Optional<User> findByResetPasswordToken(String token);
  Optional<User> findByGoogleId(String googleId);
  boolean existsByEmail(String email);
}
