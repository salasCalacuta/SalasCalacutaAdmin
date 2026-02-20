
import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { Login } from './components/Login';
import { Button } from './components/ui/Button';
import { storage, initDB } from './services/storage';
import { User, UserRole, Reservation, Product, Transaction, MaintenanceItem, Consumption, RoomColor, StaffShift, Contact, Room } from './types';
import { ROOMS as DEFAULT_ROOMS } from './constants';
import { StockView } from './components/admin/StockView';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DailyBands } from './components/staff/DailyBands';
import { GeneralBarView } from './components/staff/GeneralBarView';
import { NewReservation } from './components/client/NewReservation';
import { Calculator } from './components/client/Calculator';
import { Input, Select } from './components/ui/Input';
import { CobrosView } from './components/admin/CobrosView';
import { PagosView } from './components/admin/PagosView';
import { PricesView } from './components/admin/PricesView';
import { MaintenanceView } from './components/admin/MaintenanceView';
import { CashView } from './components/admin/CashView';
import { StaffScheduleView } from './components/admin/StaffScheduleView';
import { InstrumentsView } from './components/staff/InstrumentsView';
import { ContactsView } from './components/reservas/ContactsView';
import { CalendarSyncView } from './components/reservas/CalendarSyncView';
import { ChatView } from './components/reservas/ChatView';
import { ReservasUserView } from './components/reservas/ReservasUserView';
import { X } from 'lucide-react';

