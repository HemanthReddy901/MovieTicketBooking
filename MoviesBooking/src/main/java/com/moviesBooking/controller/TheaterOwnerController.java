package com.moviesBooking.controller;

import java.io.IOException;
import java.util.List;
import java.util.Map;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.moviesBooking.dto.MovieDTO;
import com.moviesBooking.dto.ScreenDTO;
import com.moviesBooking.dto.ShowDTO;
import com.moviesBooking.dto.TheaterDTO;
import com.moviesBooking.model.Movie;
import com.moviesBooking.model.Screen;
import com.moviesBooking.model.Seat;
import com.moviesBooking.model.SeatStatus;
import com.moviesBooking.model.SeatType;
import com.moviesBooking.model.Show;
import com.moviesBooking.model.Theater;
import com.moviesBooking.model.User;
import com.moviesBooking.repository.MovieRepository;
import com.moviesBooking.repository.ScreenRepository;
import com.moviesBooking.repository.SeatRepository;
import com.moviesBooking.repository.ShowRepository;
import com.moviesBooking.repository.TheaterRepository;
import com.moviesBooking.repository.UserRepository;
import com.moviesBooking.services.FileStorageService;

import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/theater-owner")
@PreAuthorize("hasRole('THEATER_OWNER')")
@CrossOrigin(origins="http://localhost:5174")
public class TheaterOwnerController 
{
	@Autowired
   private TheaterRepository theaterRepository;
	@Autowired
   private MovieRepository movieRepository;
	@Autowired
   private ShowRepository showRepository;
	@Autowired
   private ScreenRepository screenRepository;
	@Autowired
   private SeatRepository seatRepository;
	@Autowired
   private UserRepository userRepository;
   @Autowired
   private FileStorageService fileStorageService;
   
   private User getCurrentUser()
   {
	  String email = SecurityContextHolder.getContext().getAuthentication().getName();
	  return userRepository.findByEmail(email).orElseThrow(()->new RuntimeException("User Not Found"));
   }
   //Theater CRUD Operations
   //Creating A Theater
   @PostMapping("/theaters")
   public ResponseEntity<?> createTheater(@RequestBody TheaterDTO theaterDTO)
   {
	   User currentUser=getCurrentUser();
	   Theater t=new Theater();
	   t.setName(theaterDTO.getName());
	   t.setLocation(theaterDTO.getLocation());
	   t.setAddress(theaterDTO.getAddress());
	   t.setCity(theaterDTO.getCity());
	   t.setState(theaterDTO.getState());
	   t.setPincode(theaterDTO.getPincode());
	   t.setContactNumber(theaterDTO.getContactNumber());
	   t.setEmail(theaterDTO.getEmail());
	   t.setTotalScreens(theaterDTO.getTotalScreens());
	   t.setOwner(currentUser);
	   Theater savedTheater=theaterRepository.save(t);
	   return ResponseEntity.ok(savedTheater);
   }
   //Get All Theaters
   @GetMapping("/theaters")
   public ResponseEntity<List<Theater>> getMyTheaters()
   {
	   User currentUser=getCurrentUser();
	   List<Theater> theaters=theaterRepository.findByOwner(currentUser);
	   return ResponseEntity.ok(theaters);
   }
   //Updating Existing Theater
   @PutMapping("/theaters/{id}")
   public ResponseEntity<?> updateTheater(@PathVariable Long id,@RequestBody TheaterDTO theaterDTO)
   {
	   Theater t=theaterRepository.findById(id).orElseThrow(()->new RuntimeException("Theater Not Found"));
	   //Verify Ownership
	   if(!t.getOwner().getId().equals(getCurrentUser().getId()))
	   {
		   return ResponseEntity.status(403).body("You Don't have permission to update this theater");
	   }
	   t.setName(theaterDTO.getName());
	   t.setLocation(theaterDTO.getLocation());
	   t.setAddress(theaterDTO.getAddress());
	   t.setCity(theaterDTO.getCity());
	   t.setState(theaterDTO.getState());
	   t.setPincode(theaterDTO.getPincode());
	   t.setContactNumber(theaterDTO.getContactNumber());
	   t.setEmail(theaterDTO.getEmail());
	   t.setTotalScreens(theaterDTO.getTotalScreens());
	   theaterRepository.save(t);
	   return ResponseEntity.ok(t);
	   
   }
   //Delete Theater
   @DeleteMapping("/theaters/{id}")
   public ResponseEntity<?> deleteTheater(@PathVariable Long id)
   {
	   Theater t=theaterRepository.findById(id).orElseThrow(()->new RuntimeException("Theater Not Found"));
	   //verify OwnerShip
	   if(!t.getOwner().getId().equals(getCurrentUser().getId()))
	   {
		   return ResponseEntity.status(403).body("You Don't have permission to delete this theater");
		   
	   }
	   
	   theaterRepository.delete(t);
	   return ResponseEntity.ok("Theater Deleted Successfully");
   }
   
