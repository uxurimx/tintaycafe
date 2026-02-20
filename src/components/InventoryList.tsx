"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher/client";
import { Package, BookOpen, AlertCircle, RefreshCcw, Camera } from "lucide-react";

interface InventoryItem {
    id: number;
    name: string;
    barcode: string;
    quantity: number;
    type: string;
    minStock: number;
}

export default function InventoryList({ initialItems }: { initialItems: InventoryItem[] }) {
    const [items, setItems] = useState(initialItems);

    useEffect(() => {
        const channel = pusherClient.subscribe("inventory-updates");
        channel.bind("stock-changed", (data: { itemId: number; newQuantity: number }) => {
            setItems((prev) =>
                prev.map((item) =>
                    item.id === data.itemId ? { ...item, quantity: data.newQuantity } : item
                )
            );
        });

        return () => {
            pusherClient.unsubscribe("inventory-updates");
        };
    }, []);

    return (
        <div className="w-full space-y-6">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-3xl font-outfit font-bold">Orquestador de Stock</h2>
                    <p className="text-slate-400 text-sm">Control centralizado y neuronal de tus sucursales.</p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20">
                    <Camera className="w-5 h-5" />
                    Ingesta IA Vision
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total SKU</p>
                    <p className="text-3xl font-outfit font-bold">{items.length}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Bajo Stock</p>
                    <p className="text-3xl font-outfit font-bold text-amber-500">
                        {items.filter(i => i.quantity <= i.minStock).length}
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Sincronización</p>
                    <div className="flex items-center gap-2 text-emerald-400">
                        <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                        <span className="text-sm font-bold">Tiempo Real Activo</span>
                    </div>
                </div>
            </div>

            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/50 backdrop-blur-xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/30">
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Producto</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Categoría</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Stock Actual</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {items.map((item) => (
                            <tr key={item.id} className="border-b border-slate-900/50 hover:bg-slate-900/20 transition-colors group">
                                <td className="p-6">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-xl group-hover:bg-indigo-500/10 transition-colors">
                                            {item.type === 'book' ? <BookOpen className="w-5 h-5 text-indigo-400" /> : <Package className="w-5 h-5 text-purple-400" />}
                                        </div>
                                        <div>
                                            <p className="font-bold text-slate-200 line-clamp-1">{item.name}</p>
                                            <p className="text-xs text-slate-500 font-mono">{item.barcode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className="px-3 py-1 rounded-full bg-slate-900 text-xs font-bold text-slate-400 border border-slate-800 capitalize">
                                        {item.type}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <span className={`text-xl font-outfit font-bold ${item.quantity <= item.minStock ? 'text-amber-500' : 'text-slate-200'}`}>
                                        {item.quantity}
                                    </span>
                                </td>
                                <td className="p-6">
                                    {item.quantity <= item.minStock ? (
                                        <div className="flex items-center gap-2 text-amber-500 text-xs font-bold bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit">
                                            <AlertCircle className="w-3 h-3" />
                                            CRÍTICO
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-emerald-500 text-xs font-bold bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                                            ÓPTIMO
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
