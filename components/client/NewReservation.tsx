import React, { useState, useMemo } from 'react';
import { Room } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface NewReservationProps {
  onReserve: (data: { date: string; timeStart: string; timeEnd: string; roomId: string }) => void;
  userBandName: string;
  onSuccessRedirect: () => void;
  rooms: Room[];
}

export const NewReservation: React.FC<NewReservationProps> = ({ onReserve, userBandName, onSuccessRedirect, rooms }) => {
  const [date, setDate] = useState('');
  const [timeStart, setTimeStart] = useState('14:00');
  const [timeEnd, setTimeEnd] = useState('16:00');
  const [roomId, setRoomId] = useState(rooms[0]?.id || 'sala1');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Generate full hours 10 to 00
  const hours = useMemo(() => {
    const list = [];
    // 10:00 to 23:00
    for(let i=10; i<=23; i++) list.push(`${i}:00`);
    // 00:00
    list.push('00:00');
    return list;
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (timeStart === timeEnd) {
        alert("La hora de inicio y fin no pueden ser iguales.");
        return;
    }
    
    setIsSubmitting(true);
    
    // Simulate short delay for UX
    setTimeout(() => {
        onReserve({ date, timeStart, timeEnd, roomId });
        alert("Ya enviamos tu solicitud. Por favor, espera que lo veamos y te confirmamos o denegamos la reserva. Gracias!");
        setIsSubmitting(false);
        setDate(''); 
        onSuccessRedirect(); // Switch view
    }, 500);
  };

  return (
    <div className="max-w-md mx-auto bg-gray-900 p-6 rounded border border-[#D2B48C]/30">
        <h2 className="text-xl font-bold text-[#D2B48C] mb-6 text-center uppercase">Nueva Reserva</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="block text-xs uppercase text-gray-500 mb-1">Banda</label>
                <div className="p-2 border border-gray-700 rounded text-gray-300 bg-gray-800 cursor-not-allowed">
                    {userBandName}
                </div>
            </div>
            
            <Input 
                type="date" 
                label="Fecha" 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                required 
                min={new Date().toLocaleDateString('en-CA')}
            />
            
            <div className="flex gap-4">
                <Select label="Desde" value={timeStart} onChange={e => setTimeStart(e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
                <Select label="Hasta" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}>
                    {hours.map(h => <option key={h} value={h}>{h}</option>)}
                </Select>
            </div>

            <Select label="Sala" value={roomId} onChange={e => setRoomId(e.target.value)}>
                {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} - ${r.price}</option>
                ))}
            </Select>

            <div className="pt-4">
                <Button type="submit" className="w-full" disabled={isSubmitting}>
                    {isSubmitting ? "Enviando..." : "Solicitar Reserva"}
                </Button>
            </div>
        </form>
    </div>
  );
};