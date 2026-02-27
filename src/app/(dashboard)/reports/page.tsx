import { protectModule } from "@/lib/auth-utils";
import { BarChart3, TrendingUp, DollarSign, Package, ShoppingBag } from "lucide-react";

export default async function ReportsPage() {
    await protectModule("reports");

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-outfit font-black text-white tracking-tight uppercase">
                    Reportes e Inteligencia
                </h1>
                <p className="text-slate-400 font-medium">Análisis detallado de ventas, inventario y rendimiento.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Stats Grid */}
                {[
                    { label: "Ventas del Día", value: "$0.00", icon: DollarSign, color: "text-emerald-400", bg: "bg-emerald-600/20" },
                    { label: "Tickets", value: "0", icon: ShoppingBag, color: "text-indigo-400", bg: "bg-indigo-600/20" },
                    { label: "Stock Bajo", value: "0", icon: Package, color: "text-rose-400", bg: "bg-rose-600/20" },
                    { label: "Crecimiento", value: "0%", icon: TrendingUp, color: "text-amber-400", bg: "bg-amber-600/20" },
                ].map((stat, i) => (
                    <div key={i} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex flex-col gap-4">
                        <div className={`w-10 h-10 ${stat.bg} rounded-xl border border-white/5 flex items-center justify-center`}>
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{stat.label}</p>
                            <p className="text-2xl font-outfit font-black text-white">{stat.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] min-h-[350px] flex flex-col justify-between">
                    <div className="space-y-2">
                        <h3 className="text-lg font-outfit font-black text-white uppercase flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-indigo-400" />
                            Tendencia de Ventas
                        </h3>
                        <p className="text-sm text-slate-500">Visualiza el rendimiento de tu negocio.</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Módulo en preparación</p>
                    </div>
                </div>

                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] min-h-[350px] flex flex-col justify-between">
                    <div className="space-y-2">
                        <h3 className="text-lg font-outfit font-black text-white uppercase flex items-center gap-2">
                            <Package className="w-5 h-5 text-purple-400" />
                            Top Productos
                        </h3>
                        <p className="text-sm text-slate-500">Los artículos más vendidos esta semana.</p>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                        <p className="text-xs font-black text-slate-600 uppercase tracking-[0.3em]">Módulo en preparación</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
