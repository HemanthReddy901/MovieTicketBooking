package com.moviesBooking.security;

import java.io.IOException;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2AuthenticationSuccessHandler extends SimpleUrlAuthenticationSuccessHandler{
    @Autowired
	private JwtTokenProvider jwtTokenProvider;
    @Override
    public void onAuthenticationSuccess(HttpServletRequest request,HttpServletResponse response,Authentication authentication)
    throws IOException,ServletException
    {
    	  OAuth2User oAuth2User = (OAuth2User)authentication.getPrincipal();
    	  String token=jwtTokenProvider.generatedToken(authentication);
    	  String targetUrl=UriComponentsBuilder.fromUriString("http://localhost:3000/oauth2/redirect")
    			  .queryParam("token",token)
    			  .build().toUriString();
    	  getRedirectStrategy().sendRedirect(request, response, targetUrl);
    }
}
