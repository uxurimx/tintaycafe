import { db } from "@/db";
import { stores } from "@/db/schema";
import { NextResponse } from "next/server";

export async function GET() {
    try {
        console.log("Forcing seed...");
        // Check if stores exist
        const s = await db.select().from(stores);
        if (s.length === 0) {
            await db.insert(stores).values([
                { id: 1, name: "Sucursal Central", type: "stable", address: "Durango" },
                { id: 2, name: "Nodo Informal A", type: "informal" },
                { id: 3, name: "Nodo Informal B", type: "informal" }
            ]);
            return NextResponse.json({ success: true, message: "Seeded successfully" });
        }
        return NextResponse.json({ success: true, message: "Already seeded", stores: s });
    } catch (error) {
        console.error("Seed error:", error);
        return NextResponse.json({ success: false, error: (error as any).message }, { status: 500 });
    }
}
