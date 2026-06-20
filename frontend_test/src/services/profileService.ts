import { api } from './api';
import { UpdateProfileRequest, ProfileUser} from '../types/profile.types';



interface ProfileResponse {
  success: boolean;
  message: string;
  data?: {
    user: ProfileUser;
  };
  error?: string;
}

export const profileService = {
  updateProfile: async (profileData: UpdateProfileRequest): Promise<ProfileUser> => {
    const response = await api.patch<ProfileResponse>('/auth/me', profileData);
    if (!response.data.success || !response.data.data) {
      throw new Error(response.data.error || 'Error al actualizar perfil');
    }
    return response.data.data.user;
  }
};
