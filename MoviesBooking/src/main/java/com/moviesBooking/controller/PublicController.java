package com.moviesBooking.controller;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.moviesBooking.model.Movie;
import com.moviesBooking.model.Show;
import com.moviesBooking.model.Theater;
import com.moviesBooking.repository.MovieRepository;
import com.moviesBooking.repository.ShowRepository;
import com.moviesBooking.repository.TheaterRepository;

@RestController
@RequestMapping("/api/public")
@CrossOrigin(origins="http://localhost:5174")
public class PublicController
{
	@Autowired
    private TheaterRepository theaterRepository;
	@Autowired
	private MovieRepository movieRepository;
	@Autowired
	private ShowRepository showRepository;
	//Showing All Theaters
	@GetMapping("/theaters")
	public ResponseEntity<List<Theater>> getAllTheaters()
	{
		return ResponseEntity.ok(theaterRepository.findAll());
	}
	//Search Specific Theater
	@GetMapping("/theaters/search")
	public ResponseEntity<List<Theater>> searchTheaters(@RequestParam String query)
	{
		return ResponseEntity.ok(theaterRepository.searchTheater(query));
	}
	//Showing All Movies
	@GetMapping("/movies")
	public ResponseEntity<List<Movie>> getAllMovies()
	{
		LocalDateTime now = LocalDateTime.now();
		List<Movie> movies=movieRepository.findByReleaseDateLessThanEqualAndEndDateGreaterThanEqual(now.toLocalDate(),now.toLocalDate());
		return ResponseEntity.ok(movies);
	}
	//Search Specific Movie
	@GetMapping("/movie/search")
	public ResponseEntity<List<Movie>> searchMovies(@RequestParam String query)
	{
		return ResponseEntity.ok(movieRepository.searchMovies(query));
	}
	//Getting Movie Details
	@GetMapping("/movies/{id}")
	public ResponseEntity<Movie> getMovieDetails(@PathVariable Long id)
	{
		Movie movie=movieRepository.findById(id).orElseThrow(()->new RuntimeException("Movie Not Found"));
		return ResponseEntity.ok(movie);
	}
	//Showing Current Running Movies
	@GetMapping("/shows/now-showing")
	public ResponseEntity<List<Show>> getMovieShowing()
	{
	    LocalDateTime now = LocalDateTime.now();
	    LocalDateTime startOfDay = now.withHour(0).withMinute(0).withSecond(0).withNano(0);
	    LocalDateTime endOfDay = now.withHour(23).withMinute(59).withSecond(59).withNano(999999999);
	    List<Show> shows = showRepository.findByStartTimeBetween(startOfDay, endOfDay);
	    return ResponseEntity.ok(shows);
	}
}
