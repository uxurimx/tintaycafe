"use server";

import { db } from "@/db";
import { categories } from "@/db/schema";
import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";

export async function createCategory(name: string, icon: string = "Package") {
    try {
        await db.insert(categories).values({ name, icon });
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Failed to create category:", error);
        return { success: false };
    }
}

export async function deleteCategory(id: number) {
    try {
        await db.delete(categories).where(eq(categories.id, id));
        revalidatePath("/inventory");
        return { success: true };
    } catch (error) {
        console.error("Failed to delete category:", error);
        return { success: false };
    }
}

export async function getCategories() {
    return await db.select().from(categories);
}
