import { db } from "@/db";
import { items, inventory } from "@/db/schema";
import { eq, gt } from "drizzle-orm";
import Link from "next/link";
import { Coffee, Book, ShoppingBag, ArrowRight, Zap, Sparkles, Plus } from "lucide-react";
import { auth } from "@clerk/nextjs/server";

export default async function EcommerceStore() {
  const { userId } = await auth();

  // Fetch real inventory for the public store (items in stock)
  let products = [];
  try {
    const stockData = await db
      .select({
        id: items.id,
        name: items.name,
        type: items.type,
        price: items.price,
        imageUrl: items.imageUrl,
        quantity: inventory.quantity,
      })
      .from(items)
      .innerJoin(inventory, eq(items.id, inventory.itemId))
      .where(gt(inventory.quantity, 0))
      .limit(8);
    products = stockData;
  } catch (e) {
    // Fallback if DB not ready
    products = [
      { id: 1, name: "Don Quijote de la Mancha", type: "book", price: 450, quantity: 5 },
      { id: 2, name: "Cien Años de Soledad", type: "book", price: 380, quantity: 3 },
      { id: 3, name: "Café de Especialidad 500g", type: "product", price: 290, quantity: 12 },
    ];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Dynamic Header */}
      <header className="fixed top-0 w-full p-4 md:p-6 flex justify-between items-center z-50 backdrop-blur-xl bg-slate-950/60 border-b border-slate-900">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl">
            <Coffee className="text-white w-5 h-5" />
          </div>
          <span className="font-outfit font-bold text-xl tracking-tight">Tinta y Café <span className="text-indigo-400">Shop</span></span>
        </div>

        <div className="flex items-center gap-4">
          {userId && (
            <Link href="/inventory" className="text-slate-400 hover:text-white text-xs font-bold uppercase tracking-widest hidden md:block">
              Admin Panel
            </Link>
          )}
          <div className="relative p-2 bg-slate-900 rounded-full border border-slate-800 hover:bg-slate-800 transition-colors">
            <ShoppingBag className="w-5 h-5 text-slate-300" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-500 rounded-full text-[10px] flex items-center justify-center font-bold">0</span>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-20 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-[100px]" />
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-300">Inventario Sincronizado en Tiempo Real</span>
          </div>
          <h1 className="text-5xl md:text-8xl font-outfit font-bold mb-6 tracking-tight">
            Cultura & Grano <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 leading-tight">
              Nexus Durango
            </span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-10 font-medium">
            Libros, juegos de mesa y café de especialidad. Todo lo que amas de Tinta y Café, directamente en tu puerta.
          </p>
        </div>
      </section>

      {/* Product Grid */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-3xl font-outfit font-bold">Explora el Catálogo</h2>
            <div className="h-1 w-20 bg-indigo-500 mt-2 rounded-full" />
          </div>
          <Link href="/catalog" className="text-indigo-400 flex items-center gap-2 font-bold text-sm group">
            Ver todo <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <div key={product.id} className="group relative bg-slate-900/50 border border-slate-800 rounded-[2rem] p-4 hover:border-indigo-500/30 transition-all hover:translate-y-[-4px]">
              <div className="aspect-square bg-slate-950 rounded-[1.5rem] mb-6 overflow-hidden relative flex items-center justify-center border border-slate-900">
                {product.type === 'book' ? (
                  <Book className="w-16 h-16 text-indigo-800 opacity-50" />
                ) : (
                  <Coffee className="w-16 h-16 text-purple-800 opacity-50" />
                )}
                {/* Out of stock badge logic could go here */}
              </div>

              <div className="space-y-1 px-2">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{product.type === 'book' ? 'Librería' : 'Cafetería'}</span>
                <h3 className="text-lg font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                <div className="flex justify-between items-center pt-4">
                  <p className="text-2xl font-outfit font-bold text-indigo-400">${product.price}</p>
                  <button className="p-3 bg-white text-slate-950 rounded-2xl hover:bg-slate-200 transition-all flex items-center justify-center">
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* AI Experience Banner */}
      <section className="px-6 pb-32 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-indigo-900/20 to-purple-900/20 border border-indigo-500/20 rounded-[3rem] p-12 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-[80px]" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="text-left max-w-xl">
              <div className="flex items-center gap-2 mb-6">
                <Zap className="w-6 h-6 text-indigo-400 fill-indigo-400" />
                <span className="text-sm font-bold uppercase tracking-widest text-indigo-300">Powered by Neural Nexus</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-outfit font-bold mb-6">Tu Asistente de Lectura IA</h2>
              <p className="text-slate-300 text-lg mb-8 leading-relaxed">
                Nuestra red neuronal analiza tus gustos en café y lecturas pasadas para recomendarte tu próxima gran historia.
              </p>
              <button className="px-8 py-4 bg-indigo-600 rounded-2xl font-bold flex items-center gap-3 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20">
                Iniciar Conversación <ArrowRight className="w-5 h-5" />
              </button>
            </div>
            <div className="relative w-full max-w-xs aspect-square bg-slate-950 rounded-[2.5rem] border border-slate-800 flex items-center justify-center p-8 group-hover:scale-[1.02] transition-transform">
              <Sparkles className="w-32 h-32 text-indigo-500/30 animate-pulse" />
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-sm font-medium">© 2026 Tinta y Café. Sincronicidad Durango-Digital.</p>
      </footer>
    </div>
  );
}
