
import { Product, Room, RoomColor, MaintenanceItem } from './types';

export const ROOMS: Room[] = [
  { id: 'sala1', name: 'Sala 1', color: RoomColor.BLUE, hex: '#1e3a8a', price: 8500 },
  { id: 'sala2', name: 'Sala 2', color: RoomColor.GREEN, hex: '#14532d', price: 9000 },
  { id: 'salaA', name: 'Sala A', color: RoomColor.VIOLET, hex: '#581c87', price: 10500 },
  { id: 'sala3', name: 'Sala 3', color: RoomColor.RED, hex: '#991b1b', price: 8000 },
];

export const INCOME_CATEGORIES = [
  'Estudio Nacho', 
  'Colo', 
  'Taller Arriba', 
  'Entrepiso Barra (Nerds)', 
  'Sala Vacía (ex estudio)'
];

export const EXPENSE_CATEGORIES = [
  'Luz', 
  'Alquiler', 
  'ABL', 
  'Compras Barra', 
  'Personal', 
  'Mantenimiento',
  'RETIRO_EFECTIVO'
];

export const INITIAL_PRODUCTS: Product[] = [
  // Drinks
  { id: 'p1', name: 'Coca 600', price: 1500, cost: 800, stock: 20, category: 'BAR' },
  { id: 'p2', name: 'Sprite 600', price: 1500, cost: 800, stock: 20, category: 'BAR' },
  { id: 'p3', name: 'Agua', price: 1000, cost: 400, stock: 30, category: 'BAR' },
  { id: 'p4', name: 'Vino', price: 3000, cost: 1500, stock: 10, category: 'BAR' },
  { id: 'p5', name: 'Fernet', price: 4000, cost: 2000, stock: 10, category: 'BAR' },
  { id: 'p6', name: 'IPA Lager', price: 2500, cost: 1200, stock: 2, category: 'BAR' }, // Low stock test
  { id: 'p7', name: 'IPA Red', price: 2500, cost: 1200, stock: 15, category: 'BAR' },
  { id: 'p8', name: 'IPA Golden', price: 2500, cost: 1200, stock: 15, category: 'BAR' },
  { id: 'p9', name: 'Pizza', price: 5000, cost: 2000, stock: 10, category: 'BAR' },
  { id: 'p10', name: 'Empanadas', price: 800, cost: 300, stock: 50, category: 'BAR' },
  // Instruments
  { id: 'i1', name: 'Guitarra A', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i2', name: 'Guitarra B', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i3', name: 'Bajo', price: 2000, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i4', name: 'Set Platos', price: 1500, cost: 0, stock: 1, category: 'INSTRUMENT' },
  { id: 'i5', name: 'Teclado', price: 2500, cost: 0, stock: 1, category: 'INSTRUMENT' },
  // Special
  { id: 'bar_generic', name: 'Barra (Manual)', price: 0, cost: 0, stock: 9999, category: 'BAR' },
];

export const INITIAL_MAINTENANCE: MaintenanceItem[] = [
  // Sala 1
  { id: 'm1', name: 'Batería Sonor SmartForce 505', roomId: 'sala1', status: 'OK' },
  { id: 'm2', name: 'Amp Bajo Hartke HA2500', roomId: 'sala1', status: 'OK' },
  { id: 'm3', name: 'Amp Guitarra Fender HotRod', roomId: 'sala1', status: 'OK' },
  { id: 'm4', name: 'Amp Guitarra Peavey Windsor', roomId: 'sala1', status: 'OK' },
  { id: 'm5', name: 'Piano R.Weimar', roomId: 'sala1', status: 'OK' },
  { id: 'm6', name: 'Consola Yamaha EMX2000', roomId: 'sala1', status: 'OK' },
  // Sala 2
  { id: 'm7', name: 'Batería Gretsch Renegade', roomId: 'sala2', status: 'OK' },
  { id: 'm8', name: 'Amp Bajo GK mb200', roomId: 'sala2', status: 'OK' },
  { id: 'm9', name: 'Amp Marshall MG100', roomId: 'sala2', status: 'OK' },
  { id: 'm10', name: 'Amp Laney Lx120N', roomId: 'sala2', status: 'OK' },
  { id: 'm11', name: 'Consola Yamaha MG16', roomId: 'sala2', status: 'OK' },
  // Sala A
  { id: 'm12', name: 'Batería', roomId: 'salaA', status: 'OK' },
  { id: 'm13', name: 'Amp Bajo', roomId: 'salaA', status: 'OK' },
  { id: 'm14', name: 'Amp Guitarra 1', roomId: 'salaA', status: 'OK' },
  { id: 'm15', name: 'Amp Guitarra 2', roomId: 'salaA', status: 'OK' },
  { id: 'm16', name: 'Consola Yamaha Parquer', roomId: 'salaA', status: 'OK' },
  // Sala 3
  { id: 'm17', name: 'Batería', roomId: 'sala3', status: 'OK' },
  { id: 'm18', name: 'Amp Bajo', roomId: 'sala3', status: 'OK' },
  { id: 'm19', name: 'Amp Guitarra', roomId: 'sala3', status: 'OK' },
  { id: 'm20', name: 'Consola', roomId: 'sala3', status: 'OK' },
];

export const STAFF_USERS = ['zequi', 'nacho', 'mai', 'ove', 'abi', 'santi'];
