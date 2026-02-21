import { auth, currentUser } from "@clerk/nextjs/server";
import { db } from "@/db";
import { users as usersTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";

export type Role = 'owner' | 'admin' | 'employee' | 'kitchen' | 'customer';

export async function getUserRole(): Promise<Role> {
    const { userId } = await auth();
    if (!userId) return 'customer';

    // 1. Check if user exists in DB
    let dbUser = await db.query.users.findFirst({
        where: eq(usersTable.id, userId)
    });

    if (dbUser) return (dbUser.role as Role);

    // 2. If no user in DB, check if the table is empty
    const allUsers = await db.select().from(usersTable).limit(1);
    const isFirstUser = allUsers.length === 0;

    // 3. Auto-sync user
    const user = await currentUser();
    if (user) {
        const email = user.emailAddresses[0]?.emailAddress || "";
        const role: Role = isFirstUser ? 'owner' : 'customer';

        await db.insert(usersTable).values({
            id: userId,
            email: email,
            name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || "Usuario Nexus",
            role: role,
            createdAt: new Date(),
        }).onConflictDoNothing();

        return role;
    }

    return 'customer';
}

export async function protectAdmin() {
    const role = await getUserRole();
    const isStaff = ['owner', 'admin', 'employee'].includes(role);
    if (!isStaff) {
        redirect("/me");
    }
    return { role };
}

export async function protectStaff() {
    const role = await getUserRole();
    const isStaff = ['owner', 'admin', 'employee', 'kitchen'].includes(role);
    if (!isStaff) {
        redirect("/me");
    }
    return { role };
}
