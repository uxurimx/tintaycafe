"use server";

import { db } from "@/db";
import { transactions, transactionItems, inventory, customers } from "@/db/schema";
import { eq, sql, and } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher/server";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function processSale(data: {
    storeId: number;
    customerId?: number;
    items: {
        itemId: number;
        quantity: number;
        price: number;
    }[];
    total: number;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    return await db.transaction(async (tx) => {
        // 1. Create the transaction record
        const [newTransaction] = await tx.insert(transactions).values({
            storeId: data.storeId,
            userId: userId,
            customerId: data.customerId,
            total: data.total,
            type: 'sale',
            createdAt: new Date(),
        }).returning();

        // 2. Create transaction items
        for (const item of data.items) {
            await tx.insert(transactionItems).values({
                transactionId: newTransaction.id,
                itemId: item.itemId,
                quantity: item.quantity,
                price: item.price,
            });

            // 3. Deduct from inventory
            await tx.update(inventory)
                .set({
                    quantity: sql`${inventory.quantity} - ${item.quantity}`,
                    updatedAt: new Date(),
                })
                .where(and(
                    eq(inventory.itemId, item.itemId),
                    eq(inventory.storeId, data.storeId)
                ));
        }

        // 4. Update customer points if customerId provided
        if (data.customerId) {
            // Logic: 1 point per $10 spent (adjust as needed)
            const pointsToGain = Math.floor(data.total / 10);
            if (pointsToGain > 0) {
                await tx.update(customers)
                    .set({
                        points: sql`${customers.points} + ${pointsToGain}`
                    })
                    .where(eq(customers.id, data.customerId));
            }
        }

        // 5. Trigger Real-time inventory update via Pusher for each item
        try {
            for (const itemData of data.items) {
                // Get new quantity for the Pusher event
                const currentStock = await tx.query.inventory.findFirst({
                    where: and(
                        eq(inventory.itemId, itemData.itemId),
                        eq(inventory.storeId, data.storeId)
                    )
                });

                if (currentStock) {
                    await pusherServer.trigger('inventory-updates', 'stock-changed', {
                        itemId: itemData.itemId,
                        storeId: data.storeId,
                        newQuantity: currentStock.quantity,
                    });
                }
            }
        } catch (error) {
            console.error("Pusher trigger failed:", error);
        }

        revalidatePath("/inventory");
        revalidatePath("/pos");
        revalidatePath("/customers");
        revalidatePath("/");

        return { success: true, transactionId: newTransaction.id };
    });
}
