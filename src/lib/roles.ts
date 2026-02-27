import { db } from "@/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";

export const MODULE_OPTIONS = [
    { id: "me", label: "Mi Perfil" },
    { id: "users", label: "Usuarios" },
    { id: "inventory", label: "Inventario" },
    { id: "menu", label: "Carta / Menú" },
    { id: "pos", label: "Punto de Venta" },
    { id: "customers", label: "Clientes" },
    { id: "suppliers", label: "Proveedores" },
    { id: "settings", label: "Configuración" },
] as const;

export type ModuleId = (typeof MODULE_OPTIONS)[number]["id"];

const FALLBACK_MODULES: Record<string, string[]> = {
    owner: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    admin: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    employee: ["me", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    kitchen: ["me", "menu"],
    customer: ["me"],
};

/** Returns role name for display, or slug if not found. */
export async function getRoleName(roleSlug: string): Promise<string> {
    try {
        const role = await db.query.roles.findFirst({
            where: eq(roles.slug, roleSlug),
        });
        return role?.name ?? roleSlug;
    } catch {
        return roleSlug;
    }
}

/** Returns list of module ids the given role slug can access. */
export async function getModulesForRoleSlug(roleSlug: string): Promise<string[]> {
    try {
        const role = await db.query.roles.findFirst({
            where: eq(roles.slug, roleSlug),
            with: { modules: true },
        });
        if (role?.modules?.length) return role.modules.map((m) => m.module);
        if (roleSlug in FALLBACK_MODULES) return FALLBACK_MODULES[roleSlug];
    } catch {
        if (roleSlug in FALLBACK_MODULES) return FALLBACK_MODULES[roleSlug];
    }
    return ["me"];
}
