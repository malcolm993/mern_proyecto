// frontend/scr/types/profile.types.ts

export interface UpdateProfileRequest {
  name?: string;
  company?: string;
  businessArea?: string;
  interests?: string[];
  bio?: string;
}

export interface ProfileStats {
  totalReservations: number;
  activeReservations: number;
  createdEvents?: number; // Solo para admin/organizador
}
