import { db } from "@/db";
import { items, inventory, stores } from "@/db/schema";
import InventoryList from "@/components/InventoryList";
import { eq } from "drizzle-orm";
import { seedDatabase } from "@/app/api/db/seed";

interface InventoryItem {
    id: number;
    name: string;
    barcode: string;
    type: string;
    quantity: number;
    minStock: number;
}

export default async function InventoryPage() {
    let displayItems: InventoryItem[] = [];
    let dbError = false;

    try {
        // Check if stores exist, if not, seed them
        const existingStores = await db.select().from(stores).limit(1);
        if (existingStores.length === 0) {
            await seedDatabase();
        }

        const stockData = await db
            .select({
                id: items.id,
                name: items.name,
                barcode: items.barcode,
                type: items.type,
                quantity: inventory.quantity,
                minStock: inventory.minStock,
            })
            .from(items)
            .leftJoin(inventory, eq(items.id, inventory.itemId))
            .limit(20);

        displayItems = stockData.map(item => ({
            ...item,
            barcode: item.barcode || "N/A",
            quantity: item.quantity || 0,
            minStock: item.minStock || 5,
        })) as InventoryItem[];

    } catch (error) {
        console.error("Database connection failed, using mock data:", error);
        dbError = true;
    }

    if (!dbError && displayItems.length === 0) {
        // Fallback labels if DB is empty but connected
        displayItems = [
            { id: 1, name: "Don Quijote de la Mancha", barcode: "9788424116263", type: "book", quantity: 5, minStock: 2 },
            { id: 2, name: "Café de Especialidad (Grano)", barcode: "COF-001", type: "product", quantity: 12, minStock: 15 },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto text-left">
                {dbError && (
                    <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-amber-500 text-sm flex items-center gap-3 animate-fade-in text-left">
                        <span className="relative flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                        </span>
                        <span>
                            <strong>Modo Resiliencia:</strong> No se detectó la estructura de sucursales. Verifica tu base de datos Neon.
                        </span>
                    </div>
                )}
                <InventoryList initialItems={displayItems} />
            </div>
        </div>
    );
}
