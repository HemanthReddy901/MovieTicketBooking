package com.moviesBooking.security;

import java.util.Arrays;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configuration.WebSecurityCustomizer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig 
{
  private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
  private final JwtAuthenticationFilter jwtAuthenticationFilter;
  private final CustomOAuth2UserService customOAuth2UserService;
  private final OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler;
  public SecurityConfig(JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint,
	    JwtAuthenticationFilter jwtAuthenticationFilter,
	    CustomOAuth2UserService customOAuth2UserService,
		OAuth2AuthenticationSuccessHandler oAuth2AuthenticationSuccessHandler) {
	
	this.jwtAuthenticationEntryPoint = jwtAuthenticationEntryPoint;
	this.jwtAuthenticationFilter = jwtAuthenticationFilter;
	this.customOAuth2UserService = customOAuth2UserService;
	this.oAuth2AuthenticationSuccessHandler = oAuth2AuthenticationSuccessHandler;
  }
  
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception
  {
	  http
	  .cors(cors -> cors.configurationSource(corsConfigurationSource()))
	  .csrf(csrf -> csrf.disable())
	  .exceptionHandling(ex -> ex.authenticationEntryPoint(jwtAuthenticationEntryPoint))
	  .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
	  .authorizeHttpRequests(auth -> auth
			    .requestMatchers("/api/auth/**", "/oauth2/**").permitAll()
			    .requestMatchers("/api/public/**").permitAll()
			    .requestMatchers("/api/theater-owner/**").hasRole("THEATER_OWNER")
			    .requestMatchers("/api/admin/**").hasRole("ADMIN")
			    .anyRequest().authenticated()
			)
	  .oauth2Login(oauth -> oauth
			  .authorizationEndpoint(auth -> auth.baseUri("/oauth2/authorize"))
			  .redirectionEndpoint(redir -> redir.baseUri("/oauth2/callback/*"))
			  .userInfoEndpoint(user -> user.userService(customOAuth2UserService))
			  .successHandler(oAuth2AuthenticationSuccessHandler)
			  );
	  http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
	  return http.build();
	 
  }
  
  @Bean
  public PasswordEncoder passwordEncoder()
  {
	  return new BCryptPasswordEncoder();
  }
  
  @Bean
  public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) throws Exception
  {
	  return authenticationConfiguration.getAuthenticationManager();
  }
  
  @Bean
  public CorsConfigurationSource corsConfigurationSource()
  {
	  CorsConfiguration configuration=new CorsConfiguration();
	  configuration.setAllowedOriginPatterns(Arrays.asList("*"));
	  configuration.setAllowedMethods(Arrays.asList("GET","POST","PUT","DELETE"));
	  configuration.setAllowedHeaders(Arrays.asList("*"));
	  configuration.setAllowCredentials(true);
	  UrlBasedCorsConfigurationSource source=new UrlBasedCorsConfigurationSource();
	  source.registerCorsConfiguration("/**", configuration);
	  return source;
  }
  @Bean
  public WebSecurityCustomizer webSecurityCustomizer() {
      return (web) -> web.ignoring().requestMatchers("/uploads/**");
  }
}
