import { db } from "@/db";
import { items, inventory, categories } from "@/db/schema";
import { eq, gt, and } from "drizzle-orm";
import Link from "next/link";
import {
  Coffee,
  Book,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  Users,
  Gamepad2,
  MapPin,
  ExternalLink,
  UserPlus,
  UtensilsCrossed,
  Clock
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
        isSupply: items.isSupply,
      })
      .from(items)
      .innerJoin(inventory, eq(items.id, inventory.itemId))
      .leftJoin(categories, eq(items.categoryId, categories.id))
      .where(and(gt(inventory.quantity, 0), eq(items.isSupply, false)))
      .limit(20);
    products = stockData;
  } catch (e) {
    console.error("Failed to fetch products for landing page", e);
    products = [];
  }

  return (
    <div className="min-h-screen bg-cafe-creme text-cafe-dark selection:bg-cafe-terracotta/20">
      {/* Warm Navigation */}
      <header className="fixed top-0 w-full p-4 md:p-6 flex justify-between items-center z-[100] backdrop-blur-xl bg-cafe-dark/95 border-b border-cafe-gold/20 shadow-lg">
        <div className="flex items-center gap-4">
          <div className="p-2.5 bg-gradient-to-br from-cafe-terracotta to-cafe-gold rounded-2xl shadow-lg shadow-cafe-terracotta/20">
            <Coffee className="text-white w-6 h-6" />
          </div>
          <div className="flex flex-col">
            <span className="font-playfair font-black text-2xl tracking-tight text-cafe-white leading-none">TINTA Y CAFÉ</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-cafe-gold mt-1">Durango, México</span>
          </div>
        </div>

        <nav className="hidden lg:flex items-center gap-8">
          {[
            { label: 'Nuestro Menú', href: '#catalogo' },
            { label: 'Librería', href: '#secciones' },
            { label: 'Juegos', href: '#secciones' },
            { label: 'Nosotros', href: '#nosotros' },
            { label: 'Ubicación', href: '#ubicacion' }
          ].map((item) => (
            <a key={item.label} href={item.href} className="text-[11px] font-bold uppercase tracking-[0.15em] text-cafe-milk hover:text-cafe-gold transition-colors">
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-6">
          {!userId ? (
            <div className="flex items-center gap-2 md:gap-4">
              <SignInButton mode="modal">
                <button className="text-[10px] font-black uppercase tracking-widest text-cafe-milk hover:text-cafe-white transition-colors cursor-pointer">
                  Ingresar
                </button>
              </SignInButton>
              <Link href="/sign-up" className="px-5 md:px-7 py-2.5 md:py-3 bg-cafe-terracotta text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-cafe-gold transition-all shadow-xl shadow-cafe-terracotta/10 active:scale-95">
                Unirse
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-4 md:gap-6">
              <Link href="/me" className="flex items-center gap-2 group">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-tighter text-cafe-gold">Mi Perfil</span>
                  <span className="text-[9px] font-bold text-cafe-milk">CLIENTE</span>
                </div>
                <div className="p-2 md:p-2.5 bg-cafe-dark/50 rounded-xl border border-cafe-gold/30 group-hover:border-cafe-gold transition-all">
                  <UserPlus className="w-4 h-4 text-cafe-gold" />
                </div>
              </Link>
              {isStaff && (
                <Link href="/pos" className="hidden sm:flex items-center gap-2 group">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-tighter text-cafe-terracotta">Panel</span>
                    <span className="text-[9px] font-bold text-cafe-milk">ADMIN</span>
                  </div>
                  <div className="p-2 md:p-2.5 bg-cafe-dark/50 rounded-xl border border-cafe-terracotta/30 group-hover:border-cafe-terracotta transition-all">
                    <ExternalLink className="w-4 h-4 text-cafe-terracotta" />
                  </div>
                </Link>
              )}
              <UserButton appearance={{ elements: { userButtonAvatarBox: "w-8 h-8 md:w-10 md:h-10 rounded-xl border border-cafe-gold/30 shadow-lg" } }} />
            </div>
          )}
        </div>
      </header>

      {/* Hero Section - Cozy & Welcoming */}
      <section className="relative pt-48 pb-32 px-6 overflow-hidden bg-[#FFFDF9]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-full opacity-40 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-cafe-gold/10 rounded-full blur-[140px]" />
          <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-cafe-terracotta/10 rounded-full blur-[140px]" />
        </div>

        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-cafe-terracotta/5 border border-cafe-terracotta/10 mb-8 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cafe-terracotta" />
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-cafe-terracotta">Un lugar para saborear y leer</span>
          </div>

          <h1 className="text-6xl md:text-9xl font-playfair font-black mb-8 tracking-tighter leading-[0.9] text-cafe-dark">
            CAFÉ, LIBROS & <br />
            <span className="text-cafe-terracotta italic">
              BUENOS MOMENTOS
            </span>
          </h1>

          <p className="text-cafe-milk text-lg md:text-2xl max-w-3xl mx-auto mb-12 font-medium leading-relaxed px-6">
            Más que una cafetería, un refugio para tu mente. Disfruta de una curada selección literaria, café de especialidad y las mejores tardes de juegos en el corazón de Durango.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 px-6">
            <a href="#catalogo" className="w-full sm:w-auto px-10 py-5 bg-cafe-terracotta text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-cafe-dark transition-all shadow-2xl active:scale-95">
              Explorar el Menú <ArrowRight className="w-4 h-4" />
            </a>
            <a href="#nosotros" className="w-full sm:w-auto px-10 py-5 bg-cafe-white border-2 border-cafe-gold/20 text-cafe-dark rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 hover:bg-cafe-gold/10 transition-all">
              Vivir la Experiencia <Users className="w-4 h-4 text-cafe-gold" />
            </a>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section id="secciones" className="px-6 py-32 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
        {[
          {
            title: "Café de Especialidad",
            desc: "Granos seleccionados y tostados artesanalmente. Una taza perfecta para cada momento del día.",
            icon: <Coffee className="w-8 h-8 text-cafe-terracotta" />,
            color: "bg-orange-50/50 border-orange-100"
          },
          {
            title: "Librería Curada",
            desc: "Clásicos, novedades y tesoros ocultos. Encuentra tu próxima historia favorita entre nuestros estantes.",
            icon: <Book className="w-8 h-8 text-cafe-gold" />,
            color: "bg-green-50/50 border-green-100"
          },
          {
            title: "Juegos de Mesa",
            desc: "Ajedrez, estrategia y diversión. El espacio ideal para desconectarse y disfrutar entre amigos.",
            icon: <Gamepad2 className="w-8 h-8 text-amber-600" />,
            color: "bg-amber-50/50 border-amber-100"
          },
          {
            title: "Postres & Más",
            desc: "El maridaje perfecto. Repostería artesanal diseñada para complementar cada sorbo de tu café.",
            icon: <UtensilsCrossed className="w-8 h-8 text-rose-600" />,
            color: "bg-rose-50/50 border-rose-100"
          }
        ].map((pillar, i) => (
          <div key={i} className={`p-10 rounded-[2.5rem] border ${pillar.color} flex flex-col items-start gap-6 group hover:translate-y-[-8px] transition-all duration-500 shadow-sm hover:shadow-xl`}>
            <div className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm group-hover:scale-110 transition-transform">
              {pillar.icon}
            </div>
            <h3 className="text-2xl font-playfair font-black text-cafe-dark italic tracking-tight leading-none group-hover:text-cafe-terracotta transition-colors">{pillar.title}</h3>
            <p className="text-cafe-milk text-sm font-medium leading-relaxed">{pillar.desc}</p>
          </div>
        ))}
      </section>

      {/* Menu / Catalog Section */}
      <section id="catalogo" className="px-6 py-32 bg-cafe-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-16 text-left">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-10 h-[2px] bg-cafe-terracotta" />
                <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-cafe-terracotta">Selección de la casa</span>
              </div>
              <h2 className="text-5xl md:text-7xl font-playfair font-black text-cafe-dark tracking-tighter italic">NUESTRO MENÚ</h2>
            </div>
            <p className="text-cafe-milk text-sm max-w-xs font-bold uppercase tracking-widest md:text-right">
              Pide en línea y recoge en tienda o disfruta en nuestro local.
            </p>
          </div>

          <ClientShop initialProducts={products} />
        </div>
      </section>

      {/* Club / Loyalty Registration Section */}
      <section id="nosotros" className="px-6 py-32 relative bg-[#FFF8EF]">
        <div className="max-w-7xl mx-auto">
          <JoinLoyalty />
        </div>
      </section>

      {/* Location / Contact */}
      <section id="ubicacion" className="px-6 py-32 border-t border-cafe-gold/10">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20">
          <div className="flex-1 space-y-10 text-left">
            <h2 className="text-6xl font-playfair font-black text-cafe-dark tracking-tight italic leading-[1.1]">ENCUÉNTRANOS EN EL CENTRO</h2>
            <p className="text-cafe-milk text-xl leading-relaxed font-medium">
              Te esperamos en el corazón del centro histórico de Durango. Un espacio diseñado para que el tiempo se detenga mientras disfrutas de un buen libro y el mejor café.
            </p>
            <div className="space-y-6">
              <div className="flex items-center gap-5 text-cafe-dark group cursor-pointer hover:translate-x-2 transition-transform">
                <div className="p-3 bg-cafe-terracotta/10 rounded-xl border border-cafe-terracotta/20">
                  <MapPin className="w-7 h-7 text-cafe-terracotta" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-cafe-milk uppercase tracking-widest">Dirección</span>
                  <span className="font-bold text-lg">Calle Constitución #123, Centro Histórico, Durango</span>
                </div>
              </div>
              <div className="flex items-center gap-5 text-cafe-dark group cursor-pointer hover:translate-x-2 transition-transform">
                <div className="p-3 bg-cafe-gold/10 rounded-xl border border-cafe-gold/20">
                  <Clock className="w-7 h-7 text-cafe-gold" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-cafe-milk uppercase tracking-widest">Horario</span>
                  <span className="font-bold text-lg">Todos los días: 8:00 AM – 10:00 PM</span>
                </div>
              </div>
            </div>
          </div>
          <div className="w-full lg:w-[500px] aspect-square bg-cafe-white rounded-[3rem] border border-cafe-gold/20 flex items-center justify-center relative overflow-hidden group shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-br from-cafe-gold/5 to-cafe-terracotta/5" />
            <MapPin className="w-20 h-20 text-cafe-terracotta/20 group-hover:scale-125 transition-transform duration-700" />
            <div className="absolute inset-0 bg-cafe-dark/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <span className="px-8 py-4 bg-cafe-dark text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center gap-3 shadow-xl">
                Google Maps <ExternalLink className="w-4 h-4" />
              </span>
            </div>
            <div className="absolute bottom-10 left-10 right-10 p-5 bg-white/80 backdrop-blur-md rounded-2xl border border-gray-100 shadow-xl">
              <span className="text-[11px] font-black uppercase tracking-widest text-cafe-terracotta block text-center">Estamos a unas cuadras de Catedral</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="py-20 px-6 border-t border-cafe-gold/10 bg-cafe-dark text-cafe-white text-center">
        <div className="flex flex-col items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="p-2 bg-cafe-terracotta rounded-xl">
              <Coffee className="w-6 h-6 text-white" />
            </div>
            <span className="font-playfair font-black text-3xl tracking-tight">TINTA Y CAFÉ</span>
          </div>

          <div className="flex gap-10">
            {['Menú', 'Librería', 'Juegos', 'Privacidad'].map(link => (
              <a key={link} href="#" className="text-xs font-bold uppercase tracking-widest text-cafe-milk hover:text-cafe-gold transition-colors">
                {link}
              </a>
            ))}
          </div>

          <p className="text-cafe-milk/50 text-[10px] font-bold uppercase tracking-[0.5em] mt-8">
            © 2026 TINTA Y CAFÉ — DURANGO, MÉXICO. TODOS LOS DERECHOS RESERVADOS.
          </p>
        </div>
      </footer>
    </div>
  );
}
