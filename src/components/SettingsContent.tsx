"use client";

import { useState } from "react";
import {
    Settings,
    Store,
    MapPin,
    Shield,
    Bell,
    Zap,
    Layers,
    Save,
    Plus,
    Check,
    ToggleLeft,
    ToggleRight
} from "lucide-react";
import { createStore, updateStore } from "@/app/api/stores/actions";
import { toast } from "sonner";

interface StoreData {
    id: number;
    name: string;
    type: string;
    address: string | null;
    isActive: boolean | null;
}

export default function SettingsContent({
    initialStores
}: {
    initialStores: StoreData[];
}) {
    const [stores, setStores] = useState<StoreData[]>(initialStores);
    const [activeTab, setActiveTab] = useState<'stores' | 'general' | 'security'>('stores');
    const [isAddingStore, setIsAddingStore] = useState(false);
    const [newStore, setNewStore] = useState({ name: "", type: "stable", address: "" });

    const handleToggleStore = async (store: StoreData) => {
        const newStatus = !store.isActive;
        const res = await updateStore(store.id, { isActive: newStatus });
        if (res.success) {
            setStores(prev => prev.map(s => s.id === store.id ? { ...s, isActive: newStatus } : s));
            toast.success(`Sucursal ${newStatus ? 'activada' : 'desactivada'}`);
        } else {
            toast.error("Error al actualizar sucursal");
        }
    };

    const handleAddStore = async (e: React.FormEvent) => {
        e.preventDefault();
        const res = await createStore(newStore.name, newStore.type as any, newStore.address);
        if (res.success) {
            toast.success("Nueva sucursal sincronizada");
            setIsAddingStore(false);
            setNewStore({ name: "", type: "stable", address: "" });
            // In a real app we'd re-fetch, for now let's mock the update
            window.location.reload(); // Simple way to refresh data for settings
        }
    };

    return (
        <div className="flex gap-12 max-w-7xl mx-auto">
            {/* Sidebar Navigation */}
            <div className="w-64 space-y-2 shrink-0">
                <button
                    onClick={() => setActiveTab('stores')}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'stores' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                >
                    <Store className="w-4 h-4" /> Gestión de Sucursales
                </button>
                <button
                    onClick={() => setActiveTab('general')}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                >
                    <Layers className="w-4 h-4" /> Preferencias Generales
                </button>
                <button
                    onClick={() => setActiveTab('security')}
                    className={`w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50'}`}
                >
                    <Shield className="w-4 h-4" /> Accesos y Seguridad
                </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 space-y-8 animate-fade-in">
                {activeTab === 'stores' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div>
                                <h2 className="text-3xl font-outfit font-black text-white uppercase tracking-tight italic">Mapa de Sucursales</h2>
                                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1 italic">Nodos activos en la red neuronal</p>
                            </div>
                            <button
                                onClick={() => setIsAddingStore(true)}
                                className="p-4 bg-white text-slate-950 rounded-2xl hover:bg-slate-200 transition-all shadow-xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> Desplegar Nueva Sucursal
                            </button>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {stores.map(store => (
                                <div key={store.id} className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 bg-slate-950 rounded-3xl border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                                            <MapPin className={`w-8 h-8 ${store.isActive ? 'text-indigo-500' : 'text-slate-700'}`} />
                                        </div>
                                        <div>
                                            <p className="text-xl font-bold text-white uppercase tracking-tight">{store.name}</p>
                                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">
                                                {store.type === 'stable' ? 'INSTALACIÓN FIJA' : 'PUNTO LOGÍSTICO'} | ID_{store.id}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-8">
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Estatus del Nodo</p>
                                            <button
                                                onClick={() => handleToggleStore(store)}
                                                className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${store.isActive ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}
                                            >
                                                {store.isActive ? <ToggleRight className="w-5 h-5" /> : <ToggleLeft className="w-5 h-5" />}
                                                <span className="text-[10px] font-black uppercase tracking-widest">{store.isActive ? 'Activo' : 'Inactivo'}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'general' && (
                    <div className="p-12 border-2 border-dashed border-slate-900 rounded-[3rem] text-center opacity-30">
                        <Zap className="w-12 h-12 text-indigo-500 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Módulo de sincronización global en fase beta</p>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="p-12 border-2 border-dashed border-slate-900 rounded-[3rem] text-center opacity-30">
                        <Shield className="w-12 h-12 text-rose-500 mx-auto mb-4" />
                        <p className="text-xs font-black uppercase tracking-[0.3em] text-slate-500">Protocolos de encriptación cuántica activos</p>
                    </div>
                )}
            </div>

            {/* Add Store Modal Overlay */}
            {isAddingStore && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md bg-slate-950/40">
                    <div className="bg-slate-900 border border-slate-800 w-full max-w-lg rounded-[3rem] shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                        <div className="p-8 border-b border-slate-800">
                            <h3 className="text-2xl font-outfit font-black text-white uppercase italic tracking-tight">Arquitectura de Sucursal</h3>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">DEFINIR NUEVA COORDENADA EN LA RED</p>
                        </div>
                        <form onSubmit={handleAddStore} className="p-8 space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Identificador</label>
                                <input
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500"
                                    value={newStore.name}
                                    onChange={e => setNewStore({ ...newStore, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tipología del Nodo</label>
                                <select
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none appearance-none"
                                    value={newStore.type}
                                    onChange={e => setNewStore({ ...newStore, type: e.target.value })}
                                >
                                    <option value="stable">Fija (Instalación Permanente)</option>
                                    <option value="informal">Informal (Punto de Venta Móvil)</option>
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Dirección Geo-Sincronizada</label>
                                <input
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 px-6 text-white focus:outline-none focus:border-indigo-500"
                                    value={newStore.address}
                                    onChange={e => setNewStore({ ...newStore, address: e.target.value })}
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setIsAddingStore(false)} className="flex-1 py-4 border border-slate-800 text-slate-500 rounded-2xl font-black uppercase tracking-widest text-xs hover:text-white transition-all">Cancelar</button>
                                <button type="submit" className="flex-1 py-4 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-indigo-600/20 active:scale-95 transition-all">Sincronizar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
