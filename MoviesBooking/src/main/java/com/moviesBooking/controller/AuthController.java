package com.moviesBooking.controller;

import java.time.LocalDateTime;
import java.util.Collections;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moviesBooking.dto.JwtResponse;
import com.moviesBooking.dto.LoginRequest;
import com.moviesBooking.dto.SignupRequest;
import com.moviesBooking.model.Role;
import com.moviesBooking.model.User;
import com.moviesBooking.repository.UserRepository;
import com.moviesBooking.security.JwtTokenProvider;
import com.moviesBooking.services.EmailService;
import com.moviesBooking.utils.TokenGenerator;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins="http://localhost:5174")
public class AuthController 
{
	@Autowired
    private AuthenticationManager authenticationManager;
	@Autowired
	private UserRepository userRepository;
	@Autowired
	private PasswordEncoder passwordEncoder;
	@Autowired
	private JwtTokenProvider jwtTokenProvider;
	@Autowired
	  private EmailService emailService;
	//User Or Owner As To Authenticate First
	@PostMapping("/signin")
	public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest)
	{
		Authentication authentication=authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(loginRequest.getEmail(),loginRequest.getPassword()));
		SecurityContextHolder.getContext().setAuthentication(authentication);
		String jwt=jwtTokenProvider.generatedToken(authentication);
		User user=userRepository.findByEmail(loginRequest.getEmail()).orElseThrow(()->new RuntimeException("User Not Found"));
		return ResponseEntity.ok(new JwtResponse(jwt,user.getId(),user.getEmail(),user.getFullName(),Collections.singletonList(user.getRole().name())));
	}
	//Registering User Or Theater-Owner
	@PostMapping("/signup")
	public ResponseEntity<?> registerUser(@Valid @RequestBody SignupRequest signupRequest)
	{
		if(userRepository.existsByEmail(signupRequest.getEmail()))
		{
			return ResponseEntity.badRequest().body("Email Is Already Taken!");
		}
		//Create User Account
		User user=new User();
		user.setEmail(signupRequest.getEmail());
		user.setPassword(passwordEncoder.encode(signupRequest.getPassword()));
		user.setFullName(signupRequest.getFullName());
		user.setPhoneNumber(signupRequest.getPhoneNumber());
		
		//Set Role Based On Request
		if("THEATER_OWNER".equals(signupRequest.getRole()))
				{
			     user.setRole(Role.THEATER_OWNER);
				}
		else
		{
			user.setRole(Role.USER);
		}
		String token=TokenGenerator.generateToken();
		user.setVerificationToken(token);
		user.setVerificationTokenExpiry(LocalDateTime.now().plusHours(24));
		userRepository.save(user);
		//send Verification mail
		String verificationLink="http://localhost:8081/api/auth/verify?token="+token;
		emailService.sendVerificationEmail(user.getEmail(),verificationLink);
		return ResponseEntity.ok("User Registerd Successfully.Please Check Your Email For Verification Link");
	}
	//Verifying That User Is Real or Not Using Email
	@GetMapping("/verify")
	public ResponseEntity<?> verifyEmail(@RequestParam String token)
	{
		User user=userRepository.findByVerificationToken(token).orElseThrow(()->new RuntimeException("Invalid Verification Token!"));
		if(user.getVerificationTokenExpiry().isBefore(LocalDateTime.now()))
		{
			return ResponseEntity.badRequest().body("Verification Token Has Expired");
		}
		user.setEnabled(true);
		user.setVerificationToken(null);
		user.setVerificationTokenExpiry(null);
		userRepository.save(user);
		return ResponseEntity.ok("Email Verified Successfully. You Can Login Now");
	}

}

