"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Coffee,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronRight,
    UserPlus,
    Shield
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
    { name: "Mi Perfil", href: "/me", icon: UserPlus, roles: ['admin', 'owner', 'employee', 'kitchen', 'customer'] },
    { name: "Usuarios", href: "/users", icon: Shield, roles: ['admin', 'owner'] },
    { name: "Inventario", href: "/inventory", icon: Package, roles: ['admin', 'owner', 'employee'] },
    { name: "Carta / Menú", href: "/menu", icon: Coffee, roles: ['admin', 'owner', 'employee', 'kitchen'] },
    { name: "Punto de Venta", href: "/pos", icon: ShoppingCart, roles: ['admin', 'owner', 'employee'] },
    { name: "Proveedores", href: "/suppliers", icon: Users, roles: ['admin', 'owner', 'employee'] },
    { name: "Clientes", href: "/customers", icon: Users, roles: ['admin', 'owner', 'employee'] },
    { name: "Configuración", href: "/settings", icon: Settings, roles: ['admin', 'owner', 'employee'] },
];

export default function SideNav({ userRole = 'customer' }: { userRole?: string }) {
    const pathname = usePathname();
    const { user } = useUser();

    const isStaff = ['admin', 'owner', 'employee'].includes(userRole);
    const filteredNav = navItems.filter(item => item.roles.includes(userRole));

    return (
        <div className="h-screen w-64 bg-slate-950 border-r border-slate-900 flex flex-col p-4 fixed left-0 top-0 z-50">
            <div className="flex items-center gap-3 px-2 mb-10 mt-2">
                <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                    <Coffee className="text-white w-6 h-6" />
                </div>
                <div className="flex flex-col text-white text-left">
                    <span className="font-outfit font-bold text-lg leading-tight">Tinta y Café</span>
                    <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest text-left">Neural Nexus</span>
                </div>
            </div>

            <nav className="flex-1 space-y-2">
                {filteredNav.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`
                flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-300 group
                ${isActive
                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20 font-bold"
                                    : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"}
              `}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className={`w-5 h-5 ${isActive ? "text-white" : "group-hover:text-indigo-400"}`} />
                                <span className="font-medium">{item.name}</span>
                            </div>
                            {isActive && <ChevronRight className="w-4 h-4 text-white/50" />}
                        </Link>
                    );
                })}
            </nav>

            <div className="mt-auto pt-6 border-t border-slate-900">
                <div className="flex items-center gap-4 px-2 py-3 bg-slate-900/50 rounded-2xl border border-slate-800/50">
                    <UserButton
                        afterSignOutUrl="/"
                        appearance={{
                            elements: {
                                userButtonAvatarBox: "w-10 h-10 rounded-xl",
                            }
                        }}
                    />
                    <div className="flex flex-col overflow-hidden text-left">
                        <span className="text-xs font-bold text-slate-200 truncate">
                            {user?.firstName || "Usuario"} {user?.lastName || ""}
                        </span>
                        <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest">
                            {userRole === 'owner' ? 'Propietario' :
                                userRole === 'admin' ? 'Administrador' :
                                    userRole === 'employee' ? 'Staff' : 'Consumidor'}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
