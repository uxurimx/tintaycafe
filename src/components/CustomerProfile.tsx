"use client";

import {
    Zap,
    Calendar,
    Package,
    CreditCard,
    ShoppingBag,
    TrendingUp,
    ChevronRight,
    Star,
    Coffee,
    Book,
    Gamepad2,
    FlaskConical,
    Clock,
    Plus,
    QrCode
} from "lucide-react";
import Link from "next/link";

interface TransactionItem {
    id: number;
    name: string;
    quantity: number;
    price: number;
    type: string;
}

interface Transaction {
    id: number;
    total: number;
    status: string;
    createdAt: Date | null;
    items: TransactionItem[];
}

interface CustomRecipe {
    id: number;
    name: string;
    ingredients: string;
    basePrice: number;
    baseItem?: {
        name: string;
    } | null;
}

interface Customer {
    id: number;
    name: string;
    email: string | null;
    points: number | null;
    xp: number | null;
    rank: string | null;
    createdAt: Date | null;
}

export default function CustomerProfile({
    customer,
    transactions,
    customRecipes = [],
    activeOrders = []
}: {
    customer: Customer;
    transactions: Transaction[];
    customRecipes?: CustomRecipe[];
    activeOrders?: any[];
}) {
    const totalSpent = transactions.reduce((acc, t) => acc + t.total, 0);

    // XP Logic
    const currentXP = customer.xp || 0;
    const nextLevelXP = currentXP > 1000 ? 5000 : currentXP > 500 ? 1000 : currentXP > 100 ? 500 : 100;
    const progress = (currentXP / nextLevelXP) * 100;

    return (
        <div className="space-y-12 max-w-7xl mx-auto px-6 pb-20">
            {/* Hero Stats Card */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 relative overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 rounded-[3.5rem] p-12 text-white shadow-2xl shadow-indigo-500/20 group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 group-hover:bg-white/20 transition-all duration-700" />

                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-12">
                        <div className="space-y-6 flex-1">
                            <div className="flex flex-wrap gap-2">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 border border-white/30 backdrop-blur-md">
                                    <Star className="w-3 h-3 text-yellow-300 fill-yellow-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{customer.rank || 'Aprendiz'} Quantum</span>
                                </div>
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/30 border border-white/10 backdrop-blur-md">
                                    <Zap className="w-3 h-3 text-indigo-300" />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{currentXP} XP</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h1 className="text-5xl md:text-6xl font-outfit font-black italic tracking-tighter leading-none">
                                    Hola, <br /> {customer.name}
                                </h1>

                                {/* Progress Bar */}
                                <div className="max-w-xs space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-indigo-200">
                                        <span>Progreso de Rango</span>
                                        <span>{Math.round(progress)}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden border border-white/5">
                                        <div
                                            className="h-full bg-gradient-to-r from-emerald-400 to-indigo-300 transition-all duration-1000"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col items-end gap-2 shrink-0">
                            <div className="text-right">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-200 mb-2">Puntos Acumulados</p>
                                <div className="flex items-center gap-4">
                                    <span className="text-7xl md:text-8xl font-outfit font-black italic tracking-tighter">{customer.points || 0}</span>
                                    <Zap className="w-12 h-12 text-yellow-400 fill-yellow-400 animate-pulse" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] p-10 flex flex-col justify-between hover:border-indigo-500/30 transition-all">
                    <div className="space-y-6">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <TrendingUp className="w-6 h-6 text-indigo-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Total Invertido</p>
                                <p className="text-3xl font-outfit font-black text-white italic tracking-tighter mt-1">${totalSpent.toFixed(2)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                                <Calendar className="w-6 h-6 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Miembro desde</p>
                                <p className="text-lg font-bold text-white mt-1">
                                    {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString('es-MX', { month: 'long', year: 'numeric' }) : '---'}
                                </p>
                            </div>
                        </div>
                    </div>

                    <Link href="/" className="w-full py-5 bg-white text-slate-950 rounded-[1.5rem] font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-slate-200 transition-all active:scale-95 shadow-xl shadow-white/5">
                        <ShoppingBag className="w-4 h-4" /> Nueva Experiencia
                    </Link>
                </div>
            </div>

            {/* Quantum Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Left Column: Orders & History */}
                <div className="lg:col-span-2 space-y-12">
                    {/* Active Orders Section */}
                    {activeOrders.length > 0 && (
                        <div className="space-y-6">
                            <div className="flex items-center gap-3">
                                <Clock className="w-6 h-6 text-indigo-400" />
                                <h2 className="text-3xl font-outfit font-black text-white italic tracking-tighter uppercase">Sintonía en Tiempo Real</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {activeOrders.map(order => (
                                    <div key={order.id} className="p-6 bg-indigo-500/5 border border-indigo-500/20 rounded-3xl flex justify-between items-center animate-pulse">
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Orden #{order.id}</p>
                                            <p className="text-lg font-bold text-white capitalize">{order.status === 'preparing' ? 'En Preparación' : 'Pendiente'}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center border border-indigo-500/30">
                                            <Coffee className="w-6 h-6 text-indigo-400" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Custom Recipes / Alchemy Lab */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-end">
                            <div className="flex items-center gap-3">
                                <FlaskConical className="w-6 h-6 text-purple-400" />
                                <h2 className="text-3xl font-outfit font-black text-white italic tracking-tighter uppercase">Mis Alquimias</h2>
                            </div>
                            <Link href="/me/alchemy" className="px-4 py-2 bg-indigo-600/20 text-indigo-300 rounded-xl border border-indigo-500/30 text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:bg-indigo-600 hover:text-white transition-all">
                                <Plus className="w-3 h-3" /> Crear Nueva
                            </Link>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {customRecipes.length > 0 ? (
                                customRecipes.map(recipe => (
                                    <div key={recipe.id} className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] hover:border-purple-500/30 transition-all flex justify-between items-center group">
                                        <div className="space-y-2">
                                            <p className="text-[9px] font-black uppercase tracking-widest text-purple-400">Base: {recipe.baseItem?.name || 'Varios'}</p>
                                            <h4 className="text-xl font-bold text-white italic">{recipe.name}</h4>
                                            <div className="flex items-center gap-2 text-indigo-400 font-black tracking-tighter">
                                                <span>${recipe.basePrice}</span>
                                            </div>
                                        </div>
                                        <button className="w-12 h-12 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center group-hover:bg-purple-600 group-hover:text-white transition-all">
                                            <QrCode className="w-6 h-6" />
                                        </button>
                                    </div>
                                ))
                            ) : (
                                <div className="col-span-full py-12 bg-slate-900/40 border border-slate-800 border-dashed rounded-[2.5rem] text-center space-y-4">
                                    <FlaskConical className="w-10 h-10 text-slate-700 mx-auto" />
                                    <p className="text-sm text-slate-500">¿Aún no has creado tu propia esencia? Explora el Lab.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-8">
                        <div className="flex justify-between items-end">
                            <h2 className="text-4xl font-outfit font-black text-white italic tracking-tighter uppercase">Cronología Circular</h2>
                            <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Últimas 10 Transacciones</span>
                        </div>

                        <div className="space-y-4">
                            {transactions.map(transaction => (
                                <div key={transaction.id} className="group p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] hover:border-indigo-500/30 transition-all">
                                    <div className="flex flex-col md:flex-row justify-between gap-6">
                                        <div className="flex items-start gap-6">
                                            <div className="w-16 h-16 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                                <CreditCard className="w-8 h-8 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="text-[10px] font-black uppercase tracking-widest text-indigo-400">
                                                    ID_TRANS_{transaction.id} | {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString('es-MX', { day: 'numeric', month: 'short' }) : '---'}
                                                </p>
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {transaction.items.map((item, i) => (
                                                        <span key={i} className="px-3 py-1 bg-slate-950/80 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-300">
                                                            {item.quantity}x {item.name}
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end justify-center">
                                            <p className="text-3xl font-outfit font-black text-white italic tracking-tighter">${transaction.total.toFixed(2)}</p>
                                            <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 mt-1">Completado</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar Extras */}
                <div className="space-y-8">
                    <h2 className="text-4xl font-outfit font-black text-white italic tracking-tighter uppercase">Próximos Nexus</h2>

                    <div className="p-8 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-white/5 rounded-[3rem] space-y-6">
                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-300">Personalizado para ti</p>
                        <h3 className="text-2xl font-black text-white tracking-tight leading-tight">Maridaje Fractal para este fin de semana</h3>

                        <div className="space-y-4">
                            {[
                                { icon: <Coffee className="w-4 h-4" />, text: "Espresso Doble Etíope" },
                                { icon: <Book className="w-4 h-4" />, text: "Narrativa Contemporánea" },
                                { icon: <Gamepad2 className="w-4 h-4" />, text: "Estrategia Fractal" }
                            ].map((recom, i) => (
                                <div key={i} className="flex items-center gap-4 text-slate-400 font-medium">
                                    <div className="w-8 h-8 bg-slate-950 rounded-xl border border-white/5 flex items-center justify-center">
                                        {recom.icon}
                                    </div>
                                    {recom.text}
                                </div>
                            ))}
                        </div>

                        <button className="w-full py-4 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 hover:bg-indigo-500/20 transition-all flex items-center justify-center gap-2">
                            Ver Predicciones <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Quantum Flux (Offers) placeholder */}
                    <div className="p-8 bg-slate-950 border border-slate-800 rounded-[3rem] space-y-6">
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400" />
                            <h3 className="text-xl font-bold text-white tracking-tighter italic">Quantum Flux</h3>
                        </div>
                        <p className="text-xs text-slate-500">Misiones activas para ganar XP extra.</p>

                        <div className="space-y-3">
                            <div className="p-4 bg-slate-900/50 rounded-2xl border border-white/5 opacity-60">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Misión Diaria</p>
                                <p className="text-sm font-bold text-slate-400 mt-1">Visita antes de las 10 AM</p>
                                <p className="text-[10px] text-indigo-400 font-bold mt-2">+50 XP | +10 Puntos</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
