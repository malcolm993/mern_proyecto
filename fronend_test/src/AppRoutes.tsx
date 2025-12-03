// src/AppRoutes.tsx (actualizado)
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './modules/home/HomePage';
import EventsPage from './modules/events/EventsPage';
import EventDetailPage from './modules/events/EventDetailPage';
import LoginPage from './modules/auth/LoginPage'; 
import RegisterPage from './modules/auth/RegisterPage'; 
import MyReservationPage from './modules/reservations/MyReservationPage';

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />
        <Route path='/my-reservations' element={<MyReservationPage/>}/>
      </Route>

      {/* 🆕 Rutas de auth sin layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
    </Routes>
  );
}

export default AppRoutes;