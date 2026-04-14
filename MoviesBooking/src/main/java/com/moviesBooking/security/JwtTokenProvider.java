package com.moviesBooking.security;

import java.security.Key;
import java.util.Date;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import io.jsonwebtoken.security.Keys;
import io.jsonwebtoken.*;
@Component
public class JwtTokenProvider {
          @Value("${jwt.secret}")
          private String jwtSecret;
          @Value("${jwt.expiration}")
          private int jwtExpiration;
          private Key key()
          {
        	  return Keys.hmacShaKeyFor(jwtSecret.getBytes());
          }
          
          public String generatedToken(Authentication authentication)
          {
        	    UserPrincipal userPrincipal=(UserPrincipal)authentication.getPrincipal();
        	    Date now=new Date();
        	    Date expiryDate=new Date(now.getTime()+jwtExpiration);
        	    return Jwts.builder()
        	    		.setSubject(userPrincipal.getUsername())
        	    		.setIssuedAt(now)
        	    		.setExpiration(expiryDate)
        	    		.signWith(key())
        	    		.compact();
          }
          public String getUserNameFromToken(String token)
          {
        	  Claims claims=Jwts.parserBuilder()
        			  .setSigningKey(key())
        			  .build()
        			  .parseClaimsJws(token)
        			  .getBody();
        	  return claims.getSubject();
          }
          public boolean validateToken(String token)
          {
        	  try {
        		  Jwts.parserBuilder().setSigningKey(key()).build().parse(token);
        		  return true;
        	  }
        	  catch(MalformedJwtException | ExpiredJwtException | UnsupportedJwtException | IllegalArgumentException ex)
        	  {
        		  return false;
        	  }
          }
}
