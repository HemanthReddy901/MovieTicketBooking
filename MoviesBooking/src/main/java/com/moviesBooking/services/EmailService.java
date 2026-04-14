package com.moviesBooking.services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import com.moviesBooking.model.BookedSeat;
import com.moviesBooking.model.Booking;
import com.moviesBooking.model.Show;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;

@Service
public class EmailService 
{
  @Autowired
  private JavaMailSender mailSender;
  @Autowired
  private TemplateEngine templateEngine;
  public void sendVerificationEmail(String to,String verificationLink)
  {
	  try {
	  MimeMessage message=mailSender.createMimeMessage();
	  MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");
	  Context context=new Context();
	  context.setVariable("verificationLink", verificationLink);
	  String htmlContent = templateEngine.process("email/verification", context);
	  helper.setTo(to);
	  helper.setSubject("Verify your email-Movie Ticket Booked");
	  helper.setText(htmlContent,true);
	  mailSender.send(message);
	  
	  }
	  catch(MessagingException e)
	  {
		throw new RuntimeException("Failed to Send Email",e);  
	  }
  }
  public void sendBookingConfirmation(String to, Booking booking)
  {
      try {
          MimeMessage message = mailSender.createMimeMessage();
          MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
          Context context = new Context();
          
          Show show = booking.getShow();
          show.getMovie().getTitle();
          show.getTheater().getName();
       
          if (show.getScreen() != null) 
          {
              show.getScreen().getName();
          }
          
          context.setVariable("booking", booking);
          context.setVariable("movie", booking.getShow().getMovie());
          context.setVariable("theater", booking.getShow().getTheater());
          context.setVariable("show", show);
          context.setVariable("showTime", booking.getShow().getStartTime());
          context.setVariable("seats", booking.getBookedSeats().stream()
              .map(BookedSeat::getSeat)
              .collect(java.util.stream.Collectors.toList()));
          
          String htmlContent = templateEngine.process("email/booking-confirmation", context);
          helper.setTo(to);
          helper.setSubject("Booking Confirmation - " + booking.getBookingReference());
          helper.setText(htmlContent, true);
          mailSender.send(message);
      }
      catch(MessagingException e)
      {
          throw new RuntimeException("Failed to Send Email", e);  
      }
  }
  
  public void sendPsaawordResetEmail(String to,String resetLink)
  {
	  try {
		  MimeMessage message=mailSender.createMimeMessage();
		  MimeMessageHelper helper=new MimeMessageHelper(message,true,"UTF-8");
		  Context context=new Context();
		  context.setVariable("resetLink", resetLink);
		  String htmlContent=templateEngine.process("email/password-reset", context);
		  helper.setTo(to);
		  helper.setSubject("Reset your Password");
		  helper.setText(htmlContent,true);
		  mailSender.send(message);
	  }
	  catch(MessagingException e)
	  {
		  throw new RuntimeException("Failed to Send Email",e);  
	  }
	  
  }
 
}
