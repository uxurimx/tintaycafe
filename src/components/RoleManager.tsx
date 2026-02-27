"use client";

import { useState } from "react";
import {
    Shield,
    Plus,
    Pencil,
    Trash2,
    Lock,
    Check,
    X,
    LayoutGrid,
} from "lucide-react";
import { createRole, updateRole, deleteRole } from "@/app/api/roles/actions";
import { MODULE_OPTIONS } from "@/lib/modules";
import { toast } from "sonner";

interface RoleWithModules {
    id: number;
    name: string;
    slug: string;
    isSystem: boolean;
    createdAt: Date | null;
    modules: string[];
}

export default function RoleManager({
    initialRoles,
}: {
    initialRoles: RoleWithModules[];
}) {
    const [roles, setRoles] = useState<RoleWithModules[]>(initialRoles);
    const [creating, setCreating] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newName, setNewName] = useState("");
    const [newSlug, setNewSlug] = useState("");
    const [editModules, setEditModules] = useState<string[]>([]);

    const startCreate = () => {
        setCreating(true);
        setNewName("");
        setNewSlug("");
    };

    const cancelCreate = () => {
        setCreating(false);
        setNewName("");
        setNewSlug("");
    };

    const handleCreate = async () => {
        const name = newName.trim();
        const slug = newSlug.trim().toLowerCase().replace(/\s+/g, "-");
        if (!name || !slug) {
            toast.error("Nombre y slug son obligatorios");
            return;
        }
        try {
            const created = await createRole({ name, slug });
            setRoles((prev) => [
                { id: created.id, name: created.name, slug: created.slug, isSystem: false, createdAt: created.createdAt, modules: [] },
                ...prev,
            ]);
            cancelCreate();
            toast.success("Rol creado. Asigna módulos editando el rol.");
        } catch (e: any) {
            toast.error(e?.message || "Error al crear el rol");
        }
    };

    const startEdit = (role: RoleWithModules) => {
        setEditingId(role.id);
        setEditModules([...role.modules]);
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditModules([]);
    };

    const toggleModule = (moduleId: string) => {
        setEditModules((prev) =>
            prev.includes(moduleId)
                ? prev.filter((m) => m !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSaveModules = async (roleId: number) => {
        try {
            await updateRole(roleId, { modules: editModules });
            setRoles((prev) =>
                prev.map((r) =>
                    r.id === roleId ? { ...r, modules: editModules } : r
                )
            );
            cancelEdit();
            toast.success("Permisos actualizados");
        } catch (e: any) {
            toast.error(e?.message || "Error al guardar");
        }
    };

    const handleDelete = async (roleId: number) => {
        if (!confirm("¿Eliminar este rol? Los usuarios con este rol quedarán sin acceso hasta asignarles otro.")) return;
        try {
            await deleteRole(roleId);
            setRoles((prev) => prev.filter((r) => r.id !== roleId));
            toast.success("Rol eliminado");
        } catch (e: any) {
            toast.error(e?.message || "Error al eliminar");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-outfit font-black text-white flex items-center gap-2">
                    <LayoutGrid className="w-5 h-5 text-indigo-400" />
                    Roles y permisos
                </h2>
                {!creating && (
                    <button
                        onClick={startCreate}
                        className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Nuevo rol
                    </button>
                )}
            </div>

            {creating && (
                <div className="p-6 bg-slate-900/60 border border-slate-700 rounded-2xl space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Crear rol
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                                Nombre
                            </label>
                            <input
                                value={newName}
                                onChange={(e) => {
                                    setNewName(e.target.value);
                                    if (!newSlug) setNewSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, "-"));
                                }}
                                placeholder="Ej. Barista"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white text-sm focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">
                                Slug (identificador único)
                            </label>
                            <input
                                value={newSlug}
                                onChange={(e) => setNewSlug(e.target.value.trim().toLowerCase().replace(/\s+/g, "-"))}
                                placeholder="Ej. barista"
                                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-white text-sm font-mono focus:outline-none focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={handleCreate}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <Check className="w-3 h-3" /> Crear
                        </button>
                        <button
                            onClick={cancelCreate}
                            className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-bold flex items-center gap-2"
                        >
                            <X className="w-3 h-3" /> Cancelar
                        </button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {roles.map((role) => (
                    <div
                        key={role.id}
                        className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl"
                    >
                        <div className="flex flex-wrap items-center justify-between gap-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-indigo-600/20 border border-indigo-500/20">
                                    {role.isSystem ? (
                                        <Lock className="w-4 h-4 text-indigo-400" />
                                    ) : (
                                        <Shield className="w-4 h-4 text-indigo-400" />
                                    )}
                                </div>
                                <div>
                                    <p className="font-bold text-white">{role.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">
                                        {role.slug}
                                        {role.isSystem && " · Sistema"}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {editingId === role.id ? (
                                    <>
                                        <button
                                            onClick={() => handleSaveModules(role.id)}
                                            className="p-2 rounded-lg bg-emerald-600 text-white"
                                            title="Guardar"
                                        >
                                            <Check className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-300"
                                            title="Cancelar"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={() => startEdit(role)}
                                            className="p-2 rounded-lg bg-slate-700 text-slate-300 hover:bg-slate-600 flex items-center gap-1 text-xs font-bold"
                                            title="Editar permisos"
                                        >
                                            <Pencil className="w-3 h-3" /> Permisos
                                        </button>
                                        {!role.isSystem && (
                                            <button
                                                onClick={() => handleDelete(role.id)}
                                                className="p-2 rounded-lg text-slate-400 hover:bg-rose-600/20 hover:text-rose-400"
                                                title="Eliminar rol"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </>
                                )}
                            </div>
                        </div>

                        {editingId === role.id && (
                            <div className="mt-6 pt-6 border-t border-slate-800">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-3">
                                    Módulos visibles en el menú
                                </p>
                                <div className="flex flex-wrap gap-2">
                                    {MODULE_OPTIONS.map((opt) => (
                                        <label
                                            key={opt.id}
                                            className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all ${editModules.includes(opt.id)
                                                    ? "bg-indigo-600/20 border-indigo-500/50 text-white"
                                                    : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                                                }`}
                                        >
                                            <input
                                                type="checkbox"
                                                checked={editModules.includes(opt.id)}
                                                onChange={() => toggleModule(opt.id)}
                                                className="sr-only"
                                            />
                                            <span className="text-sm font-medium">
                                                {opt.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        )}

                        {editingId !== role.id && role.modules.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-1.5">
                                {role.modules.map((m) => {
                                    const opt = MODULE_OPTIONS.find((o) => o.id === m);
                                    return (
                                        <span
                                            key={m}
                                            className="px-2 py-1 rounded-lg bg-slate-800 text-slate-400 text-[10px] font-bold"
                                        >
                                            {opt?.label ?? m}
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
