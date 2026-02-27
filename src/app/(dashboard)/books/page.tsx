import { protectStaff } from "@/lib/auth-utils";
import BookAutomation from "@/components/BookAutomation";
import { getStores } from "@/app/api/books/actions";

export default async function BooksPage() {
    await protectStaff();
    const stores = await getStores();

    return (
        <div className="p-8 pb-24">
            <div className="max-w-6xl mx-auto space-y-12">
                <div>
                    <h1 className="text-4xl font-playfair font-black text-white italic tracking-tight">Gestión de Libros</h1>
                    <p className="text-slate-400 mt-2 font-medium">Automatiza tu inventario escaneando códigos de barras.</p>
                </div>

                <BookAutomation stores={stores} />
            </div>
        </div>
    );
}
