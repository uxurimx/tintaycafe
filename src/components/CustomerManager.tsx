"use client";

import { useState } from "react";
import {
    Users,
    UserPlus,
    Search,
    Star,
    Calendar,
    Phone,
    Mail,
    ChevronRight,
    Trophy,
    History,
    Settings,
    X,
    Check
} from "lucide-react";
import { createCustomer, updateCustomer } from "@/app/api/customers/actions";
import { toast } from "sonner";

interface Customer {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    birthday: Date | null;
    points: number | null;
    createdAt: Date | null;
}

export default function CustomerManager({
    initialCustomers
}: {
    initialCustomers: Customer[];
}) {
    const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
    const [searchTerm, setSearchTerm] = useState("");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newCustomer, setNewCustomer] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: ""
    });

    const filteredCustomers = customers.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.phone?.includes(searchTerm)
    );

    const handleAddCustomer = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const result = await createCustomer({
                name: newCustomer.name,
                email: newCustomer.email || undefined,
                phone: newCustomer.phone || undefined,
                birthday: newCustomer.birthday ? new Date(newCustomer.birthday) : undefined
            });
            setCustomers([result as any, ...customers]);
            setIsAddModalOpen(false);
            setNewCustomer({ name: "", email: "", phone: "", birthday: "" });
            toast.success("Cliente registrado en el Nexus");
        } catch (error) {
            toast.error("Error al registrar cliente");
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-outfit font-black text-white tracking-tight flex items-center gap-4">
                        <span className="p-3 bg-pink-600 rounded-2xl shadow-lg shadow-pink-600/20">
                            <Users className="w-8 h-8" />
                        </span>
                        NEXUS DE CLIENTES
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">
                        CENTRO DE FIDELIZACIÓN Y ANÁLISIS DE COMPORTAMIENTO
                    </p>
                </div>

                <button
                    onClick={() => setIsAddModalOpen(true)}
                    className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-slate-200 transition-all shadow-xl active:scale-95"
                >
                    <UserPlus className="w-4 h-4" /> Registrar Nuevo Cliente
                </button>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl group hover:border-pink-500/30 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Star className="w-3 h-3 text-pink-500" /> Total Clientes
                    </p>
                    <p className="text-4xl font-outfit font-black text-white">{customers.length}</p>
                </div>
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl group hover:border-indigo-500/30 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Trophy className="w-3 h-3 text-indigo-500" /> Puntos Emitidos
                    </p>
                    <p className="text-4xl font-outfit font-black text-white">
                        {customers.reduce((acc, c) => acc + (c.points || 0), 0)}
                    </p>
                </div>
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] backdrop-blur-xl group hover:border-emerald-500/30 transition-all">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
                        <History className="w-3 h-3 text-emerald-500" /> Actividad Reciente
                    </p>
                    <p className="text-4xl font-outfit font-black text-white">Alta</p>
                </div>
            </div>

            {/* Filter Area */}
            <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Filtrar por nombre, email o teléfono..."
                    className="w-full bg-slate-950/60 border border-slate-900 rounded-[2rem] py-6 pl-16 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-pink-500/30 transition-all font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Main Table */}
            <div className="bg-slate-900/20 border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-slate-900/50 border-b border-slate-800">
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Perfil</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500">Contacto</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Puntos Quantum</th>
                            <th className="p-8 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Estatus</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                        {filteredCustomers.map((customer) => (
                            <tr key={customer.id} className="group hover:bg-slate-800/20 transition-all cursor-pointer">
                                <td className="p-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 group-hover:border-pink-500/30 transition-all">
                                            <span className="text-sm font-black text-slate-400 group-hover:text-pink-400">{customer.name.charAt(0).toUpperCase()}</span>
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-100 uppercase tracking-tight">{customer.name}</p>
                                            <p className="text-[10px] text-slate-600 font-mono">ID_CLIENTE_{customer.id}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-8">
                                    <div className="space-y-1">
                                        <p className="flex items-center gap-2 text-xs text-slate-400">
                                            <Mail className="w-3 h-3 text-slate-600" /> {customer.email || 'N/A'}
                                        </p>
                                        <p className="flex items-center gap-2 text-xs text-slate-400">
                                            <Phone className="w-3 h-3 text-slate-600" /> {customer.phone || 'N/A'}
                                        </p>
                                    </div>
                                </td>
                                <td className="p-8 text-center text-3xl font-outfit font-black text-white italic group-hover:text-pink-500 transition-colors">
                                    {customer.points || 0}
                                </td>
                                <td className="p-8 text-right">
                                    <button className="p-3 bg-slate-950 border border-slate-800 rounded-xl text-slate-500 hover:text-white hover:border-slate-700 transition-all">
                                        <Settings className="w-5 h-5" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {filteredCustomers.length === 0 && (
                    <div className="p-32 text-center opacity-30 flex flex-col items-center">
                        <Users className="w-16 h-16 mb-6" />
                        <p className="text-xs font-black uppercase tracking-[0.3em]">No se detectaron perfiles en esta frecuencia</p>
                    </div>
                )}
            </div>

            {/* Add Modal */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h3 className="text-2xl font-outfit font-black text-white">SÍNTESIS DE CLIENTE</h3>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">NUEVO NODO EN LA RED</p>
                            </div>
                            <button onClick={() => setIsAddModalOpen(false)} className="p-2 text-slate-500 hover:text-white"><X /></button>
                        </div>

                        <form onSubmit={handleAddCustomer} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-pink-500/30"
                                    value={newCustomer.name}
                                    onChange={e => setNewCustomer({ ...newCustomer, name: e.target.value })}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                                    <input
                                        type="email"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-pink-500/30"
                                        value={newCustomer.email}
                                        onChange={e => setNewCustomer({ ...newCustomer, email: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
                                    <input
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-pink-500/30"
                                        value={newCustomer.phone}
                                        onChange={e => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cumpleaños (Opcional)</label>
                                <input
                                    type="date"
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-pink-500/30"
                                    value={newCustomer.birthday}
                                    onChange={e => setNewCustomer({ ...newCustomer, birthday: e.target.value })}
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-all flex items-center justify-center gap-3 shadow-xl shadow-white/5 active:scale-95"
                            >
                                <Check className="w-5 h-5" /> Finalizar Registro
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