   //Movie CURD Operations
   //Creating A Movie
   @PostMapping(value = "/movies", consumes = "multipart/form-data")
   public ResponseEntity<?> createMovie(@RequestParam("movie") String movieJson,@RequestParam(value = "poster", required = false) MultipartFile poster) throws IOException 
   {
       ObjectMapper objectMapper = new ObjectMapper();
       MovieDTO dto = objectMapper.readValue(movieJson, MovieDTO.class);
       System.out.println("Title: " + dto.getTitle());
       
       Theater theater = theaterRepository.findById(dto.getTheaterId())
               .orElseThrow(() -> new RuntimeException("Theater Not Found"));


       if (!theater.getOwner().getId().equals(getCurrentUser().getId())) {
           return ResponseEntity.status(403).body("No permission");
       }


       Movie movie = new Movie();
       movie.setTitle(dto.getTitle());
       movie.setDescription(dto.getDescription());
       movie.setGenre(dto.getGenre());
       movie.setLanguage(dto.getLanguage());
       movie.setDuration(dto.getDuration());
       movie.setReleaseDate(dto.getReleaseDate());
       movie.setEndDate(dto.getEndDate());
       movie.setTrailerUrl(dto.getTrailerUrl());
       movie.setDirector(dto.getDirector());
       movie.setCast(dto.getCast());
       movie.setTheater(theater);


       if (poster != null && !poster.isEmpty()) {
           String fileName = fileStorageService.storeFile(poster);
           movie.setPosterUrl("/uploads/" + fileName);
       }
       Movie savedMovie = movieRepository.save(movie);
       return ResponseEntity.ok(savedMovie);
   }
   //Get All Movies
   @GetMapping("/theaters/{theaterId}/movies")
   public ResponseEntity<List<Movie>> getMyTheaterMovies(@PathVariable Long theaterId)
   {
	   Theater theater=theaterRepository.findById(theaterId).orElseThrow(()->new RuntimeException("Theater Not Found"));
	   //verify OwnerShip
	   if(!theater.getOwner().getId().equals(getCurrentUser().getId()))
	   {
		  return ResponseEntity.status(403).body(null); 
	   }
	   List<Movie> movies=movieRepository.findByTheater(theater);
	   return ResponseEntity.ok(movies);
   }
   //Updating Existing Movie
   @PutMapping(value = "/movies/{id}", consumes = "multipart/form-data")
   public ResponseEntity<?> updateMovie(@PathVariable Long id, @RequestParam("movie") String movieJson,@RequestParam(value = "poster", required = false) MultipartFile poster) throws IOException 
   {
       ObjectMapper objectMapper = new ObjectMapper();
       MovieDTO dto = objectMapper.readValue(movieJson, MovieDTO.class);

       System.out.println("Movie ID: " + id);
       System.out.println("Title: " + dto.getTitle());


       Movie movie = movieRepository.findById(id)
               .orElseThrow(() -> new RuntimeException("Movie Not Found"));


       if (!movie.getTheater().getOwner().getId().equals(getCurrentUser().getId())) {
           return ResponseEntity.status(403).body("No permission");
       }


       movie.setTitle(dto.getTitle());
       movie.setDescription(dto.getDescription());
       movie.setGenre(dto.getGenre());
       movie.setLanguage(dto.getLanguage());
       movie.setDuration(dto.getDuration());
       movie.setReleaseDate(dto.getReleaseDate());
       movie.setEndDate(dto.getEndDate());
       movie.setTrailerUrl(dto.getTrailerUrl());
       movie.setDirector(dto.getDirector());
       movie.setCast(dto.getCast());


       if (dto.getTheaterId() != null &&
           !dto.getTheaterId().equals(movie.getTheater().getId())) {

           Theater theater = theaterRepository.findById(dto.getTheaterId())
                   .orElseThrow(() -> new RuntimeException("Theater Not Found"));

           if (!theater.getOwner().getId().equals(getCurrentUser().getId())) {
               return ResponseEntity.status(403).body("No permission");
           }

           movie.setTheater(theater);
       }


       if (poster != null && !poster.isEmpty()) {
           String fileName = fileStorageService.storeFile(poster);
           movie.setPosterUrl("/uploads/" + fileName);
       }

       Movie updatedMovie = movieRepository.save(movie);

       return ResponseEntity.ok(updatedMovie);
   }
   //Delete Movie
   @DeleteMapping("/movies/{id}")
   public ResponseEntity<?> deleteMovie(@PathVariable Long id)
   {
	   Movie movie=movieRepository.findById(id).orElseThrow(()-> new RuntimeException("Movie Not Found"));
	   //Verify OwnerShip
	   if(!movie.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
	   {
		   return ResponseEntity.status(403).body("You Dont Have Permission To Delete This Movie");
	   }
	   movieRepository.delete(movie);
	   return ResponseEntity.ok("Movie Deleted Successfully");
   }
   //Show Management
   //Creating a Show For Screen
   @PostMapping("/shows")
   public ResponseEntity<?> createShow(@RequestBody ShowDTO dto)
   {
       Movie movie = movieRepository.findById(dto.getMovieId())
           .orElseThrow(() -> new RuntimeException("Movie Not Found"));
       Screen screen = screenRepository.findById(dto.getScreenId())
           .orElseThrow(() -> new RuntimeException("Screen Not Found"));
       
       // Verify Ownership
       if(!movie.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
       {
           return ResponseEntity.status(403).body("You Don't Have Permission To Add Shows");
       }
       
       Show show = new Show();
       show.setMovie(movie);
       show.setScreen(screen);
       show.setTheater(screen.getTheater());
       show.setStartTime(dto.getStartTime());
       show.setEndTime(dto.getEndTime());
       show.setPrice(dto.getPrice());
       
       Show savedShow = showRepository.save(show);
       initializeShowSeats(savedShow);
       return ResponseEntity.ok(savedShow);
   }
   //Deleting Show
   @DeleteMapping("/shows/{id}")
   public ResponseEntity<?> deleteShow(@PathVariable Long id)
   {
       Show show = showRepository.findById(id)
           .orElseThrow(() -> new RuntimeException("Show Not Found"));
       
       // Verify ownership
       if(!show.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
       {
           return ResponseEntity.status(403).body("You Don't Have Permission To Delete This Show");
       }
       
       // Clear show association from seats
       List<Seat> seats = seatRepository.findByShow(show);
       for(Seat seat : seats) {
           seat.setShow(null);
           seat.setStatus(SeatStatus.AVALIABLE);
           seatRepository.save(seat);
       }
       
       showRepository.delete(show);
       return ResponseEntity.ok("Show Deleted Successfully");
   }
   //Getting Show And Seats
   @GetMapping("/shows/{id}/seats")
   public ResponseEntity<List<Seat>> getShowSeates(@PathVariable Long id)
   {
	   Show show=showRepository.findById(id).orElseThrow(()->new RuntimeException("Show Not Found"));
	   List<Seat> seats=seatRepository.findByShow(show);
	   return ResponseEntity.ok(seats);
   }
   
   //Screen Management
   //Creating Screen
   @PostMapping("/screens")
   public ResponseEntity<?> createScreen(@RequestBody ScreenDTO screenDTO)
   {
       Theater theater = theaterRepository.findById(screenDTO.getTheaterId())
           .orElseThrow(() -> new RuntimeException("Theater Not Found"));
       
       // Verify Ownership
       if(!theater.getOwner().getId().equals(getCurrentUser().getId()))
       {
           return ResponseEntity.status(403).body("You don't have permission to add Screens");
       }
       
       Screen screen = new Screen();
       screen.setName(screenDTO.getName());
       screen.setTotalSeats(screenDTO.getTotalSeats());
       screen.setRows(screenDTO.getRows());
       screen.setColumnCount(screenDTO.getColumns());
       screen.setTheater(theater); 
       Screen savedScreen = screenRepository.save(screen);
       createSeatsForScreen(savedScreen);
       return ResponseEntity.ok(savedScreen);
   }
   //Getting Screen 
   @GetMapping("/theaters/{theaterId}/screens")
   public ResponseEntity<List<Screen>> getTheaterScreens(@PathVariable Long theaterId)
   {
	   Theater theater=theaterRepository.findById(theaterId).orElseThrow(()->new RuntimeException("Screen Not Found"));
		 //Verify OwnerShip
		 if(!theater.getOwner().getId().equals(getCurrentUser().getId()))
		 {
			 return ResponseEntity.status(403).body(null);
		 }
		 
		 List<Screen> screens=screenRepository.findByTheater(theater);
		 return ResponseEntity.ok(screens);
   }
   //Updating Screen
   @PutMapping("/screens/{id}")
   public ResponseEntity<?> updateScreen(@PathVariable Long id, @RequestBody ScreenDTO screenDTO)
   {
       Screen screen = screenRepository.findById(id)
           .orElseThrow(() -> new RuntimeException("Screen Not Found"));
       
       // Verify Ownership
       if(!screen.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
       {
           return ResponseEntity.status(403).body("You Don't Have Permission To Update Screens");
       }
  
       screen.setName(screenDTO.getName());
       screen.setTotalSeats(screenDTO.getRows() * screenDTO.getColumns());
       screen.setRows(screenDTO.getRows());
       screen.setColumnCount(screenDTO.getColumns());
       
       if(screenDTO.getTheaterId() != null && 
          !screenDTO.getTheaterId().equals(screen.getTheater().getId()))
       {
           Theater newTheater = theaterRepository.findById(screenDTO.getTheaterId())
               .orElseThrow(() -> new RuntimeException("Theater Not Found"));
           
           // Verify ownership of the new theater
           if(!newTheater.getOwner().getId().equals(getCurrentUser().getId()))
           {
               return ResponseEntity.status(403).body("You Don't Have Permission To Move Screen To This Theater");
           }
           
           screen.setTheater(newTheater);
       }
       
       screenRepository.save(screen);
       recreateSeatsForScreen(screen);
       return ResponseEntity.ok(screen);
   }
   //Deleting Screens
   @DeleteMapping("/screens/{id}")
   public ResponseEntity<?> deleteScreens(@PathVariable Long id)
   {
	   Screen screen = screenRepository.findById(id).orElseThrow(()-> new RuntimeException("Screen Not Found"));
	   //Verify OwnerShip
	   if(!screen.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
		 {
			 return ResponseEntity.status(403).body("You Dont't Have Permission To Update Screens");
		 }
		 screenRepository.delete(screen);
		 return ResponseEntity.ok("Screen Deleted Successfully");
   }
   //Seat Management
   //Creating Seats For Screen
   private void createSeatsForScreen(Screen screen)
   {
	   char rowChar='A';
	   for(int row=0;row<screen.getRows();row++) 
	   {
		   for(int col=1;col<=screen.getColumnCount();col++)
		   {
			   Seat seat=new Seat();
			   seat.setSeatNumber(String.valueOf((char)(rowChar+row))+col);
			   seat.setScreen(screen);
			   seat.setStatus(SeatStatus.AVALIABLE);
			   if(row==0)
			   {
				   seat.setSeatType(SeatType.PLATINUM);
				   seat.setPrice(250.0);
			   }else if(row==1 || row==2) {
				   seat.setSeatType(SeatType.GOLD);
				   seat.setPrice(150.0);
			   }else {
				   seat.setSeatType(SeatType.SILVER);
				   seat.setPrice(100.0);
			   }
			   seatRepository.save(seat);
		   }
	   }
	   
   }
   //Recreating Seats For Screen After Show End
   private void recreateSeatsForScreen(Screen screen)
   {
       List<Seat> seats = seatRepository.findByScreen(screen);
       for(Seat seat : seats) {
           seat.setShow(null);
           seat.setStatus(SeatStatus.AVALIABLE);
           seatRepository.save(seat);
       }
       seatRepository.deleteAll(seats);
       createSeatsForScreen(screen);
   }
 //Initialize Seats For a Specific Show
   private void initializeShowSeats(Show show)
   {
       List<Seat> screenSeats = seatRepository.findByScreenAndShowIsNull(show.getScreen());
       
       for(Seat seat : screenSeats)
       {
           seat.setShow(show);
           seat.setStatus(SeatStatus.AVALIABLE);
           seatRepository.save(seat);
       }
       
       System.out.println("Updated " + screenSeats.size() + " seats for show: " + show.getId());
   }
   //Initialize Seats Manually
   @PostMapping("/shows/{showId}/initialize-seats")
   public ResponseEntity<?> initializeShowSeatsManually(@PathVariable Long showId)
   {
       Show show = showRepository.findById(showId)
           .orElseThrow(() -> new RuntimeException("Show Not Found"));
       
       // Verify Ownership
       if(!show.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
       {
           return ResponseEntity.status(403).body("You Don't Have Permission To Initialize Seats For This Show");
       }
       

       List<Seat> existingSeats = seatRepository.findByShow(show);
       for(Seat seat : existingSeats) {
           seat.setShow(null);
           seat.setStatus(SeatStatus.AVALIABLE);
           seatRepository.save(seat);
       }
       
       initializeShowSeats(show);
       
       return ResponseEntity.ok("Seats initialized successfully for show: " + show.getId());
   }
   //Update Seat Pricing
   @PutMapping("/shows/{showId}/seats/pricing")
   public ResponseEntity<?> updateSeatPricing(@PathVariable Long showId,@RequestBody Map<String,Double> seatPrices)
   {
	   Show show=showRepository.findById(showId).orElseThrow(()->new RuntimeException("Show Not Found"));
	   //Verify OwnerShip
	   if(!show.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
	   {
		   return ResponseEntity.status(403).body("You Don't Have Permission To UpdateShow");
	   }
	   for(Map.Entry<String, Double> entry:seatPrices.entrySet())
	   {
		   List<Seat> seats=seatRepository.findByShowAndSeatNumber(show, entry.getKey());
		   for(Seat seat:seats)
		   {
			   seat.setPrice(entry.getValue());
			   seatRepository.save(seat);
		   }
	   }
	   return ResponseEntity.ok("Seat Prices Updated Successfully");
	   
   }
   //get Available Seats For Show
   @GetMapping("/shows/{showId}/available-seats")
   public ResponseEntity<List<Seat>> getAvailableSeats(@PathVariable Long showId)
   {
	   Show show = showRepository.findById(showId).orElseThrow(()->new RuntimeException("Show Not Found"));
	   List<Seat> seats=seatRepository.findByShowAndStatus(show, SeatStatus.AVALIABLE);
	   return ResponseEntity.ok(seats);
   }
   //Blocking seats Temporarily
   @PostMapping("/shows/{showId}/seats/block")
   public ResponseEntity<?> blockSeats(@PathVariable Long showId,@RequestBody List<Long> seatIds)
   {
	   Show show=showRepository.findById(showId).orElseThrow(()->new RuntimeException("Show Not Found"));
	   //Verify OwnerShip
	   if(!show.getTheater().getOwner().getId().equals(getCurrentUser().getId()))
	   {
		   return ResponseEntity.status(403).body("You Don't Have Permission To BlockSeats");
	   }
	   List<Seat> seats=seatRepository.findAllById(seatIds);
	   for(Seat seat:seats)
	   {
		   if(seat.getStatus()==SeatStatus.AVALIABLE)
		   {
			   seat.setStatus(SeatStatus.BLOCKED);
			   seatRepository.save(seat);
		   }
	   }
	   return ResponseEntity.ok("Seats Blocked Successfully");
   }
   //Getting Shows By THeater
   @GetMapping("/theaters/{theaterId}/shows")
   public ResponseEntity<List<Show>> getShowsByTheater(@PathVariable Long theaterId) {
       Theater theater = theaterRepository.findById(theaterId)
               .orElseThrow(() -> new RuntimeException("Theater Not Found"));

       if (!theater.getOwner().getId().equals(getCurrentUser().getId())) {
           return ResponseEntity.status(403).body(null);
       }

       List<Show> shows = showRepository.findByTheater(theater);
       return ResponseEntity.ok(shows);
   }

}
