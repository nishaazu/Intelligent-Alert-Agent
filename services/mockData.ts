import { Outlet, User, UserRole } from '../types';

export const OUTLETS: Outlet[] = [
  { id: 1, name: "Hotel Seri Malaysia Kuala Lumpur" },
  { id: 2, name: "Hotel Seri Malaysia Genting" },
  { id: 3, name: "Hotel Seri Malaysia Seremban" },
  { id: 4, name: "Hotel Seri Malaysia Johor Bahru" },
];

export const USERS: User[] = [
  // Top Management
  { user_id: 1, name: "Ahmad Ibrahim", email: "ceo@hsm.com.my", role: UserRole.TOP_MANAGEMENT },
  { user_id: 2, name: "Sarah Lee", email: "ops_director@hsm.com.my", role: UserRole.TOP_MANAGEMENT },

  // Halal Executives
  { user_id: 10, name: "Rahman Ali", email: "halal.kl@hsm.com.my", role: UserRole.HALAL_EXECUTIVE, outlet_id: 1 },
  { user_id: 11, name: "Wong Mei Lin", email: "halal.genting@hsm.com.my", role: UserRole.HALAL_EXECUTIVE, outlet_id: 2 },
  { user_id: 12, name: "Siti Aminah", email: "halal.seremban@hsm.com.my", role: UserRole.HALAL_EXECUTIVE, outlet_id: 3 },
  { user_id: 13, name: "Farid Razak", email: "halal.jb@hsm.com.my", role: UserRole.HALAL_EXECUTIVE, outlet_id: 4 },
];