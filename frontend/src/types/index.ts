export interface User {
  id: string;
  name: string;
  email: string;
}

export interface AuthResponse {
  success: boolean;
  token: string;
  user: User;
}

export interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (data: AuthResponse) => void;
  logout: () => void;
}

export interface Story {
  _id: string;
  hnId?: string;
  title: string;
  url: string;
  points: number;
  author: string;
  postedAt: string;
  rank?: number;
  isActive?: boolean;
  scrapedAt?: string;
}
