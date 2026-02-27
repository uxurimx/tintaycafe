import SideNav from "@/components/SideNav";
import { getUserRole } from "@/lib/auth-utils";
import { getModulesForRoleSlug, getRoleName } from "@/lib/roles";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const userRole = await getUserRole();
    const [allowedModules, roleName] = await Promise.all([
        getModulesForRoleSlug(userRole),
        getRoleName(userRole),
    ]);

    return (
        <div className="min-h-screen bg-slate-950 flex font-outfit">
            <SideNav userRole={userRole} roleName={roleName} allowedModules={allowedModules} />
            <main className="flex-1 lg:ml-64 min-h-screen relative overflow-y-auto pt-16 lg:pt-0">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                {children}
            </main>
        </div>
    );
}
