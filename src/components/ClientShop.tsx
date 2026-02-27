"use client";

import { useState, useEffect, useMemo } from "react";
import {
    ShoppingBag,
    Plus,
    Minus,
    X,
    ArrowRight,
    Coffee,
    Book,
    Gamepad2,
    Check,
    Info,
    ChevronRight,
    Sparkles,
    UtensilsCrossed
} from "lucide-react";
import { toast } from "sonner";
import { processWebSale } from "@/app/api/checkout/actions";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";

interface Product {
    id: number;
    name: string;
    type: string;
    price: number;
    imageUrl: string | null;
    quantity: number;
    categoryName?: string | null;
    description?: string | null;
    metadata?: string | null;
    isSupply: boolean;
}

interface CartItem extends Product {
    cartQuantity: number;
}

export default function ClientShop({ initialProducts }: { initialProducts: Product[] }) {
    const { user, isLoaded } = useUser();
    const router = useRouter();
    const [products] = useState<Product[]>(initialProducts);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'coffee' | 'book' | 'game' | 'dessert'>('all');

    // Load cart from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("tinta-y-cafe-cart");
        if (savedCart) {
            try {
                setCart(JSON.parse(savedCart));
            } catch (e) {
                console.error("Failed to load cart", e);
            }
        }
    }, []);

    // Save cart to local storage
    useEffect(() => {
        localStorage.setItem("tinta-y-cafe-cart", JSON.stringify(cart));
    }, [cart]);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'coffee') return p.type === 'product' || p.categoryName?.toLowerCase().includes('café');
            if (activeFilter === 'book') return p.type === 'book';
            if (activeFilter === 'game') return p.categoryName?.toLowerCase().includes('juego');
            if (activeFilter === 'dessert') return p.categoryName?.toLowerCase().includes('postre') || p.categoryName?.toLowerCase().includes('repostería');
            return true;
        });
    }, [products, activeFilter]);

    const cartTotal = cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    const cartCount = cart.reduce((acc, item) => acc + item.cartQuantity, 0);

    const addToCart = (product: Product) => {
        setCart(prev => {
            const existing = prev.find(item => item.id === product.id);
            if (existing) {
                if (existing.cartQuantity >= product.quantity) {
                    toast.warning("Límite de disponibilidad alcanzado");
                    return prev;
                }
                toast.success(`Añadido: ${product.name}`);
                return prev.map(item => item.id === product.id
                    ? { ...item, cartQuantity: item.cartQuantity + 1 }
                    : item
                );
            }
            toast.success(`Añadido: ${product.name}`);
            return [...prev, { ...product, cartQuantity: 1 }];
        });
    };

    const updateQuantity = (id: number, delta: number) => {
        setCart(prev => prev.map(item => {
            if (item.id === id) {
                const newQty = item.cartQuantity + delta;
                if (newQty < 1) return item;
                if (newQty > item.quantity) {
                    toast.warning("Límite de disponibilidad alcanzado");
                    return item;
                }
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
        toast.info("Eliminado del carrito");
    };

    const handleCheckout = async () => {
        if (!isLoaded) return;
        if (!user) {
            toast.error("Por favor inicia sesión para completar tu pedido");
            return;
        }

        setIsProcessing(true);
        try {
            const result = await processWebSale({
                items: cart.map(item => ({
                    itemId: item.id,
                    quantity: item.cartQuantity,
                    price: item.price
                })),
                total: cartTotal
            });

            if (result.success) {
                toast.success("¡Pedido recibido! Te esperamos pronto.");
                setCart([]);
                localStorage.removeItem("tinta-y-cafe-cart");
                setIsCartOpen(false);
                router.push("/me");
            }
        } catch (error: any) {
            toast.error(error.message || "Error al procesar el pedido");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <>
            {/* Floating Cart Button */}
            <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[150]">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className={`relative p-5 md:p-6 rounded-2xl md:rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 group ${cartCount > 0 ? 'bg-cafe-terracotta text-white' : 'bg-cafe-dark text-white shadow-cafe-dark/20'}`}
                >
                    <ShoppingBag className="w-6 h-6 md:w-8 md:h-8" />
                    {cartCount > 0 && (
                        <span className="absolute -top-1 -right-1 bg-white text-cafe-terracotta text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-2 border-cafe-terracotta shadow-xl animate-pulse">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filters */}
            <div className="flex justify-center flex-wrap gap-2 md:gap-4 mb-12 md:mb-20 px-4">
                {[
                    { id: 'all', label: 'Todo', icon: <Sparkles className="w-4 h-4" /> },
                    { id: 'coffee', label: 'Cafetería', icon: <Coffee className="w-4 h-4" /> },
                    { id: 'book', label: 'Libros', icon: <Book className="w-4 h-4" /> },
                    { id: 'game', label: 'Juegos', icon: <Gamepad2 className="w-4 h-4" /> },
                    { id: 'dessert', label: 'Postres', icon: <UtensilsCrossed className="w-4 h-4" /> },
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id as any)}
                        className={`px-6 md:px-8 py-3 md:py-4 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-3 transition-all ${activeFilter === filter.id ? 'bg-cafe-terracotta text-white shadow-xl shadow-cafe-terracotta/20 translate-y-[-2px]' : 'bg-white text-cafe-milk border border-cafe-gold/20 hover:border-cafe-gold hover:text-cafe-dark shadow-sm'}`}
                    >
                        {filter.icon} {filter.label}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group relative bg-white border border-cafe-gold/10 rounded-[2.5rem] p-6 hover:border-cafe-gold/30 transition-all hover:translate-y-[-8px] shadow-sm hover:shadow-2xl"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 left-6 z-10">
                            <span className="px-4 py-1.5 rounded-full bg-cafe-white/90 backdrop-blur-md border border-cafe-gold/20 text-[9px] font-black uppercase tracking-widest text-cafe-terracotta">
                                {product.type === 'book' ? 'Librería' : 'Favorito'}
                            </span>
                        </div>

                        {/* Image / Icon Holder */}
                        <div
                            onClick={() => setSelectedProduct(product)}
                            className="aspect-[4/5] bg-cafe-creme rounded-[2rem] mb-6 overflow-hidden relative flex items-center justify-center border border-cafe-gold/5 group-hover:bg-[#FFFDF9] transition-colors cursor-pointer"
                        >
                            {product.type === 'book' ? (
                                <Book className="w-16 h-16 text-cafe-gold/30 group-hover:text-cafe-gold/50 transition-colors" />
                            ) : (
                                <Coffee className="w-16 h-16 text-cafe-terracotta/20 group-hover:text-cafe-terracotta/40 transition-colors" />
                            )}

                            <div className="absolute inset-0 bg-cafe-terracotta/0 group-hover:bg-cafe-terracotta/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-cafe-dark text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-xl">
                                    <Info className="w-4 h-4" /> Ver más
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4 text-left">
                            <h3 className="text-xl font-playfair font-black text-cafe-dark transition-colors line-clamp-1 group-hover:text-cafe-terracotta">{product.name}</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-3xl font-playfair font-black text-cafe-dark italic tracking-tighter">${product.price}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="p-4 bg-cafe-terracotta text-white rounded-2xl hover:bg-cafe-dark transition-all shadow-lg active:scale-95 shadow-cafe-terracotta/10"
                                >
                                    <Plus className="w-6 h-6" />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Sidebar Cart */}
            {isCartOpen && (
                <div className="fixed inset-0 z-[200] flex justify-end">
                    <div
                        className="absolute inset-0 bg-cafe-dark/20 backdrop-blur-sm"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-cafe-creme border-l border-cafe-gold/20 h-screen flex flex-col animate-in slide-in-from-right duration-300 shadow-2xl">
                        <div className="p-8 border-b border-cafe-gold/10 flex justify-between items-center bg-cafe-dark">
                            <div>
                                <h2 className="text-2xl font-playfair font-black text-white italic">TU PEDIDO</h2>
                                <p className="text-[10px] font-bold text-cafe-gold uppercase tracking-widest mt-1">Sabor artesanal en cada pieza</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-cafe-milk hover:text-white transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-8">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-5 group">
                                    <div className="w-20 h-24 bg-white rounded-2xl border border-cafe-gold/10 flex items-center justify-center shrink-0 shadow-sm">
                                        {item.type === 'book' ? <Book className="w-8 h-8 text-cafe-gold/30" /> : <Coffee className="w-8 h-8 text-cafe-terracotta/20" />}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-cafe-dark leading-tight">{item.name}</h4>
                                            <p className="text-lg font-playfair font-black text-cafe-terracotta mt-1">${item.price}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-white rounded-xl border border-cafe-gold/20 p-1.5 shadow-sm">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-cafe-terracotta"><Minus className="w-3.5 h-3.5" /></button>
                                                <span className="w-8 text-center text-xs font-black text-cafe-dark">{item.cartQuantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-cafe-terracotta"><Plus className="w-3.5 h-3.5" /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-cafe-milk hover:text-cafe-terracotta uppercase tracking-widest transition-colors">Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                                    <ShoppingBag className="w-20 h-20 mb-6 text-cafe-milk" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em] italic text-cafe-dark">Tu bolsa está vacía</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-white border-t border-cafe-gold/10 space-y-8 shadow-[0_-10px_40px_rgba(0,0,0,0.03)]">
                            <div className="flex justify-between items-center">
                                <span className="font-playfair font-black text-cafe-dark italic text-3xl">Total</span>
                                <span className="font-playfair font-black text-cafe-terracotta text-3xl">${cartTotal.toFixed(2)}</span>
                            </div>
                            <button
                                onClick={handleCheckout}
                                disabled={cart.length === 0 || isProcessing}
                                className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 transition-all shadow-xl active:scale-95 ${cart.length === 0 || isProcessing ? 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none' : 'bg-cafe-terracotta text-white hover:bg-cafe-dark shadow-cafe-terracotta/10'}`}
                            >
                                {isProcessing ? (
                                    <Sparkles className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        Completar Pedido <ArrowRight className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-cafe-dark/30 backdrop-blur-xl">
                    <div className="relative bg-[#FFFDF9] border border-cafe-gold/20 w-full max-w-4xl h-full md:h-auto rounded-[3rem] shadow-2xl overflow-y-auto md:overflow-hidden animate-in zoom-in duration-300">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-6 right-6 z-10 p-3 bg-white rounded-2xl border border-cafe-gold/20 text-cafe-milk hover:text-cafe-terracotta transition-all shadow-sm"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row">
                            <div className="w-full md:w-1/2 bg-cafe-creme flex items-center justify-center p-12 overflow-hidden shrink-0 min-h-[300px]">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-cafe-terracotta/5 blur-[80px] rounded-full" />
                                    {selectedProduct.type === 'book' ? (
                                        <Book className="w-40 h-40 md:w-56 md:h-56 text-cafe-gold relative z-10" />
                                    ) : (
                                        <Coffee className="w-40 h-40 md:w-56 md:h-56 text-cafe-terracotta relative z-10" />
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 p-8 md:p-14 flex flex-col justify-center space-y-8 text-left">
                                <div>
                                    <span className="px-4 py-1.5 rounded-full bg-cafe-terracotta/5 border border-cafe-terracotta/10 text-[10px] font-black uppercase tracking-[0.3em] text-cafe-terracotta">
                                        {selectedProduct.categoryName || 'Selección de la Casa'}
                                    </span>
                                    <h2 className="text-4xl lg:text-5xl font-playfair font-black text-cafe-dark mt-6 italic leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-4xl font-playfair font-black text-cafe-terracotta mt-3">${selectedProduct.price}</p>
                                </div>
                                <div className="space-y-6">
                                    <p className="text-cafe-milk text-lg leading-relaxed font-medium">
                                        {selectedProduct.description || "Una de nuestras piezas más queridas, seleccionada para brindarte una experiencia inigualable en cultura y sabor."}
                                    </p>
                                    <div className="flex items-center gap-4 py-5 border-y border-cafe-gold/10">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.3)]" />
                                            <span className="text-[11px] font-bold text-cafe-milk uppercase tracking-widest">Disponible ahora</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    className="w-full py-6 bg-cafe-terracotta text-white rounded-[2rem] font-black uppercase tracking-widest text-xs flex items-center justify-center gap-4 hover:bg-cafe-dark transition-all shadow-xl shadow-cafe-terracotta/10 active:scale-95"
                                >
                                    Añadir a mi Bolsa <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
