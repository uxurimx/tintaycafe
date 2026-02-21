"use client";

import { useState, useMemo } from "react";
import {
    Plus,
    Search,
    Coffee,
    Edit3,
    Trash2,
    MoreVertical,
    PlusCircle,
    X,
    ChevronRight,
    UtensilsCrossed,
    Flame,
    Droplets
} from "lucide-react";

interface MenuProduct {
    id: number;
    name: string;
    category: string;
    price: number;
    description: string;
    status: 'active' | 'out_of_stock';
}

export default function MenuManager({ initialProducts = [] }: { initialProducts: MenuProduct[] }) {
    const [products, setProducts] = useState(initialProducts);
    const [searchQuery, setSearchQuery] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('Todas');

    const categories = ['Todas', 'Café', 'Bebidas Frías', 'Repostería', 'Juegos'];

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = activeCategory === 'Todas' || p.category === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [products, searchQuery, activeCategory]);

    return (
        <div className="w-full space-y-8 animate-fade-in p-2 text-left">
            {/* Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                    <h2 className="text-4xl font-outfit font-black tracking-tighter text-white">
                        CARTA <span className="text-indigo-500 italic">NEURAL</span>
                    </h2>
                    <div className="flex items-center gap-3 mt-2">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full">
                            <UtensilsCrossed className="w-3 h-3 text-indigo-400" />
                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">Menú de Experiencias</span>
                        </div>
                        <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Preparados & Listos</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
                    <div className="relative group flex-1 min-w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Buscar en la carta..."
                            className="w-full pl-12 pr-4 py-3.5 bg-slate-900/50 border border-slate-800 rounded-3xl text-sm focus:outline-none focus:border-indigo-500/50 focus:bg-slate-900 transition-all text-white backdrop-blur-md"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <button
                        onClick={() => setIsModalOpen(true)}
                        className="p-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl shadow-xl shadow-indigo-600/20 active:scale-95 transition-all text-xs font-bold uppercase tracking-widest flex items-center gap-2"
                    >
                        <PlusCircle className="w-5 h-5" /> Nuevo Platillo
                    </button>
                </div>
            </div>

            {/* Category Filter */}
            <div className="flex items-center gap-4 overflow-x-auto scrollbar-hide pb-2">
                {categories.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-6 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border shrink-0
                            ${activeCategory === cat ? "bg-white text-slate-950 border-white shadow-lg" : "bg-transparent text-slate-500 border-slate-800 hover:text-white"}
                        `}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Menu Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                    <div key={product.id} className="group relative bg-slate-950 border border-slate-900 rounded-[2.5rem] p-8 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px] overflow-hidden">
                        <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button className="p-2 bg-slate-900 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-colors">
                                <MoreVertical className="w-4 h-4" />
                            </button>
                        </div>

                        <div className="flex items-start gap-6">
                            <div className="w-20 h-20 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/5 rounded-3xl flex items-center justify-center shrink-0">
                                <Coffee className="w-10 h-10 text-indigo-400" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-1">
                                    <span className="text-[9px] font-black text-indigo-500 uppercase tracking-widest">{product.category}</span>
                                    <span className={`h-2 w-2 rounded-full ${product.status === 'active' ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.3)]' : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.3)]'}`} />
                                </div>
                                <h3 className="text-2xl font-outfit font-black text-white tracking-tight leading-none mb-2">{product.name}</h3>
                                <p className="text-slate-500 text-xs line-clamp-2 mb-4 leading-relaxed">{product.description || 'Sin descripción descriptiva.'}</p>
                                <div className="flex justify-between items-center">
                                    <span className="text-3xl font-outfit font-black text-white italic tracking-tighter">${product.price}</span>
                                    <div className="flex gap-2">
                                        <button className="p-2.5 bg-slate-900 hover:bg-slate-800 rounded-xl border border-slate-800 transition-all">
                                            <Edit3 className="w-4 h-4 text-slate-500" />
                                        </button>
                                        <button className="p-2.5 bg-slate-900 hover:bg-rose-950/30 rounded-xl border border-slate-800 hover:border-rose-900/50 transition-all group/del">
                                            <Trash2 className="w-4 h-4 text-slate-500 group-hover/del:text-rose-500" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}

                {filteredProducts.length === 0 && (
                    <div className="col-span-full py-20 bg-slate-950/50 border-2 border-dashed border-slate-900 rounded-[3rem] flex flex-col items-center justify-center text-center">
                        <UtensilsCrossed className="w-12 h-12 text-slate-800 mb-4" />
                        <p className="text-slate-600 font-black uppercase tracking-[0.2em] text-xs">No hay creaciones en esta categoría</p>
                    </div>
                )}
            </div>

            {/* Add Product Modal (Simplified for now) */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-3xl bg-slate-950/80 animate-fade-in">
                    <div className="bg-slate-950 border border-white/5 rounded-[2.5rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-[0_0_100px_rgba(79,70,229,0.1)] overflow-hidden">
                        <div className="p-8 border-b border-white/5 flex justify-between items-center shrink-0">
                            <div>
                                <h3 className="text-4xl font-outfit font-black tracking-tighter text-white uppercase italic">Inyectar Platillo</h3>
                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mt-1">Alta de producto en carta</p>
                            </div>
                            <button onClick={() => setIsModalOpen(false)} className="p-3 hover:bg-slate-900 rounded-full border border-slate-800 transition-all group">
                                <X className="w-6 h-6 text-slate-500 group-hover:text-white" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            <form className="grid grid-cols-2 gap-8">
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Nombre del Producto</label>
                                    <input className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none focus:border-indigo-500 transition-all font-medium" placeholder="P Ej. Latte de Especialidad" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Categoría</label>
                                    <select className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none appearance-none">
                                        {categories.filter(c => c !== 'Todas').map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Precio Venta</label>
                                    <input type="number" step="0.01" className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none" placeholder="$0.00" />
                                </div>
                                <div className="col-span-2 space-y-2">
                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">Descripción Breve</label>
                                    <textarea className="w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-5 text-white focus:outline-none h-32 resize-none" placeholder="Describe los ingredientes o sensaciones..." />
                                </div>
                                <button className="col-span-2 py-5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-3xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl transition-all shadow-indigo-600/20 active:scale-[0.98]">Sincronizar a la Carta</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
