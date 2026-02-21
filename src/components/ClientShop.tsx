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
    Zap
} from "lucide-react";
import { toast } from "sonner";

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
}

interface CartItem extends Product {
    cartQuantity: number;
}

export default function ClientShop({ initialProducts }: { initialProducts: Product[] }) {
    const [products] = useState<Product[]>(initialProducts);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [isCartOpen, setIsCartOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [activeFilter, setActiveFilter] = useState<'all' | 'coffee' | 'book' | 'game'>('all');

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
                    toast.warning("Limite de stock alcanzado");
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
                    toast.warning("Limite de stock alcanzado");
                    return item;
                }
                return { ...item, cartQuantity: newQty };
            }
            return item;
        }));
    };

    const removeFromCart = (id: number) => {
        setCart(prev => prev.filter(item => item.id !== id));
        toast.info("Producto eliminado del carrito");
    };

    return (
        <>
            {/* Nav Extension - Dynamic Cart Button */}
            <div className="fixed top-6 right-6 z-[60] flex items-center gap-4">
                <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-4 bg-white text-slate-950 rounded-2xl shadow-2xl hover:scale-105 transition-transform group"
                >
                    <ShoppingBag className="w-6 h-6" />
                    {cartCount > 0 && (
                        <span className="absolute -top-2 -right-2 bg-indigo-600 text-white text-[10px] font-black w-6 h-6 flex items-center justify-center rounded-full border-4 border-slate-950 shadow-lg group-hover:animate-bounce">
                            {cartCount}
                        </span>
                    )}
                </button>
            </div>

            {/* Filter Section */}
            <div className="flex justify-center flex-wrap gap-3 mb-16">
                {[
                    { id: 'all', label: 'Todo', icon: <Sparkles className="w-4 h-4" /> },
                    { id: 'coffee', label: 'Cafetería', icon: <Coffee className="w-4 h-4" /> },
                    { id: 'book', label: 'Librería', icon: <Book className="w-4 h-4" /> },
                    { id: 'game', label: 'Juegos', icon: <Gamepad2 className="w-4 h-4" /> },
                ].map(filter => (
                    <button
                        key={filter.id}
                        onClick={() => setActiveFilter(filter.id as any)}
                        className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-3 transition-all ${activeFilter === filter.id ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-600/40 translate-y-[-2px]' : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:text-white'}`}
                    >
                        {filter.icon} {filter.label}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                {filteredProducts.map((product) => (
                    <div
                        key={product.id}
                        className="group relative bg-slate-900/30 border border-slate-800 rounded-[2.5rem] p-6 hover:border-indigo-500/30 transition-all hover:translate-y-[-8px] shadow-2xl"
                    >
                        {/* Status Badge */}
                        <div className="absolute top-6 left-6 z-10">
                            <span className="px-3 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-300">
                                {product.type === 'book' ? 'Librería' : 'Especialidad'}
                            </span>
                        </div>

                        {/* Image Placeholder with Icon */}
                        <div
                            onClick={() => setSelectedProduct(product)}
                            className="aspect-[4/5] bg-slate-950 rounded-[2rem] mb-6 overflow-hidden relative flex items-center justify-center border border-slate-900 group-hover:bg-slate-900 transition-colors cursor-pointer"
                        >
                            {product.type === 'book' ? (
                                <Book className="w-20 h-20 text-indigo-900/30 group-hover:text-indigo-500/20 transition-colors" />
                            ) : (
                                <Coffee className="w-20 h-20 text-purple-900/30 group-hover:text-purple-500/20 transition-colors" />
                            )}

                            <div className="absolute inset-0 bg-indigo-600/0 group-hover:bg-indigo-600/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white text-slate-950 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <Info className="w-3 h-3" /> Detalles
                                </span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h3 className="text-xl font-bold text-slate-100 group-hover:text-white transition-colors line-clamp-1">{product.name}</h3>
                            <div className="flex justify-between items-center">
                                <p className="text-3xl font-outfit font-black text-white italic tracking-tighter">${product.price}</p>
                                <button
                                    onClick={() => addToCart(product)}
                                    className="p-4 bg-indigo-600 text-white rounded-2xl hover:bg-indigo-500 transition-all shadow-lg active:scale-95"
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
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <div
                        className="absolute inset-0 bg-slate-950/40 backdrop-blur-md"
                        onClick={() => setIsCartOpen(false)}
                    />
                    <div className="relative w-full max-w-md bg-slate-900 border-l border-slate-800 h-screen flex flex-col animate-in slide-in-from-right duration-300">
                        <div className="p-8 border-b border-slate-800 flex justify-between items-center">
                            <div>
                                <h2 className="text-2xl font-outfit font-black text-white">TU CARRITO</h2>
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mt-1">Sincronización Durango</p>
                            </div>
                            <button onClick={() => setIsCartOpen(false)} className="p-2 text-slate-500 hover:text-white">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 space-y-6">
                            {cart.map(item => (
                                <div key={item.id} className="flex gap-4 group">
                                    <div className="w-20 h-24 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center shrink-0">
                                        {item.type === 'book' ? <Book className="w-8 h-8 text-slate-800" /> : <Coffee className="w-8 h-8 text-slate-800" />}
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-100 leading-tight">{item.name}</h4>
                                            <p className="text-lg font-outfit font-black text-indigo-400 mt-1">${item.price}</p>
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                                                <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-white"><Minus className="w-3 h-3 text-slate-600" /></button>
                                                <span className="w-8 text-center text-xs font-black text-white">{item.cartQuantity}</span>
                                                <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-white"><Plus className="w-3 h-3 text-slate-600" /></button>
                                            </div>
                                            <button onClick={() => removeFromCart(item.id)} className="text-[10px] font-black text-slate-600 hover:text-rose-500 uppercase tracking-widest">Eliminar</button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {cart.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-20">
                                    <ShoppingBag className="w-16 h-16 mb-6" />
                                    <p className="text-sm font-black uppercase tracking-[0.2em] italic">El carrito está vacío</p>
                                </div>
                            )}
                        </div>

                        <div className="p-8 bg-slate-950/50 border-t border-slate-800 space-y-6">
                            <div className="flex justify-between items-center text-3xl">
                                <span className="font-outfit font-black text-white italic tracking-tighter">TOTAL</span>
                                <span className="font-outfit font-black text-indigo-400">${cartTotal.toFixed(2)}</span>
                            </div>
                            <button className="w-full py-5 bg-white text-slate-950 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 hover:bg-indigo-600 hover:text-white transition-all shadow-xl active:scale-95">
                                Finalizar Pedido <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Product Details Modal */}
            {selectedProduct && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-6 bg-slate-950/60 backdrop-blur-xl">
                    <div className="relative bg-slate-900 border border-slate-800 w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
                        <button
                            onClick={() => setSelectedProduct(null)}
                            className="absolute top-8 right-8 z-10 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-slate-500 hover:text-white transition-all"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <div className="flex flex-col md:flex-row h-full">
                            <div className="w-full md:w-1/2 bg-slate-950 flex items-center justify-center p-12 overflow-hidden">
                                <div className="relative group">
                                    <div className="absolute inset-0 bg-indigo-600/20 blur-[80px] rounded-full" />
                                    {selectedProduct.type === 'book' ? (
                                        <Book className="w-48 h-48 text-indigo-500 relative z-10" />
                                    ) : (
                                        <Coffee className="w-48 h-48 text-purple-500 relative z-10" />
                                    )}
                                </div>
                            </div>

                            <div className="w-full md:w-1/2 p-12 flex flex-col justify-center space-y-8">
                                <div>
                                    <span className="px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black uppercase tracking-[0.3em] text-indigo-400">
                                        {selectedProduct.categoryName || 'Selección Premium'}
                                    </span>
                                    <h2 className="text-4xl lg:text-5xl font-outfit font-black text-white mt-4 italic leading-tight">{selectedProduct.name}</h2>
                                    <p className="text-4xl font-outfit font-black text-indigo-400 mt-2">${selectedProduct.price}</p>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-slate-400 text-lg leading-relaxed font-medium">
                                        {selectedProduct.description || "Esta pieza ha sido seleccionada cuidadosamente por nuestro equipo de Tinta y Café para brindarte una experiencia inigualable en cultura y sabor."}
                                    </p>
                                    <div className="flex items-center gap-4 py-4 border-y border-slate-800/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">En Stock: {selectedProduct.quantity}</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        addToCart(selectedProduct);
                                        setSelectedProduct(null);
                                    }}
                                    className="w-full py-6 bg-indigo-600 text-white rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-4 hover:bg-indigo-500 transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                                >
                                    Añadir al Carrito <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
