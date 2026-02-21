import { db } from "@/db";
import { stores } from "@/db/schema";
import SettingsContent from "@/components/SettingsContent";
import { protectAdmin } from "@/lib/auth-utils";

export default async function SettingsPage() {
    await protectAdmin();
    let dbStores = [];

    try {
        dbStores = await db.query.stores.findMany();
    } catch (e) {
        console.error("Settings fetch failed:", e);
        // Fallback mock data
        dbStores = [
            { id: 1, name: "Sucursal Central", type: "stable", address: "Centro Histórico", isActive: true },
        ];
    }

    return (
        <div className="p-8">
            <div className="max-w-7xl mx-auto">
                <SettingsContent initialStores={dbStores as any[]} />
            </div>
        </div>
    );
}
