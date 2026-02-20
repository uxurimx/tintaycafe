"use client";

import { useState } from "react";
import {
    Store,
    TrendingUp,
    ArrowLeftRight,
    History,
    Package,
    ArrowLeft,
    Clock,
    User,
    LucideIcon
} from "lucide-react";

interface AnalyticsData {
    storeInfo: any;
    inventory: any[];
    transactions: any[];
}

export default function StoreIntelligence({
    initialData,
    onBack
}: {
    initialData: AnalyticsData;
    onBack: () => void;
}) {
    const [activeTab, setActiveTab] = useState<'inventory' | 'history'>('inventory');

    return (
        <div className="space-y-8 animate-fade-in p-2 text-left">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4 group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Volver al Orquestador
                    </button>
                    <h2 className="text-4xl font-outfit font-black tracking-tighter text-white flex items-center gap-4">
                        <span className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Store className="w-8 h-8" />
                        </span>
                        {initialData.storeInfo.name.toUpperCase()}
                    </h2>
                    <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-2 ml-1">
                        CENTRO DE INTELIGENCIA ESTRATÉGICA | ID_{initialData.storeInfo.id}
                    </p>
                </div>

                <div className="flex gap-4">
                    <div className="p-6 bg-slate-900/50 border border-slate-800 rounded-[2rem] backdrop-blur-xl">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Items en Red</p>
                        <p className="text-3xl font-outfit font-black text-white">{initialData.inventory.length}</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-2 p-1 bg-slate-950 border border-slate-900 rounded-2xl w-fit">
                <button
                    onClick={() => setActiveTab('inventory')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'inventory' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Package className="w-4 h-4" /> Inventario Local
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <History className="w-4 h-4" /> Historial Operativo
                </button>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6">
                {activeTab === 'inventory' ? (
                    <div className="rounded-[2.5rem] border border-slate-800 bg-slate-950/40 backdrop-blur-xl overflow-hidden shadow-2xl">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-900/30 border-b border-slate-800">
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Producto</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Categoría</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Stock</th>
                                    <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-right">Estatus</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-900/50">
                                {initialData.inventory.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-900/20 transition-all">
                                        <td className="p-6">
                                            <p className="font-bold text-slate-100">{item.name}</p>
                                            <p className="text-[10px] text-slate-600 font-mono">REF_{item.barcode}</p>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 bg-slate-900 rounded-lg text-[10px] font-black text-slate-400 border border-slate-800 uppercase tracking-widest">
                                                {item.categoryName || 'General'}
                                            </span>
                                        </td>
                                        <td className="p-6 text-center text-xl font-black text-white">
                                            {item.quantity}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className={`inline-flex h-2 w-2 rounded-full ${item.quantity > item.minStock ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-pulse'}`} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {initialData.transactions.map((tx) => (
                            <div key={tx.id} className="p-6 bg-slate-900/30 border border-slate-800 rounded-[2rem] flex items-center justify-between group hover:border-indigo-500/30 transition-all">
                                <div className="flex items-center gap-6">
                                    <div className={`p-4 rounded-2xl ${tx.type === 'transfer' ? 'bg-purple-600/20 text-purple-400' : 'bg-emerald-600/20 text-emerald-400'}`}>
                                        {tx.type === 'transfer' ? <ArrowLeftRight className="w-6 h-6" /> : <TrendingUp className="w-6 h-6" />}
                                    </div>
                                    <div>
                                        <p className="text-white font-black uppercase tracking-tight">
                                            {tx.type === 'transfer' ? 'Transferencia de Stock' : 'Venta Realizada'}
                                        </p>
                                        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {new Date(tx.createdAt).toLocaleString()}</span>
                                            <span className="w-1 h-1 bg-slate-800 rounded-full" />
                                            <span className="flex items-center gap-1"><User className="w-3 h-3" /> Operador_{tx.userId.slice(0, 5)}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className={`text-2xl font-outfit font-black ${tx.type === 'transfer' ? 'text-indigo-400' : 'text-emerald-400'}`}>
                                        {tx.type === 'transfer' ? `${tx.total} units` : `$${tx.total}`}
                                    </p>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">TX_ID: {tx.id}</p>
                                </div>
                            </div>
                        ))}
                        {initialData.transactions.length === 0 && (
                            <div className="p-20 text-center border-2 border-dashed border-slate-900 rounded-[3rem]">
                                <History className="w-12 h-12 text-slate-800 mx-auto mb-4" />
                                <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">Sin registros históricos detectados</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
