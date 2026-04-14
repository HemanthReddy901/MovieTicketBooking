package com.moviesBooking.security;

import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.moviesBooking.model.User;
import com.moviesBooking.repository.UserRepository;
@Service
public class CustomUserDetailsService implements UserDetailsService
{
	@Autowired
   private UserRepository userRepository;

	@Override
	public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
		 User user=userRepository.findByEmail(email).orElse(null);
		 if(!user.isEnabled())
		 {
			 throw new UsernameNotFoundException("User Account is Not Verified");
		 }
		 return UserPrincipal.create(user);	
	}
}
