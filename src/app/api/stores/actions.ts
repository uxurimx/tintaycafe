"use server";

import { db } from "@/db";
import { stores } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createStore(name: string, type: "stable" | "informal", address?: string) {
    try {
        await db.insert(stores).values({ name, type, address });
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Failed to create store:", error);
        return { success: false };
    }
}

export async function updateStore(id: number, data: { name?: string; type?: "stable" | "informal"; address?: string; isActive?: boolean }) {
    try {
        await db.update(stores).set(data).where(eq(stores.id, id));
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Failed to update store:", error);
        return { success: false };
    }
}

export async function getStores() {
    return await db.select().from(stores);
}
