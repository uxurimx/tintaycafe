"use server";

import { db } from "@/db";
import { stores } from "@/db/schema";

export async function seedDatabase() {
    console.log("Seeding started...");
    try {
        const existingStores = await db.select().from(stores);

        if (existingStores.length === 0) {
            await db.insert(stores).values([
                { id: 1, name: "Tinta y Café - Sucursal Central", type: "stable", address: "Durango, Centro" },
                { id: 2, name: "Nodo Informal A", type: "informal", address: "Punto Móvil 1" },
                { id: 3, name: "Nodo Informal B", type: "informal", address: "Punto Móvil 2" },
            ]);
            console.log("Stores seeded successfully.");
            return { success: true, message: "Sucursales inicializadas correctamente." };
        }

        return { success: true, message: "Las sucursales ya existen." };
    } catch (error) {
        console.error("Seeding failed:", error);
        return { success: false, message: "Error al inicializar: " + (error as any).message };
    }
}
