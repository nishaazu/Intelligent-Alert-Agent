export enum UserRole {
  HALAL_EXECUTIVE = 'HALAL_EXECUTIVE',
  TOP_MANAGEMENT = 'TOP_MANAGEMENT',
  ADMIN = 'ADMIN'
}

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH'
}

export interface User {
  user_id: number;
  name: string;
  email: string;
  role: UserRole;
  outlet_id?: number; // Optional because Top Management might oversee all
}

export interface Outlet {
  id: number;
  name: string;
}

export interface AlertDetails {
  material_name: string;
  supplier_name: string;
  days_until_expiry: number;
  affected_menus: string[];
  category: string;
}

export interface AlertInput {
  trigger_type: 'EXPIRY' | 'NCR' | 'AUDIT_DUE';
  outlet_id: number;
  severity: Severity;
  details: AlertDetails;
}

export interface GeneratedAlert {
  alert_id: number;
  severity: Severity;
  message: string;
  target_users: User[];
  created_at: string;
}

export interface EmailLogEntry {
  id: string;
  timestamp: string;
  status: 'CONNECTING' | 'AUTHENTICATING' | 'SENDING' | 'SENT' | 'FAILED';
  details: string;
  recipient?: string;
}