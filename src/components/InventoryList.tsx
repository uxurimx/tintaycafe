"use client";

import { useEffect, useState } from "react";
import { pusherClient } from "@/lib/pusher/client";
import {
    Package,
    BookOpen,
    AlertCircle,
    RefreshCcw,
    Camera,
    Plus,
    Search,
    Store,
    X,
    Loader2,
    ScanBarcode
} from "lucide-react";
import { addInventoryItem, processVisionAI } from "@/app/api/inventory/actions";

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
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessingAI, setIsProcessingAI] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");

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

    const handleAIInspiration = async () => {
        setIsProcessingAI(true);
        // Simulating camera/image processing
        try {
            const result = await processVisionAI("");
            if (result.success) {
                // In a real flow, this would fill a form
                console.log("AI Detected:", result.data);
            }
        } finally {
            setIsProcessingAI(false);
            setIsModalOpen(true);
        }
    };

    const filteredItems = items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.barcode.includes(searchQuery)
    );

    return (
        <div className="w-full space-y-6 text-white">
            {/* Header & Search */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h2 className="text-4xl font-outfit font-bold tracking-tight">Orquestador de Stock</h2>
                    <p className="text-slate-400 text-sm mt-1 flex items-center gap-2">
                        <Store className="w-4 h-4 text-indigo-400" />
                        Nodo Central Durango | Control Neural Activo
                    </p>
                </div>

                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar por nombre o barcode..."
                            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-2xl text-sm focus:outline-none focus:border-indigo-500 transition-all"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-2.5 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-bold transition-all shadow-lg shadow-indigo-500/20"
                    >
                        <Plus className="w-6 h-6" />
                    </button>
                    <button
                        onClick={handleAIInspiration}
                        className="p-2.5 bg-gradient-to-br from-purple-600 to-pink-600 hover:opacity-90 rounded-2xl font-bold transition-all shadow-lg shadow-purple-500/20"
                    >
                        <Camera className="w-6 h-6" />
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Total SKU</p>
                    <p className="text-3xl font-outfit font-bold">{items.length}</p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Bajo Stock</p>
                    <p className="text-3xl font-outfit font-bold text-amber-500">
                        {items.filter(i => i.quantity <= i.minStock).length}
                    </p>
                </div>
                <div className="p-6 rounded-3xl bg-slate-900/40 border border-slate-800/50 backdrop-blur-sm col-span-1 md:col-span-2">
                    <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-2">Estado Sincronicidad</p>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit">
                            <RefreshCcw className="w-4 h-4 animate-spin-slow" />
                            <span className="text-xs font-bold uppercase tracking-widest">Pusher Realtime Activo</span>
                        </div>
                        <div className="flex items-center gap-2 text-indigo-400 bg-indigo-500/10 px-3 py-1 rounded-full border border-indigo-500/20 w-fit">
                            <RefreshCcw className="w-4 h-4" />
                            <span className="text-xs font-bold uppercase tracking-widest">Sucursales Vinculadas: 3</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-950/50 backdrop-blur-xl shadow-2xl">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-slate-800 bg-slate-900/30">
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Producto / Neural Tag</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Tipo</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500">Stock Actual</th>
                            <th className="p-6 text-xs font-bold uppercase tracking-widest text-slate-500 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/50">
                        {filteredItems.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-900/40 transition-colors group">
                                <td className="p-6 text-left">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-slate-900 rounded-2xl group-hover:bg-indigo-500/20 transition-all border border-slate-800">
                                            {item.type === 'book' ? <BookOpen className="w-5 h-5 text-indigo-400" /> : <Package className="w-5 h-5 text-purple-400" />}
                                        </div>
                                        <div className="text-left">
                                            <p className="font-bold text-slate-200 group-hover:text-white transition-colors leading-tight">{item.name}</p>
                                            <p className="text-[10px] text-slate-500 font-mono mt-1 uppercase tracking-tighter">REF: {item.barcode}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-6">
                                    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-800 bg-slate-900/50
                    ${item.type === 'book' ? 'text-indigo-400' : 'text-purple-400'}
                  `}>
                                        {item.type}
                                    </span>
                                </td>
                                <td className="p-6">
                                    <div className="flex flex-col">
                                        <span className={`text-2xl font-outfit font-bold ${item.quantity <= item.minStock ? 'text-amber-500' : 'text-slate-200'}`}>
                                            {item.quantity}
                                        </span>
                                        <span className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Umbral: {item.minStock}</span>
                                    </div>
                                </td>
                                <td className="p-6 text-right">
                                    <button className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white border border-transparent hover:border-slate-700">
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* AI PROCESSING OVERLAY */}
            {isProcessingAI && (
                <div className="fixed inset-0 z-[100] bg-slate-950/80 backdrop-blur-md flex items-center justify-center animate-fade-in">
                    <div className="text-center space-y-4">
                        <div className="relative">
                            <Loader2 className="w-16 h-16 text-indigo-500 animate-spin mx-auto" />
                            <Camera className="w-6 h-6 text-white absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                        </div>
                        <h3 className="text-2xl font-outfit font-bold text-white">Inyectando Conciencia IA</h3>
                        <p className="text-slate-400 animate-pulse">Analizando ISBN y metadatos cuánticos...</p>
                    </div>
                </div>
            )}

            {/* ADD ITEM MODAL */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
                    <div className="relative bg-slate-900 border border-slate-800 rounded-[2.5rem] w-full max-w-lg p-8 shadow-2xl animate-fade-in overflow-hidden">
                        {/* Glow decor */}
                        <div className="absolute -top-20 -right-20 w-40 h-40 bg-indigo-600/20 rounded-full blur-3xl" />

                        <div className="flex justify-between items-center mb-8">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-indigo-600 rounded-xl">
                                    <ScanBarcode className="w-5 h-5" />
                                </div>
                                <h3 className="text-2xl font-outfit font-bold">Registro de Insumo</h3>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-slate-800 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <form action={async (formData) => {
                            await addInventoryItem(formData);
                            setIsModalOpen(false);
                        }} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Nombre del Producto</label>
                                <input
                                    name="name"
                                    required
                                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500"
                                    placeholder="Ej. Espresso Blend / El Psicoanalista"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Código de Barras</label>
                                    <input
                                        name="barcode"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white font-mono focus:outline-none focus:border-indigo-500"
                                        placeholder="978..."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Tipo</label>
                                    <select
                                        name="type"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500 appearance-none"
                                    >
                                        <option value="book">Libro</option>
                                        <option value="product">Insumo / Café</option>
                                        <option value="other">Otro</option>
                                    </select>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">Stock Inicial</label>
                                    <input
                                        name="quantity"
                                        type="number"
                                        required
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest ml-1">ID Almacén (1-3)</label>
                                    <input
                                        name="storeId"
                                        type="number"
                                        defaultValue="1"
                                        className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white focus:outline-none focus:border-indigo-500"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-indigo-500/20 active:scale-[0.98] mt-4">
                                Sincronizar Producto
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
