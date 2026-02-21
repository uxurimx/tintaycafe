"use client";

import { useState } from "react";
import { UserPlus, Check, Zap, Sparkles, Mail, User, Phone, Calendar } from "lucide-react";
import { createCustomer } from "@/app/api/customers/actions";
import { toast } from "sonner";

export default function JoinLoyalty() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        birthday: ""
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createCustomer({
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                birthday: formData.birthday ? new Date(formData.birthday) : undefined
            });
            setIsSuccess(true);
            toast.success("¡Bienvenido al Nexus de Tinta y Café!");
        } catch (error) {
            toast.error("Error al unirse al programa. Inténtalo de nuevo.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-[3rem] p-12 text-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                    <Check className="w-10 h-10 text-emerald-400" />
                </div>
                <h3 className="text-3xl font-outfit font-black text-white mb-4">¡Sincronización Exitosa!</h3>
                <p className="text-slate-300 max-w-md mx-auto leading-relaxed">
                    Tu perfil ha sido integrado en nuestra red. Ahora puedes acumular puntos Quantum en cada visita a nuestra sucursal en Durango.
                </p>
                <div className="mt-8 p-4 bg-slate-950/50 rounded-2xl border border-white/5 inline-flex items-center gap-3">
                    <Zap className="w-5 h-5 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-300">ID_ACTIVO | BIENVENIDO</span>
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

                <ul className="space-y-4">
                    {[
                        "1 punto por cada $10 de consumo",
                        "Descuentos en libros seleccionados",
                        "Café de cortesía en tu cumpleaños",
                        "Acceso prioritario a juegos nuevos"
                    ].map((benefit, i) => (
                        <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                            <div className="w-6 h-6 bg-indigo-600/20 rounded-lg flex items-center justify-center border border-indigo-600/30">
                                <Check className="w-3.5 h-3.5 text-indigo-400" />
                            </div>
                            {benefit}
                        </li>
                    ))}
                </ul>
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-[3rem] p-8 md:p-12 backdrop-blur-xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full blur-[80px] -z-10 group-hover:bg-indigo-600/10 transition-all duration-700" />

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Nombre Completo</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                required
                                type="text"
                                placeholder="P. ej. Juan Perez"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="email"
                                    placeholder="hola@nexus.mx"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                                <input
                                    type="text"
                                    placeholder="618-123-4567"
                                    className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white placeholder:text-slate-700 focus:outline-none focus:border-indigo-500/50 transition-all"
                                    value={formData.phone}
                                    onChange={e => setFormData({ ...formData, phone: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Cumpleaños (Opcional)</label>
                        <div className="relative">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
                            <input
                                type="date"
                                className="w-full bg-slate-950/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-6 text-white focus:outline-none focus:border-indigo-500/50 transition-all appearance-none"
                                value={formData.birthday}
                                onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all shadow-xl ${isSubmitting ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-indigo-600 hover:text-white shadow-white/5 active:scale-95'}`}
                    >
                        {isSubmitting ? (
                            <Zap className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Unirse al Nexus <UserPlus className="w-5 h-5" />
                            </>
                        )}
                    </button>

                    <p className="text-[9px] text-slate-600 text-center font-bold uppercase tracking-widest mt-4">
                        Al unirse, acepta nuestra política de datos y sincronización Durango-Digital.
                    </p>
                </form>
            </div>
        </div>
    );
}
