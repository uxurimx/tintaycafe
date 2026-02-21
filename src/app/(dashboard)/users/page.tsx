import { protectOwnerAdmin } from "@/lib/auth-utils";
import { getUsers } from "@/app/api/users/actions";
import UserManager from "@/components/UserManager";

export default async function UsersPage() {
    await protectOwnerAdmin();

    let dbUsers: Awaited<ReturnType<typeof getUsers>> = [];
    try {
        dbUsers = await getUsers();
    } catch (e) {
        console.error("Users fetch failed:", e);
    }

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                <UserManager initialUsers={dbUsers} />
            </div>
        </div>
    );
}
