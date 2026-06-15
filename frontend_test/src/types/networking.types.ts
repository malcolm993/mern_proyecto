export interface NetworkingUser {
  _id: string;
  email: string;
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

export interface AgendaItem {
  _id: string;
  event: string;
  title: string;
  description?: string;
  speaker?: string;
  startTime: string;
  endTime: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}
