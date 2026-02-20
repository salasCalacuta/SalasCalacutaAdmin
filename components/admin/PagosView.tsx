import React, { useState, useMemo, useEffect } from 'react';
import { Transaction, StaffShift } from '../../types';
import { EXPENSE_CATEGORIES, STAFF_USERS } from '../../constants';
import { Button } from '../ui/Button';
import { Input, Select, CurrencyInput } from '../ui/Input';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface PagosViewProps {
  transactions: Transaction[];
  shifts: StaffShift[];
  onAddTransaction: (t: Transaction) => void;
  onToggleStatus?: (id: string) => void;
  onUpdateTransaction?: (t: Transaction) => void;
}

const FIXED_HOURLY_RATE = 7000;

export const PagosView: React.FC<PagosViewProps> = ({ transactions, shifts, onAddTransaction, onToggleStatus, onUpdateTransaction }) => {
  const [category, setCategory] = useState(EXPENSE_CATEGORIES[0]);
  const [staffName, setStaffName] = useState(STAFF_USERS[0]);
  const [amount, setAmount] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isPaid, setIsPaid] = useState('true');
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'MERCADOPAGO' | 'CARD'>('CASH');
  
  const formatMoney = (val: number) => val.toLocaleString('es-AR');

  // Edit Mode
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const expenses = transactions.filter(t => t.type === 'EXPENSE' && EXPENSE_CATEGORIES.includes(t.category));

  const chartData = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    monto: expenses.filter(i => i.category === cat && i.isPaid).reduce((sum, curr) => sum + curr.amount, 0)
  }));

  // Logic to calculate hours
  const calculateHours = (s: string, e: string) => {
      let [startH, startM] = s.split(':').map(val => parseInt(val) || 0);
      let [endH, endM] = e.split(':').map(val => parseInt(val) || 0);

      // Rule: If 23:59, add 1 minute (treat as 24:00)
      if (endH === 23 && endM === 59) {
          endH = 24;
          endM = 0;
      }

      // Handle 00:00 as 24:00 for end time if start time is not 00:00
      if (endH === 0 && endM === 0 && (startH > 0 || startM > 0)) {
          endH = 24;
      }

      const startTotal = startH + (startM / 60);
      const endTotal = endH + (endM / 60);

      return Math.max(0, endTotal - startTotal);
  };

  const calculationDetails = useMemo(() => {
      if (category !== 'Personal') return { weekly: 0, monthly: 0, total: 0 };
      
      // Filter shifts for selected staff
      const userShifts = shifts.filter(s => s.staffName === staffName);
      
      // Calculate total hours per WEEK
      const weeklyHours = userShifts.reduce((acc, s) => {
          return acc + calculateHours(s.timeStart, s.timeEnd);
      }, 0);

      // Assume 4 weeks per month for the "Monthly" total
      const monthlyHours = weeklyHours * 4;
      const total = monthlyHours * FIXED_HOURLY_RATE;
      
      return { weekly: weeklyHours, monthly: monthlyHours, total };
  }, [staffName, shifts, category]);

  // Auto-update amount when calculation changes for Personal
  useEffect(() => {
      if (category === 'Personal' && !editingId) {
          // Even if 0, we set it to show no shifts
          setAmount(calculationDetails.total);
      }
  }, [calculationDetails, category, editingId]);

  const handleEdit = (t: Transaction) => {
      setEditingId(t.id);
      setCategory(t.category);
      setAmount(t.amount);
      setDate(t.date.split('T')[0]);
      setIsPaid(t.isPaid ? 'true' : 'false');
      setPaymentMethod((t.paymentMethod as any) || 'CASH');
      // Extract staff name from description if possible, or leave default
      const staffMatch = t.description.match(/Pago Personal: (.*)/);
      if (staffMatch && staffMatch[1]) {
          setStaffName(staffMatch[1]);
      }
  };

  const handleCancelEdit = () => {
      setEditingId(null);
      setAmount(0);
      setCategory(EXPENSE_CATEGORIES[0]);
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (category === 'Personal' && !editingId) {
        alert(`Generando PDF para pago a ${staffName} por $${formatMoney(Number(amount))}...`);
    }

    const description = category === 'Personal' ? `Pago Personal: ${staffName}` : `Gasto: ${category}`;

    const txData: Transaction = {
        id: editingId || Date.now().toString(),
        type: 'EXPENSE',
        category,
        amount: Number(amount),
        date: new Date(date).toISOString(),
        description,
        isPaid: isPaid === 'true',
        paymentMethod
    };

    if (editingId && onUpdateTransaction) {
        onUpdateTransaction(txData);
        alert("Pago actualizado");
        setEditingId(null);
    } else {
        onAddTransaction(txData);
        alert("Gasto registrado");
    }
    setAmount(0);
  };

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-gray-900 p-6 rounded border border-red-900/50">
              <h3 className="text-xl font-bold text-red-500 mb-4 uppercase">
                  {editingId ? 'Modificar Gasto' : 'Registrar Gasto'}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                  <Select label="Concepto" value={category} onChange={e => setCategory(e.target.value)}>
                      {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </Select>
                  
                  {category === 'Personal' && (
                      <div className="bg-gray-800 p-3 rounded border border-gray-700 space-y-3">
                          <Select label="Nombre del Personal" value={staffName} onChange={e => setStaffName(e.target.value)}>
                              {STAFF_USERS.map(u => <option key={u} value={u}>{u}</option>)}
                          </Select>
                          {!editingId && (
                            <div className="text-xs text-gray-400 text-right">
                                <div>Horas Semanales: <b>{calculationDetails.weekly.toFixed(2)}hs</b></div>
                                <div>Horas Mensuales (x4): <b>{calculationDetails.monthly.toFixed(2)}hs</b></div>
                                <div className="text-[#D2B48C] mt-1 border-t border-gray-600 pt-1">
                                    {calculationDetails.monthly.toFixed(2)}hs x ${formatMoney(FIXED_HOURLY_RATE)} = <b>${formatMoney(calculationDetails.total)}</b>
                                </div>
                            </div>
                          )}
                      </div>
                  )}

                  <CurrencyInput label="Monto" value={amount} onChange={setAmount} required />
                  <Input type="date" label="Fecha" value={date} onChange={e => setDate(e.target.value)} required />
                  
                  <div className="flex gap-4">
                      <Select label="Estado" value={isPaid} onChange={e => setIsPaid(e.target.value)}>
                          <option value="true">Pagado</option>
                          <option value="false">A Deber</option>
                      </Select>
                      <Select label="Método de Pago" value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as any)}>
                          <option value="CASH">Efectivo</option>
                          <option value="MERCADOPAGO">MercadoPago</option>
                          <option value="CARD">Tarjeta</option>
                      </Select>
                  </div>

                  <div className="flex gap-2">
                    <Button type="submit" variant="danger" className="w-full">
                        {editingId ? 'Guardar Cambios' : 'Registrar Gasto'}
                    </Button>
                    {editingId && (
                        <Button type="button" variant="secondary" onClick={handleCancelEdit}>Cancelar</Button>
                    )}
                  </div>
              </form>
          </div>

          {/* Chart */}
          <div className="bg-gray-900 p-4 rounded border border-red-900/30 h-[400px]">
              <h3 className="text-center text-red-500 mb-4 uppercase text-sm">Seguimiento de Gastos (Pagados)</h3>
              <ResponsiveContainer width="100%" height="90%">
                  <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                      <XAxis dataKey="name" stroke="#666" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#666" />
                      <Tooltip contentStyle={{ backgroundColor: '#000', borderColor: '#991b1b' }} itemStyle={{ color: '#fff' }} />
                      <Bar dataKey="monto" fill="#991b1b" />
                  </BarChart>
              </ResponsiveContainer>
          </div>
      </div>

      {/* List */}
      <div>
        <h3 className="text-xl font-bold text-red-500 mb-4">Historial de Pagos</h3>
        <p className="text-xs text-gray-500 mb-2">Click en estado para alternar rápido. Click en Modificar para editar.</p>
        <div className="bg-gray-900 rounded border border-gray-800 overflow-hidden">
            <table className="w-full text-left text-sm">
                <thead className="bg-gray-800 text-red-400">
                    <tr>
                        <th className="p-3">Fecha</th>
                        <th className="p-3">Concepto</th>
                        <th className="p-3">Monto / Método</th>
                        <th className="p-3">Estado / Acción</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {expenses.map(t => (
                        <tr key={t.id}>
                            <td className="p-3">{t.date.split('T')[0]}</td>
                            <td className="p-3">{t.description}</td>
                            <td className="p-3">
                                <div className="text-red-500 font-bold">${formatMoney(t.amount)}</div>
                                <div className="text-[10px] text-gray-400 uppercase">{t.paymentMethod === 'MERCADOPAGO' ? 'MP' : t.paymentMethod === 'CARD' ? 'Tarjeta' : 'Efectivo'}</div>
                            </td>
                            <td className="p-3 flex items-center gap-2">
                                <button 
                                  onClick={() => onToggleStatus && onToggleStatus(t.id)}
                                  className={`px-2 py-1 rounded text-xs cursor-pointer hover:opacity-80 ${t.isPaid ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}
                                >
                                    {t.isPaid ? 'Pagado' : 'A Deber'}
                                </button>
                                <button 
                                    onClick={() => handleEdit(t)}
                                    className="px-2 py-1 rounded text-xs bg-blue-900 text-blue-200 hover:bg-blue-800"
                                >
                                    Modificar
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};