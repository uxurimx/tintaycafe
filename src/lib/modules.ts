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
] as const;

export type ModuleId = (typeof MODULE_OPTIONS)[number]["id"];

export const FALLBACK_MODULES: Record<string, string[]> = {
    owner: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books"],
    admin: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books"],
    employee: ["me", "inventory", "menu", "pos", "customers", "suppliers", "settings", "books"],
    kitchen: ["me", "menu"],
    customer: ["me"],
};
