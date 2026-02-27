import { db } from "@/db";
import { stores, categories, items, inventory, roles, roleModules } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

const SYSTEM_ROLES = [
    { name: "Propietario", slug: "owner", isSystem: true },
    { name: "Administrador", slug: "admin", isSystem: true },
    { name: "Empleado", slug: "employee", isSystem: true },
    { name: "Cocina", slug: "kitchen", isSystem: true },
    { name: "Cliente", slug: "customer", isSystem: true },
];

const MODULES_BY_ROLE: Record<string, string[]> = {
    owner: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    admin: ["me", "users", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    employee: ["me", "inventory", "menu", "pos", "customers", "suppliers", "settings"],
    kitchen: ["me", "menu"],
    customer: ["me"],
};

const DEMO_CATEGORIES = [
    { name: "Cafetería", icon: "Coffee" },
    { name: "Librería", icon: "Book" },
    { name: "Juegos", icon: "Gamepad2" },
];

const DEMO_ITEMS = [
    { name: "Americano", type: "product", categoryName: "Cafetería", price: 45, barcode: "001-001-001" },
    { name: "Latte", type: "product", categoryName: "Cafetería", price: 55, barcode: "001-001-002" },
    { name: "Cappuccino", type: "product", categoryName: "Cafetería", price: 55, barcode: "001-001-003" },
    { name: "Mocha", type: "product", categoryName: "Cafetería", price: 60, barcode: "001-001-004" },
    { name: "Don Quijote", type: "book", categoryName: "Librería", price: 350, barcode: "002-001-001" },
    { name: "Cien años de soledad", type: "book", categoryName: "Librería", price: 420, barcode: "002-001-002" },
    { name: "Catan", type: "product", categoryName: "Juegos", price: 890, barcode: "003-001-001" },
];

export async function GET() {
    try {
        const results: string[] = [];

        // 1. Seed stores
        const existingStores = await db.select().from(stores);
        if (existingStores.length === 0) {
            await db.insert(stores).values([
                { id: 1, name: "Sucursal Central", type: "stable", address: "Durango, Centro" },
                { id: 2, name: "Nodo Informal A", type: "informal", address: "Punto Móvil 1" },
                { id: 3, name: "Nodo Informal B", type: "informal", address: "Punto Móvil 2" },
            ]);
            results.push("stores");
        }

        // 2. Seed categories
        const existingCategories = await db.select().from(categories);
        if (existingCategories.length === 0) {
            await db.insert(categories).values(DEMO_CATEGORIES);
            results.push("categories");
        }

        // 3. Seed items (only if we have categories and no items)
        const existingItems = await db.select().from(items);
        const allCategories = await db.select().from(categories);
        if (existingItems.length === 0 && allCategories.length > 0) {
            const catMap = Object.fromEntries(allCategories.map(c => [c.name, c.id]));
            const itemsToInsert = DEMO_ITEMS.map(it => ({
                name: it.name,
                type: it.type,
                category: it.categoryName,
                categoryId: catMap[it.categoryName] ?? null,
                price: it.price,
                barcode: it.barcode,
            }));
            await db.insert(items).values(itemsToInsert);
            results.push("items");
        }

        // 4. Seed inventory for Sucursal Central (store 1)
        const existingInventory = await db.select().from(inventory).where(eq(inventory.storeId, 1));
        if (existingInventory.length === 0) {
            const allItems = await db.select().from(items);
            const store1Id = existingStores.length > 0 ? existingStores[0].id : 1;
            await db.insert(inventory).values(
                allItems.map(item => ({
                    storeId: store1Id,
                    itemId: item.id,
                    quantity: 25,
                    minStock: 5,
                }))
            );
            results.push("inventory");
        }

        // 5. Seed system roles and their modules
        const existingRoles = await db.select().from(roles);
        if (existingRoles.length === 0) {
            await db.insert(roles).values(SYSTEM_ROLES);
            results.push("roles");
            const rolesAfter = await db.select().from(roles);
            for (const r of rolesAfter) {
                const mods = MODULES_BY_ROLE[r.slug];
                if (mods?.length) {
                    await db.insert(roleModules).values(
                        mods.map(module => ({ roleId: r.id, module }))
                    );
                }
            }
            results.push("role_modules");
        }

        return NextResponse.json({
            success: true,
            message: results.length > 0 ? `Seeded: ${results.join(", ")}` : "Already seeded",
            seeded: results,
        });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
    }
}
