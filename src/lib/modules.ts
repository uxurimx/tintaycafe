export const MODULE_OPTIONS = [
    { id: "me", label: "Mi Perfil" },
    { id: "users", label: "Usuarios" },
    { id: "inventory", label: "Inventario" },
    { id: "menu", label: "Carta / Menú" },
    { id: "pos", label: "Punto de Venta" },
    { id: "customers", label: "Clientes" },
    { id: "suppliers", label: "Proveedores" },
    { id: "settings", label: "Configuración" },
    { id: "books", label: "Libros" },
    { id: "kitchen", label: "Cocina" },
    { id: "reports", label: "Reportes" },
] as const;

export type ModuleId = (typeof MODULE_OPTIONS)[number]["id"];

export const FALLBACK_MODULES: Record<string, string[]> = {
    owner: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books", "kitchen", "reports"],
    admin: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books", "kitchen", "reports"],
    employee: ["me", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books", "kitchen"],
    kitchen: ["me", "kitchen"],
    customer: ["me"],
};
