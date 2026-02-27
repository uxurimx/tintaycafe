import { db } from "@/db";
import { roles } from "@/db/schema";
import { eq } from "drizzle-orm";
import { MODULE_OPTIONS, FALLBACK_MODULES } from "./modules";

export { MODULE_OPTIONS };
export type { ModuleId } from "./modules";

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

        let modules: string[] = [];
        if (role?.modules?.length) {
            modules = role.modules.map((m) => m.module);
        } else if (roleSlug in FALLBACK_MODULES) {
            modules = [...FALLBACK_MODULES[roleSlug]];
        } else {
            modules = ["me"];
        }

        // Hardcoded safety for the new modules until DB is synced
        const newModules = ["books", "kitchen", "reports"];
        if (['owner', 'admin'].includes(roleSlug)) {
            newModules.forEach(m => {
                if (!modules.includes(m)) modules.push(m);
            });
        } else if (roleSlug === 'employee' || roleSlug === 'kitchen') {
            if (!modules.includes("kitchen")) modules.push("kitchen");
        }

        return modules;
    } catch {
        if (roleSlug in FALLBACK_MODULES) return FALLBACK_MODULES[roleSlug];
    }
    return ["me"];
}
