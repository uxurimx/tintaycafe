import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { customers, transactions, transactionItems, items, customRecipes } from "@/db/schema";
import { eq, desc, and, not } from "drizzle-orm";
import CustomerProfile from "@/components/CustomerProfile";
import OrderStatusListener from "@/components/OrderStatusListener";

export default async function MemberDashboardPage() {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
        redirect("/");
    }

    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) {
        redirect("/");
    }

    // 1. Find or sync customer
    let customerRecord = await db.query.customers.findFirst({
        where: eq(customers.email, email)
    });

    if (!customerRecord) {
        const [newCustomer] = await db.insert(customers).values({
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Cliente Quantum",
            email: email,
            points: 0,
            createdAt: new Date(),
        }).returning();
        customerRecord = newCustomer;
    }

    // 2. Fetch history (Last 10 transactions)
    const history = await db.query.transactions.findMany({
        where: eq(transactions.customerId, customerRecord.id),
        orderBy: [desc(transactions.createdAt)],
        limit: 10,
        with: {
            items: {
                with: {
                    item: true
                }
            }
        }
    });

    // 3. Format history
    const formattedHistory = history.map(t => ({
        id: t.id,
        total: t.total,
        status: t.status,
        createdAt: t.createdAt,
        items: t.items.map(ti => ({
            id: ti.id,
            name: ti.item.name,
            quantity: ti.quantity,
            price: ti.price,
            type: ti.item.type
        }))
    }));

    // 4. Fetch Custom Recipes
    const userRecipes = await db.query.customRecipes.findMany({
        where: eq(customRecipes.userId, userId),
        orderBy: [desc(customRecipes.createdAt)],
        with: {
            baseItem: true
        }
    });

    // 5. Fetch Active Orders
    const activeOrders = history
        .filter(t => t.status !== 'completed')
        .map(t => ({
            id: t.id,
            status: t.status,
            total: t.total,
            createdAt: t.createdAt
        }));

    return (
        <div className="pt-32 min-h-screen bg-slate-950">
            <OrderStatusListener customerId={customerRecord.id} />
            <CustomerProfile
                customer={customerRecord as any}
                transactions={formattedHistory as any}
                customRecipes={userRecipes as any}
                activeOrders={activeOrders as any}
            />
        </div>
    );
}
