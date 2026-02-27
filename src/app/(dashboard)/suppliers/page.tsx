import { db } from "@/db";
import { suppliers } from "@/db/schema";
import SupplierManager from "@/components/SupplierManager";
import { desc } from "drizzle-orm";
import { protectModule } from "@/lib/auth-utils";

export default async function SuppliersPage() {
    await protectModule("suppliers");
    let dbSuppliers = [];

    try {
        dbSuppliers = await db.query.suppliers.findMany({
            orderBy: [desc(suppliers.createdAt)]
        });
    } catch (e) {
        console.error("Suppliers fetch failed:", e);
        // Fallback mock data
        dbSuppliers = [
            { id: 1, name: "Distribuidora de Café Central", contact: "Juan Pérez", email: "juan@central.com", phone: "555-0192", address: "Calle Falsa 123" },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <SupplierManager initialSuppliers={dbSuppliers} />
            </div>
        </div>
    );
}
