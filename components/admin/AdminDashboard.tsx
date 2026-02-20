import React, { useState } from 'react';
import { Transaction, Reservation, Room, Contact, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend, CartesianGrid } from 'recharts';
// @ts-ignore
import * as XLSX from 'xlsx';
import { Button } from '../ui/Button';

interface AdminDashboardProps {
  transactions: Transaction[];
  reservations?: Reservation[];
  rooms?: Room[];
  contacts?: Contact[];
  currentUser?: User;
  onSettleDebt?: (contactId: string, amount: number, type: 'PAY' | 'VOID') => void;
  onResetToZero?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ 
    transactions, 
    reservations = [], 
    rooms = [], 
    contacts = [], 
    currentUser,
    onSettleDebt,
    onResetToZero
}) => {
  
  const [showDebtors, setShowDebtors] = useState(false);
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  // Group by category for chart
  const dataMap = transactions.reduce((acc, curr) => {
    // Exclude DEBT transactions from Income charts/sums for Cash Flow view
    if (curr.paymentMethod === 'DEBT') return acc;

    const existing = acc.find(item => item.name === curr.category);
    if (existing) {
        if (curr.type === 'INCOME') existing.Ingresos += curr.amount;
        else existing.Gastos += curr.amount;
    } else {
        acc.push({
            name: curr.category,
            Ingresos: curr.type === 'INCOME' ? curr.amount : 0,
            Gastos: curr.type === 'EXPENSE' ? curr.amount : 0,
        });
    }
    return acc;
  }, [] as any[]);

  // Calculate Totals (Excluding Debt transactions from "Cash" totals)
  const totalIncome = transactions
    .filter(t => t.type === 'INCOME' && t.paymentMethod !== 'DEBT')
    .reduce((s, t) => s + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((s, t) => s + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Calculate Total Debt from Contacts (The actual current owed balance)
  const debtors = contacts.filter(c => c.debt && c.debt > 0);
  const totalDebt = debtors.reduce((acc, c) => acc + (c.debt || 0), 0);

  const handleExport = () => {
      const now = new Date();
      const currentMonth = now.getMonth() + 1;
      const currentYear = now.getFullYear();

      // 1. Transactions Sheet (All in One)
      const monthlyTransactions = transactions.filter(t => {
          const d = new Date(t.date);
          return d.getMonth() === now.getMonth() && d.getFullYear() === currentYear;
      });
      monthlyTransactions.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      let sumIngreso = 0;
      let sumEgreso = 0;

      const exportData = monthlyTransactions.map(t => {
          const isIncome = t.type === 'INCOME';
          
          if (t.paymentMethod !== 'DEBT') {
              if(isIncome) sumIngreso += t.amount;
              else sumEgreso += t.amount;
          }

          return {
              Fecha: t.date.split('T')[0],
              Tipo: isIncome ? 'INGRESO' : 'EGRESO',
              Categoria: t.category,
              Descripcion: t.description,
              Ingreso: isIncome ? t.amount : '',
              Egreso: !isIncome ? t.amount : '',
              Metodo: t.paymentMethod === 'MERCADOPAGO' ? 'MercadoPago' : t.paymentMethod === 'CASH' ? 'Efectivo' : t.paymentMethod === 'DEBT' ? 'Deuda' : t.paymentMethod === 'CARD' ? 'Tarjeta' : '-'
          };
      });

      // Add Total Row
      exportData.push({
          Fecha: 'TOTALES (Caja Real)',
          Tipo: '',
          Categoria: '',
          Descripcion: '',
          Ingreso: sumIngreso,
          Egreso: sumEgreso,
          Metodo: ''
      } as any);

      // 2. Band Statistics Sheet
      const monthlyReservations = reservations.filter(r => {
          const [y, m, d] = r.date.split('-').map(Number); // YYYY-MM-DD
          return m === currentMonth && y === currentYear;
      });
      
      const statsData = monthlyReservations.map(r => {
          const room = rooms.find(rm => rm.id === r.roomId);
          // Calculate metrics (using contacts logic)
          let cancelRate = 0;
          let attRate = 0;
          
          if (contacts.length > 0) {
              const threeMonthsAgo = new Date();
              threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
              const history = reservations.filter(hist => 
                  hist.bandName.toLowerCase() === r.bandName.toLowerCase() && 
                  new Date(hist.date) >= threeMonthsAgo
              );
              const total = history.length;
              if (total > 0) {
                  const cancelled = history.filter(h => h.status === 'REJECTED').length;
                  const attended = history.filter(h => h.status === 'COMPLETED').length;
                  cancelRate = Math.round((cancelled / total) * 100);
                  attRate = Math.round((attended / total) * 100);
              }
          }

          return {
              Banda: r.bandName,
              Fecha: r.date,
              HorarioInicio: r.timeStart,
              HorarioCierre: r.timeEnd,
              Sala: room ? room.name : r.roomId,
              PorcentajeCancelacion: `${cancelRate}%`,
              PorcentajeAsistencia: `${attRate}%`,
              Abonado: r.isAbono ? 'X' : ''
          };
      });


      // Create Workbook
      const wb = XLSX.utils.book_new();

      // Append Sheets
      const ws1 = XLSX.utils.json_to_sheet(exportData);
      XLSX.utils.book_append_sheet(wb, ws1, "Movimientos");

      const ws2 = XLSX.utils.json_to_sheet(statsData);
      XLSX.utils.book_append_sheet(wb, ws2, "Estadisticas Bandas");

      // Generate File
      XLSX.writeFile(wb, `Cierre_Mensual_${currentYear}_${currentMonth}.xlsx`);
  };

  return (
    <div className="space-y-8">
      
      {/* Debtors Modal */}
      {showDebtors && (
          <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
              <div className="bg-gray-900 border border-yellow-500 rounded w-full max-w-2xl p-6 relative">
                  <button onClick={() => setShowDebtors(false)} className="absolute top-4 right-4 text-white hover:text-yellow-500">X</button>
                  <h3 className="text-xl font-bold text-yellow-500 mb-4 uppercase">Listado de Deudores</h3>
                  
                  <div className="max-h-[60vh] overflow-y-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-800 text-yellow-500">
                            <tr>
                                <th className="p-2">Banda</th>
                                <th className="p-2">Responsable</th>
                                <th className="p-2 text-right">Monto Deuda</th>
                                <th className="p-2 text-center">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {debtors.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-500">No hay deudas registradas.</td></tr>}
                            {debtors.map(c => (
                                <tr key={c.id}>
                                    <td className="p-2 font-bold text-white">{c.bandName}</td>
                                    <td className="p-2 text-gray-400">{c.name}</td>
                                    <td className="p-2 text-right font-bold text-red-400">${formatMoney(c.debt || 0)}</td>
                                    <td className="p-2 flex justify-center gap-2">
                                        <button 
                                            onClick={() => onSettleDebt && onSettleDebt(c.id, c.debt || 0, 'PAY')}
                                            className="px-2 py-1 bg-green-900/50 hover:bg-green-900 text-green-300 border border-green-700 rounded text-xs"
                                        >
                                            Cobrar
                                        </button>
                                        <button 
                                            onClick={() => onSettleDebt && onSettleDebt(c.id, c.debt || 0, 'VOID')}
                                            className="px-2 py-1 bg-red-900/50 hover:bg-red-900 text-red-300 border border-red-700 rounded text-xs"
                                        >
                                            Anular
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                  </div>
              </div>
          </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-6 border border-green-800 bg-green-900/10 rounded text-center">
            <h4 className="text-green-500 uppercase tracking-widest text-sm mb-2">Ingresos Totales</h4>
            <span className="text-3xl font-bold text-white">${formatMoney(totalIncome)}</span>
        </div>
        <div className="p-6 border border-red-800 bg-red-900/10 rounded text-center">
            <h4 className="text-red-500 uppercase tracking-widest text-sm mb-2">Gastos Totales</h4>
            <span className="text-3xl font-bold text-white">${formatMoney(totalExpense)}</span>
        </div>
        <div className="p-6 border border-yellow-600 bg-yellow-900/10 rounded text-center shadow-[0_0_15px_rgba(202,138,4,0.1)]">
            <h4 className="text-yellow-500 uppercase tracking-widest text-sm mb-2">Balance Neto</h4>
            <span className={`text-3xl font-bold ${netBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${formatMoney(netBalance)}
            </span>
        </div>
        
        {/* Debt Box in Yellow */}
        <div className="p-6 border-2 border-yellow-400 bg-yellow-900/20 rounded text-center flex flex-col justify-center items-center">
            <h4 className="text-yellow-400 uppercase tracking-widest text-sm mb-2">Deudas por Cobrar</h4>
            <span className="text-3xl font-bold text-yellow-300">${formatMoney(totalDebt)}</span>
            <button 
                onClick={() => setShowDebtors(true)}
                className="mt-2 text-xs bg-yellow-400 text-black px-2 py-1 rounded font-bold hover:bg-yellow-300"
            >
                Ver Deudores
            </button>
        </div>
      </div>

      <div className="h-[400px] w-full bg-gray-900/50 p-4 border border-gray-800 rounded">
        <h3 className="text-center text-[#D2B48C] mb-4 uppercase text-sm">Movimientos por Categoría (Excl. Deuda)</h3>
        <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dataMap}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#666" fontSize={12} />
                <YAxis stroke="#666" fontSize={12} />
                <Tooltip 
                    contentStyle={{ backgroundColor: '#000', borderColor: '#D2B48C' }}
                    itemStyle={{ color: '#fff' }}
                />
                <Legend />
                <Bar dataKey="Ingresos" fill="#15803d" />
                <Bar dataKey="Gastos" fill="#991b1b" />
            </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex flex-col md:flex-row justify-center gap-4">
        <button 
            className="bg-[#D2B48C] text-black font-bold py-2 px-6 rounded hover:bg-[#c2a47c] transition-colors" 
            onClick={handleExport}
        >
            Exportar Cierre Mensual (XLS)
        </button>

        {(currentUser?.username.toLowerCase() === 'oveja' || currentUser?.username.toLowerCase() === 'leo') && (
            <button 
                className="bg-red-600 text-white font-bold py-2 px-6 rounded hover:bg-red-700 transition-colors shadow-[0_0_15px_rgba(220,38,38,0.3)]" 
                onClick={() => {
                    if (window.confirm("¿ESTÁS SEGURO? Se exportará un Excel y se BORRARÁN todos los registros operativos (Reservas, Caja, Consumos, Stock y Deudas).")) {
                        handleExport();
                        onResetToZero?.();
                    }
                }}
            >
                REINICIO A CERO
            </button>
        )}
      </div>
    </div>
  );
};