"use client";

import { useState } from "react";
import { Sparkles, Zap, FlaskConical, Beaker, Check, ArrowRight, Save, QrCode } from "lucide-react";
import { saveCustomRecipe } from "@/app/api/customers/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface BaseProduct {
    id: number;
    name: string;
    price: number;
    category: string;
}

export default function AlchemyLab({ bases }: { bases: BaseProduct[] }) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedBase, setSelectedBase] = useState<BaseProduct | null>(null);
    const [recipeName, setRecipeName] = useState("");
    const [isSaving, setIsSaving] = useState(false);

    const [adjustments, setAdjustments] = useState({
        milk: "Entera",
        sweetness: "Normal",
        temperature: "Caliente",
        extraShots: 0,
    });

    const handleSave = async () => {
        if (!selectedBase || !recipeName) return;
        setIsSaving(true);

        try {
            await saveCustomRecipe({
                name: recipeName,
                baseItemId: selectedBase.id,
                ingredients: JSON.stringify(adjustments),
                basePrice: selectedBase.price + (adjustments.extraShots * 15),
            });
            toast.success("¡Alquimia Guardada en el Nexus!");
            router.push("/me");
        } catch (error) {
            toast.error("Error al guardar la receta.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20">
                    <FlaskConical className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs font-black uppercase tracking-widest text-indigo-300">Laboratorio de Alquimia</span>
                </div>
                <h2 className="text-3xl md:text-5xl font-outfit font-black text-white italic tracking-tighter">
                    Crea tu <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400">Esencia Quantum</span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base max-w-xl mx-auto px-4">
                    Personaliza cada molécula de tu bebida. Tu receta será guardada en tu perfil con un código único para el barista.
                </p>
            </div>

            {/* Stepper */}
            <div className="flex justify-center items-center gap-2 md:gap-4 px-4 overflow-x-auto pb-2">
                {[1, 2, 3].map((s) => (
                    <div key={s} className="flex items-center gap-2 md:gap-4 shrink-0">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black transition-all ${step === s ? 'bg-indigo-600 text-white scale-110 shadow-lg shadow-indigo-600/20' : step > s ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-900 text-slate-600 border border-slate-800'}`}>
                            {step > s ? <Check className="w-5 h-5" /> : s}
                        </div>
                        {s < 3 && <div className={`w-8 md:w-12 h-0.5 rounded-full ${step > s ? 'bg-emerald-500/30' : 'bg-slate-800'}`} />}
                    </div>
                ))}
            </div>

            {/* Content areas */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-3xl md:rounded-[3rem] p-6 md:p-12 backdrop-blur-xl relative overflow-hidden mx-4 md:mx-0">
                <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/5 rounded-full blur-[100px] pointer-events-none" />

                {step === 1 && (
                    <div className="space-y-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {bases.map((base) => (
                                <button
                                    key={base.id}
                                    onClick={() => setSelectedBase(base)}
                                    className={`p-6 rounded-3xl border text-left transition-all group relative overflow-hidden ${selectedBase?.id === base.id ? 'bg-indigo-600/20 border-indigo-500 shadow-xl' : 'bg-slate-950/50 border-white/5 hover:border-white/10'}`}
                                >
                                    <div className="flex flex-col gap-4">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${selectedBase?.id === base.id ? 'bg-white text-indigo-600' : 'bg-slate-900 text-slate-400 group-hover:bg-slate-800'}`}>
                                            <Beaker className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-white text-lg">{base.name}</h4>
                                            <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">{base.category}</p>
                                        </div>
                                        <div className="text-lg font-outfit font-black text-indigo-400">${base.price}</div>
                                    </div>
                                    {selectedBase?.id === base.id && (
                                        <div className="absolute top-4 right-4 animate-in zoom-in duration-300">
                                            <Check className="w-6 h-6 text-indigo-400" />
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end">
                            <button
                                disabled={!selectedBase}
                                onClick={() => setStep(2)}
                                className={`w-full md:w-auto px-8 py-4 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 transition-all ${!selectedBase ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-white text-slate-950 hover:bg-indigo-600 hover:text-white shadow-xl shadow-white/5 active:scale-95'}`}
                            >
                                Siguiente Fase <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {/* Milk selection */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Tipo de Base / Leche</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Entera", "Deslactosada", "Almendra", "Avena"].map((m) => (
                                        <button
                                            key={m}
                                            onClick={() => setAdjustments({ ...adjustments, milk: m })}
                                            className={`py-4 rounded-2xl border text-xs font-bold transition-all ${adjustments.milk === m ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10'}`}
                                        >
                                            {m}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Sweetness */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Nivel de Dulzor</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Sin Dulce", "Ligero", "Normal", "Extra"].map((s) => (
                                        <button
                                            key={s}
                                            onClick={() => setAdjustments({ ...adjustments, sweetness: s })}
                                            className={`py-4 rounded-2xl border text-xs font-bold transition-all ${adjustments.sweetness === s ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10'}`}
                                        >
                                            {s}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Temperature */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Temperatura</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {["Frío (Iced)", "Caliente", "Frappé"].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setAdjustments({ ...adjustments, temperature: t })}
                                            className={`py-4 rounded-2xl border text-xs font-bold transition-all ${adjustments.temperature === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-slate-950/50 border-white/5 text-slate-400 hover:border-white/10'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Extra shots */}
                            <div className="space-y-4">
                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest ml-1">Shots Extra de Café</label>
                                <div className="flex items-center gap-6 bg-slate-950/50 p-2 rounded-2xl border border-white/5">
                                    <button
                                        onClick={() => setAdjustments({ ...adjustments, extraShots: Math.max(0, adjustments.extraShots - 1) })}
                                        className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-slate-800"
                                    >-</button>
                                    <div className="flex-1 text-center font-black text-xl text-white">{adjustments.extraShots}</div>
                                    <button
                                        onClick={() => setAdjustments({ ...adjustments, extraShots: Math.min(4, adjustments.extraShots + 1) })}
                                        className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center text-white hover:bg-slate-800"
                                    >+</button>
                                </div>
                                <p className="text-[10px] text-slate-600 font-bold uppercase text-center mt-2">+$15 por shot adicional</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                            <button onClick={() => setStep(1)} className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-all order-2 md:order-1">← Volver al Base</button>
                            <button
                                onClick={() => setStep(3)}
                                className="w-full md:w-auto px-8 py-4 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-xl shadow-white/5 active:scale-95 order-1 md:order-2"
                            >
                                Finalizar Alquimia <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="space-y-10 animate-in zoom-in-95 duration-500">
                        <div className="flex flex-col items-center gap-8 text-center">
                            <div className="w-24 h-24 bg-indigo-600/20 rounded-[2rem] flex items-center justify-center border border-indigo-500/30">
                                <FlaskConical className="w-12 h-12 text-indigo-400" />
                            </div>
                            <div className="space-y-4 w-full max-w-md">
                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Nombra tu Creación</label>
                                <input
                                    type="text"
                                    placeholder="Ej. El Despertar del Maestro"
                                    className="w-full bg-slate-950/80 border border-indigo-500/30 rounded-2xl py-5 px-6 text-white text-center text-xl font-bold placeholder:text-slate-800 focus:outline-none focus:border-indigo-500 transition-all shadow-2xl"
                                    value={recipeName}
                                    onChange={(e) => setRecipeName(e.target.value)}
                                />
                            </div>

                            <div className="w-full bg-slate-950/50 rounded-3xl p-8 border border-white/5 text-left space-y-4">
                                <h5 className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Resumen de la Receta</h5>
                                <div className="grid grid-cols-2 gap-y-4">
                                    <div className="text-slate-400 text-sm">Base: <span className="text-white font-bold ml-2">{selectedBase?.name}</span></div>
                                    <div className="text-slate-400 text-sm">Leche: <span className="text-white font-bold ml-2">{adjustments.milk}</span></div>
                                    <div className="text-slate-400 text-sm">Dulzor: <span className="text-white font-bold ml-2">{adjustments.sweetness}</span></div>
                                    <div className="text-slate-400 text-sm">Estado: <span className="text-white font-bold ml-2">{adjustments.temperature}</span></div>
                                    <div className="text-slate-400 text-sm">Shots Extra: <span className="text-white font-bold ml-2">{adjustments.extraShots}</span></div>
                                    <div className="text-indigo-400 font-black text-xl">${(selectedBase?.price || 0) + (adjustments.extraShots * 15)}</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row justify-between items-center gap-6 pt-8 border-t border-white/5">
                            <button onClick={() => setStep(2)} className="text-slate-500 text-xs font-black uppercase tracking-widest hover:text-white transition-all order-2 md:order-1">← Ajustar</button>
                            <button
                                disabled={!recipeName || isSaving}
                                onClick={handleSave}
                                className={`w-full md:w-auto px-10 py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 transition-all shadow-2xl order-1 md:order-2 ${!recipeName || isSaving ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-500 hover:to-purple-500 shadow-indigo-600/20 active:scale-95'}`}
                            >
                                {isSaving ? <Zap className="w-5 h-5 animate-spin" /> : <>Guardar Alquimia <Save className="w-5 h-5" /></>}
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Sidebar info */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 px-4 md:px-0">
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                        <QrCode className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 text-sm italic">Código QR Único</h5>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Escaneo instantáneo</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 text-sm italic">XP Ganado</h5>
                        <p className="text-[10px] text-slate-500 uppercase font-black">+25 XP por creación</p>
                    </div>
                </div>
                <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-3xl flex items-center gap-4">
                    <div className="p-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20">
                        <Zap className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                        <h5 className="font-bold text-slate-100 text-sm italic">Sincronización</h5>
                        <p className="text-[10px] text-slate-500 uppercase font-black">Disponible en todas las sucursales</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
