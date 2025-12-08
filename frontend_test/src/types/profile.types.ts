// frontend/scr/types/profile.types.ts

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  // Podrías agregar más campos aquí
}

export interface ProfileStats {
  totalReservations: number;
  activeReservations: number;
  createdEvents?: number; // Solo para admin/organizador
}
