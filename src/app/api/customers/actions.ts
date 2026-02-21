"use server";

import { db } from "@/db";
import { customers, customRecipes } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@clerk/nextjs/server";

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

export async function saveCustomRecipe(data: {
    name: string;
    baseItemId: number;
    ingredients: string;
    basePrice: number;
}) {
    const { userId } = await auth();
    if (!userId) throw new Error("Unauthorized");

    const [newRecipe] = await db.insert(customRecipes).values({
        userId,
        ...data,
        createdAt: new Date(),
    }).returning();

    revalidatePath("/me");
    return newRecipe;
}

export async function updateCustomerXP(customerId: number, xpAmount: number) {
    const [customer] = await db.update(customers)
        .set({ xp: sql`${customers.xp} + ${xpAmount}` })
        .where(eq(customers.id, customerId))
        .returning();

    // Logic for rank up
    let newRank = customer.rank;
    const xp = customer.xp || 0;

    if (xp > 1000) newRank = "Maestro";
    else if (xp > 500) newRank = "Alquimista";
    else if (xp > 100) newRank = "Socio";

    if (newRank !== customer.rank) {
        await db.update(customers)
            .set({ rank: newRank })
            .where(eq(customers.id, customerId));
    }

    revalidatePath("/me");
    return { ...customer, rank: newRank };
}
