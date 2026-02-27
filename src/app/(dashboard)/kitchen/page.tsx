import { protectModule } from "@/lib/auth-utils";
import { Utensils, Timer, CheckCircle2, AlertCircle } from "lucide-react";

export default async function KitchenPage() {
    await protectModule("kitchen");

    return (
        <div className="p-8 space-y-8">
            <div className="flex flex-col gap-2">
                <h1 className="text-4xl font-outfit font-black text-white tracking-tight uppercase">
                    Centro de Cocina
                </h1>
                <p className="text-slate-400 font-medium">Gestión de pedidos y comandas en tiempo real.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-8 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex flex-col items-center justify-center text-center space-y-4 min-h-[400px]">
                    <div className="p-4 bg-indigo-600/20 rounded-3xl border border-indigo-500/20">
                        <Timer className="w-12 h-12 text-indigo-400" />
                    </div>
                    <div className="space-y-2">
                        <h2 className="text-2xl font-outfit font-black text-white uppercase">Sin pedidos pendientes</h2>
                        <p className="text-sm text-slate-400 max-w-[200px] mx-auto">
                            Las comandas nuevas aparecerán aquí automáticamente.
                        </p>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="space-y-6">
                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-emerald-600/20 rounded-2xl border border-emerald-500/20">
                                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">Listos hoy</p>
                                <p className="text-2xl font-outfit font-black text-white">0</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-rose-600/20 rounded-2xl border border-rose-500/20">
                                <AlertCircle className="w-6 h-6 text-rose-400" />
                            </div>
                            <div>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest">En espera</p>
                                <p className="text-2xl font-outfit font-black text-white">0</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
