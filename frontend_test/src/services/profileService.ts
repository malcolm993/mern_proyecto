import { api } from './api';
import { NetworkingUser } from '../types/networking.types';
import { UpdateProfileRequest } from '../types/profile.types';



interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: NetworkingUser;
  };
  error?: string;
}

export const profileService = {
  updateProfile: async (profileData: UpdateProfileRequest): Promise<NetworkingUser> => {
    const response = await api.patch<ProfileResponse>('/auth/me', profileData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al actualizar perfil');
    }
    return response.data.data.user;
  }
};
