package com.moviesBooking.security;

import java.util.Map;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.oauth2.client.userinfo.DefaultOAuth2UserService;
import org.springframework.security.oauth2.client.userinfo.OAuth2UserRequest;
import org.springframework.security.oauth2.core.OAuth2AuthenticationException;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.stereotype.Component;

import com.moviesBooking.model.Role;
import com.moviesBooking.model.User;
import com.moviesBooking.repository.UserRepository;

@Component
public class CustomOAuth2UserService extends DefaultOAuth2UserService 
{
	@Autowired
  private UserRepository userRepository;
	@Override
	public OAuth2User loadUser(OAuth2UserRequest userRequest) throws OAuth2AuthenticationException
	{
		OAuth2User oAuth2User=super.loadUser(userRequest);
		Map<String,Object> attributes=oAuth2User.getAttributes();
		String email=(String)attributes.get("email");
		String name=(String)attributes.get("name");
		String googleId=(String)attributes.get("sub");
		Optional<User> existingUser=userRepository.findByEmail(email);
		if(existingUser.isEmpty())
		{
			//Create a New User
			User user=new User();
			user.setEmail(email);
			user.setFullName(name);
			user.setGoogleId(googleId);
			user.setEnabled(true);
			user.setRole(Role.USER);
			userRepository.save(user);			
		}
		else
		{
			//Update Existing User's googleId
			User user=existingUser.get();
			if(user.getGoogleId() == null)
			{
				user.setGoogleId(googleId);
				userRepository.save(user);
			}
		}
		return oAuth2User;
		
	}
}
