import { db } from "@/db";
import { items, categories } from "@/db/schema";
import MenuManager from "@/components/MenuManager";
import { eq, and } from "drizzle-orm";
import { protectStaff } from "@/lib/auth-utils";

export default async function MenuPage() {
    await protectStaff();
    let displayProducts = [];

    try {
        const productData = await db.query.items.findMany({
            where: (items, { eq }) => eq(items.type, 'product'),
            with: {
                category: true
            }
        });

        displayProducts = productData.map(p => ({
            id: p.id,
            name: p.name,
            category: (p as any).category?.name || 'Varios',
            price: p.price,
            description: p.description || "",
            status: 'active' as const
        }));
    } catch (e) {
        console.error("Menu fetch failed:", e);
        // Fallback mock data
        displayProducts = [
            { id: 101, name: "Latte Lavanda", category: "Café", price: 65, description: "Un viaje floral con granos de altura.", status: 'active' as const },
            { id: 102, name: "Espresso Doble", category: "Café", price: 45, description: "Intensidad pura y sincronizada.", status: 'active' as const },
            { id: 103, name: "Matcha Ceremonial", category: "Bebidas Frías", price: 75, description: "Energía verde y balanceada.", status: 'active' as const },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <MenuManager initialProducts={displayProducts} />
            </div>
        </div>
    );
}
