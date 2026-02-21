import { db } from "@/db";
import { items } from "@/db/schema";
import AlchemyLab from "@/components/AlchemyLab";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default async function AlchemyPage() {
    const { userId } = await auth();
    if (!userId) redirect("/");

    // Fetch base items for alchemy (Drinks and Coffee)
    const baseItems = await db.query.items.findMany({
        where: (items, { and, eq, or }) => and(
            eq(items.type, 'product'),
            or(
                eq(items.category, 'Café'),
                eq(items.category, 'Bebidas Frías'),
                eq(items.category, 'Té / Infusiones')
            )
        )
    });

    const formattedBases = baseItems.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        category: p.category || "Varios"
    }));

    return (
        <div className="pt-32 pb-20 px-4 min-h-screen bg-slate-950">
            <AlchemyLab bases={formattedBases} />
        </div>
    );
}
