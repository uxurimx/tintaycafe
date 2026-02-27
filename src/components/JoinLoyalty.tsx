"use client";

import { UserPlus, Sparkles, Zap, ArrowRight, User } from "lucide-react";
import { useUser, SignInButton } from "@clerk/nextjs";
import Link from "next/link";

export default function JoinLoyalty() {
    const { user, isLoaded } = useUser();

    if (!isLoaded) return (
        <div className="h-[400px] flex items-center justify-center">
            <Coffee className="w-8 h-8 text-cafe-terracotta animate-pulse" />
        </div>
    );

    if (user) {
        return (
            <div className="bg-white border border-cafe-gold/20 rounded-[3rem] p-12 text-center animate-in zoom-in duration-500 flex flex-col items-center shadow-xl">
                <div className="w-20 h-20 bg-cafe-terracotta/10 rounded-full flex items-center justify-center mb-6 border border-cafe-terracotta/20">
                    <User className="w-10 h-10 text-cafe-terracotta" />
                </div>
                <h3 className="text-4xl font-playfair font-black text-cafe-dark mb-4 italic">¡Bienvenido, {user.firstName}!</h3>
                <p className="text-cafe-milk max-w-md mx-auto leading-relaxed font-medium">
                    Ya eres parte del Club Tinta y Café. Tus visitas y consumos se acumulan para recompensarte con lo mejor de nuestra librería y cafetería.
                </p>
                <div className="mt-8">
                    <Link
                        href="/me"
                        className="px-10 py-5 bg-cafe-terracotta text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 hover:bg-cafe-dark transition-all shadow-xl shadow-cafe-terracotta/10 active:scale-95"
                    >
                        Ver mis Beneficios <ArrowRight className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="text-left space-y-10">
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-cafe-gold/5 border border-cafe-gold/20">
                    <Sparkles className="w-4 h-4 text-cafe-gold" />
                    <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cafe-gold">Club de Amigos Tinta y Café</span>
                </div>
                <h2 className="text-6xl md:text-7xl font-playfair font-black text-cafe-dark italic tracking-tighter leading-[0.9]">
                    Únete a nuestra <br />
                    <span className="text-cafe-terracotta">Comunidad</span>
                </h2>
                <p className="text-cafe-milk text-xl leading-relaxed max-w-md font-medium">
                    Acumula beneficios en cada compra, accede a lecturas exclusivas y recibe invitaciones a nuestras noches de juegos de mesa.
                </p>

                <div className="bg-white border border-cafe-gold/20 rounded-[3rem] p-12 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-cafe-gold/5 rounded-full blur-[80px] -z-10 group-hover:bg-cafe-gold/10 transition-all duration-700" />

                    <div className="space-y-8">
                        <h4 className="text-2xl font-playfair font-black text-cafe-dark italic">Acceso Preferencial</h4>
                        <p className="text-base text-cafe-milk leading-relaxed font-medium">
                            Sin formularios complicados. Crea tu cuenta en segundos para empezar a disfrutar de beneficios exclusivos de inmediato.
                        </p>

                        <div className="pt-4">
                            <SignInButton mode="modal">
                                <button className="w-full py-6 bg-cafe-dark text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all shadow-xl hover:bg-cafe-terracotta active:scale-95">
                                    Registrarme Ahora <UserPlus className="w-5 h-5" />
                                </button>
                            </SignInButton>
                        </div>

                        <p className="text-[10px] text-cafe-milk/60 text-center font-bold uppercase tracking-widest mt-4">
                            Tus datos están seguros y protegidos.
                        </p>
                    </div>
                </div>
            </div>

            <div className="relative">
                <div className="absolute inset-0 bg-cafe-gold/10 blur-[130px] rounded-full pointer-events-none" />
                <div className="relative space-y-5">
                    {[
                        { title: "Beneficios Literarios", desc: "Descuento en títulos seleccionados cada mes.", icon: Sparkles },
                        { title: "Café de Cortesía", desc: "Un detalle especial para celebrar tu cumpleaños.", icon: Zap },
                        { title: "Acceso Prioritario", desc: "Sé el primero en jugar los nuevos títulos de mesa.", icon: UserPlus },
                        { title: "Puntos de Sabor", desc: "Acumula 1 punto por cada $10 de consumo.", icon: User }
                    ].map((benefit, i) => (
                        <div key={i} className="p-8 bg-white/80 backdrop-blur-md border border-cafe-gold/10 rounded-[2.5rem] flex items-start gap-6 hover:border-cafe-terracotta/30 transition-all hover:translate-x-3 shadow-sm hover:shadow-xl">
                            <div className="p-4 bg-cafe-terracotta/5 rounded-2xl border border-cafe-terracotta/10">
                                <benefit.icon className="w-6 h-6 text-cafe-terracotta" />
                            </div>
                            <div>
                                <h4 className="text-lg font-bold text-cafe-dark">{benefit.title}</h4>
                                <p className="text-sm text-cafe-milk mt-1.5 font-medium">{benefit.desc}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

import { Coffee } from "lucide-react";
