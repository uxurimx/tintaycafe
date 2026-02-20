"use server";

import { db } from "@/db";
import { items, inventory, stores } from "@/db/schema";
import { pusherServer } from "@/lib/pusher/server";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";
import { eq, sql, and } from "drizzle-orm";
import { transactions } from "@/db/schema";

export async function addInventoryItem(formData: FormData) {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string;
    const storeId = parseInt(formData.get("storeId") as string);
    const quantity = parseFloat(formData.get("quantity") as string);
    const type = formData.get("type") as string;
    const categoryId = formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : null;

    // 0. Ensure Store exists (Self-healing)
    const existingStore = await db.query.stores.findFirst({
        where: eq(stores.id, storeId)
    });

    if (!existingStore) {
        await db.insert(stores).values({
            id: storeId,
            name: storeId === 1 ? "Sucursal Central" : `Sucursal ${storeId}`,
            type: "stable"
        });
    }

    // 1. Create or Update Item
    const [item] = await db
        .insert(items)
        .values({
            name,
            barcode,
            type: type as any,
            categoryId,
        })
        .onConflictDoUpdate({
            target: items.barcode,
            set: { name, categoryId },
        })
        .returning();

    // 2. Update Inventory
    await db
        .insert(inventory)
        .values({
            itemId: item.id,
            storeId,
            quantity,
        })
        .onConflictDoUpdate({
            target: [inventory.storeId, inventory.itemId],
            set: { quantity },
        });

    // 3. Real-time broadcast (Resilient)
    try {
        await pusherServer.trigger("inventory-updates", "stock-changed", {
            itemId: item.id,
            storeId,
            newQuantity: quantity,
        });
    } catch (e) {
        console.warn("Pusher broadcast failed (ENOTFOUND), but inventory was saved:", e);
    }

    revalidatePath("/inventory");
    return {
        success: true,
        data: {
            id: item.id,
            name,
            barcode,
            quantity,
            type,
            categoryId,
            storeId,
            uId: `${item.id}-${storeId}`
        }
    };
}

export async function deleteInventoryItem(itemId: number) {
    try {
        // Delete related inventory first
        await db.delete(inventory).where(eq(inventory.itemId, itemId));
        // Delete item
        await db.delete(items).where(eq(items.id, itemId));

        revalidatePath("/inventory");
        return { success: true };
    } catch (e) {
        console.error("Delete failed:", e);
        return { success: false };
    }
}

export async function updateInventoryItem(itemId: number, storeId: number, data: { name?: string; quantity?: number; minStock?: number; categoryId?: number | null }) {
    try {
        if (data.name || data.categoryId !== undefined) {
            await db.update(items).set({
                name: data.name,
                categoryId: data.categoryId
            }).where(eq(items.id, itemId));
        }

        if (data.quantity !== undefined || data.minStock !== undefined) {
            await db.update(inventory).set({
                quantity: data.quantity,
                minStock: data.minStock,
                updatedAt: new Date()
            }).where(and(eq(inventory.itemId, itemId), eq(inventory.storeId, storeId)));
        }

        revalidatePath("/inventory");
        return {
            success: true,
            data: {
                id: itemId,
                storeId,
                ...data,
                uId: `${itemId}-${storeId}`
            }
        };
    } catch (e) {
        console.error("Update failed:", e);
        return { success: false };
    }
}

export async function transferStock(itemId: number, fromStoreId: number, toStoreId: number, quantityToMove: number) {
    try {
        // From store deduction
        await db.update(inventory)
            .set({ quantity: sql`${inventory.quantity} - ${quantityToMove}` })
            .where(eq(inventory.itemId, itemId))
            .where(eq(inventory.storeId, fromStoreId));

        // To store addition
        await db.insert(inventory)
            .values({ itemId, storeId: toStoreId, quantity: quantityToMove })
            .onConflictDoUpdate({
                target: [inventory.storeId, inventory.itemId],
                set: { quantity: sql`${inventory.quantity} + ${quantityToMove}` }
            });

        revalidatePath("/inventory");

        // 3. Log Transaction History
        const { userId } = await auth();
        if (userId) {
            await db.insert(transactions).values({
                storeId: fromStoreId,
                userId: userId,
                total: quantityToMove, // Using total to store quantity for transfers for now
                type: 'transfer',
                createdAt: new Date()
            });
        }

        return { success: true };
    } catch (e) {
        console.error("Transfer failed:", e);
        return { success: false };
    }
}

export async function processVisionAI(imageBase64: string) {
    // Placeholder for OpenAI Vision integration
    // This would send the image to GPT-4o-mini to extract ISBN, Title, and Authors
    console.log("Analyzing image with AI...");

    return {
        success: true,
        data: {
            name: "Libro Detectado (IA)",
            barcode: "123456789",
            type: "book",
        }
    };
}
