"use server";

import { db } from "@/db";
import { items, inventory } from "@/db/schema";
import { pusherServer } from "@/lib/pusher/server";
import { revalidatePath } from "next/cache";

export async function addInventoryItem(formData: FormData) {
    const name = formData.get("name") as string;
    const barcode = formData.get("barcode") as string;
    const storeId = parseInt(formData.get("storeId") as string);
    const quantity = parseFloat(formData.get("quantity") as string);
    const type = formData.get("type") as string;

    // 1. Create or Update Item
    const [item] = await db
        .insert(items)
        .values({
            name,
            barcode,
            type: type as any,
        })
        .onConflictDoUpdate({
            target: items.barcode,
            set: { name },
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

    // 3. Real-time broadcast
    await pusherServer.trigger("inventory-updates", "stock-changed", {
        itemId: item.id,
        storeId,
        newQuantity: quantity,
    });

    revalidatePath("/inventory");
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
