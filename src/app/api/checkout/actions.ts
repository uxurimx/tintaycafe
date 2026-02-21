"use server";

import { db } from "@/db";
import { transactions, inventory, customers, transactionItems } from "@/db/schema";
import { pusherServer } from "@/lib/pusher/server";
import { revalidatePath } from "next/cache";
import { auth, currentUser } from "@clerk/nextjs/server";
import { eq, sql, and } from "drizzle-orm";

export async function processWebSale(data: {
    items: {
        itemId: number;
        quantity: number;
        price: number;
    }[];
    total: number;
}) {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) throw new Error("Debes iniciar sesión para finalizar la compra");

    // Get or create customer linked to this Clerk user
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) throw new Error("No email found for user");

    return await db.transaction(async (tx) => {
        // 1. Find or create customer
        let customerRecord = await tx.query.customers.findFirst({
            where: eq(customers.email, email)
        });

        if (!customerRecord) {
            [customerRecord] = await tx.insert(customers).values({
                name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Cliente Web",
                email: email,
                points: 0,
                createdAt: new Date(),
            }).returning();
        }

        // 2. Create the transaction record (Default to store 1 - Sucursal Central for web sales)
        const [newTransaction] = await tx.insert(transactions).values({
            storeId: 1,
            userId: userId,
            customerId: customerRecord.id,
            total: data.total,
            type: 'sale',
            status: 'preparing',
            createdAt: new Date(),
        }).returning();

        // 3. Process each item
        for (const itemData of data.items) {
            // Deduct from inventory (Store 1)
            await tx.update(inventory)
                .set({ quantity: sql`${inventory.quantity} - ${itemData.quantity}` })
                .where(and(
                    eq(inventory.itemId, itemData.itemId),
                    eq(inventory.storeId, 1)
                ));

            // Record transaction item
            await tx.insert(transactionItems).values({
                transactionId: newTransaction.id,
                itemId: itemData.itemId,
                quantity: itemData.quantity,
                price: itemData.price,
            });
        }

        // 4. Update customer points (1 point per $10)
        const pointsEarned = Math.floor(data.total / 10);
        await tx.update(customers)
            .set({ points: sql`${customers.points} + ${pointsEarned}` })
            .where(eq(customers.id, customerRecord.id));

        // 5. Trigger Real-time inventory update via Pusher for each item
        try {
            for (const itemData of data.items) {
                const currentStock = await tx.query.inventory.findFirst({
                    where: and(
                        eq(inventory.itemId, itemData.itemId),
                        eq(inventory.storeId, 1)
                    )
                });

                if (currentStock) {
                    await pusherServer.trigger('inventory-updates', 'stock-changed', {
                        itemId: itemData.itemId,
                        storeId: 1,
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
        revalidatePath("/me");
        revalidatePath("/");

        return { success: true, transactionId: newTransaction.id };
    });
}

export async function updateTransactionStatus(transactionId: number, status: string) {
    const [updated] = await db.update(transactions)
        .set({ status })
        .where(eq(transactions.id, transactionId))
        .returning();

    if (updated) {
        try {
            await pusherServer.trigger(`order-updates-${updated.customerId}`, 'status-changed', {
                transactionId: updated.id,
                status: updated.status,
            });
        } catch (error) {
            console.error("Pusher status update failed:", error);
        }
    }

    revalidatePath("/pos");
    revalidatePath("/me");
    return updated;
}
