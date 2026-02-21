"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { protectOwnerAdmin } from "@/lib/auth-utils";
import { revalidatePath } from "next/cache";

const VALID_ROLES = ['owner', 'admin', 'employee', 'kitchen', 'customer'] as const;

export async function getUsers() {
    await protectOwnerAdmin();

    const list = await db.query.users.findMany({
        orderBy: [desc(users.createdAt)],
    });

    return list;
}

export async function updateUserRole(userId: string, newRole: string) {
    await protectOwnerAdmin();

    if (!VALID_ROLES.includes(newRole as any)) {
        throw new Error("Rol no válido");
    }

    const [updated] = await db.update(users)
        .set({ role: newRole })
        .where(eq(users.id, userId))
        .returning();

    revalidatePath("/users");
    return updated;
}
