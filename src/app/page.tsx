import { db } from "@/db";
import { items, inventory, categories } from "@/db/schema";
import { eq, gt } from "drizzle-orm";
import Link from "next/link";
import {
  Coffee,
  Book,
  ShoppingBag,
  ArrowRight,
  Zap,
  Sparkles,
  Users,
  Gamepad2,
  MapPin,
  ExternalLink,
  UserPlus
} from "lucide-react";
import { auth } from "@clerk/nextjs/server";
import { SignInButton, UserButton } from "@clerk/nextjs";
import ClientShop from "@/components/ClientShop";
import JoinLoyalty from "@/components/JoinLoyalty";
import { getUserRole } from "@/lib/auth-utils";

export default async function EcommerceStore() {
  const { userId } = await auth();

  // Fetch user role using centralized logic
  const userRole = await getUserRole();
  const isStaff = ['admin', 'owner', 'employee', 'kitchen'].includes(userRole);

  // Fetch real products with inventory for the shop
  let products: any[] = [];
  try {
    const stockData = await db
      .select({
        id: items.id,
        name: items.name,
        type: items.type,
        price: items.price,
        imageUrl: items.imageUrl,
        quantity: inventory.quantity,
        categoryName: categories.name,
        description: items.description,
        metadata: items.metadata,
      })
      .from(items)
      .innerJoin(inventory, eq(items.id, inventory.itemId))
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .where(gt(inventory.quantity, 0))
      .limit(20);
    products = stockData;
  } catch (e) {
    console.error("Failed to fetch products for landing page", e);
    // Minimal fallback handled inside ClientShop or with empty array
    products = [];
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white selection:bg-indigo-500/30">
      {/* Premium Navigation */}
      <header className="fixed top-0 w-full p-4 md:p-6 flex justify-between items-center z-[100] backdrop-blur-2xl bg-slate-950/60 border-b border-white/5">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl shadow-lg shadow-indigo-500/20">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-outfit font-black text-xl tracking-tighter leading-none">TINTA Y CAFÉ</span>
            <span className="text-[9px] font-black uppercase tracking-[0.4em] text-indigo-400 mt-1">NEXUS DURANGO</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {['Servicios', 'Librería', 'Comunidad', 'Ubicación'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:text-indigo-400 transition-colors">
              {item}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-6">
          {!userId ? (
            <div className="flex items-center gap-4">
              <SignInButton mode="modal">
                <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors">
                  Ingresar
                </button>
              </SignInButton>
              <Link href="/sign-up" className="px-6 py-3 bg-white text-slate-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 transition-all shadow-xl shadow-white/5 active:scale-95">
                Unirse
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link href="/me" className="flex items-center gap-2 group">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Mi Perfil</span>
                  <span className="text-[9px] font-bold text-slate-500">CONSUMIDOR</span>
                </div>
                <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-indigo-500/50 transition-all">
                  <UserPlus className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                </div>
              </Link>
              {isStaff && (
                <Link href="/pos" className="hidden md:flex items-center gap-2 group">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-indigo-400">Panel de Control</span>
                    <span className="text-[9px] font-bold text-slate-500">ADMINISTRADOR</span>
                  </div>
                  <div className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 group-hover:border-indigo-500/50 transition-all">
                    <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-indigo-400" />
                  </div>
                </Link>
              )}
              <UserButton afterSignOutUrl="/" appearance={{ elements: { userButtonAvatarBox: "w-10 h-10 rounded-xl border border-white/10" } }} />
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Cinematic Presence */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-30 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-indigo-600/20 rounded-full blur-[120px]" />
          <div className="absolute top-1/2 right-1/4 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-indigo-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-indigo-300">Sincronización Durango-Digital Activa</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-outfit font-black mb-8 tracking-tighter italic leading-none">
            CULTURA & <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
              GRANO NEURAL
            </span>
          </h1>

          <p className="text-slate-400 text-xl md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed">
            Más que una cafetería, un refugio para la mente. Libros seleccionados, café de especialidad y estrategias en mesa en el corazón de Durango.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a href="#catalogo" className="w-full sm:w-auto px-10 py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-2xl active:scale-95">
              Explorar Catálogo <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#comunidad" className="w-full sm:w-auto px-10 py-5 bg-slate-900/50 border border-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-slate-800 transition-all backdrop-blur-xl">
              Unirse al Nexus <Users className="w-4 h-4 text-indigo-400" />
            </a>
          </div>
        </div>
      </section>

      {/* Info Sections - The Pillars */}
      <section className="px-6 py-32 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {[
          {
            title: "Cafetería de Especialidad",
            desc: "Granos de altura trazables directamente del productor. Una experiencia de extracción calibrada para paladares exigentes.",
            icon: <Coffee className="w-8 h-8 text-indigo-400" />,
            color: "from-indigo-600/20 to-indigo-900/10"
          },
          {
            title: "La Librería Curada",
            desc: "Desde clásicos universales hasta narrativa contemporánea y editoriales independientes. El maridaje perfecto para tu café.",
            icon: <Book className="w-8 h-8 text-purple-400" />,
            color: "from-purple-600/20 to-purple-900/10"
          },
          {
            title: "Mesa & Estrategia",
            desc: "Un catálogo de juegos de mesa para desafiar tu mente mientras disfrutas de nuestro ambiente único y acogedor.",
            icon: <Gamepad2 className="w-8 h-8 text-pink-400" />,
            color: "from-pink-600/20 to-pink-900/10"
          }
        ].map((pillar, i) => (
          <div key={i} className={`p-10 rounded-[3rem] bg-gradient-to-br ${pillar.color} border border-white/5 flex flex-col items-start gap-6 group hover:translate-y-[-4px] transition-all duration-500`}>
            <div className="p-4 bg-slate-950 rounded-2xl border border-white/10 group-hover:scale-110 transition-transform">
              {pillar.icon}
            </div>
            <h3 className="text-2xl font-outfit font-black text-white italic tracking-tight uppercase leading-none">{pillar.title}</h3>
            <p className="text-slate-400 font-medium leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </section>

      {/* Interactive Catalog Section */}
      <section id="catalogo" className="px-6 py-32 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-20 text-left">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-[1px] bg-indigo-500" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-indigo-400">Sincronización Real</span>
              </div>
              <h2 className="text-5xl md:text-6xl font-outfit font-black text-white tracking-tighter italic">SHOP VIRTUAL</h2>
            </div>
            <p className="text-slate-500 text-sm max-w-xs font-bold uppercase tracking-widest text-right">
              Inventario compartido entre el espacio físico y digital.
            </p>
          </div>

          <ClientShop initialProducts={products} />
        </div>
      </section>

      {/* Loyalty Registration Section */}
      <section id="comunidad" className="px-6 py-32 relative">
        <div className="absolute inset-0 bg-indigo-600/[0.02] -z-10" />
        <div className="max-w-7xl mx-auto">
          <JoinLoyalty />
        </div>
      </section>

      {/* Location / Contact */}
      <section className="px-6 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8 text-left">
            <h2 className="text-5xl font-outfit font-black text-white tracking-tight italic">ENCUÉNTRANOS EN EL CORAZÓN DE DURANGO</h2>
            <p className="text-slate-400 text-lg leading-relaxed font-medium">
              Ven a vivir la experiencia completa. Estamos ubicados en el centro histórico, listos para recibirte con el aroma del café recién molido y las mejores historias.
            </p>
            <div className="space-y-4">
              <div className="flex items-center gap-4 text-white">
                <MapPin className="w-6 h-6 text-indigo-500" />
                <span className="font-bold">Calle Constitución #123, Centro Histórico, Durango, Dgo.</span>
              </div>
              <div className="flex items-center gap-4 text-white">
                <Zap className="w-6 h-6 text-purple-500" />
                <span className="font-bold">Abierto todos los días de 8:00 AM a 10:00 PM</span>
              </div>
            </div>
          </div>
          <div className="w-full md:w-1/2 aspect-video bg-slate-900/50 rounded-[3rem] border border-slate-800 flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10" />
            <MapPin className="w-16 h-16 text-indigo-500/30 group-hover:scale-125 transition-transform" />
            <div className="absolute bottom-10 left-10 p-4 bg-slate-950/80 backdrop-blur-md rounded-2xl border border-white/5">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Ver en Google Maps</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <span className="font-outfit font-black text-lg tracking-tight">TINTA Y CAFÉ</span>
        </div>
        <p className="text-slate-600 text-[10px] font-bold uppercase tracking-[0.4em]">© 2026 Sincronicidad Durango-Digital. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
