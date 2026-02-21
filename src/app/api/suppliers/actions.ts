"use server";

import { db } from "@/db";
import { suppliers, transactions } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function createSupplier(formData: FormData) {
    const name = formData.get("name") as string;
    const contact = formData.get("contact") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const address = formData.get("address") as string;

    await db.insert(suppliers).values({
        name,
        contact,
        email,
        phone,
        address,
    });

    revalidatePath("/suppliers");
    revalidatePath("/inventory");
}

export async function getSuppliers() {
    return await db.query.suppliers.findMany({
        orderBy: [desc(suppliers.createdAt)]
    });
}

export async function getSupplierHistory(supplierId: number) {
    return await db.query.transactions.findMany({
        where: eq(transactions.supplierId, supplierId),
        orderBy: [desc(transactions.createdAt)],
        with: {
            items: {
                with: {
                    item: true
                }
            },
            user: true
        }
    });
}
