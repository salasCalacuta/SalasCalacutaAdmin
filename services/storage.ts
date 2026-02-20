
import { INITIAL_PRODUCTS, INITIAL_MAINTENANCE, ROOMS as INITIAL_ROOMS } from '../constants';
import { Product, Reservation, Transaction, User, MaintenanceItem, Consumption, Contact, Room } from '../types';

// Keys
const DB_PREFIX = 'calacuta_';
const KEYS = {
  USERS: `${DB_PREFIX}users`,
  RESERVATIONS: `${DB_PREFIX}reservations`,
  PRODUCTS: `${DB_PREFIX}products`,
  TRANSACTIONS: `${DB_PREFIX}transactions`,
  MAINTENANCE: `${DB_PREFIX}maintenance`,
  CONSUMPTION: `${DB_PREFIX}consumption`,
  CONTACTS: `${DB_PREFIX}contacts`,
  ROOMS: `${DB_PREFIX}rooms`, 
  INITIAL_CASH: `${DB_PREFIX}initial_cash`, // New key
};

// Initialize DB if empty
export const initDB = () => {
  if (!localStorage.getItem(KEYS.PRODUCTS)) {
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
  }
  if (!localStorage.getItem(KEYS.MAINTENANCE)) {
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE));
  }
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify([]));
  }
  if (!localStorage.getItem(KEYS.ROOMS)) {
    localStorage.setItem(KEYS.ROOMS, JSON.stringify(INITIAL_ROOMS));
  } else {
    // Migration: Check if Sala 3 exists, if not, add it
    const storedRooms = JSON.parse(localStorage.getItem(KEYS.ROOMS) || '[]');
    const sala3 = INITIAL_ROOMS.find(r => r.id === 'sala3');
    if (sala3 && !storedRooms.find((r: Room) => r.id === 'sala3')) {
        storedRooms.push(sala3);
        localStorage.setItem(KEYS.ROOMS, JSON.stringify(storedRooms));
    }
  }
};

// Helper to simulate "Excel Drive Save"
export const logToDrive = (data: any) => {
  console.log("SIMULATING UPLOAD TO GOOGLE DRIVE (appCalacuta@gmail.com):", data);
  // In a real app, this would be a fetch call to a backend proxying the Google Sheets API
};

export const storage = {
  getProducts: (): Product[] => JSON.parse(localStorage.getItem(KEYS.PRODUCTS) || '[]'),
  saveProducts: (data: Product[]) => localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(data)),
  
  getReservations: (): Reservation[] => JSON.parse(localStorage.getItem(KEYS.RESERVATIONS) || '[]'),
  saveReservations: (data: Reservation[]) => localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify(data)),
  
  getTransactions: (): Transaction[] => JSON.parse(localStorage.getItem(KEYS.TRANSACTIONS) || '[]'),
  saveTransactions: (data: Transaction[]) => localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify(data)),

  getMaintenance: (): MaintenanceItem[] => JSON.parse(localStorage.getItem(KEYS.MAINTENANCE) || '[]'),
  saveMaintenance: (data: MaintenanceItem[]) => localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(data)),

  getUsers: (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]'),
  saveUsers: (data: User[]) => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(data));
    logToDrive(data); // Req: Save client data to "Drive"
  },

  getConsumption: (): Consumption[] => JSON.parse(localStorage.getItem(KEYS.CONSUMPTION) || '[]'),
  saveConsumption: (data: Consumption[]) => localStorage.setItem(KEYS.CONSUMPTION, JSON.stringify(data)),

  getContacts: (): Contact[] => JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]'),
  saveContacts: (data: Contact[]) => {
      localStorage.setItem(KEYS.CONTACTS, JSON.stringify(data));
      logToDrive(data);
  },

  getRooms: (): Room[] => JSON.parse(localStorage.getItem(KEYS.ROOMS) || JSON.stringify(INITIAL_ROOMS)),
  saveRooms: (data: Room[]) => localStorage.setItem(KEYS.ROOMS, JSON.stringify(data)),

  getInitialCash: (): number => Number(localStorage.getItem(KEYS.INITIAL_CASH) || 0),
  saveInitialCash: (amount: number) => localStorage.setItem(KEYS.INITIAL_CASH, String(amount)),

  clearAllData: () => {
    localStorage.setItem(KEYS.RESERVATIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.TRANSACTIONS, JSON.stringify([]));
    localStorage.setItem(KEYS.CONSUMPTION, JSON.stringify([]));
    localStorage.setItem(KEYS.INITIAL_CASH, '0');
    // We keep PRODUCTS, MAINTENANCE, USERS, ROOMS, CONTACTS as they are structural/master data
    // But maybe the user wants to reset stock too? "vuelvan todos los campos a cero o vacio"
    // Usually "reinicio a cero" in this context means clearing the operational data (reservations, cash, transactions)
    // I'll also reset product stock to initial values if they want a full reset.
    localStorage.setItem(KEYS.PRODUCTS, JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem(KEYS.MAINTENANCE, JSON.stringify(INITIAL_MAINTENANCE));
    // Reset debts on contacts
    const contacts = JSON.parse(localStorage.getItem(KEYS.CONTACTS) || '[]');
    const resetContacts = contacts.map((c: any) => ({ ...c, debt: 0 }));
    localStorage.setItem(KEYS.CONTACTS, JSON.stringify(resetContacts));
  }
};
