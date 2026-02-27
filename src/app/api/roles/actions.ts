"use server";

import { db } from "@/db";
import { roles, roleModules } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { protectOwnerAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getRoles() {
    await protectOwnerAdmin();

    const list = await db.query.roles.findMany({
        orderBy: [desc(roles.id)],
        with: { modules: true },
    });

    return list.map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        isSystem: r.isSystem,
        createdAt: r.createdAt,
        modules: r.modules.map((m) => m.module),
    }));
}

export async function createRole(data: { name: string; slug: string }) {
    await protectOwnerAdmin();

    const slug = data.slug.trim().toLowerCase().replace(/\s+/g, "-");
    if (!slug) throw new Error("El slug no puede estar vacío");

    const [created] = await db
        .insert(roles)
        .values({
            name: data.name.trim(),
            slug,
            isSystem: false,
        })
        .returning();

    revalidatePath("/users");
    return created;
}

export async function updateRole(
    roleId: number,
    data: { name?: string; modules?: string[] }
) {
    await protectOwnerAdmin();

    const role = await db.query.roles.findFirst({
        where: eq(roles.id, roleId),
    });
    if (!role) throw new Error("Rol no encontrado");
    if (role.isSystem && data.modules === undefined) {
        // Allow name update for system roles? We could. For now only modules.
    }

    if (data.name !== undefined) {
        await db.update(roles).set({ name: data.name.trim() }).where(eq(roles.id, roleId));
    }

    if (data.modules !== undefined) {
        await db.delete(roleModules).where(eq(roleModules.roleId, roleId));
        if (data.modules.length > 0) {
            await db.insert(roleModules).values(
                data.modules.map((module) => ({ roleId, module }))
            );
        }
    }

    revalidatePath("/users");
    return { success: true };
}

export async function deleteRole(roleId: number) {
    await protectOwnerAdmin();

    const role = await db.query.roles.findFirst({
        where: eq(roles.id, roleId),
    });
    if (!role) throw new Error("Rol no encontrado");
    if (role.isSystem) throw new Error("No se pueden eliminar roles del sistema");

    await db.delete(roleModules).where(eq(roleModules.roleId, roleId));
    await db.delete(roles).where(eq(roles.id, roleId));

    revalidatePath("/users");
    return { success: true };
}

export async function getRoleModules(roleId: number) {
    await protectOwnerAdmin();

    const mods = await db.query.roleModules.findMany({
        where: eq(roleModules.roleId, roleId),
    });
    return mods.map((m) => m.module);
}
