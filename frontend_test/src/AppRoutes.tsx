// src/AppRoutes.tsx (actualizado)
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './modules/home/HomePage';
import EventsPage from './modules/events/EventsPage';
import EventDetailPage from './modules/events/EventDetailPage';
import LoginPage from './modules/auth/LoginPage';
import RegisterPage from './modules/auth/RegisterPage';
import MyReservationPage from './modules/reservations/MyReservationPage';
import CreateEventPage from './modules/events/CreateEventPage';
import EditEventPage from './modules/events/EditEventPage';
import MyEventsPage from './modules/events/MyEventsPage';
import ProfilePage from './modules/profiles/ProfilePage';
import NetworkingPage from './modules/networking/NetworkingPage';
import ProtectedRoute from './components/auth/ProtectedRoute';
import UnauthorizedPage from './modules/auth/UnauthorizedPage';
import ManageAgendaPage from './modules/events/ManageAgendaPage';
import { NotFound } from './modules/notFound';

function AppRoutes() {
  return (
    <Routes>
      {/* Rutas públicas con layout */}
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:eventId" element={<EventDetailPage />} />


        <Route path='/my-reservations' element={
          <ProtectedRoute>
            <MyReservationPage />
          </ProtectedRoute>
        } />

        <Route path='/profile' element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>} />

        <Route path='/networking' element={
          <ProtectedRoute>
            <NetworkingPage />
          </ProtectedRoute>} />


        <Route path="/events/create" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateEventPage />
          </ProtectedRoute>} />

        <Route path="/events/create" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CreateEventPage />
          </ProtectedRoute>
        } />

        <Route path="/events/edit/:eventId" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <EditEventPage />
          </ProtectedRoute>
        } />

        <Route path="/my-events" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <MyEventsPage />
          </ProtectedRoute>
        } />
        <Route path="/events/:eventId/agenda/manage" element={
          <ProtectedRoute allowedRoles={['admin']}>
            <ManageAgendaPage />
          </ProtectedRoute>
        } />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 🆕 Rutas de auth sin layout */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path='/unauthorized' element={<UnauthorizedPage />} />
    </Routes>
  );
}

export default AppRoutes;
