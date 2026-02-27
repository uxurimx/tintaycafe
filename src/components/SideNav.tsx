"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname } from "next/navigation";
import {
    Coffee,
    Package,
    ShoppingCart,
    Users,
    Settings,
    ChevronRight,
    UserPlus,
    Shield,
    Menu,
    X,
    Book,
    Utensils,
    BarChart3
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

const navItems = [
    { name: "Mi Perfil", href: "/me", icon: UserPlus, module: "me" as const },
    { name: "Usuarios", href: "/users", icon: Shield, module: "users" as const },
    { name: "Inventario", href: "/inventory", icon: Package, module: "inventory" as const },
    { name: "Carta / Menú", href: "/menu", icon: Coffee, module: "menu" as const },
    { name: "Punto de Venta", href: "/pos", icon: ShoppingCart, module: "pos" as const },
    { name: "Proveedores", href: "/suppliers", icon: Users, module: "suppliers" as const },
    { name: "Clientes", href: "/customers", icon: Users, module: "customers" as const },
    { name: "Libros", href: "/books", icon: Book, module: "books" as const },
    { name: "Cocina", href: "/kitchen", icon: Utensils, module: "kitchen" as const },
    { name: "Reportes", href: "/reports", icon: BarChart3, module: "reports" as const },
    { name: "Configuración", href: "/settings", icon: Settings, module: "settings" as const },
];

export default function SideNav({
    userRole = "customer",
    roleName,
    allowedModules = ["me"],
}: {
    userRole?: string;
    roleName?: string;
    allowedModules?: string[];
}) {
    const pathname = usePathname();
    const { user } = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const filteredNav = navItems.filter((item) => allowedModules.includes(item.module));

    return (
        <>
            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 w-full h-16 bg-slate-950 border-b border-slate-900 flex items-center justify-between px-4 z-[60]">
                <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow-lg shadow-indigo-500/20">
                        <Coffee className="text-white w-4 h-4" />
                    </div>
                    <span className="font-outfit font-bold text-sm tracking-tight text-white uppercase">Tinta y Café</span>
                </div>
                <button
                    onClick={() => setIsOpen(true)}
                    className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                    <Menu className="w-6 h-6" />
                </button>
            </div>

            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-[70] lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}

            <div className={`
                h-screen w-64 bg-slate-950 border-r border-slate-900 flex flex-col p-4 fixed left-0 top-0 z-[80] transition-transform duration-300
                ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
            `}>
                <div className="flex items-center justify-between px-2 mb-10 mt-2">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg shadow-indigo-500/20">
                            <Coffee className="text-white w-6 h-6" />
                        </div>
                        <div className="flex flex-col text-white text-left">
                            <span className="font-outfit font-bold text-lg leading-tight">Tinta y Café</span>
                            <span className="text-[10px] text-indigo-400 font-bold uppercase tracking-widest text-left">Neural Nexus</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="lg:hidden p-2 text-slate-500 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 space-y-2">
                    {filteredNav.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
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
                                {roleName ?? userRole}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
