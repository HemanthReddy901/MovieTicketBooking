package com.moviesBooking.controller;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moviesBooking.dto.BookingRequest;
import com.moviesBooking.dto.PaymentIntentRequest;
import com.moviesBooking.dto.PaymentResult;
import com.moviesBooking.model.BookedSeat;
import com.moviesBooking.model.Booking;
import com.moviesBooking.model.BookingStatus;
import com.moviesBooking.model.Movie;
import com.moviesBooking.model.PaymentStatus;
import com.moviesBooking.model.Seat;
import com.moviesBooking.model.SeatStatus;
import com.moviesBooking.model.Show;
import com.moviesBooking.model.User;
import com.moviesBooking.repository.BookingRepository;
import com.moviesBooking.repository.MovieRepository;
import com.moviesBooking.repository.SeatRepository;
import com.moviesBooking.repository.ShowRepository;
import com.moviesBooking.repository.UserRepository;
import com.moviesBooking.services.EmailService;
import com.moviesBooking.services.PDFService;
import com.moviesBooking.services.PaymentService;
import com.moviesBooking.utils.BookingReferenceGenerator;
import com.stripe.model.PaymentIntent;

@RestController
@RequestMapping("/api/user")
@PreAuthorize("hasRole('USER')")
@CrossOrigin(origins="http://localhost:5174")
public class UserController
{
  @Autowired
  private UserRepository userRepository;
  @Autowired
  private ShowRepository showRepository;
  @Autowired
  private BookingRepository bookingRepository;
  @Autowired
  private SeatRepository seatRepository;
  @Autowired
  private MovieRepository movieRepository;
  @Autowired
  private PaymentService paymentService;
  @Autowired
  private EmailService emailService;
  @Autowired
  private PDFService pdfService;
  //Get Current User
  private User getCurrentUser() {
	  String email=SecurityContextHolder.getContext().getAuthentication().getName();
	  return userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found"));
  }
  //Show DashBoard To User
  @GetMapping("/dashboard")
  public ResponseEntity<?> getUserDashBoard()
  {
	  User user=getCurrentUser();
	  List<Booking> bookings=bookingRepository.findByUserOrderByBookingTimeDesc(user);
	  return ResponseEntity.ok(bookings);
  }
  //Getting User Bookings
  @GetMapping("/bookings")
  public ResponseEntity<List<Booking>> getUserBooking()
  {
	  User user=getCurrentUser();
	  List<Booking> bookings = bookingRepository.findByUserOrderByBookingTimeDesc(user);
      return ResponseEntity.ok(bookings);
  }
  //Getting User BookingDetails
  @GetMapping("/bookings/{id}")
  public ResponseEntity<Booking> getBookingDetails(@PathVariable Long id)
  {
	  Booking booking=bookingRepository.findById(id).orElseThrow(()->new RuntimeException("Booking Not Found"));
      //Verify Ownership
	  if(!booking.getUser().getId().equals(getCurrentUser().getId())) 
	  {
		  return ResponseEntity.status(403).body(null);
	  }
	  return ResponseEntity.ok(booking);
  }
  //Creating a Booking
  @PostMapping("/booking")
  public ResponseEntity<?> createBooking(@RequestBody BookingRequest bookingRequest)
  {
      User user = getCurrentUser();
      Show show = showRepository.findById(bookingRequest.getShowId())
          .orElseThrow(() -> new RuntimeException("Show Not Found"));
      List<Seat> selectedSeats = seatRepository.findAllById(bookingRequest.getSeatIds());
      
      for (Seat seat : selectedSeats) {
          if (seat.getStatus() != SeatStatus.AVALIABLE) {
              return ResponseEntity.badRequest().body("Seat " + seat.getSeatNumber() + " is Not Available");
          }
      }
      
      // Calculate Price
      double totalAmount = selectedSeats.stream().mapToDouble(Seat::getPrice).sum();
      
      // Process The Payment
      PaymentResult paymentResult = paymentService.processPayment(bookingRequest.getPaymentIntentId(), totalAmount);
      if (!paymentResult.isSuccess()) {
          return ResponseEntity.badRequest().body("Payment Failed: " + paymentResult.getMessage());
      }
      
      // Creating new Booking
      Booking booking = new Booking();
      booking.setUser(user);
      booking.setShow(show);
      booking.setBookingReference(BookingReferenceGenerator.generate());
      booking.setBookingTime(LocalDateTime.now());
      booking.setStatus(BookingStatus.CONFIRMED);
      booking.setNumberOfSeats(selectedSeats.size());
      booking.setTotalAmount(totalAmount);
      booking.setPaymentIntentId(paymentResult.getPaymentIntentId());
      booking.setPaymentStatus(PaymentStatus.PAID);
      
      // Update Seat Status
      for (Seat seat : selectedSeats) {
          seat.setStatus(SeatStatus.BOOKED);
          BookedSeat bookedSeat = new BookedSeat();
          bookedSeat.setSeat(seat);
          bookedSeat.setBooking(booking);
          bookedSeat.setPrice(seat.getPrice());
          booking.getBookedSeats().add(bookedSeat);
      }
      seatRepository.saveAll(selectedSeats);
      Booking savedBooking = bookingRepository.save(booking);
      emailService.sendBookingConfirmation(user.getEmail(), savedBooking);
      return ResponseEntity.ok(savedBooking);
  }
  //After Booking Download Receipt
  @GetMapping("/bookings/{id}/receipt")
  public ResponseEntity<byte[]> downloadReceipt(@PathVariable Long id)
  {
	  Booking booking=bookingRepository.findById(id).orElseThrow(()->new RuntimeException("Booking Not Found"));
	  //verify Ownership
	  if(!booking.getUser().getId().equals(getCurrentUser().getId()))
	  {
		  return ResponseEntity.status(403).body(null);
	  }
	  byte[] pdfBytes=pdfService.generateReceipt(booking);
	  HttpHeaders headers=new HttpHeaders();
      headers.setContentType(MediaType.APPLICATION_PDF);
      headers.setContentDispositionFormData("filename","receipt-"+booking.getBookingReference()+".pdf");
      return ResponseEntity.ok().headers(headers).body(pdfBytes);
  }
  //Searching Movies In Different Ways
  @GetMapping("/search")
  public ResponseEntity<?> searchShows(@RequestParam(required=false) String city,@RequestParam(required=false) String movieName, @RequestParam(required=false) String date) 
  {
      LocalDateTime searchDate = (date != null && !date.isEmpty()) ? LocalDateTime.parse(date + "T00:00:00"): LocalDateTime.now();
      
      LocalDateTime startOfDay = searchDate.withHour(0).withMinute(0).withSecond(0);
      LocalDateTime endOfDay = searchDate.withHour(23).withMinute(59).withSecond(59);
      
      List<Show> shows;
      if ((city != null && !city.isEmpty()) && (movieName != null && !movieName.isEmpty())) 
      {
          shows = showRepository.findByCityAndMovieNameAndDate(city, movieName, startOfDay, endOfDay);
      } 
      else if (city != null && !city.isEmpty())
      {
          shows = showRepository.findByCityAndDate(city, startOfDay, endOfDay);
      }
      else if (movieName != null && !movieName.isEmpty()) 
      {
          shows = showRepository.findByMovieNameAndDate(movieName, startOfDay, endOfDay);
      }
      else
      {
          shows = showRepository.findByStartTimeBetween(startOfDay, endOfDay);
      }
      
      shows.forEach(show -> {
          show.getMovie().getTitle(); 
          show.getTheater().getName(); 
          if (show.getScreen() != null) 
          {
              show.getScreen().getName(); 
          }
      });
      
      return ResponseEntity.ok(shows);
  }
  //Get The Movie And Related Shows 
  @GetMapping("/movies/{movieId}/shows")
  public ResponseEntity<List<Show>> getMovieShows(@PathVariable Long movieId)
  {
	Movie movie =  movieRepository.findById(movieId).orElseThrow(()->new RuntimeException("movie not found"));
	  List<Show> shows=showRepository.findByMovie(movie);
	  return ResponseEntity.ok(shows);
	  
  }
  //Creating a Payment-Intent Id For Payments
  @PostMapping("/create-payment-intent")
  public ResponseEntity<?> createPaymentIntent(@RequestBody PaymentIntentRequest request)
  {
	  User user=getCurrentUser();
	  Show show=showRepository.findById(request.getShowIds()).orElseThrow(()->new RuntimeException("Show Not Found"));
	 List<Seat> selectedSeats= seatRepository.findAllById(request.getSeatIds());
	 //Calculate Amount
	 double totalAmount=selectedSeats.stream().mapToDouble(Seat::getPrice).sum();
	 //Process Payment
	  PaymentIntent paymentIntent=paymentService.createPaymentIntent(totalAmount, "usd", "Movie Ticket Booking For "+show.getMovie().getTitle());
	  return ResponseEntity.ok(Map.of(
			  "clientSecret",paymentIntent.getClientSecret(),
			  "paymentIntentId",paymentIntent.getId(),
			  "amount",totalAmount
			  ));
  }

//Getting Show Full Details
@GetMapping("/shows/{showId}")
public ResponseEntity<?> getShowDetails(@PathVariable Long showId) {
   try {
       Show show = showRepository.findById(showId)
           .orElseThrow(() -> new RuntimeException("Show not found"));
       
       show.getMovie().getTitle();
       show.getMovie().getLanguage();
       show.getMovie().getGenre();
       show.getTheater().getName();
       show.getTheater().getCity();
       show.getTheater().getState();
       if (show.getScreen() != null) 
       {
           show.getScreen().getName();
       }
       
       return ResponseEntity.ok(show);
   } 
   catch (Exception e) 
   {
       return ResponseEntity.badRequest().body(e.getMessage());
   }
}
//Showing All Seats
@GetMapping("/shows/{showId}/seats")
public ResponseEntity<?> getShowSeats(@PathVariable Long showId) {
   try 
   {
       Show show = showRepository.findById(showId)
           .orElseThrow(() -> new RuntimeException("Show not found"));
       
       List<Seat> seats = seatRepository.findByShow(show);
       
       List<Map<String, Object>> seatInfo = seats.stream().map(seat -> {
           Map<String, Object> seatMap = new HashMap<>();
           seatMap.put("id", seat.getId());
           seatMap.put("seatNumber", seat.getSeatNumber());
           seatMap.put("status", seat.getStatus().toString());
           seatMap.put("seatType", seat.getSeatType().toString());
           seatMap.put("price", seat.getPrice());
           return seatMap;
       }).collect(Collectors.toList());
       
       return ResponseEntity.ok(seatInfo);
   } 
   catch (Exception e)
   {
       return ResponseEntity.badRequest().body(e.getMessage());
   }
}
}