// Helper for tabs
const TabButton: React.FC<{ active: boolean; onClick: () => void; children: React.ReactNode; alert?: boolean }> = ({ active, onClick, children, alert }) => (
  <button 
    onClick={onClick}
    className={`relative px-4 py-3 text-sm font-bold uppercase tracking-wider transition-all duration-300 text-left
      ${active ? 'bg-[#D2B48C] text-black' : 'bg-transparent text-[#D2B48C] hover:bg-[#D2B48C]/10'}
      w-full border-b md:border-b-0 md:border-l-4 ${active ? 'border-transparent' : 'border-transparent'}
    `}
  >
    {children}
    {alert && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
  </button>
);

// Global Footer Component (WhatsApp Only)
const GlobalFooter: React.FC = () => (
    <footer className="w-full bg-black border-t border-[#D2B48C]/20 p-4 flex justify-end items-end shrink-0 mt-auto">
        {/* Right Side: WhatsApp */}
        <div className="flex flex-col items-center">
            <span className="text-[#D2B48C] text-[10px] uppercase font-bold mb-1">escribinos</span>
            <a 
                href="https://wa.me/5491124623323" 
                target="_blank" 
                rel="noreferrer" 
                className="text-green-500 hover:text-green-400 transition-colors"
                title="WhatsApp 11-2462-3323"
            >
                <svg viewBox="0 0 24 24" width="48" height="48" fill="currentColor">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
            </a>
        </div>
    </footer>
);

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [view, setView] = useState<string>('home');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  // Data State
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [maintenance, setMaintenance] = useState<MaintenanceItem[]>([]);
  const [consumptions, setConsumptions] = useState<Consumption[]>([]);
  const [shifts, setShifts] = useState<StaffShift[]>([]);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [rooms, setRooms] = useState<Room[]>(DEFAULT_ROOMS);
  const [initialCash, setInitialCash] = useState<number>(0);
  
  // UI State
  const [selectedContactBand, setSelectedContactBand] = useState<string>('');
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);

  useEffect(() => {
    initDB();
    refreshData();
  }, []);

  const refreshData = () => {
    setReservations(storage.getReservations());
    setProducts(storage.getProducts());
    setTransactions(storage.getTransactions());
    setMaintenance(storage.getMaintenance());
    setConsumptions(storage.getConsumption());
    setContacts(storage.getContacts());
    setRooms(storage.getRooms());
    setInitialCash(storage.getInitialCash());
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setShowLoginModal(false); // Close modal on login
    if (user.role === UserRole.ADMIN) setView('reservas'); // Keeps internal ID but label changes
    else if (user.role === UserRole.STAFF) setView('bandas');
    else if (user.role === UserRole.RESERVAS) setView('contactos');
    else setView('reservar');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('home');
    setSelectedContactBand('');
  };

  // --- Actions ---

  const handleUpdateStock = (updatedProduct: Product) => {
    const newProducts = products.map(p => p.id === updatedProduct.id ? updatedProduct : p);
    storage.saveProducts(newProducts);
    setProducts(newProducts);
  };

  const handleUpdateRoom = (updatedRoom: Room) => {
      const newRooms = rooms.map(r => r.id === updatedRoom.id ? updatedRoom : r);
      storage.saveRooms(newRooms);
      setRooms(newRooms);
  };

  const handleAddStockExpense = (product: Product, quantity: number) => {
     // Create expense when adding stock
     const cost = product.cost * quantity;
     if (cost > 0) {
         const tx: Transaction = {
             id: Date.now().toString(),
             type: 'EXPENSE',
             category: 'Compras Barra',
             amount: cost,
             date: new Date().toISOString(),
             description: `Stock: ${product.name} x${quantity}`,
             isPaid: true
         };
         handleAddTransaction(tx);
     }
  };

  const handleCreateProduct = (p: Product) => {
      const newProducts = [...products, p];
      storage.saveProducts(newProducts);
      setProducts(newProducts);
  };

  const handleReservationStatus = (id: string, status: Reservation['status']) => {
    const updated = reservations.map(r => r.id === id ? { ...r, status } : r);
    storage.saveReservations(updated);
    setReservations(updated);
  };

  // New function to delete reservation entirely (Error Interno)
  const handleDeleteReservation = (id: string) => {
      const updated = reservations.filter(r => r.id !== id);
      storage.saveReservations(updated);
      setReservations(updated);
  };

  const handleToggleAbono = (id: string) => {
      const updated = reservations.map(r => r.id === id ? { ...r, isAbono: !r.isAbono } : r);
      storage.saveReservations(updated);
      setReservations(updated);
  }

  const handleAddConsumption = (resId: string, product: Product) => {
    if (product.stock <= 0 && product.category === 'BAR' && product.id !== 'bar_generic' && product.id !== 'manual') return alert("Sin stock");
    
    if (product.category === 'BAR' && product.id !== 'bar_generic' && product.id !== 'manual') {
        handleUpdateStock({ ...product, stock: product.stock - 1 });
    }

    const existing = consumptions.find(c => c.reservationId === resId);
    let newConsumptions = [];
    if (existing) {
        const itemIndex = existing.items.findIndex(i => i.productId === product.id && i.price === product.price);
        let newItems = [...existing.items];
        if (itemIndex >= 0) {
            newItems[itemIndex].quantity += 1;
        } else {
            newItems.push({ productId: product.id, name: product.name, price: product.price, quantity: 1 });
        }
        const updatedCons = { 
            ...existing, 
            items: newItems, 
            total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0) 
        };
        newConsumptions = consumptions.map(c => c.reservationId === resId ? updatedCons : c);
    } else {
        const newCons: Consumption = {
            id: Date.now().toString(),
            reservationId: resId,
            items: [{ productId: product.id, name: product.name, price: product.price, quantity: 1 }],
            total: product.price,
            paid: false
        };
        newConsumptions = [...consumptions, newCons];
    }
    storage.saveConsumption(newConsumptions);
    setConsumptions(newConsumptions);
  };

  const handleUpdateConsumptionItem = (resId: string, productId: string, change: number, isDelete: boolean = false) => {
      const existing = consumptions.find(c => c.reservationId === resId);
      if (!existing) return;

      let newItems = [...existing.items];
      const idx = newItems.findIndex(i => i.productId === productId);
      if (idx === -1) return;

      if (isDelete) {
          newItems.splice(idx, 1);
      } else {
          newItems[idx].quantity += change;
          if (newItems[idx].quantity <= 0) {
              newItems.splice(idx, 1);
          }
      }

      const updatedCons = {
          ...existing,
          items: newItems,
          total: newItems.reduce((acc, i) => acc + (i.price * i.quantity), 0)
      };

      const newConsumptions = consumptions.map(c => c.reservationId === resId ? updatedCons : c);
      storage.saveConsumption(newConsumptions);
      setConsumptions(newConsumptions);
  };

  const handleCloseBand = (resId: string, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', partialAmount?: number) => {
    const res = reservations.find(r => r.id === resId);
    const cons = consumptions.find(c => c.reservationId === resId);
    if(!res) return;

    // Logic: If Abono, Room Price is 0.
    const roomPrice = res.isAbono ? 0 : res.totalAmount;
    const total = (cons?.total || 0) + roomPrice; 

    // Handle DEBT and Partial Payments
    if (method === 'DEBT') {
        const contact = contacts.find(c => c.bandName.toLowerCase() === res.bandName.toLowerCase());
        
        let incomeAmount = 0; // Amount actually entering the box (Partial)
        let debtAmount = total;

        if (partialAmount !== undefined) {
            incomeAmount = partialAmount;
            debtAmount = total - partialAmount;
        }

        // 1. Record Partial Payment as Income (if any)
        if (incomeAmount > 0) {
            const partialTx: Transaction = {
                id: Date.now().toString() + '_partial',
                type: 'INCOME',
                category: 'COBRO_BANDA',
                amount: incomeAmount,
                date: new Date().toISOString(),
                description: `Cobro Parcial ${res.bandName}`,
                isPaid: true,
                paymentMethod: 'CASH' // Assume Cash for partial unless specified, or could add partialMP
            };
            handleAddTransaction(partialTx);
        }

        // 2. Update Debt on Contact
        if (contact && debtAmount > 0) {
            const updatedContact = { ...contact, debt: (contact.debt || 0) + debtAmount };
            const newContacts = contacts.map(c => c.id === contact.id ? updatedContact : c);
            storage.saveContacts(newContacts);
            setContacts(newContacts);
        }
    } else {
        // Full Payment (CASH or MP)
        const newTx: Transaction = {
            id: Date.now().toString(),
            type: 'INCOME',
            category: 'COBRO_BANDA',
            amount: total,
            date: new Date().toISOString(),
            description: `Cobro banda ${res.bandName} ${res.isAbono ? '(Abono)' : ''}`,
            isPaid: true,
            paymentMethod: method 
        };
        handleAddTransaction(newTx);
    }
    
    // Mark Reservation as COMPLETED (Attended/Paid)
    handleReservationStatus(resId, 'COMPLETED');
    
    if(cons) {
        const updatedCons = consumptions.map(c => c.id === cons.id ? { ...c, paid: true, paymentMethod: method } : c);
        storage.saveConsumption(updatedCons);
        setConsumptions(updatedCons);
    }
  };

  const handleGeneralBarTransaction = (amount: number, method: 'CASH' | 'MERCADOPAGO' | 'DEBT', descriptionSuffix: string = '') => {
      const tx: Transaction = {
          id: Date.now().toString(),
          type: 'INCOME',
          category: 'Barra',
          amount: amount,
          date: new Date().toISOString(),
          description: `Venta de Barra (General)${descriptionSuffix}`,
          isPaid: method !== 'DEBT',
          paymentMethod: method
      };
      handleAddTransaction(tx);
  };

  const handleDayClose = () => {
      try {
          const now = new Date();
          const todayString = now.toDateString(); 
          
          const todayTxs = transactions.filter(t => {
              if (!t.isPaid || !t.date) return false;
              // Filter out DEBT transactions for cash closing
              if (t.paymentMethod === 'DEBT') return false; 
              return new Date(t.date).toDateString() === todayString;
          });

          // Only sum Income
          const incomeTxs = todayTxs.filter(t => t.type === 'INCOME');
          
          const totalCash = incomeTxs.filter(t => t.paymentMethod === 'CASH').reduce((s,t) => s + t.amount, 0);
          const totalMP = incomeTxs.filter(t => t.paymentMethod === 'MERCADOPAGO').reduce((s,t) => s + t.amount, 0);
          const totalDay = totalCash + totalMP;

          // Force re-render just in case
          setTransactions([...transactions]);
          
          // No alert here, called by UI
      } catch (e) {
          console.error(e);
          alert("Error al cerrar la caja. Por favor revisa la consola.");
      }
  };

  const handleAddTransaction = (t: Transaction) => {
      const newTxs = [...transactions, t];
      storage.saveTransactions(newTxs);
      setTransactions(newTxs);
  };
  
  const handleUpdateTransaction = (t: Transaction) => {
      const newTxs = transactions.map(tx => tx.id === t.id ? t : tx);
      storage.saveTransactions(newTxs);
      setTransactions(newTxs);
  };

  const handleToggleTransactionStatus = (id: string) => {
      const updated = transactions.map(t => t.id === id ? { ...t, isPaid: !t.isPaid } : t);
      storage.saveTransactions(updated);
      setTransactions(updated);
  };

  const handleSettleDebt = (contactId: string, amount: number, type: 'PAY' | 'VOID') => {
      const contact = contacts.find(c => c.id === contactId);
      if (!contact) return;

      // 1. Clear Debt from Contact
      const updatedContact = { ...contact, debt: 0 };
      const newContacts = contacts.map(c => c.id === contact.id ? updatedContact : c);
      storage.saveContacts(newContacts);
      setContacts(newContacts);

      // 2. Register Transaction
      if (type === 'PAY') {
          // Income
          const tx: Transaction = {
              id: Date.now().toString(),
              type: 'INCOME',
              category: 'COBRO_DEUDA',
              amount: amount,
              date: new Date().toISOString(),
              description: `Cobro Deuda Total: ${contact.bandName}`,
              isPaid: true,
              paymentMethod: 'CASH'
          };
          handleAddTransaction(tx);
          alert("Deuda cobrada e ingresada a Caja.");
      } else {
          // Void (Expense/Loss)
          const tx: Transaction = {
              id: Date.now().toString(),
              type: 'EXPENSE',
              category: 'DEUDA_ANULADA',
              amount: amount,
              date: new Date().toISOString(),
              description: `Deuda Anulada: ${contact.bandName}`,
              isPaid: true
          };
          handleAddTransaction(tx);
          alert("Deuda anulada y registrada como pérdida.");
      }
  };

  const handleClientReserve = (data: { date: string, timeStart: string, timeEnd: string, roomId: string }) => {
      const room = rooms.find(r => r.id === data.roomId);
      const newRes: Reservation = {
          id: Date.now().toString(),
          clientName: currentUser?.username || 'Unknown',
          bandName: currentUser?.bandName || 'Unknown',
          date: data.date,
          timeStart: data.timeStart,
          timeEnd: data.timeEnd,
          roomId: data.roomId,
          status: 'PENDING',
          totalAmount: room ? room.price : 0
      };
      const updated = [...reservations, newRes];
      storage.saveReservations(updated);
      setReservations(updated);
  };
  
  // Helper for overlaps
  const checkConflict = (date: string, timeStart: string, timeEnd: string, roomId: string): boolean => {
      return reservations.some(r => 
          r.status !== 'REJECTED' && 
          r.date === date && 
          r.roomId === roomId &&
          (
              (timeStart >= r.timeStart && timeStart < r.timeEnd) || 
              (timeEnd > r.timeStart && timeEnd <= r.timeEnd) ||
              (timeStart <= r.timeStart && timeEnd >= r.timeEnd)
          )
      );
  };

  const handleAdminOrReservasCreate = (data: { 
      date: string, timeStart: string, timeEnd: string, roomId: string, bandName: string, isAbono?: boolean
  }): { success: boolean, message?: string } => {
      
      const room = rooms.find(r => r.id === data.roomId);
      const datesToBook: string[] = [data.date];

      // Logic: If Abono, find all same weekdays for the rest of the current month
      if (data.isAbono) {
          // Parse properly YYYY-MM-DD
          const [y, m, d] = data.date.split('-').map(Number);
          // Create date object (Month is 0-indexed)
          const current = new Date(y, m - 1, d);
          const targetMonth = current.getMonth();

          // Loop until month changes
          while (true) {
              current.setDate(current.getDate() + 7);
              if (current.getMonth() !== targetMonth) break;
              // Format back to YYYY-MM-DD
              const ny = current.getFullYear();
              const nm = String(current.getMonth() + 1).padStart(2, '0');
              const nd = String(current.getDate()).padStart(2, '0');
              datesToBook.push(`${ny}-${nm}-${nd}`);
          }
      }

      // 1. Check conflicts for ALL dates first (Atomic operation)
      for (const d of datesToBook) {
          if (checkConflict(d, data.timeStart, data.timeEnd, data.roomId)) {
              return { success: false, message: `Horario ocupado en fecha ${d}` };
          }
      }

      // 2. Create reservations
      const newReservations: Reservation[] = [];
      datesToBook.forEach((d, idx) => {
          newReservations.push({
            id: Date.now().toString() + idx,
            clientName: data.bandName,
            bandName: data.bandName,
            date: d,
            timeStart: data.timeStart,
            timeEnd: data.timeEnd,
            roomId: data.roomId,
            status: 'CONFIRMED',
            totalAmount: room ? room.price : 0,
            isAbono: data.isAbono
          });
      });

      const updated = [...reservations, ...newReservations];
      storage.saveReservations(updated);
      setReservations(updated);
      return { success: true };
  }

  const handleCancelReservation = (id: string) => {
      if(window.confirm("¿Seguro que deseas cancelar esta solicitud?")) {
          // Status strict cast fix
          const updated = reservations.map(r => r.id === id ? { ...r, status: 'REJECTED' as const } : r);
          storage.saveReservations(updated);
          setReservations(updated); 
      }
  }

  const handleUpdateMaintenance = (item: MaintenanceItem) => {
      const updated = maintenance.map(m => m.id === item.id ? item : m);
      storage.saveMaintenance(updated);
      setMaintenance(updated);
  };

  const handleCreateMaintenanceItem = (name: string, roomId: string) => {
     const existing = maintenance.find(m => m.name === name && m.roomId === roomId);
     if (existing) {
         handleUpdateMaintenance({...existing, status: 'REPAIR', repairDate: new Date().toISOString().split('T')[0]});
     } else {
        const newItem: MaintenanceItem = {
            id: Date.now().toString(),
            name, 
            roomId,
            status: 'REPAIR',
            repairDate: new Date().toISOString().split('T')[0]
        };
        const updated = [...maintenance, newItem];
        storage.saveMaintenance(updated);
        setMaintenance(updated);
     }
  };

  const handlePayRepair = (item: MaintenanceItem, cost: number) => {
      if (cost > 0) {
        const tx: Transaction = {
            id: Date.now().toString(),
            type: 'EXPENSE',
            category: 'Mantenimiento',
            amount: cost,
            date: new Date().toISOString(),
            description: `Reparación ${item.name}`,
            isPaid: true
        };
        handleAddTransaction(tx);
      }
      const updatedItem: MaintenanceItem = { 
          ...item, 
          isPaid: true, 
          actualCost: cost, 
          status: 'OK',
          repairDate: undefined 
      };
      handleUpdateMaintenance(updatedItem);
  };

  const handleAddShift = (shift: StaffShift) => setShifts([...shifts, shift]);
  const handleRemoveShift = (id: string) => setShifts(shifts.filter(s => s.id !== id));
  
  // NEW: Update Shift
  const handleUpdateShift = (updatedShift: StaffShift) => {
      const updated = shifts.map(s => s.id === updatedShift.id ? updatedShift : s);
      setShifts(updated);
  };

  const handleAddContact = (c: Contact) => {
      const newContacts = [...contacts, c];
      storage.saveContacts(newContacts);
      setContacts(newContacts);
  };

  // NEW: Handle Pay Abono from Contacts
  const handlePayAbono = (contactId: string, amount: number, description: string) => {
      // 1. Update Contact
      const updatedContacts = contacts.map(c => c.id === contactId ? { ...c, isAbono: true } : c);
      storage.saveContacts(updatedContacts);
      setContacts(updatedContacts);

      // 2. Add Transaction
      const tx: Transaction = {
          id: Date.now().toString(),
          type: 'INCOME',
          category: 'COBRO_ABONO',
          amount: amount,
          date: new Date().toISOString(),
          description: description,
          isPaid: true,
          paymentMethod: 'CASH' // Default or could add selector in modal
      };
      handleAddTransaction(tx);
  };
  
  const handleUpdateInitialCash = (amount: number) => {
      storage.saveInitialCash(amount);
      setInitialCash(amount);
  };

  const handleResetToZero = () => {
      storage.clearAllData();
      refreshData();
      alert("Sistema reiniciado a cero con éxito.");
  };

  const handleNavigateToReserve = (bandName: string) => {
      setSelectedContactBand(bandName);
      setView('reservas_view');
  };

  const handleSyncCalendar = () => {
      // Simulate creating dummy reservations for the next few days
      const newRes: Reservation[] = [];
      const now = new Date();
      for (let i = 1; i < 4; i++) {
          const d = new Date(now);
          d.setDate(now.getDate() + i);
          newRes.push({
              id: Date.now().toString() + i,
              clientName: `SyncBanda ${i}`,
              bandName: `SyncBanda ${i}`,
              date: d.toISOString().split('T')[0],
              timeStart: '18:00',
              timeEnd: '20:00',
              roomId: rooms[i % 3].id,
              status: 'CONFIRMED',
              totalAmount: rooms[i % 3].price
          });
      }
      const updated = [...reservations, ...newRes];
      storage.saveReservations(updated);
      setReservations(updated);
      alert(`Se han sincronizado ${newRes.length} eventos del Calendar.`);
  };

  // --- Render ---

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center relative">
        <Header 
            isLoggedIn={false} 
            onViewSalas={() => setView(view === 'guest_salas' ? 'home' : 'guest_salas')} 
            onViewQuienes={() => setView('guest_quienes')}
            onViewEspacio={() => setView('guest_espacio')}
            onGoHome={() => setView('home')}
            onOpenLogin={() => setShowLoginModal(true)}
        />
        
        {/* LOGIN MODAL */}
        {showLoginModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
                <div className="relative w-full max-w-sm">
                    <button 
                        onClick={() => setShowLoginModal(false)}
                        className="absolute -top-10 right-0 text-white hover:text-[#D2B48C]"
                    >
                        <X size={32} />
                    </button>
                    <Login onLogin={handleLogin} />
                </div>
            </div>
        )}

        {view === 'guest_salas' && (
             <div className="flex-1 w-full p-8 max-w-4xl mx-auto">
                <div className="mb-4">
                    <button onClick={() => setView('home')} className="text-[#D2B48C] hover:text-white underline mb-4">&larr; Volver</button>
                    <h2 className="text-2xl font-bold text-[#D2B48C] mb-4 text-center">Nuestras Salas</h2>
                </div>
                <div className="grid gap-6">
                    {rooms.map(room => {
                        // Image Mapping for Guests (Same logic as user but repeated for 4 images)
                        let images: string[] = [];
                        if (room.id === 'sala1') images = [
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu",
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu"
                        ];
                        if (room.id === 'sala2') images = [
                            "https://lh3.googleusercontent.com/d/11nJQoEYlzMrkxoQIBSy-ms2HEOjZgszT", 
                            "https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK",
                            "https://lh3.googleusercontent.com/d/11nJQoEYlzMrkxoQIBSy-ms2HEOjZgszT", 
                            "https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK"
                        ];
                        if (room.id === 'salaA') images = [
                            "https://lh3.googleusercontent.com/d/1gD4HPzANu4y9ipqs71xMhXO0SHrPF-dm", 
                            "https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1",
                            "https://lh3.googleusercontent.com/d/1gD4HPzANu4y9ipqs71xMhXO0SHrPF-dm", 
                            "https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1"
                        ];
                         // Default logic for new Sala 3 (reusing Sala 1 images as placeholder)
                         if (room.id === 'sala3') images = [
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu",
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu"
                        ];

                        return (
                            <div key={room.id} className="border border-gray-800 rounded p-4 bg-gray-900">
                                <h3 className="text-xl font-bold mb-2" style={{ color: room.hex }}>{room.name}</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    {images.map((img, i) => (
                                        <img key={i} src={img} className="rounded opacity-90 hover:opacity-100 transition-opacity w-full h-48 object-cover aspect-square" alt="Sala" />
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
             </div>
        )}

        {view === 'guest_quienes' && (
             <div className="flex-1 w-full p-8 max-w-4xl mx-auto text-center">
                 <button onClick={() => setView('home')} className="text-[#D2B48C] hover:text-white underline mb-4">&larr; Volver</button>
                 <h2 className="text-2xl font-bold text-[#D2B48C] mb-4">Quienes Somos</h2>
                 <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm md:text-base border border-[#D2B48C]/30 p-6 rounded bg-gray-900">
                    Somos Salas Calacuta, donde le damos importancia al arte en todos sus aspectos. Tenemos salas equipadas para ensayos y profesores. Tenemos una barra con precios económicos y una terraza para disfrutar del aire libre. Brindamos servicio de alquiler de equipamiento, de instrumentos y contamos con un estudio para mezcla.
                 </p>
             </div>
        )}
        
        {view === 'guest_espacio' && (
             <div className="flex-1 w-full p-8 max-w-4xl mx-auto text-center space-y-12">
                 <button onClick={() => setView('home')} className="text-[#D2B48C] hover:text-white underline mb-4 inline-block">&larr; Volver</button>
                 <h2 className="text-3xl font-bold text-[#D2B48C] mb-8">Nuestro Espacio</h2>
                 
                 {/* PLANTA BAJA */}
                 <div>
                    <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Planta Baja</h3>
                    <div className="flex justify-center">
                        <img src="https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Planta Baja 1" />
                    </div>
                 </div>

                 {/* PRIMER PISO */}
                 <div>
                    <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Primer Piso</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                        <img src="https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 1" />
                        <img src="https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 2" />
                    </div>
                 </div>

                 {/* TERRAZA */}
                 <div>
                    <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Terraza</h3>
                    <div className="flex justify-center">
                        <img src="https://lh3.googleusercontent.com/d/12SZJ9hoq5pui4Bs30LCaqLVdlpSpfLeo" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Terraza 1" />
                    </div>
                 </div>
             </div>
        )}

        {view === 'home' && (
             <div className="flex-1 w-full max-w-4xl p-4 flex flex-col items-center justify-center">
                <div className="mb-8 transform scale-125">
                    <div className="w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-[#D2B48C] shadow-lg bg-gray-900 flex items-center justify-center">
                        <img src="https://lh3.googleusercontent.com/d/1V9wXGOpisrKGMy-CCbFplO-ZiadWpSKs" alt="Logo Salas Calacuta" className="object-cover w-full h-full" />
                    </div>
                </div>
                {/* Login Form REMOVED from body. Triggered via Header Button */}
            </div>
        )}

        <GlobalFooter />
      </div>
    );
  }

  // --- LOGGED IN RENDER ---

  const lowStockAlert = products.some(p => p.stock < 5 && p.category === 'BAR');
  
  const myConsumption = consumptions.filter(c => {
      const res = reservations.find(r => r.id === c.reservationId);
      return res?.bandName === currentUser.bandName && !c.paid;
  });
  const myTotalConsumption = myConsumption.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className="min-h-screen bg-black flex flex-col text-[#D2B48C] relative">
      <Header 
        isLoggedIn={true} 
        onViewSalas={() => setView('salas')} 
        onViewQuienes={() => setView('quienes_somos')}
        onViewEspacio={() => setView('nuestro_espacio')}
        onGoHome={() => setView(currentUser.role === UserRole.STAFF ? 'bandas' : 'home')}
      />

      {/* Lightbox Modal */}
      {lightboxImg && (
          <div 
             className="fixed inset-0 z-50 bg-black/95 flex justify-center items-center cursor-pointer p-4"
             onClick={() => setLightboxImg(null)}
          >
              <img src={lightboxImg} alt="Full View" className="max-h-full max-w-full rounded border-2 border-[#D2B48C] shadow-2xl" />
          </div>
      )}
      
      <div className="bg-[#D2B48C]/10 border-b border-[#D2B48C]/20 px-4 py-2 flex justify-between items-center text-xs text-[#D2B48C]">
        <div className="flex gap-4">
            <span>Usuario: <b>{currentUser.username}</b> ({currentUser.role})</span>
            {currentUser.bandName && <span>Banda: {currentUser.bandName}</span>}
        </div>
        <button onClick={handleLogout} className="underline hover:text-white">Cerrar Sesión</button>
      </div>

      <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden">
        
        <nav className="w-full md:w-48 bg-gray-900 border-b md:border-b-0 md:border-r border-[#D2B48C]/20 flex flex-col shrink-0 overflow-y-auto">
            {/* OVEJA (ADMIN) */}
            {currentUser.role === UserRole.ADMIN && (
                <>
                    <TabButton active={view === 'reservas'} onClick={() => setView('reservas')}>Agenda</TabButton>
                    <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>
                    <TabButton active={view === 'personal'} onClick={() => setView('personal')}>Personal</TabButton>
                    <TabButton active={view === 'stock'} onClick={() => setView('stock')} alert={lowStockAlert}>Stock</TabButton>
                    <TabButton active={view === 'caja'} onClick={() => setView('caja')}>Caja</TabButton>
                    <TabButton active={view === 'pagos'} onClick={() => setView('pagos')}>Pagos</TabButton>
                    <TabButton active={view === 'cobros'} onClick={() => setView('cobros')}>Cobros</TabButton>
                    <TabButton active={view === 'precios'} onClick={() => setView('precios')}>Precios</TabButton>
                    <TabButton active={view === 'mantenimiento'} onClick={() => setView('mantenimiento')}>Mantenimiento</TabButton>
                    <TabButton active={view === 'admin'} onClick={() => setView('admin')}>Admin</TabButton>
                </>
            )}

            {/* PERSONAL (STAFF) */}
            {currentUser.role === UserRole.STAFF && (
                <>
                    <TabButton active={view === 'bandas'} onClick={() => setView('bandas')}>Bandas</TabButton>
                    <TabButton active={view === 'barra_banda'} onClick={() => setView('barra_banda')}>Barra Banda</TabButton>
                    <TabButton active={view === 'barra'} onClick={() => setView('barra')}>Barra</TabButton>
                    <TabButton active={view === 'instrumentos'} onClick={() => setView('instrumentos')}>Instrumentos</TabButton>
                    <TabButton active={view === 'cierre'} onClick={() => setView('cierre')}>Cierre</TabButton>
                </>
            )}

            {/* RESERVAS USER */}
            {currentUser.role === UserRole.RESERVAS && (
                <>
                    <TabButton active={view === 'contactos'} onClick={() => setView('contactos')}>Contactos</TabButton>
                    <TabButton active={view === 'sync'} onClick={() => setView('sync')}>Sincronizar Calendar</TabButton>
                    <TabButton active={view === 'chat'} onClick={() => setView('chat')}>Chat</TabButton>
                    <TabButton active={view === 'reservas_view'} onClick={() => setView('reservas_view')}>Reservar</TabButton>
                </>
            )}

            {/* CLIENTE */}
            {currentUser.role === UserRole.CLIENT && (
                <>
                    <TabButton active={view === 'reservar'} onClick={() => setView('reservar')}>Reservar</TabButton>
                    <TabButton active={view === 'historial'} onClick={() => setView('historial')}>Historial</TabButton>
                    <TabButton active={view === 'consumos'} onClick={() => setView('consumos')}>Consumos</TabButton>
                    <TabButton active={view === 'salas'} onClick={() => setView('salas')}>Salas</TabButton>
                    <TabButton active={view === 'quienes_somos'} onClick={() => setView('quienes_somos')}>Quienes Somos</TabButton>
                    <TabButton active={view === 'nuestro_espacio'} onClick={() => setView('nuestro_espacio')}>Nuestro Espacio</TabButton>
                </>
            )}
        </nav>

        <main className="flex-1 p-4 md:p-8 overflow-y-auto h-full pb-20">
            {/* OVEJA uses ReservasUserView for full creation control */}
            {view === 'reservas' && <ReservasUserView 
                reservations={reservations} 
                onUpdateStatus={handleReservationStatus} 
                onDelete={handleDeleteReservation}
                onToggleAbono={handleToggleAbono}
                onReserve={handleAdminOrReservasCreate}
                contacts={contacts}
                rooms={rooms}
            />}
            {view === 'stock' && <StockView products={products} onUpdateProduct={handleUpdateStock} onAddStockExpense={handleAddStockExpense} />}
            {view === 'admin' && <AdminDashboard 
                transactions={transactions} 
                reservations={reservations} 
                rooms={rooms} 
                contacts={contacts} 
                currentUser={currentUser}
                onSettleDebt={handleSettleDebt} 
                onResetToZero={handleResetToZero}
            />}
            {view === 'caja' && <CashView 
                transactions={transactions} 
                onAddTransaction={handleAddTransaction} 
                initialCash={initialCash}
                onUpdateInitialCash={handleUpdateInitialCash}
            />}
            {view === 'cobros' && <CobrosView transactions={transactions} onAddTransaction={handleAddTransaction} onToggleStatus={handleToggleTransactionStatus} onUpdateTransaction={handleUpdateTransaction} />}
            {view === 'pagos' && <PagosView 
                transactions={transactions} 
                shifts={shifts}
                onAddTransaction={handleAddTransaction} 
                onToggleStatus={handleToggleTransactionStatus} 
                onUpdateTransaction={handleUpdateTransaction}
            />}
            
            {view === 'precios' && <PricesView 
                products={products} 
                onUpdateProduct={handleUpdateStock} 
                onBulkUpdate={() => {}} // deprecated
                onCreateProduct={handleCreateProduct}
                rooms={rooms}
                onUpdateRoom={handleUpdateRoom}
            />}

            {view === 'mantenimiento' && <MaintenanceView 
                items={maintenance} 
                onUpdateItem={handleUpdateMaintenance} 
                onPayRepair={handlePayRepair} 
            />}

            {view === 'personal' && <StaffScheduleView 
                shifts={shifts} 
                onAddShift={handleAddShift} 
                onRemoveShift={handleRemoveShift}
                onUpdateShift={handleUpdateShift}
            />}

            {view === 'bandas' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={[]} 
                consumptions={consumptions}
                onAddConsumption={() => {}} 
                onCloseBand={handleCloseBand} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={false} // Hide Close Button
            />}
            
            {view === 'barra_banda' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={products.filter(p => p.category === 'BAR')}
                consumptions={consumptions}
                onAddConsumption={handleAddConsumption}
                onCloseBand={() => {}} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={false}
            />}
            
            {view === 'barra' && <GeneralBarView 
                products={products} 
                onAddTransaction={handleGeneralBarTransaction} 
                onUpdateStock={handleUpdateStock}
            />}

            {view === 'instrumentos' && <InstrumentsView 
                reservations={reservations} 
                instruments={products} 
                maintenanceItems={maintenance}
                onAssignInstrument={handleAddConsumption}
                onSendToMaintenance={handleCreateMaintenanceItem}
            />}

            {view === 'cierre' && <DailyBands 
                reservations={reservations} 
                rooms={rooms} 
                products={products.filter(p => p.category === 'BAR')} 
                consumptions={consumptions}
                onAddConsumption={handleAddConsumption} 
                onCloseBand={handleCloseBand} 
                onDayClose={handleDayClose}
                onToggleAbono={handleToggleAbono}
                onUpdateConsumption={handleUpdateConsumptionItem}
                isClosingView={true} // Show Close Button
            />}

            {/* CONTACTOS (Shared by Admin and Reservas) */}
            {view === 'contactos' && <ContactsView 
                contacts={contacts} 
                reservations={reservations}
                onAddContact={handleAddContact} 
                onNavigateToReserve={handleNavigateToReserve}
                onPayAbono={handlePayAbono}
                rooms={rooms}
            />}

            {/* RESERVAS VIEWS */}
            {view === 'sync' && <CalendarSyncView onSync={handleSyncCalendar} />}
            {view === 'chat' && <ChatView />}
            {view === 'reservas_view' && <ReservasUserView 
                reservations={reservations} 
                onUpdateStatus={handleReservationStatus} 
                onDelete={handleDeleteReservation}
                onToggleAbono={handleToggleAbono}
                onReserve={handleAdminOrReservasCreate}
                prefillBandName={selectedContactBand}
                contacts={contacts}
                rooms={rooms}
            />}

            {view === 'reservar' && <NewReservation onReserve={handleClientReserve} userBandName={currentUser.bandName || ''} onSuccessRedirect={() => setView('historial')} rooms={rooms} />}
            
            {view === 'consumos' && (
                <div className="space-y-4">
                     <h2 className="text-xl mb-4 font-bold text-[#D2B48C]">Mis Consumos Pendientes</h2>
                     {myConsumption.length === 0 ? (
                         <p className="text-gray-500">No tienes consumos sin pagar.</p>
                     ) : (
                         <div className="bg-gray-900 p-4 rounded border border-gray-800">
                             {myConsumption.map(c => (
                                 <div key={c.id}>
                                     {c.items.map(i => (
                                         <div key={i.productId} className="flex justify-between border-b border-gray-800 py-2">
                                             <span>{i.quantity}x {i.name}</span>
                                             <span>${i.price * i.quantity}</span>
                                         </div>
                                     ))}
                                 </div>
                             ))}
                             <div className="flex justify-between pt-4 font-bold text-xl text-white">
                                 <span>Total a Pagar (en Cierre)</span>
                                 <span>${myTotalConsumption}</span>
                             </div>
                         </div>
                     )}
                     <p className="text-gray-500 text-sm italic mt-4">* El monto total no es modificable. Es lo que el personal designó.</p>
                     <Calculator />
                </div>
            )}
            
            {view === 'salas' && (
                <div className="grid gap-8">
                    {rooms.map(room => {
                        // REQ: 4 images per room, square and clickable
                        // Reuse existing links to fill 4 slots since new unique links weren't provided for 3rd/4th
                        let images: string[] = [];
                        if (room.id === 'sala1') images = [
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu",
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu"
                        ];
                        if (room.id === 'sala2') images = [
                            "https://lh3.googleusercontent.com/d/11nJQoEYlzMrkxoQIBSy-ms2HEOjZgszT", 
                            "https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK",
                            "https://lh3.googleusercontent.com/d/11nJQoEYlzMrkxoQIBSy-ms2HEOjZgszT", 
                            "https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK"
                        ];
                        if (room.id === 'salaA') images = [
                            "https://lh3.googleusercontent.com/d/1gD4HPzANu4y9ipqs71xMhXO0SHrPF-dm", 
                            "https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1",
                            "https://lh3.googleusercontent.com/d/1gD4HPzANu4y9ipqs71xMhXO0SHrPF-dm", 
                            "https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1"
                        ];
                         // Placeholder images for Sala 3
                         if (room.id === 'sala3') images = [
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu",
                            "https://lh3.googleusercontent.com/d/1cKhE-HdhR-9XZfDlRdbA9oKFCrlIhhX2", 
                            "https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu"
                        ];

                        return (
                            <div key={room.id} className="border border-gray-800 rounded p-6 bg-gray-900">
                                <h3 className="text-2xl font-bold mb-4 border-b border-gray-800 pb-2" style={{ color: room.hex }}>{room.name}</h3>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {images.map((img, i) => (
                                        <div key={i} className="cursor-pointer group overflow-hidden rounded border border-gray-700 hover:border-[#D2B48C]">
                                            <img 
                                                src={img} 
                                                onClick={() => setLightboxImg(img)}
                                                className="w-full h-full object-cover aspect-square group-hover:scale-110 transition-transform duration-500" 
                                                alt={`Sala ${room.name} ${i+1}`} 
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}

            {view === 'quienes_somos' && (
                 <div className="flex-1 w-full max-w-4xl mx-auto text-center">
                     <h2 className="text-2xl font-bold text-[#D2B48C] mb-4">Quienes Somos</h2>
                     <p className="text-white max-w-2xl mx-auto leading-relaxed text-sm md:text-base border border-[#D2B48C]/30 p-6 rounded bg-gray-900">
                        Somos Salas Calacuta, donde le damos importancia al arte en todos sus aspectos. Tenemos salas equipadas para ensayos y profesores. Tenemos una barra con precios económicos y una terraza para disfrutar del aire libre. Brindamos servicio de alquiler de equipamiento, de instrumentos y contamos con un estudio para mezcla.
                     </p>
                 </div>
            )}
            
            {view === 'nuestro_espacio' && (
                 <div className="flex-1 w-full max-w-4xl mx-auto text-center space-y-12">
                     <h2 className="text-3xl font-bold text-[#D2B48C] mb-8">Nuestro Espacio</h2>
                     
                     {/* PLANTA BAJA */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Planta Baja</h3>
                        <div className="flex justify-center">
                            <img src="https://lh3.googleusercontent.com/d/1m1YtnDot1AYwH75Y5hQAAIpDZCQKQkc1" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Planta Baja 1" />
                        </div>
                     </div>

                     {/* PRIMER PISO */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Primer Piso</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                            <img src="https://lh3.googleusercontent.com/d/1CawoOtHpTUptKlEQsxP2Em_37dHOdOUK" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 1" />
                            <img src="https://lh3.googleusercontent.com/d/1m_DosZlO3_qma9o82P9b2B3opuIY0seu" className="w-full h-48 object-cover rounded border border-gray-800" alt="Primer Piso 2" />
                        </div>
                     </div>

                     {/* TERRAZA */}
                     <div>
                        <h3 className="text-xl font-bold text-[#D2B48C] mb-4 uppercase tracking-widest border-b border-[#D2B48C]/30 pb-2 inline-block">Terraza</h3>
                        <div className="flex justify-center">
                            <img src="https://lh3.googleusercontent.com/d/12SZJ9hoq5pui4Bs30LCaqLVdlpSpfLeo" className="w-full max-w-sm h-64 object-cover rounded border border-gray-800" alt="Terraza 1" />
                        </div>
                     </div>
                 </div>
            )}
            
            {view === 'historial' && (
                <div className="space-y-4">
                    <h2 className="text-xl font-bold mb-4 text-[#D2B48C]">Historial de Reservas</h2>
                    {reservations.filter(r => r.bandName === currentUser.bandName).length === 0 ? (
                        <p className="text-gray-500">No hay historial.</p>
                    ) : (
                        reservations.filter(r => r.bandName === currentUser.bandName).sort((a,b) => b.id.localeCompare(a.id)).map(r => (
                            <div key={r.id} className="flex flex-col md:flex-row justify-between items-center border border-gray-800 p-3 rounded bg-gray-900 mb-2">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white">{r.date} ({r.timeStart} - {r.timeEnd})</span>
                                    <span className="text-xs text-gray-400">{rooms.find(room => room.id === r.roomId)?.name}</span>
                                </div>
                                <div className="flex items-center gap-4 mt-2 md:mt-0">
                                    <span className={`px-2 py-1 rounded text-xs font-bold 
                                        ${r.status === 'CONFIRMED' ? 'bg-green-900 text-green-200' : 
                                          r.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' : 
                                          r.status === 'REJECTED' ? 'bg-red-900 text-red-200' : 'bg-gray-700 text-gray-300'}`}>
                                        {r.status === 'REJECTED' ? 'CANCELADO/DENEGADO' : r.status}
                                    </span>
                                    {r.status === 'PENDING' && (
                                        <button onClick={() => handleCancelReservation(r.id)} className="text-red-500 text-xs hover:underline border border-red-900 px-2 py-1 rounded hover:bg-red-900/20">
                                            Cancelar
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
            
             <GlobalFooter />
        </main>
      </div>
    </div>
  );
};

export default App;
