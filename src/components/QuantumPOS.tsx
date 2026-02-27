"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    ShoppingCart,
    Search,
    Plus,
    Minus,
    Trash2,
    User,
    Zap,
    Sparkles,
    Package,
    ArrowRight,
    Coffee,
    CheckCircle
} from "lucide-react";
import { processSale } from "@/app/api/pos/actions";
import { updateTransactionStatus } from "@/app/api/checkout/actions";
import { toast } from "sonner";

interface ActiveOrder {
    id: number;
    total: number;
    status: string;
    createdAt: Date | null;
    customerName: string;
    items: { name: string; quantity: number; price: number }[];
}

interface POSItem {
    id: number;
    name: string;
    price: number;
    quantity: number; // current stock
    type: string;
    categoryName: string | null;
    imageUrl?: string;
}

interface CartItem extends POSItem {
    cartQuantity: number;
}

interface Customer {
    id: number;
    name: string;
    points: number | null;
}

export default function QuantumPOS({
    initialItems,
    initialCustomers,
    initialStoreId,
    initialActiveOrders = []
}: {
    initialItems: POSItem[];
    initialCustomers: Customer[];
    initialStoreId: number;
    initialActiveOrders?: ActiveOrder[];
}) {
    const router = useRouter();
    const [items, setItems] = useState<POSItem[]>(initialItems);
    const [activeOrders, setActiveOrders] = useState<ActiveOrder[]>(initialActiveOrders);
    const [cart, setCart] = useState<CartItem[]>([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeCategory, setActiveCategory] = useState<string>("All");
    const [activeTab, setActiveTab] = useState<"products" | "cart">("products");

    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.categoryName || "Otros"));
        return ["All", ...Array.from(cats)];
    }, [items]);

    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesCategory = activeCategory === "All" || item.categoryName === activeCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, searchTerm, activeCategory]);

    const total = useMemo(() => {
        return cart.reduce((acc, item) => acc + (item.price * item.cartQuantity), 0);
    }, [cart]);

    const addToCart = (item: POSItem) => {
        if (item.quantity <= 0) {
            toast.error("Producto sin stock");
            return;
        }

        setCart(prev => {
            const existing = prev.find(i => i.id === item.id);
            if (existing) {
                if (existing.cartQuantity >= item.quantity) {
                    toast.warning("Stock máximo alcanzado en el carrito");
                    return prev;
                }
                return prev.map(i => i.id === item.id
                    ? { ...i, cartQuantity: i.cartQuantity + 1 }
                    : i
                );
            }
            return [...prev, { ...item, cartQuantity: 1 }];
        });
    };

    const removeFromCart = (itemId: number) => {
        setCart(prev => prev.filter(i => i.id !== itemId));
    };

    const updateQuantity = (itemId: number, delta: number) => {
        setCart(prev => prev.map(i => {
            if (i.id === itemId) {
                const newQty = i.cartQuantity + delta;
                if (newQty <= 0) return i;
                if (newQty > i.quantity) {
                    toast.warning("Stock insuficiente");
                    return i;
                }
                return { ...i, cartQuantity: newQty };
            }
            return i;
        }).filter(i => i.cartQuantity > 0));
    };

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        setIsProcessing(true);

        try {
            const saleData = {
                storeId: initialStoreId,
                customerId: selectedCustomerId || undefined,
                items: cart.map(i => ({
                    itemId: i.id,
                    quantity: i.cartQuantity,
                    price: i.price
                })),
                total
            };

            const result = await processSale(saleData);

            if (result.success) {
                toast.success("Venta procesada con éxito");
                setCart([]);
                setSelectedCustomerId(null);
                // In a real app, we'd wait for Pusher or re-fetch items
                // For now, let's manually decrement local stock
                setItems(prev => prev.map(item => {
                    const cartItem = cart.find(ci => ci.id === item.id);
                    if (cartItem) {
                        return { ...item, quantity: item.quantity - cartItem.cartQuantity };
                    }
                    return item;
                }));
            }
        } catch (error) {
            console.error("Checkout failed:", error);
            toast.error("Error al procesar la venta");
        } finally {
            setIsProcessing(false);
        }
    };

    const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
        try {
            await updateTransactionStatus(orderId, newStatus);
            setActiveOrders(prev => prev.map(o =>
                o.id === orderId ? { ...o, status: newStatus } : o
            ).filter(o => o.status !== 'ready' && o.status !== 'completed'));
            router.refresh();
            if (newStatus === 'ready') {
                toast.success("Orden marcada como lista para recoger");
            }
        } catch {
            toast.error("Error al actualizar la orden");
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-[calc(100vh-5rem)] lg:h-[calc(100vh-2rem)] gap-6 overflow-hidden">
            {/* Mobile Tab Switcher */}
            <div className="lg:hidden flex bg-slate-900/50 p-1 rounded-2xl border border-slate-800">
                <button
                    onClick={() => setActiveTab("products")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "products" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                    <Package className="w-4 h-4" /> Productos
                </button>
                <button
                    onClick={() => setActiveTab("cart")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === "cart" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-slate-300"}`}
                >
                    <div className="relative">
                        <ShoppingCart className="w-4 h-4" />
                        {cart.length > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border border-slate-900">
                                {cart.length}
                            </span>
                        )}
                    </div>
                    Carrito
                </button>
            </div>

            {/* Left side: Product Selection */}
            <div className={`flex-1 flex flex-col gap-6 overflow-hidden ${activeTab !== "products" ? "hidden lg:flex" : "flex"}`}>
                <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input
                            type="text"
                            placeholder="Buscar productos por nombre o código..."
                            className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:outline-none focus:border-indigo-500/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                {/* Categories */}
                <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setActiveCategory(cat)}
                            className={`px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all ${activeCategory === cat ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'bg-slate-900/50 text-slate-500 border border-slate-800 hover:text-slate-300'}`}
                        >
                            {cat === "All" ? "Todos" : cat}
                        </button>
                    ))}
                </div>

                {/* Items Grid */}
                <div className="flex-1 overflow-y-auto pr-2 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 pb-8">
                    {filteredItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => addToCart(item)}
                            disabled={item.quantity <= 0}
                            className={`group text-left p-4 rounded-[2rem] border transition-all duration-300 relative overflow-hidden ${item.quantity <= 0 ? 'bg-slate-950/20 border-slate-900 opacity-50 grayscale' : 'bg-slate-900/40 border-slate-800 hover:border-indigo-500/30 hover:translate-y-[-4px] shadow-xl shadow-black/20'}`}
                        >
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter ${item.quantity < 5 ? 'bg-rose-500/20 text-rose-400 border border-rose-500/20' : 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/20'}`}>
                                    {item.quantity} DISP
                                </span>
                            </div>

                            <div className="aspect-square bg-slate-950 rounded-2xl mb-4 flex items-center justify-center border border-slate-900 group-hover:bg-slate-900 transition-colors">
                                <Package className="w-10 h-10 text-slate-800 group-hover:text-indigo-900 transition-colors" />
                            </div>

                            <div className="space-y-1">
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{item.categoryName || 'General'}</p>
                                <h3 className="font-bold text-slate-100 line-clamp-1 group-hover:text-white">{item.name}</h3>
                                <p className="text-xl font-outfit font-black text-indigo-400">${item.price}</p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Right side: Cart & Checkout */}
            <div className={`w-full lg:w-96 flex flex-col gap-6 ${activeTab !== "cart" ? "hidden lg:flex" : "flex"}`}>
                <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[2.5rem] flex flex-col overflow-hidden backdrop-blur-xl shadow-2xl">
                    <div className="p-6 border-b border-slate-800/50 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-600 rounded-xl">
                                <ShoppingCart className="w-5 h-5 text-white" />
                            </div>
                            <h2 className="font-outfit font-black text-white uppercase tracking-tight">Carrito Actual</h2>
                        </div>
                        <span className="bg-slate-800 px-3 py-1 rounded-full text-[10px] font-black text-slate-400">{cart.length} ITEMS</span>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {cart.map(item => (
                            <div key={item.id} className="flex items-center justify-between group">
                                <div className="flex-1 min-w-0 pr-4">
                                    <h4 className="font-bold text-slate-200 text-sm truncate">{item.name}</h4>
                                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest">${item.price} c/u</p>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="flex items-center bg-slate-950 rounded-xl border border-slate-800 p-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, -1)}
                                            className="p-1 hover:text-rose-400 text-slate-500 transition-colors"
                                        ><Minus className="w-4 h-4" /></button>
                                        <span className="w-8 text-center text-xs font-black text-white">{item.cartQuantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, 1)}
                                            className="p-1 hover:text-emerald-400 text-slate-500 transition-colors"
                                        ><Plus className="w-4 h-4" /></button>
                                    </div>
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="p-2 text-slate-600 hover:text-rose-500 transition-colors"
                                    ><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>
                        ))}
                        {cart.length === 0 && (
                            <div className="h-full flex flex-col items-center justify-center text-center opacity-20 pointer-events-none py-12">
                                <ShoppingCart className="w-12 h-12 mb-4" />
                                <p className="text-xs font-black uppercase tracking-widest">Carrito Vacío</p>
                            </div>
                        )}
                    </div>

                    {/* Customer & Totals */}
                    <div className="p-6 bg-slate-950/50 border-t border-slate-800 space-y-6 mt-auto">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                <User className="w-3 h-3" /> Asignar Cliente (Opcional)
                            </label>
                            <select
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 px-4 text-xs font-bold text-white focus:outline-none focus:border-indigo-500/50"
                                value={selectedCustomerId || ""}
                                onChange={(e) => setSelectedCustomerId(Number(e.target.value) || null)}
                            >
                                <option value="">Venta General (Sin Id.)</option>
                                {initialCustomers.map(c => (
                                    <option key={c.id} value={c.id}>{c.name.toUpperCase()} ({c.points} pts)</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-2 pt-4 border-t border-slate-900">
                            <div className="flex justify-between items-center">
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Subtotal</span>
                                <span className="font-outfit font-bold text-slate-300">${total.toFixed(2)}</span>
                            </div>
                            <div className="flex justify-between items-center text-2xl">
                                <span className="font-outfit font-black text-white italic tracking-tighter uppercase">Total</span>
                                <span className="font-outfit font-black text-indigo-400">${total.toFixed(2)}</span>
                            </div>
                        </div>

                        <button
                            onClick={handleCheckout}
                            disabled={cart.length === 0 || isProcessing}
                            className={`w-full py-5 rounded-2xl font-black uppercase tracking-widest text-sm flex items-center justify-center gap-3 transition-all ${cart.length === 0 || isProcessing ? 'bg-slate-900 text-slate-600 grayscale cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-xl shadow-indigo-600/30 active:scale-[0.98]'}`}
                        >
                            {isProcessing ? (
                                <Zap className="w-5 h-5 animate-pulse" />
                            ) : (
                                <>
                                    Procesar Transacción <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Active Orders Panel */}
                {activeOrders.length > 0 && (
                    <div className="bg-slate-900/60 border border-slate-700 rounded-[2rem] overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center gap-2">
                            <Coffee className="w-4 h-4 text-indigo-400" />
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-300">
                                Órdenes Web ({activeOrders.length})
                            </h3>
                        </div>
                        <div className="p-4 space-y-3 max-h-48 overflow-y-auto">
                            {activeOrders.map(order => (
                                <div key={order.id} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs font-bold text-white">#{order.id} · {order.customerName}</p>
                                            <p className="text-[10px] text-slate-500">
                                                {order.items.map(i => `${i.name} x${i.quantity}`).join(", ")}
                                            </p>
                                        </div>
                                        <span className="text-sm font-black text-indigo-400">${order.total?.toFixed(2)}</span>
                                    </div>
                                    <div className="flex gap-2">
                                        {order.status === 'preparing' && (
                                            <button
                                                onClick={() => handleOrderStatusChange(order.id, 'ready')}
                                                className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                                            >
                                                <CheckCircle className="w-3 h-3" /> Listo
                                            </button>
                                        )}
                                        {order.status === 'pending' && (
                                            <>
                                                <button
                                                    onClick={() => handleOrderStatusChange(order.id, 'preparing')}
                                                    className="flex-1 py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                                                >
                                                    <Coffee className="w-3 h-3" /> Preparar
                                                </button>
                                                <button
                                                    onClick={() => handleOrderStatusChange(order.id, 'ready')}
                                                    className="flex-1 py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1"
                                                >
                                                    <CheckCircle className="w-3 h-3" /> Listo
                                                </button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* AI Insight Placeholder */}
                <div className="bg-gradient-to-br from-indigo-600/10 to-purple-600/10 border border-indigo-500/20 rounded-[2rem] p-6 flex flex-col gap-3 relative overflow-hidden group">
                    <Sparkles className="w-8 h-8 text-indigo-500/40 absolute -right-2 -top-2" />
                    <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-indigo-400" /> Nexus Intel
                    </p>
                    <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                        "Sugerencia: Ofrece un 'Latte Lavanda' como complemento. El 40% de los clientes que compran libros también eligen una bebida especial."
                    </p>
                </div>
            </div>
        </div>
    );
}
