import SideNav from "@/components/SideNav";
import { getUserRole } from "@/lib/auth-utils";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const userRole = await getUserRole();

    return (
        <div className="min-h-screen bg-slate-950 flex font-outfit">
            <SideNav userRole={userRole} />
            <main className="flex-1 ml-64 min-h-screen relative overflow-y-auto">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-indigo-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[120px] pointer-events-none -z-10" />
                {children}
            </main>
        </div>
    );
}
