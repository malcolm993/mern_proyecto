export interface NetworkingUser {
  _id: string;
  email?: string;
  name: string;
  role: 'admin' | 'user';
  company?: string;
  businessArea?: string;
  interests?: string[];
  bio?: string;
}

export interface ContactRequest {
  _id: string;
  requester: NetworkingUser;
  receiver: NetworkingUser;
  status: 'pending' | 'accepted' | 'rejected';
  message?: string;
  createdAt: string;
  updatedAt: string;
}

