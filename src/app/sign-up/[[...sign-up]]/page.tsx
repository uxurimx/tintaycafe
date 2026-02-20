import { SignUp } from "@clerk/nextjs";

export default function Page() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950">
            <SignUp appearance={{
                elements: {
                    card: "bg-slate-900 border border-slate-800",
                    headerTitle: "text-white font-outfit text-2xl",
                    headerSubtitle: "text-slate-400",
                    formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 transition-all",
                    footerActionLink: "text-indigo-400 hover:text-indigo-300",
                    formFieldLabel: "text-slate-300",
                    formFieldInput: "bg-slate-950 border-slate-800 text-white"
                }
            }} />
        </div>
    );
}
