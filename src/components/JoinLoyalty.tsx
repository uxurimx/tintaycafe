"use client";

import { UserPlus, Sparkles, Zap, ArrowRight, User } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function JoinLoyalty() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return (
        <div className="h-[400px] flex items-center justify-center">
            <Zap className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
    );

    if (user) {
        return (
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-[3rem] p-12 text-center animate-in zoom-in duration-500 flex flex-col items-center">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6 border border-emerald-500/30">
                    <User className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-outfit font-black text-white mb-4">¡Hola, {user.firstName}!</h3>
                <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                    Ya eres parte del Nexus. Tu sincronización Durango-Digital está activa y tus puntos se acumulan automáticamente en cada experiencia.
                </p>
                <div className="mt-8">
                    <Link
                        href="/me"
                        className="px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-indigo-500 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95"
                    >
                        Ver Mi Perfil & Puntos <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20">
                    <Sparkles className="w-4 h-4 text-pink-400" />
                    <span className="text-[10px] font-black uppercase tracking-[0.2em] text-pink-300">Programa de Fidelidad</span>
                </div>
                <h2 className="text-5xl md:text-6xl font-outfit font-black text-white italic tracking-tighter leading-none">
                    Únete al <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">Quantum Nexus</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed max-w-md">
                    Acumula puntos en cada compra, accede a lecturas exclusivas y recibe invitaciones a nuestras noches de juegos de mesa y catas de café.
                </p>

                <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-600/10 transition-all duration-700" />

                    <div className="space-y-6">
                        <h4 className="text-xl font-bold text-white italic">Acceso Instantáneo</h4>
                        <p className="text-sm text-slate-500 leading-relaxed">
                            No más formularios tediosos. Sincroniza tu cuenta Durango con Clerk para empezar a ganar beneficios de inmediato.
                        </p>

                        <div className="pt-4">
                            <SignInButton mode="modal">
                                <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all shadow-xl hover:bg-indigo-600 hover:text-white shadow-white/5 active:scale-95">
                                    Registrarse con Clerk <UserPlus className="w-5 h-5" />
                                </button>
                            </SignInButton>
                        </div>

                        <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest mt-4">
                            Sincronización Durango-Digital segura y cifrada.
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="relative space-y-4">
                    {[
                        { title: "Puntos Experienciales", desc: "1 punto por cada $10 de consumo real.", icon: Zap },
                        { title: "Lecturas Exclusivas", desc: "Descuentos en libros seleccionados cada mes.", icon: Sparkles },
                        { title: "Regalo de Natalicio", desc: "Café de cortesía para celebrar tu día.", icon: User },
                        { title: "Acceso Prioritario", desc: "Sé el primero en probar nuevos juegos y granos.", icon: UserPlus }
                    ].map((benefit, i) => (
                        <div key={i} className="p-6 bg-slate-900/60 border border-slate-800 rounded-3xl flex items-start gap-5 hover:border-indigo-500/30 transition-all hover:translate-x-2">
                            <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                                <benefit.icon className="w-5 h-5 text-indigo-400" />
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-100">{benefit.title}</h4>
                                <p className="text-sm text-slate-500 mt-1">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
