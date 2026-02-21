"use client";

import { useState } from "react";
import { Users, Search, Shield, Mail, User } from "lucide-react";
import { updateUserRole } from "@/app/api/users/actions";
import { toast } from "sonner";

interface DbUser {
    id: string;
    email: string;
    name: string;
    role: string;
    storeId: number | null;
    createdAt: Date | null;
}

const ROLE_LABELS: Record<string, string> = {
    owner: "Propietario",
    admin: "Administrador",
    employee: "Empleado",
    kitchen: "Cocina",
    customer: "Cliente",
};

export default function UserManager({ initialUsers }: { initialUsers: DbUser[] }) {
    const [users, setUsers] = useState<DbUser[]>(initialUsers);
    const [searchTerm, setSearchTerm] = useState("");
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    const filteredUsers = users.filter(
        u =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleRoleChange = async (userId: string, newRole: string) => {
        setUpdatingId(userId);
        try {
            await updateUserRole(userId, newRole);
            setUsers(prev =>
                prev.map(u => (u.id === userId ? { ...u, role: newRole } : u))
            );
            toast.success("Rol actualizado correctamente");
        } catch {
            toast.error("Error al actualizar el rol");
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="space-y-8 animate-fade-in">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-4xl font-outfit font-black text-white tracking-tight flex items-center gap-4">
                        <span className="p-3 bg-indigo-600 rounded-2xl shadow-lg shadow-indigo-600/20">
                            <Shield className="w-8 h-8" />
                        </span>
                        GESTIÓN DE USUARIOS
                    </h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.3em] mt-2 ml-1">
                        ROLES Y ACCESOS AL NEXUS
                    </p>
                </div>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o email..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-900/60 border border-slate-800 rounded-[2rem] py-4 pl-12 pr-6 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all font-medium"
                />
            </div>

            <div className="bg-slate-900/40 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <div className="p-6 border-b border-slate-800">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                        <Users className="w-3 h-3 text-indigo-400" /> {filteredUsers.length} usuarios registrados
                    </p>
                </div>
                <div className="divide-y divide-slate-800/80">
                    {filteredUsers.map(user => (
                        <div
                            key={user.id}
                            className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-900/30 transition-colors"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/20 flex items-center justify-center">
                                    <User className="w-6 h-6 text-indigo-400" />
                                </div>
                                <div>
                                    <p className="font-bold text-white">{user.name}</p>
                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {user.email}
                                    </p>
                                    <p className="text-[10px] text-slate-600 mt-1">
                                        ID: {user.id.slice(0, 12)}...
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <select
                                    value={user.role}
                                    onChange={e => handleRoleChange(user.id, e.target.value)}
                                    disabled={updatingId === user.id}
                                    className="bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-sm font-bold text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                                >
                                    {(Object.entries(ROLE_LABELS) as [string, string][]).map(([val, label]) => (
                                        <option key={val} value={val}>
                                            {label}
                                        </option>
                                    ))}
                                </select>
                                {updatingId === user.id && (
                                    <span className="text-[10px] text-slate-500">Guardando...</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
                {filteredUsers.length === 0 && (
                    <div className="p-12 text-center text-slate-500">
                        <Users className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm font-bold">No hay usuarios que coincidan con la búsqueda</p>
                    </div>
                )}
            </div>
        </div>
    );
}
