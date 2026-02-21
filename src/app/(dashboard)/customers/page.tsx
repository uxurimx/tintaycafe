import { db } from "@/db";
import { customers } from "@/db/schema";
import CustomerManager from "@/components/CustomerManager";
import { desc } from "drizzle-orm";

export default async function CustomersPage() {
    let dbCustomers = [];

    try {
        dbCustomers = await db.query.customers.findMany({
            orderBy: [desc(customers.createdAt)]
        });
    } catch (e) {
        console.error("Customers fetch failed:", e);
        // Fallback mock data
        dbCustomers = [
            { id: 1, name: "Cliente de Prueba", email: "prueba@nexus.com", phone: "555-0100", birthday: null, points: 150, createdAt: new Date() },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <CustomerManager initialCustomers={dbCustomers as any[]} />
            </div>
        </div>
    );
}
