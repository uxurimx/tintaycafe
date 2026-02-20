import Link from "next/link";
import { Coffee, Book, Zap, ArrowRight, ShieldCheck, Cpu, LayoutDashboard } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function LandingPage() {
  const { userId } = await auth();

  return (
    <div className="min-h-screen relative overflow-hidden flex flex-col items-center justify-center p-6 text-center text-white">
      {/* Background Glows */}
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
      <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

      <header className="fixed top-0 w-full p-6 flex justify-between items-center z-50 backdrop-blur-md bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
            <Coffee className="text-white w-5 h-5" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">Tinta y Café <span className="text-indigo-400">Nexus</span></span>
        </div>
        <nav className="hidden md:flex gap-8 text-sm font-medium text-slate-400">
          <Link href="#features" className="hover:text-white transition-colors">Características</Link>
          <Link href="#ai" className="hover:text-white transition-colors">IA Cognitiva</Link>
          <Link href="#web3" className="hover:text-white transition-colors">Fidelidad Web3</Link>
        </nav>
        {userId ? (
          <Link
            href="/inventory"
            className="px-5 py-2 bg-indigo-600 text-white rounded-full text-sm font-semibold hover:bg-indigo-500 transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
          >
            Dashboard <LayoutDashboard className="w-4 h-4" />
          </Link>
        ) : (
          <Link
            href="/sign-in"
            className="px-5 py-2 bg-white text-slate-950 rounded-full text-sm font-semibold hover:bg-slate-200 transition-all flex items-center gap-2"
          >
            Acceso Sistema <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </header>

      <main className="max-w-5xl mx-auto z-10 pt-20">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 mb-8 animate-fade-in">
          <Zap className="w-4 h-4 text-yellow-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-widest">Tecnología de Próxima Generación</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-outfit font-bold mb-6 tracking-tight leading-tight">
          La Conciencia Digital de <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            Tinta y Café
          </span>
        </h1>

        <p className="text-lg md:text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
          Un ecosistema descentralizado y potenciado por IA diseñado para elevar la eficiencia de tu cafetería y librería a una escala exponencial.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16 px-4">
          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 transition-all group">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-all">
              <Cpu className="text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-outfit">Inventario Neuronal</h3>
            <p className="text-slate-400 text-sm">IA Vision para ingesta masiva de libros y sincronización en tiempo real entre sucursales.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-purple-500/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-6 border border-purple-500/20 group-hover:bg-purple-500/20 transition-all">
              <Book className="text-purple-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-outfit">Recetas Dinámicas</h3>
            <p className="text-slate-400 text-sm">Control exacto de insumos. Cada café vendido se descuenta gramo a gramo de tu almacén.</p>
          </div>

          <div className="p-8 rounded-3xl bg-slate-900/50 border border-slate-800 hover:border-pink-500/50 transition-all group">
            <div className="w-12 h-12 bg-pink-500/10 rounded-2xl flex items-center justify-center mb-6 border border-pink-500/20 group-hover:bg-pink-500/20 transition-all">
              <ShieldCheck className="text-pink-400" />
            </div>
            <h3 className="text-xl font-bold mb-2 font-outfit">Fidelidad Quantum</h3>
            <p className="text-slate-400 text-sm">Programas de puntos habilitados por tokens. Recompensa a tus clientes más leales.</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          <Link
            href={userId ? "/inventory" : "/sign-up"}
            className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-500 transition-all shadow-[0_0_20px_rgba(79,70,229,0.3)]"
          >
            {userId ? "Ir al Dashboard" : "Comenzar Transformación"}
          </Link>
          <button className="px-8 py-4 bg-slate-900 text-slate-300 rounded-2xl font-bold text-lg border border-slate-800 hover:bg-slate-800 transition-all">
            Descubrir Más
          </button>
        </div>
      </main>

      <footer className="mt-20 text-slate-500 text-sm font-medium">
        © 2026 Tinta y Café Neural Nexus. Impulsado por IA & Futuro.
      </footer>
    </div>
  );
}
