import { Users, Construction } from "lucide-react";

export default function CustomersPage() {
    return (
        <div className="p-8 min-h-[80vh] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-pink-500/10 rounded-3xl flex items-center justify-center mb-6 border border-pink-500/20">
                <Users className="w-10 h-10 text-pink-400" />
            </div>
            <h1 className="text-4xl font-outfit font-bold mb-4 italic tracking-tight text-white">Nexus de Clientes</h1>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
                Gestiona la fidelidad de tus clientes, tokens PoCult y perfiles de compra.
            </p>
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-900 border border-slate-800 rounded-full text-xs font-bold text-slate-500 uppercase tracking-widest">
                <Construction className="w-4 h-4" />
                Fase de Construcción
            </div>
        </div>
    );
}
