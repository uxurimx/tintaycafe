import { db } from "@/db";
import { items, inventory, categories, customers, stores } from "@/db/schema";
import QuantumPOS from "@/components/QuantumPOS";
import { eq, gt, and } from "drizzle-orm";
import { protectModule } from "@/lib/auth-utils";
import { getActiveOrders } from "@/app/api/checkout/actions";

export default async function POSPage() {
    await protectModule("pos");
    let displayItems = [];
    let dbCustomers = [];
    let defaultStoreId = 1;
    let activeOrders: Awaited<ReturnType<typeof getActiveOrders>> = [];

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
                isSupply: items.isSupply,
            })
            .from(items)
            .innerJoin(inventory, eq(items.id, inventory.itemId))
            .leftJoin(categories, eq(items.categoryId, categories.id))
            .where(and(gt(inventory.quantity, 0), eq(items.isSupply, false)));

        displayItems = stockData;

        // 2. Fetch Customers
        dbCustomers = await db.query.customers.findMany();

        // 3. Get first store ID
        const store = await db.query.stores.findFirst();
        if (store) defaultStoreId = store.id;

        // 4. Fetch active web orders for this store
        activeOrders = await getActiveOrders(defaultStoreId);

    } catch (e) {
        console.error("POS Data fetch failed:", e);
        // Fallback mock data
        displayItems = [
            { id: 1, name: "Café de Especialidad", price: 290, quantity: 10, type: "product", categoryName: "Cafetería", isSupply: false },
            { id: 2, name: "Don Quijote", price: 450, quantity: 5, type: "book", categoryName: "Librería", isSupply: false },
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
                    initialActiveOrders={activeOrders}
                />
            </div>
        </div>
    );
}
