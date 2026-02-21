import { db } from "@/db";
import { items, inventory, categories, customers, stores } from "@/db/schema";
import QuantumPOS from "@/components/QuantumPOS";
import { eq, gt } from "drizzle-orm";

export default async function POSPage() {
    let displayItems = [];
    let dbCustomers = [];
    let defaultStoreId = 1;

    try {
        // 1. Fetch Items with stock > 0
        const stockData = await db
            .select({
                id: items.id,
                name: items.name,
                price: items.price,
                quantity: inventory.quantity,
                type: items.type,
                categoryName: categories.name,
            })
            .from(items)
            .innerJoin(inventory, eq(items.id, inventory.itemId))
            .leftJoin(categories, eq(items.categoryId, categories.id))
            .where(gt(inventory.quantity, 0));

        displayItems = stockData;

        // 2. Fetch Customers
        dbCustomers = await db.query.customers.findMany();

        // 3. Get first store ID
        const store = await db.query.stores.findFirst();
        if (store) defaultStoreId = store.id;

    } catch (e) {
        console.error("POS Data fetch failed:", e);
        // Fallback mock data
        displayItems = [
            { id: 1, name: "Café de Especialidad", price: 290, quantity: 10, type: "product", categoryName: "Cafetería" },
            { id: 2, name: "Don Quijote", price: 450, quantity: 5, type: "book", categoryName: "Librería" },
        ];
        dbCustomers = [{ id: 1, name: "Cliente General", points: 0 }];
    }

    return (
        <div className="p-8 h-screen">
            <div className="max-w-full mx-auto h-full">
                <QuantumPOS
                    initialItems={displayItems}
                    initialCustomers={dbCustomers}
                    initialStoreId={defaultStoreId}
                />
            </div>
        </div>
    );
}
