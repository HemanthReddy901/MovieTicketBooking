import { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './App.css';
import { useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import HomePage from './components/public/HomePage';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import UserDashboard from './components/user/UserDashboard';
import MovieSearch from './components/user/MovieSearch';
import MyBookings from './components/user/MyBookings';
import BookingPage from './components/user/BookingPage';
import OwnerDashboard from './components/owner/OwnerDashboard';
import TheaterManagement from './components/owner/TheaterManagement';
import MovieManagement from './components/owner/MovieManagement';
import ScreenManagement from './components/owner/ScreenManagement';
import ShowManagement from './components/owner/ShowManagement';
import BookingDetails from './components/user/BookingDetails';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className='App'>
      <Navbar />
      <main className='main-content'>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
          <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
          
          {/* User Routes */}
          <Route path="/user/dashboard" element={user?.role === 'USER' ? <UserDashboard /> : <Navigate to="/" />} />
          <Route path="/user/search" element={user?.role === 'USER' ? <MovieSearch /> : <Navigate to="/" />} />
          <Route path="/user/bookings" element={user?.role === 'USER' ? <MyBookings /> : <Navigate to="/" />} />
          <Route path="/user/booking/:showId" element={user?.role === 'USER' ? <BookingPage /> : <Navigate to="/" />} />
          
          {/* Owner Routes */}
          <Route path="/owner/dashboard" element={user?.role === 'THEATER_OWNER' ? <OwnerDashboard /> : <Navigate to="/" />} />
          <Route path="/owner/theaters" element={user?.role === 'THEATER_OWNER' ? <TheaterManagement /> : <Navigate to="/" />} />
          <Route path="/owner/movies" element={user?.role === 'THEATER_OWNER' ? <MovieManagement /> : <Navigate to="/" />} />
          <Route path="/owner/screens" element={user?.role === 'THEATER_OWNER' ? <ScreenManagement /> : <Navigate to="/" />} />
          <Route path="/owner/shows" element={user?.role === 'THEATER_OWNER' ? <ShowManagement /> : <Navigate to="/" />} />

          <Route path="/user/bookings/:id" element={user?.role === 'USER' ? <BookingDetails /> : <Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
      <Toaster position="top-right" />
    </div>
  );
}

export default App;