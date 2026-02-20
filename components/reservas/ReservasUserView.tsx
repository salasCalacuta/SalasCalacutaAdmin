
import React, { useState, useMemo, useEffect } from 'react';
import { Reservation, Contact, Room } from '../../types';
import { ReservationsView } from '../admin/ReservationsView';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';

interface ReservasUserViewProps {
    reservations: Reservation[];
    onUpdateStatus: (id: string, status: Reservation['status']) => void;
    onDelete?: (id: string) => void;
    onToggleAbono: (id: string) => void;
    onReserve: (data: { date: string, timeStart: string, timeEnd: string, roomId: string, bandName: string, isAbono?: boolean }) => { success: boolean, message?: string };
    prefillBandName?: string;
    contacts?: Contact[];
    rooms: Room[];
}

export const ReservasUserView: React.FC<ReservasUserViewProps> = ({ 
    reservations, 
    onUpdateStatus, 
    onDelete,
    onToggleAbono, 
    onReserve,
    prefillBandName,
    contacts = [],
    rooms
}) => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [timeStart, setTimeStart] = useState('14:00');
    const [timeEnd, setTimeEnd] = useState('16:00');
    const [roomId, setRoomId] = useState(rooms[0]?.id || 'sala1');
    const [bandName, setBandName] = useState('');
    
    // UI State
    const [formStatus, setFormStatus] = useState<{ type: 'success' | 'error' | null, msg: string }>({ type: null, msg: '' });

    useEffect(() => {
        if (prefillBandName) setBandName(prefillBandName);
    }, [prefillBandName]);

    // Effect: Auto-select habitual room when bandName matches a contact
    useEffect(() => {
        if (!bandName) return;
        const contact = contacts.find(c => c.bandName.toLowerCase() === bandName.trim().toLowerCase());
        if (contact && contact.habitualRoom) {
            // Find room ID based on room name (e.g. "Sala 1")
            const targetRoom = rooms.find(r => r.name.toLowerCase() === contact.habitualRoom.toLowerCase());
            if (targetRoom) {
                setRoomId(targetRoom.id);
            }
        }
    }, [bandName, contacts, rooms]);

    const hours = useMemo(() => {
        const list = [];
        for(let i=10; i<=23; i++) list.push(`${i}:00`);
        list.push('00:00');
        return list;
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setFormStatus({ type: null, msg: '' });

        // 1. Validate Time (End > Start)
        // Parse hours integers for comparison
        const startVal = timeStart === '00:00' ? 24 : parseInt(timeStart.split(':')[0]);
        const endVal = timeEnd === '00:00' ? 24 : parseInt(timeEnd.split(':')[0]);

        if (startVal >= endVal) {
             setFormStatus({ type: 'error', msg: 'La hora de fin debe ser mayor a la de inicio.' });
             return;
        }

        // 2. Validate Contact Existence
        const contactExists = contacts.some(c => c.bandName.trim().toLowerCase() === bandName.trim().toLowerCase());
        if (!contactExists) {
            setFormStatus({ type: 'error', msg: 'La banda no está en el listado de contactos.' });
            return;
        }

        // 3. Attempt Reserve (isAbono is now false by default for single manual reservations)
        const result = onReserve({ date, timeStart, timeEnd, roomId, bandName, isAbono: false });
        
        if (result.success) {
            setFormStatus({ type: 'success', msg: 'Reserva Agendada Correctamente.' });
            setBandName('');
            // Clear success message after 3 seconds
            setTimeout(() => setFormStatus({ type: null, msg: '' }), 3000);
        } else {
            setFormStatus({ type: 'error', msg: 'Horario ocupado' }); // Simplified message as requested
        }
    };

    return (
        <div className="space-y-8">
            {/* Quick Reserve Form */}
            <div className="bg-gray-900 border border-[#D2B48C] p-6 rounded">
                <h3 className="text-xl font-bold text-[#D2B48C] mb-4">Agendar Banda Manualmente</h3>
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    <div className="flex flex-col md:flex-row gap-4 items-end">
                        <div className="flex-1 w-full">
                            <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80 mb-1 block">Nombre Banda</label>
                            <input 
                                list="contacts-list-options"
                                value={bandName}
                                onChange={e => {
                                    setBandName(e.target.value);
                                    setFormStatus({ type: null, msg: '' });
                                }}
                                required
                                placeholder="Elegir del listado..."
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 w-full"
                            />
                            <datalist id="contacts-list-options">
                                {contacts.map(c => (
                                    <option key={c.id} value={c.bandName}>{c.name}</option>
                                ))}
                            </datalist>
                        </div>
                        <div className="w-full md:w-32">
                            <Input type="date" label="Fecha" value={date} onChange={e => setDate(e.target.value)} required />
                        </div>
                        <div className="w-full md:w-24">
                            <Select label="Inicio" value={timeStart} onChange={e => setTimeStart(e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </Select>
                        </div>
                        <div className="w-full md:w-24">
                             <Select label="Fin" value={timeEnd} onChange={e => setTimeEnd(e.target.value)}>
                                {hours.map(h => <option key={h} value={h}>{h}</option>)}
                            </Select>
                        </div>
                        <div className="w-full md:w-32">
                            <Select label="Sala" value={roomId} onChange={e => setRoomId(e.target.value)}>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </Select>
                        </div>
                    </div>
                    
                    <div className="flex gap-4 items-center border-t border-gray-800 pt-3">
                        <div className="flex-1"></div>
                        <div className="flex flex-col items-end">
                            <Button type="submit">Agendar</Button>
                        </div>
                    </div>
                    
                    {/* Inline Feedback */}
                    {formStatus.msg && (
                        <div className={`text-sm font-bold text-right ${formStatus.type === 'error' ? 'text-red-500 animate-pulse' : 'text-green-500'}`}>
                            {formStatus.msg}
                        </div>
                    )}
                </form>
            </div>

            <ReservationsView 
                reservations={reservations} 
                onUpdateStatus={onUpdateStatus} 
                onDelete={onDelete}
                onToggleAbono={onToggleAbono} 
            />
        </div>
    );
};
