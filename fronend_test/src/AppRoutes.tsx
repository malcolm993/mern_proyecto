// src/AppRoutes.tsx
import { Routes, Route } from 'react-router-dom';
import AppLayout from './components/layout/AppLayout';
import HomePage from './modules/home/HomePage';
import EventsPage from './modules/events/EventsPage';
import EventDetailPage from './modules/events/EventDetailPage'

function AppRoutes() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        {/* Página Principal */}
        <Route path="/" element={<HomePage />} />
        
        {/* 🆕 Página de Eventos con nuevo diseño */}
        <Route path="/events" element={<EventsPage />} />
        
        {/* Futuras páginas */}
        {/* <Route path="/profile" element={<ProfilePage />} /> */}

        <Route path="/events/:eventId" element={<EventDetailPage />} />

      </Route>
    </Routes>
  );
}

export default AppRoutes;