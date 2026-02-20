import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });
import { db } from './src/db';
import { stores } from './src/db/schema';

async function debug() {
    console.log("Checking stores...");
    try {
        const allStores = await db.select().from(stores);
        console.log("Current Stores:", allStores);

        if (allStores.length === 0) {
            console.log("Seeding stores...");
            const result = await db.insert(stores).values([
                { id: 1, name: "Sucursal Central", type: "stable" },
                { id: 2, name: "Informal A", type: "informal" },
                { id: 3, name: "Informal B", type: "informal" }
            ]).returning();
            console.log("Seeded:", result);
        }
    } catch (err) {
        console.error("Error during debug:", err);
    }
    process.exit(0);
}

debug();
