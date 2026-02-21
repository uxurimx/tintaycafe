import { db } from "@/db";
import { items, inventory, categories, stores } from "@/db/schema";
import InventoryList from "@/components/InventoryList";
import { eq, and } from "drizzle-orm";

export default async function InventoryPage() {
    let displayItems = [];
    let dbCategories: any[] = [];
    let dbStores: any[] = [];
    let dbSuppliers: any[] = [];

    try {
        // 1. Fetch Categories
        dbCategories = await db.query.categories.findMany();

        // 2. Fetch Stores
        dbStores = await db.query.stores.findMany();

        // 3. Fetch Suppliers
        dbSuppliers = await db.query.suppliers.findMany();

        // 3. Fetch Stock Data (Joins items with inventory)
        const stockData = await db
            .select({
                id: items.id,
                name: items.name,
                barcode: items.barcode,
                type: items.type,
                categoryId: items.categoryId,
                quantity: inventory.quantity,
                minStock: inventory.minStock,
                storeId: inventory.storeId,
                costPrice: items.costPrice,
                unit: items.unit,
                supplierId: items.supplierId,
            })
            .from(items)
            .innerJoin(inventory, eq(items.id, inventory.itemId))
            .limit(100);

        displayItems = stockData.map(item => ({
            ...item,
            barcode: item.barcode || "N/A",
            quantity: item.quantity || 0,
            minStock: item.minStock || 5,
            uId: `${item.id}-${item.storeId}`,
            costPrice: item.costPrice || 0,
            unit: item.unit || "pieza",
            supplierId: item.supplierId
        })) as any[];

        // Default store if none exists
        if (dbStores.length === 0) {
            dbStores = [{ id: 1, name: "Sucursal Central", type: "stable" }];
        }

    } catch (e) {
        console.error("Database connection issue, showing cached/fallback UI:", e);
        // Fallback data for design resilience
        displayItems = [
            { id: 1, uId: "1-1", name: "Insumo Ejemplo", barcode: "12345", quantity: 10, type: "insumo", categoryId: 1, storeId: 1, minStock: 5 },
        ];
        dbCategories = [{ id: 1, name: "General", icon: "Package" }];
        dbStores = [{ id: 1, name: "Sucursal Central", type: "stable" }];
        dbSuppliers = [];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <InventoryList
                    initialItems={displayItems}
                    initialCategories={dbCategories}
                    initialStores={dbStores}
                    initialSuppliers={dbSuppliers}
                />
            </div>
        </div>
    );
}
