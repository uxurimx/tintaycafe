"use server";

import { db } from "@/db";
import { stores, inventory, transactions, items, categories } from "@/db/schema";
import { eq, desc, and } from "drizzle-orm";

export async function getStoreAnalytics(storeId: number) {
    try {
        // 1. Fetch Store Info
        const storeInfo = await db.query.stores.findFirst({
            where: eq(stores.id, storeId)
        });

        // 2. Fetch Inventory for this store
        const storeInventory = await db
            .select({
                id: items.id,
                name: items.name,
                barcode: items.barcode,
                quantity: inventory.quantity,
                minStock: inventory.minStock,
                categoryName: categories.name,
            })
            .from(inventory)
            .innerJoin(items, eq(inventory.itemId, items.id))
            .leftJoin(categories, eq(items.categoryId, categories.id))
            .where(eq(inventory.storeId, storeId));

        // 3. Fetch Recent Transactions (Sales & Transfers)
        const recentTransactions = await db.query.transactions.findMany({
            where: eq(transactions.storeId, storeId),
            limit: 20,
            orderBy: [desc(transactions.createdAt)],
            with: {
                user: true,
                items: {
                    with: {
                        item: true
                    }
                }
            }
        });

        return {
            success: true,
            data: {
                storeInfo,
                inventory: storeInventory,
                transactions: recentTransactions
            }
        };
    } catch (e) {
        console.error("Failed to fetch store analytics:", e);
        return { success: false, error: "Falla en la red neuronal de analítica" };
    }
}
