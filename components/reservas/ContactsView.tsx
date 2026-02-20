
import React, { useState } from 'react';
import { Contact, Reservation, Room } from '../../types';
import { Button } from '../ui/Button';
import { Input, Select } from '../ui/Input';
import { ROOMS as DEFAULT_ROOMS } from '../../constants';
// @ts-ignore
import * as XLSX from 'xlsx';

interface ContactsViewProps {
  contacts: Contact[];
  reservations?: Reservation[];
  onAddContact: (c: Contact) => void;
  onNavigateToReserve?: (bandName: string) => void;
  onPayAbono?: (contactId: string, amount: number, description: string) => void;
  rooms?: Room[];
}

const BAND_ROLES = ['Baterista', 'Guitarrista', 'Bajista', 'Cantante', 'Tecladista', 'Saxofonista', 'Percusión'];
const BAND_STYLES = ['Heavy', 'Rock', 'Jazz', 'Cumbia', 'Punk', 'Reggae', 'Pop'];
const EMAIL_DOMAINS = ['@gmail.com', '@outlook.com'];

export const ContactsView: React.FC<ContactsViewProps> = ({ 
    contacts, 
    reservations = [], 
    onAddContact, 
    onNavigateToReserve,
    onPayAbono,
    rooms = DEFAULT_ROOMS
}) => {
  const [mode, setMode] = useState<'LIST' | 'CREATE'>('CREATE');
  
  // Abono Modal State
  const [abonoModal, setAbonoModal] = useState<{ isOpen: boolean, contact: Contact | null }>({ isOpen: false, contact: null });
  const [abonoRoomId, setAbonoRoomId] = useState(rooms[0].id);
  const [abonoHours, setAbonoHours] = useState('2');
  const [abonoSessions, setAbonoSessions] = useState('4');
  const [abonoDiscount, setAbonoDiscount] = useState('0');
  const [abonoDiscountType, setAbonoDiscountType] = useState<'FIXED' | 'PERCENT'>('FIXED');


  // Form
  const [name, setName] = useState('');
  const [bandName, setBandName] = useState('');
  const [phone, setPhone] = useState('');
  
  // Email Split State
  const [emailUser, setEmailUser] = useState('');
  const [emailDomain, setEmailDomain] = useState(EMAIL_DOMAINS[0]);

  const [style, setStyle] = useState(BAND_STYLES[0]);
  const [musicians, setMusicians] = useState('');
  const [room, setRoom] = useState(rooms[0].name);
  // New Fields
  const [instagramUser, setInstagramUser] = useState(''); // Store only username part
  const [bandRole, setBandRole] = useState(BAND_ROLES[0]);

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();

      const fullEmail = `${emailUser}${emailDomain}`;

      // Validation
      if (!fullEmail.includes('@')) {
          alert("El email debe ser válido (contener '@').");
          return;
      }
      
      // Strict 10 digit number validation
      const phoneRegex = /^\d{10}$/;
      if (!phoneRegex.test(phone)) {
          alert("El teléfono debe contener exactamente 10 números, sin espacios ni símbolos.");
          return;
      }

      const newContact: Contact = {
          id: Date.now().toString(),
          name,
          bandName,
          phone,
          email: fullEmail,
          style,
          musiciansCount: Number(musicians),
          habitualRoom: room,
          cancellationRate: 0, // Calculated dynamically
          attendanceRate: 0,   // Calculated dynamically
          instagram: instagramUser ? `@${instagramUser}` : '', // Prepend @ automatically
          bandRole
      };
      onAddContact(newContact);
      alert("Contacto guardado y sincronizado en Excel");
      
      // Reset
      setName(''); setBandName(''); setPhone(''); setEmailUser(''); setStyle(BAND_STYLES[0]); 
      setMusicians(''); setInstagramUser(''); setBandRole(BAND_ROLES[0]);
  };

  const handleOpenAbono = (c: Contact) => {
      setAbonoModal({ isOpen: true, contact: c });
      setAbonoDiscount('0');
      setAbonoDiscountType('FIXED');
      setAbonoHours('2');
      setAbonoSessions('4');
  };

  const calculateAbonoTotal = () => {
      const selectedRoom = rooms.find(r => r.id === abonoRoomId);
      const price = selectedRoom ? selectedRoom.price : 0;
      const subtotal = price * Number(abonoHours) * Number(abonoSessions);
      
      const discountVal = Number(abonoDiscount) || 0;
      let total = subtotal;

      if (abonoDiscountType === 'FIXED') {
          total = subtotal - discountVal;
      } else {
          // Percentage
          total = subtotal - (subtotal * discountVal / 100);
      }
      
      return Math.max(0, total);
  };

  const handleConfirmAbono = () => {
      if (!abonoModal.contact || !onPayAbono) return;
      const total = calculateAbonoTotal();
      if (total <= 0) return alert("El monto debe ser mayor a 0");
      
      const description = `Abono ${abonoModal.contact.bandName} (${abonoSessions} ensayos, ${abonoHours}hs)`;
      onPayAbono(abonoModal.contact.id, total, description);
      
      alert(`Se cobró $${total} y la banda quedó registrada como Abonada.`);
      setAbonoModal({ isOpen: false, contact: null });
  };


  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (evt) => {
          try {
              const bstr = evt.target?.result;
              const wb = XLSX.read(bstr, { type: 'binary' });
              const wsName = wb.SheetNames[0];
              const ws = wb.Sheets[wsName];
              
              const data = XLSX.utils.sheet_to_json(ws);
              
              let importedCount = 0;
              let skippedCount = 0;

              data.forEach((row: any) => {
                  const normalize = (obj: any) => {
                      const newObj: any = {};
                      Object.keys(obj).forEach(key => {
                          newObj[key.trim().toLowerCase()] = obj[key];
                      });
                      return newObj;
                  };
                  const r = normalize(row);

                  // Specified Keys: Banda , Contacto, Rol, Instagram , Teléfono, Sala
                  const rawBand = r['banda'] || '';
                  const rawName = r['contacto'] || '';
                  const rawRole = r['rol'] || '';
                  const rawInsta = r['instagram'] || '';
                  const rawPhone = r['telefono'] || r['teléfono'] || '';
                  const rawRoom = r['sala'] || 'Sala 1';
                  
                  // Defaults for others
                  const rawEmail = 'sin@email.com';
                  const rawStyle = '';
                  const rawMusicians = '0';

                  // 1. Check duplicate by Phone
                  const exists = contacts.some(c => c.phone.trim() === String(rawPhone).trim());
                  if (exists) {
                      skippedCount++;
                      return; 
                  }

                  // 2. Check for missing data
                  const isMissingData = !rawBand || !rawName || !rawPhone;
                  const finalName = isMissingData ? `${rawName}*` : rawName;

                  if (rawBand) {
                      const newContact: Contact = {
                          id: Date.now().toString() + Math.random().toString().substr(2, 5),
                          name: finalName || 'Sin Nombre*',
                          bandName: rawBand,
                          phone: rawPhone ? String(rawPhone) : '',
                          email: rawEmail,
                          style: rawStyle,
                          musiciansCount: Number(rawMusicians),
                          habitualRoom: rawRoom,
                          cancellationRate: 0,
                          attendanceRate: 0,
                          instagram: rawInsta,
                          bandRole: rawRole
                      };
                      onAddContact(newContact);
                      importedCount++;
                  }
              });
              
              let msg = `Proceso finalizado.\n- Importados: ${importedCount}`;
              if (skippedCount > 0) msg += `\n- Omitidos (Teléfono duplicado): ${skippedCount}`;
              alert(msg);
              setMode('LIST');
          } catch (error) {
              console.error(error);
              alert("Error al leer el archivo. Asegúrese de que sea un Excel válido.");
          }
      };
      reader.readAsBinaryString(file);
  };

  const getMetrics = (bandName: string) => {
      if (!reservations.length) return { cancel: 0, attendance: 0 };
      
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
      
      const history = reservations.filter(r => 
          r.bandName.toLowerCase() === bandName.toLowerCase() && 
          new Date(r.date) >= threeMonthsAgo
      );

      const total = history.length;
      if (total === 0) return { cancel: 0, attendance: 0 };

      const cancelled = history.filter(r => r.status === 'REJECTED').length;
      const attended = history.filter(r => r.status === 'COMPLETED').length;

      return {
          cancel: Math.round((cancelled / total) * 100),
          attendance: Math.round((attended / total) * 100)
      };
  };

  return (
    <div className="space-y-6">
        
        {/* ABONO MODAL */}
        {abonoModal.isOpen && abonoModal.contact && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
                <div className="bg-gray-900 border border-yellow-500/50 p-6 rounded w-full max-w-md">
                    <h3 className="text-xl font-bold text-yellow-500 mb-4">Calcular Abono: {abonoModal.contact.bandName}</h3>
                    <div className="space-y-4">
                        <Select label="Sala de Ensayo" value={abonoRoomId} onChange={e => setAbonoRoomId(e.target.value)}>
                            {rooms.map(r => <option key={r.id} value={r.id}>{r.name} (${r.price}/h)</option>)}
                        </Select>
                        <div className="flex gap-4">
                             <Input type="number" label="Horas por Ensayo" value={abonoHours} onChange={e => setAbonoHours(e.target.value)} />
                             <Input type="number" label="Cant. Ensayos" value={abonoSessions} onChange={e => setAbonoSessions(e.target.value)} />
                        </div>
                        
                        <div className="flex gap-2 items-end">
                            <div className="flex-1">
                                <Input type="number" label="Descuento Manual" value={abonoDiscount} onChange={e => setAbonoDiscount(e.target.value)} />
                            </div>
                            <div className="flex gap-1 bg-black/50 p-1 rounded border border-gray-700 h-[58px] items-end pb-1">
                                <button 
                                    onClick={() => setAbonoDiscountType('FIXED')}
                                    className={`px-3 py-2 text-xs font-bold rounded ${abonoDiscountType === 'FIXED' ? 'bg-[#D2B48C] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    $
                                </button>
                                <button 
                                    onClick={() => setAbonoDiscountType('PERCENT')}
                                    className={`px-3 py-2 text-xs font-bold rounded ${abonoDiscountType === 'PERCENT' ? 'bg-[#D2B48C] text-black' : 'text-gray-400 hover:text-white'}`}
                                >
                                    %
                                </button>
                            </div>
                        </div>
                        
                        <div className="bg-black/50 p-3 rounded border border-gray-700 mt-2">
                             <div className="flex justify-between text-gray-400 text-sm mb-1">
                                 <span>Subtotal:</span>
                                 <span>${(rooms.find(r => r.id === abonoRoomId)?.price || 0) * Number(abonoHours) * Number(abonoSessions)}</span>
                             </div>
                             <div className="flex justify-between text-yellow-500 font-bold text-xl border-t border-gray-600 pt-1">
                                 <span>TOTAL FINAL:</span>
                                 <span>${calculateAbonoTotal().toFixed(0)}</span>
                             </div>
                        </div>

                        <div className="flex gap-2 pt-4">
                            <Button onClick={handleConfirmAbono} className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-black border-none">
                                Cobrar Abono
                            </Button>
                            <Button onClick={() => setAbonoModal({isOpen: false, contact: null})} variant="secondary" className="flex-1">
                                Cancelar
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )}

        <div className="flex justify-between border-b border-gray-800 pb-2">
            <div className="flex gap-4">
                <button className={`text-sm font-bold uppercase ${mode === 'CREATE' ? 'text-[#D2B48C]' : 'text-gray-500'}`} onClick={() => setMode('CREATE')}>Crear Manual</button>
                <button className={`text-sm font-bold uppercase ${mode === 'LIST' ? 'text-[#D2B48C]' : 'text-gray-500'}`} onClick={() => setMode('LIST')}>Listado de Bandas</button>
            </div>
            
            {/* EXCEL IMPORT */}
            <div className="flex flex-col items-end gap-1">
                 <div className="flex items-center gap-2">
                    <label className="bg-green-700 hover:bg-green-600 text-white text-xs px-3 py-1 rounded cursor-pointer transition-colors">
                        Importar Excel
                        <input 
                            type="file" 
                            accept=".xlsx, .xls, .csv" 
                            onChange={handleFileUpload} 
                            className="hidden" 
                        />
                    </label>
                 </div>
                 <a 
                    href="https://docs.google.com/spreadsheets/d/1n3ETKIoPK4FUoS24gwUFHxBEpHkM7tlX6HM09-4M1Ms/edit?usp=drive_link" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-[10px] text-gray-500 hover:text-[#D2B48C] underline"
                 >
                    Ver planilla modelo
                 </a>
            </div>
        </div>

        {mode === 'CREATE' && (
            <div className="bg-gray-900 p-6 rounded border border-[#D2B48C]/30 max-w-2xl">
                <h3 className="text-xl font-bold text-[#D2B48C] mb-6">Nuevo Contacto</h3>
                <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-4">
                    <Input label="Nombre Responsable" value={name} onChange={e => setName(e.target.value)} required />
                    
                    <Select label="Rol en Banda" value={bandRole} onChange={e => setBandRole(e.target.value)}>
                        {BAND_ROLES.map(role => (
                            <option key={role} value={role}>{role}</option>
                        ))}
                    </Select>
                    
                    <Input label="Nombre Banda" value={bandName} onChange={e => setBandName(e.target.value)} required />
                    
                    {/* Instagram with Fixed Prefix */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">Instagram</label>
                        <div className="flex items-center">
                            <span className="bg-gray-800 border border-r-0 border-[#D2B48C]/30 rounded-l p-2 text-[#D2B48C] font-bold">@</span>
                            <input 
                                className="bg-gray-900 border border-l-0 border-[#D2B48C]/30 rounded-r p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 flex-1 min-w-0"
                                value={instagramUser} 
                                onChange={e => setInstagramUser(e.target.value)} 
                                placeholder="usuario" 
                            />
                        </div>
                    </div>
                    
                    <Input 
                        label="Teléfono (10 números)" 
                        value={phone} 
                        onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} // Only allow typing numbers visualy too
                        required 
                        placeholder="Ej: 1122334455" 
                        maxLength={10} 
                    />
                    
                    {/* EMAIL SPLIT */}
                    <div className="flex flex-col gap-1 w-full">
                        <label className="text-xs font-bold uppercase tracking-wider text-[#D2B48C] opacity-80">Email</label>
                        <div className="flex gap-2">
                             <input 
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] placeholder-gray-600 flex-1 min-w-0"
                                value={emailUser} 
                                onChange={e => setEmailUser(e.target.value)} 
                                required 
                                placeholder="usuario" 
                             />
                             <select 
                                className="bg-gray-900 border border-[#D2B48C]/30 rounded p-2 text-[#D2B48C] focus:outline-none focus:border-[#D2B48C] w-36"
                                value={emailDomain}
                                onChange={e => setEmailDomain(e.target.value)}
                             >
                                 {EMAIL_DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
                             </select>
                        </div>
                    </div>

                    <Select label="Estilo" value={style} onChange={e => setStyle(e.target.value)}>
                        {BAND_STYLES.map(s => <option key={s} value={s}>{s}</option>)}
                    </Select>

                    <Input label="Cant. Músicos" type="number" value={musicians} onChange={e => setMusicians(e.target.value)} />
                    <Select label="Sala Habitual" value={room} onChange={e => setRoom(e.target.value)}>
                        {rooms.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
                    </Select>
                    
                    <div className="md:col-span-2 pt-4">
                        <Button type="submit" className="w-full">Guardar</Button>
                    </div>
                </form>
            </div>
        )}

        {mode === 'LIST' && (
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#D2B48C]">Base de Datos de Bandas</h3>
                <div className="bg-gray-900 rounded border border-gray-800 overflow-x-auto">
                    <table className="w-full text-left text-xs">
                        <thead className="bg-gray-800 text-[#D2B48C]">
                            <tr>
                                <th className="p-3">Banda</th>
                                <th className="p-3">Contacto / Rol</th>
                                <th className="p-3">Instagram</th>
                                <th className="p-3">Teléfono</th>
                                <th className="p-3">Sala</th>
                                <th className="p-3 text-center" title="Últimos 3 meses">% Cancel</th>
                                <th className="p-3 text-center" title="Últimos 3 meses">% Asistencia</th>
                                <th className="p-3">Acción</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {contacts.length === 0 && <tr><td colSpan={8} className="p-4 text-center text-gray-500">Sin contactos.</td></tr>}
                            {contacts.map(c => {
                                const metrics = getMetrics(c.bandName);
                                return (
                                    <tr key={c.id} className="hover:bg-white/5">
                                        <td className="p-3 font-bold text-white">
                                            {c.bandName}
                                            {c.isAbono && <span className="ml-2 bg-yellow-600 text-black text-[9px] px-1 rounded font-bold">ABONADO</span>}
                                        </td>
                                        <td className="p-3">
                                            <div>
                                                {c.name.includes('*') ? (
                                                    <span className="text-yellow-500 font-bold" title="Faltan datos">{c.name}</span>
                                                ) : (
                                                    c.name
                                                )}
                                            </div>
                                            {c.bandRole && <div className="text-[10px] text-gray-500">{c.bandRole}</div>}
                                        </td>
                                        <td className="p-3 text-blue-400">
                                            {c.instagram ? (
                                                <a 
                                                    href={`https://instagram.com/${c.instagram.replace('@', '')}`} 
                                                    target="_blank" 
                                                    rel="noreferrer" 
                                                    className="hover:underline hover:text-blue-300"
                                                >
                                                    {c.instagram}
                                                </a>
                                            ) : '-'}
                                        </td>
                                        <td className="p-3">{c.phone}</td>
                                        <td className="p-3">{c.habitualRoom}</td>
                                        <td className="p-3 text-center font-bold text-red-400">{metrics.cancel}%</td>
                                        <td className="p-3 text-center font-bold text-green-400">{metrics.attendance}%</td>
                                        <td className="p-3 flex gap-2">
                                            <Button 
                                                variant="secondary" 
                                                className="text-xs py-1 px-2"
                                                onClick={() => onNavigateToReserve && onNavigateToReserve(c.bandName)}
                                            >
                                                Reservar
                                            </Button>
                                            {onPayAbono && (
                                                <button 
                                                    onClick={() => handleOpenAbono(c)}
                                                    className="text-[10px] bg-yellow-900/30 text-yellow-500 border border-yellow-700 px-2 rounded hover:bg-yellow-900/50"
                                                >
                                                    Abonado
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <p className="text-[10px] text-gray-500 text-right">* El asterisco en el nombre indica datos faltantes.</p>
            </div>
        )}
    </div>
  );
};
