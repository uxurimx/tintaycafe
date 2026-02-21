"use client";

import { useState } from "react";
import {
    Plus,
    Search,
    Truck,
    Edit3,
    Trash2,
    MoreVertical,
    PlusCircle,
    X,
    History,
    Phone,
    Mail,
    MapPin,
    User,
    Calendar,
    Package
} from "lucide-react";
import { createSupplier } from "@/app/api/suppliers/actions";

interface Supplier {
    id: number;
    name: string;
    contact: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
}

export default function SupplierManager({ initialSuppliers = [] }: { initialSuppliers: Supplier[] }) {
    const [suppliers, setSuppliers] = useState(initialSuppliers);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
    const [viewingHistory, setViewingHistory] = useState<number | null>(null);

    const filteredSuppliers = suppliers.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.contact || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="w-full space-y-8 animate-fade-in p-2 text-left">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase italic">
                        RED DE <span className="text-indigo-500">PROVEEDORES</span>
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Truck className="w-3 h-3 text-indigo-400" /> Abastecimiento Estratégico
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar proveedor..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-3xl text-sm focus:outline-none focus:border-indigo-500 transition-all text-white backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" /> Nuevo Aliado
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSuppliers.map((s) => (
                    <div key={s.id} className="group relative bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] overflow-hidden">
                        <div className="flex items-start justify-between mb-6">
                            <div className="p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                                <Truck className="w-8 h-8 text-indigo-400" />
                            </div>
                            <div className="flex gap-2">
                                <button className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all">
                                    <Edit3 className="w-4 h-4 text-slate-500" />
                                </button>
                                <button className="p-2.5 bg-slate-900 hover:bg-indigo-950/30 rounded-xl border border-slate-800 hover:border-indigo-500/50 transition-all">
                                    <History className="w-4 h-4 text-indigo-400" />
                                </button>
                            </div>
                        </div>

                        <h3 className="text-2xl font-outfit font-black text-white tracking-tight mb-4 uppercase italic leading-none">{s.name}</h3>

                        <div className="space-y-3">
                            {s.contact && (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <User className="w-3.5 h-3.5 text-slate-600" />
                                    <span className="text-xs font-medium">{s.contact}</span>
                                </div>
                            )}
                            {s.phone && (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Phone className="w-3.5 h-3.5 text-slate-600" />
                                    <span className="text-xs font-mono">{s.phone}</span>
                                </div>
                            )}
                            {s.email && (
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail className="w-3.5 h-3.5 text-slate-600" />
                                    <span className="text-xs">{s.email}</span>
                                </div>
                            )}
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-900 flex justify-between items-center">
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">ID_{s.id}</span>
                            <div className="h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/80 animate-fade-in">
                    <div className="bg-slate-950 border border-white/5 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(79,70,229,0.1)] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase italic">Nuevo Aliado</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Vinculación de Proveedor</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-900 rounded-full border border-slate-800 transition-all group">
                                <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">

                            <form action={async (formData) => {
                                await createSupplier(formData);
                                setIsModalOpen(false);
                            }} className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre Comercial</label>
                                    <input name="name" required className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none focus:border-indigo-500" placeholder="P Ej. Cafés del Mundo" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Contacto Directo</label>
                                    <input name="contact" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none" placeholder="Nombre de persona" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                                    <input name="phone" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none placeholder:font-mono" placeholder="+52 ..." />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Email</label>
                                    <input name="email" type="email" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none" placeholder="ventas@proveedor.com" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Dirección de Centro de Distribución</label>
                                    <input name="address" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none" placeholder="Calle, Ciudad, C.P." />
                                </div>
                                <button type="submit" className="col-span-2 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-indigo-600/30 transition-all active:scale-95 mt-4">
                                    Establecer Vínculo Comercial
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
