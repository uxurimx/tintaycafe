"use client";

import { useState } from "react";
import { Users, Shield } from "lucide-react";
import UserManager from "@/components/UserManager";
import RoleManager from "@/components/RoleManager";

interface DbUser {
    id: string;
    email: string;
    name: string;
    role: string;
    storeId: number | null;
    createdAt: Date | null;
}

interface RoleWithModules {
    id: number;
    name: string;
    slug: string;
    isSystem: boolean;
    createdAt: Date | null;
    modules: string[];
}

const TABS = [
    { id: "users" as const, label: "Usuarios", icon: Users },
    { id: "roles" as const, label: "Roles", icon: Shield },
];

export default function UsersTabs({
    initialUsers,
    initialRoles,
}: {
    initialUsers: DbUser[];
    initialRoles: RoleWithModules[];
}) {
    const [activeTab, setActiveTab] = useState<"users" | "roles">("users");

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

            <div className="flex gap-2 border-b border-slate-800 pb-2">
                {TABS.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all ${
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                                : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                        }`}
                    >
                        <tab.icon className="w-4 h-4" />
                        {tab.label}
                    </button>
                ))}
            </div>

            {activeTab === "users" && (
                <UserManager
                    initialUsers={initialUsers}
                    initialRoles={initialRoles.map((r) => ({ id: r.id, name: r.name, slug: r.slug }))}
                />
            )}
            {activeTab === "roles" && <RoleManager initialRoles={initialRoles} />}
        </div>
    );
}
