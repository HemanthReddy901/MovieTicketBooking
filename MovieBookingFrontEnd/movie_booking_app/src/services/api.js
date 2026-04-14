import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = 'http://localhost:8081/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});


api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
     
      let message = 'An error occurred'
      
      if (typeof error.response.data === 'string') {
        message = error.response.data
      } else if (error.response.data && error.response.data.message) {
        message = error.response.data.message
      } else if (error.response.data && typeof error.response.data === 'object') {
        message = JSON.stringify(error.response.data)
      }
      
      toast.error(message)
      
     
    } else if (error.request) {
      toast.error("Network error, please check your connection")
    } else {
      toast.error("An unexpected error occurred")
    }
    return Promise.reject(error)
  }
);

// Public APIs
export const publicAPI = {
  getTheaters: () => api.get("/public/theaters"),
  searchTheater: (query) => api.get(`/public/theaters/search?query=${query}`),
  getMovies: () => api.get("/public/movies"),
  searchMovies: (query) => api.get(`/public/movie/search?query=${query}`),
  getMovieDetails: (id) => api.get(`/public/movies/${id}`), 
  getNowShowing: () => api.get('/public/shows/now-showing')
};

// User APIs
export const userAPI = {
  getDashboard: () => api.get('/user/dashboard'),
  getBookings: () => api.get('/user/bookings'),
  getBookingDetails: (id) => api.get(`/user/bookings/${id}`),
    createBooking: (data) => api.post('/user/booking', data), 
  downloadReceipt: (id) => api.get(`/user/bookings/${id}/receipt`, { responseType: 'blob' }),
  searchShows: (params) => api.get(`/user/search`, { params }),
  getMovieShows: (movieId) => api.get(`/user/movies/${movieId}/shows`),
  createPaymentIntent: (data) => api.post('/user/create-payment-intent', data),
   getShowDetails: (showId) => api.get(`/user/shows/${showId}`),
  getShowSeats: (showId) => api.get(`/user/shows/${showId}/seats`), 
};

// Owner APIs
export const ownerAPI = {
  // Theater Operations
  createTheater: (data) => api.post('/theater-owner/theaters', data),
  getMyTheaters: () => api.get('/theater-owner/theaters'),
  updateTheater: (id, data) => api.put(`/theater-owner/theaters/${id}`, data),
  deleteTheater: (id) => api.delete(`/theater-owner/theaters/${id}`),
  getTheaterShows: (theaterId) => 
  api.get(`/theater-owner/theaters/${theaterId}/shows`),
  // Movie Operations
  createMovie: (formData) => api.post('/theater-owner/movies', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getTheaterMovies: (theaterId) => api.get(`/theater-owner/theaters/${theaterId}/movies`), 
  updateMovie: (id, data) => api.put(`/theater-owner/movies/${id}`, data, {
  headers: { 'Content-Type': 'multipart/form-data' }
}),
  deleteMovie: (id) => api.delete(`/theater-owner/movies/${id}`),

  // Screen Operations
  createScreen: (data) => api.post('/theater-owner/screens', data),
  getTheaterScreens: (theaterId) => api.get(`/theater-owner/theaters/${theaterId}/screens`),
  updateScreen: (id, data) => api.put(`/theater-owner/screens/${id}`, data),
  deleteScreen: (id) => api.delete(`/theater-owner/screens/${id}`),

  // Show Operations
  createShow: (data) => api.post('/theater-owner/shows', data),
   deleteShow: (showId) => api.delete(`/theater-owner/shows/${showId}`), 
  getShowSeats: (showId) => {
  console.log('Calling API for show seats:', showId);
  return api.get(`/theater-owner/shows/${showId}/seats`).then(response => {
    console.log('Raw API response for seats:', response);
    return response;
  });
},
  initializeShowSeats: (showId) => api.post(`/theater-owner/shows/${showId}/initialize-seats`),
  updateSeatPricing: (showId, data) => api.put(`/theater-owner/shows/${showId}/seats/pricing`, data),
  blockSeats: (showId, seatIds) => api.post(`/theater-owner/shows/${showId}/seats/block`, seatIds),
  
  getShowAvailableSeats: (showId) => api.get(`/theater-owner/shows/${showId}/available-seats`),
}

export default api