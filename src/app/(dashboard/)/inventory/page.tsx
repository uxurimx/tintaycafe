import { db } from "@/db";
import { items, inventory, stores, categories } from "@/db/schema";
import InventoryList from "@/components/InventoryList";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/app/api/db/seed";

export default async function InventoryPage() {
    let displayItems = [];
    let dbCategories = [];
    let dbStores = [];
    let dbError = false;

    try {
        // Check if stores exist, if not, seed them
        const existingStores = await db.select().from(stores).limit(1);
        if (existingStores.length === 0) {
            await seedDatabase();
        }

        // Fetch master data
        dbCategories = await db.select().from(categories);
        dbStores = await db.select().from(stores);

        const stockData = await db
            .select({
                id: items.id,
                name: items.name,
                barcode: items.barcode,
                type: items.type,
                categoryId: items.categoryId,
                quantity: inventory.quantity,
                minStock: inventory.minStock,
            })
            .from(items)
            .leftJoin(inventory, eq(items.id, inventory.itemId))
            .limit(50);

        displayItems = stockData.map(item => ({
            ...item,
            barcode: item.barcode || "N/A",
            quantity: item.quantity || 0,
            minStock: item.minStock || 5,
        }));

    } catch (error) {
        console.error("Database connection failed:", error);
        dbError = true;
    }

    // Fallback initial categories if none exist
    if (dbCategories.length === 0 && !dbError) {
        dbCategories = [
            { id: 1, name: "Libros", icon: "BookOpen" },
            { id: 2, name: "Grano", icon: "Coffee" },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                {dbError && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm flex items-center gap-3 animate-fade-in text-left">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span>
                            <strong>Modo Resiliencia:</strong> No se pudo conectar con el Nexus. Mostrando datos locales.
                        </span>
                    </div>
                )}
                <InventoryList
                    initialItems={displayItems as any}
                    initialCategories={dbCategories as any}
                    initialStores={dbStores as any}
                />
            </div>
        </div>
    );
}
