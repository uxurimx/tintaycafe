import { protectOwnerAdmin } from "@/lib/auth-utils";
import { getUsers } from "@/app/api/users/actions";
import { getRoles } from "@/app/api/roles/actions";
import UsersTabs from "@/components/UsersTabs";

export default async function UsersPage() {
    await protectOwnerAdmin();

    let dbUsers: Awaited<ReturnType<typeof getUsers>> = [];
    let dbRoles: Awaited<ReturnType<typeof getRoles>> = [];
    try {
        [dbUsers, dbRoles] = await Promise.all([getUsers(), getRoles()]);
    } catch (e) {
        console.error("Users/Roles fetch failed:", e);
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <UsersTabs initialUsers={dbUsers} initialRoles={dbRoles} />
            </div>
        </div>
    );
}
