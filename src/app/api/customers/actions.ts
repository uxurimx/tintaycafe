"use server";

import { db } from "@/db";
import { customers } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    return await db.query.customers.findMany({
        orderBy: [desc(customers.createdAt)]
    });
}

export async function createCustomer(data: {
    name: string;
    email?: string;
    phone?: string;
    birthday?: Date;
}) {
    const [newCustomer] = await db.insert(customers).values({
        ...data,
        points: 0,
        createdAt: new Date(),
    }).returning();

    revalidatePath("/customers");
    revalidatePath("/pos");
    return newCustomer;
}

export async function updateCustomer(id: number, data: Partial<{
    name: string;
    email: string;
    phone: string;
    birthday: Date;
    points: number;
}>) {
    const [updatedCustomer] = await db.update(customers)
        .set(data)
        .where(eq(customers.id, id))
        .returning();

    revalidatePath("/customers");
    revalidatePath("/pos");
    return updatedCustomer;
}
