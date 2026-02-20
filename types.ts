

export enum UserRole {
  ADMIN = 'ADMIN',
  STAFF = 'STAFF',
  CLIENT = 'CLIENT',
  RESERVAS = 'RESERVAS'
}

export interface User {
  username: string;
  role: UserRole;
  bandName?: string;
  email?: string;
  phone?: string;
}

export enum RoomColor {
  BLUE = 'blue',
  GREEN = 'green',
  VIOLET = 'violet',
  RED = 'red'
}

export interface Room {
  id: string;
  name: string;
  color: RoomColor; // 'blue' | 'green' | 'violet' | 'red'
  hex: string;
  price: number;
}

export interface Reservation {
  id: string;
  clientName: string;
  bandName: string;
  date: string; // YYYY-MM-DD
  timeStart: string;
  timeEnd: string;
  roomId: string;
  status: 'PENDING' | 'CONFIRMED' | 'REJECTED' | 'COMPLETED';
  totalAmount: number;
  isAbono?: boolean; // New field for fixed bands
}

export interface Product {
  id: string;
  name: string;
  price: number;
  cost: number;
  stock: number;
  category: 'BAR' | 'INSTRUMENT' | 'PROMO';
}

export interface Consumption {
  id: string;
  reservationId: string;
  items: { productId: string; quantity: number; name: string; price: number }[];
  total: number;
  paid: boolean;
  paymentMethod?: 'CASH' | 'MERCADOPAGO' | 'DEBT';
}

export interface MaintenanceItem {
  id: string;
  name: string;
  roomId: string;
  status: 'OK' | 'REPAIR';
  // Repair details
  repairDate?: string;     // Date sent to repair
  reason?: string;         // Motivo
  budget?: number;         // Estimated cost (Importe)
  estimatedTime?: string;  // Tiempo estimado
  returnDate?: string;     // Date returned (Retiro)
  actualCost?: number;     // Final cost
  isPaid?: boolean;        // Has the repair been paid?
}

export interface Transaction {
  id: string;
  type: 'INCOME' | 'EXPENSE';
  category: string; // 'LUZ', 'ALQUILER', 'SALA', 'BARRA', etc.
  amount: number;
  date: string;
  description: string;
  isPaid: boolean; // For tracking pending payments/collections
  paymentMethod?: 'CASH' | 'MERCADOPAGO' | 'DEBT' | 'CARD'; // New field
}

export interface StaffShift {
  id: string;
  staffName: string;
  dayOfWeek: string; // 'Lunes', 'Martes', etc.
  timeStart: string;
  timeEnd: string;
}

export interface Contact {
  id: string;
  name: string;
  bandName: string;
  phone: string;
  email: string;
  style: string;
  musiciansCount: number;
  habitualRoom: string;
  cancellationRate: number; // Percentage
  attendanceRate: number; // Percentage
  isAbono?: boolean; // New field
  instagram?: string; // New
  bandRole?: string; // New
  debt?: number; // New field
}