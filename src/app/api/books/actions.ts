"use server";

import { db } from "@/db";
import { items, inventory, categories, stores } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function addAutoBook(data: {
    name: string;
    description: string;
    barcode: string;
    imageUrl: string;
    metadata: string;
    costPrice: number;
    price: number;
    initialStock: number;
    storeId: number;
    categoryId?: number;
    supplierId?: number;
}) {
    // 1. Ensure "Libros" category exists (fallback if no categoryId provided)
    let bookCategory = null;
    if (!data.categoryId) {
        bookCategory = await db.query.categories.findFirst({
            where: eq(categories.name, "Libros")
        });

        if (!bookCategory) {
            const [newCat] = await db.insert(categories).values({
                name: "Libros",
                icon: "Book"
            }).returning();
            bookCategory = newCat;
        }
    }

    const finalCategoryId = data.categoryId || bookCategory?.id;

    // 2. Check if item already exists by barcode
    let item = await db.query.items.findFirst({
        where: eq(items.barcode, data.barcode)
    });

    if (!item) {
        // Create new item
        const [newItem] = await db.insert(items).values({
            name: data.name,
            description: data.description,
            barcode: data.barcode,
            type: "book",
            categoryId: finalCategoryId,
            category: "Libros",
            imageUrl: data.imageUrl,
            metadata: data.metadata,
            price: data.price,
            costPrice: data.costPrice,
            supplierId: data.supplierId,
        }).returning();
        item = newItem;
    } else {
        // Update existing item info
        await db.update(items).set({
            name: data.name,
            description: data.description,
            imageUrl: data.imageUrl,
            metadata: data.metadata,
            price: data.price,
            costPrice: data.costPrice,
            categoryId: finalCategoryId,
            category: "Libros",
            supplierId: data.supplierId,
        }).where(eq(items.id, item.id));
    }

    // 3. Update inventory
    const existingStock = await db.query.inventory.findFirst({
        where: and(
            eq(inventory.itemId, item.id),
            eq(inventory.storeId, data.storeId)
        )
    });

    if (existingStock) {
        await db.update(inventory).set({
            quantity: existingStock.quantity + data.initialStock,
            updatedAt: new Date()
        }).where(eq(inventory.id, existingStock.id));
    } else {
        await db.insert(inventory).values({
            itemId: item.id,
            storeId: data.storeId,
            quantity: data.initialStock,
            minStock: 2,
            updatedAt: new Date()
        });
    }

    revalidatePath("/inventory");
    revalidatePath("/books");
    return { success: true, itemId: item.id };
}

export async function getStores() {
    return await db.query.stores.findMany({
        where: eq(stores.isActive, true)
    });
}
