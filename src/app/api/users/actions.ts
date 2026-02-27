"use server";

import { db } from "@/db";
import { users, roles } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { protectOwnerAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

export async function getUsers() {
    await protectOwnerAdmin();

    const list = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });

    return list;
}

export async function updateUserRole(userId: string, newRoleSlug: string) {
    await protectOwnerAdmin();

    const roleExists = await db.query.roles.findFirst({
        where: eq(roles.slug, newRoleSlug),
    });
    if (!roleExists) throw new Error("Rol no válido");

    const [updated] = await db.update(users)
        .set({ role: newRoleSlug })
        .where(eq(users.id, userId))
        .returning();

    revalidatePath("/users");
    return updated;
}
